import { describe, it, expect, vi } from 'vitest';
import {
  GMAIL_PRESET,
  GetEmailSettingsUseCase,
  SendTestEmailUseCase,
  UpdateEmailSettingsUseCase,
} from './email-settings.use-cases.js';
import { GetStatsOverviewUseCase, fillMonths, lastMonths } from '../stats/stats.use-cases.js';
import type {
  EmailSettingsEntity,
  IEmailSettingsRepository,
  IStatsRepository,
} from '../../../domain/repositories/index.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';
import { HmacOtpService } from '../../../infrastructure/auth/hmac-otp.service.js';
import { escapeHtml, layout, paragraph } from '../../../infrastructure/email/email-templates.js';
import { createSmtpConfigResolver } from '../../../infrastructure/email/email-config.resolver.js';
import {
  FakeUnitOfWork,
  TEST_OTP_SECRET,
  createAuditRepositoryMock,
  createEmailServiceMock,
  fakeCipher,
} from '../../../__tests__/unit/fakes.js';

function memoryRepo(initial: EmailSettingsEntity | null = null): IEmailSettingsRepository & { value: EmailSettingsEntity | null } {
  const repo = {
    value: initial,
    get: vi.fn(async () => repo.value),
    save: vi.fn(async (data) => (repo.value = { ...data, updatedAt: new Date() })),
  };
  return repo;
}

const ENV = { host: 'localhost', port: 1025, secure: false, username: null, hasPassword: false, fromName: 'VA', fromEmail: 'no-reply@va.ao' };
const base = {
  host: 'smtp.x.ao',
  port: 587,
  secure: false,
  fromName: 'VA OneGest',
  fromEmail: 'no-reply@va.ao',
  isEnabled: true,
  otpEnabled: true,
  verificationExpiresHours: 24,
  passwordResetExpiresMinutes: 15,
};

describe('Configuração do servidor de email', () => {
  it('sem configuração guardada mostra a do ambiente', async () => {
    const dto = await new GetEmailSettingsUseCase(memoryRepo(), ENV).execute();
    expect(dto.source).toBe('environment');
    expect(dto.host).toBe('localhost');
  });

  it('Gmail força smtp.gmail.com:465 SSL e cifra a senha; nunca a devolve nem a regista na auditoria', async () => {
    const repo = memoryRepo();
    const audit = createAuditRepositoryMock();
    const dto = await new UpdateEmailSettingsUseCase(repo, fakeCipher, audit, new FakeUnitOfWork()).execute(
      { ...base, provider: 'GMAIL', host: 'ignorado', port: 25, secure: false, username: 'conta@gmail.com', password: 'app-password-123' },
      { actorId: 'admin' },
    );

    expect(repo.value).toMatchObject({ ...GMAIL_PRESET, passwordEncrypted: 'enc:app-password-123' });
    expect(dto).not.toHaveProperty('password');
    expect(dto).not.toHaveProperty('passwordEncrypted');
    expect(dto.hasPassword).toBe(true);
    expect(JSON.stringify(vi.mocked(audit.log).mock.calls)).not.toContain('app-password-123');
  });

  it('senha omitida mantém a atual; Gmail sem senha é recusado', async () => {
    const repo = memoryRepo();
    const uc = new UpdateEmailSettingsUseCase(repo, fakeCipher, createAuditRepositoryMock(), new FakeUnitOfWork());

    await expect(
      uc.execute({ ...base, provider: 'GMAIL', username: 'c@gmail.com' }, { actorId: 'a' }),
    ).rejects.toThrow(BusinessRuleError);

    await uc.execute({ ...base, provider: 'SMTP', username: 'u', password: 'segredo' }, { actorId: 'a' });
    await uc.execute({ ...base, provider: 'SMTP', username: 'u', password: '' }, { actorId: 'a' });
    expect(repo.value?.passwordEncrypted).toBe('enc:segredo');
  });

  it('resolver: usa a BD quando ativa (senha decifrada) e o ambiente quando desativada', async () => {
    const fallback = { host: 'env', port: 1, secure: false, user: '', pass: '', fromName: 'E', fromEmail: 'e@e' };
    const repo = memoryRepo({ provider: 'SMTP', ...base, username: 'u', passwordEncrypted: 'enc:s3cr3t', updatedById: null, updatedAt: new Date() });
    const resolve = createSmtpConfigResolver(repo, fakeCipher, fallback);

    expect(await resolve()).toMatchObject({ host: 'smtp.x.ao', user: 'u', pass: 's3cr3t' });
    repo.value!.isEnabled = false;
    expect(await resolve()).toEqual(fallback);
  });

  it('email de teste: devolve o erro do servidor em vez de lançar', async () => {
    const emailService = createEmailServiceMock();
    vi.mocked(emailService.sendTestEmail).mockRejectedValueOnce(new Error('Invalid login: 535 Username and Password not accepted'));
    const uc = new SendTestEmailUseCase(emailService, createAuditRepositoryMock());

    const result = await uc.execute('dest@x.ao', { actorId: 'a', actorEmail: 'admin@va.ao' });
    expect(result).toEqual({ success: false, error: expect.stringContaining('535') });
    expect(await uc.execute('dest@x.ao', { actorId: 'a', actorEmail: 'admin@va.ao' })).toEqual({ success: true });
  });

  it('permite configurar e persistir políticas de OTP (ativação, TTLs de verificação e recuperação)', async () => {
    const repo = memoryRepo();
    const audit = createAuditRepositoryMock();
    const uc = new UpdateEmailSettingsUseCase(repo, fakeCipher, audit, new FakeUnitOfWork());

    const dto = await uc.execute(
      {
        ...base,
        provider: 'SMTP',
        otpEnabled: false,
        verificationExpiresHours: 72,
        passwordResetExpiresMinutes: 45,
        username: 'u',
        password: 'pwd',
      },
      { actorId: 'admin-1' },
    );

    expect(repo.value?.otpEnabled).toBe(false);
    expect(repo.value?.verificationExpiresHours).toBe(72);
    expect(repo.value?.passwordResetExpiresMinutes).toBe(45);
    expect(dto.otpEnabled).toBe(false);
    expect(dto.verificationExpiresHours).toBe(72);
    expect(dto.passwordResetExpiresMinutes).toBe(45);
  });

  it('dispara email de teste simulando OTP de ativação ou recuperação e devolve o código gerado', async () => {
    const emailService = createEmailServiceMock();
    const audit = createAuditRepositoryMock();
    const uc = new SendTestEmailUseCase(emailService, audit);

    // Simulação de Ativação
    const actResult = await uc.execute(
      { to: 'dest@x.ao', type: 'ACCOUNT_VERIFICATION' },
      { actorId: 'admin-1', actorEmail: 'admin@va.ao' },
    );
    expect(actResult.success).toBe(true);
    if (actResult.success) {
      expect(actResult.code).toMatch(/^\d{6}$/);
      expect(emailService.sendTestEmail).toHaveBeenCalledWith({
        to: 'dest@x.ao',
        requestedBy: 'admin@va.ao',
        type: 'ACCOUNT_VERIFICATION',
        code: actResult.code,
      });
    }

    // Simulação de Recuperação
    const recResult = await uc.execute(
      { to: 'dest@x.ao', type: 'PASSWORD_RESET' },
      { actorId: 'admin-1', actorEmail: 'admin@va.ao' },
    );
    expect(recResult.success).toBe(true);
    if (recResult.success) {
      expect(recResult.code).toMatch(/^\d{6}$/);
      expect(emailService.sendTestEmail).toHaveBeenCalledWith({
        to: 'dest@x.ao',
        requestedBy: 'admin@va.ao',
        type: 'PASSWORD_RESET',
        code: recResult.code,
      });
    }

    // Auditoria
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'EMAIL_SETTINGS_TESTED',
        entity: 'EmailSettings',
        metadata: expect.objectContaining({ to: 'dest@x.ao', type: 'PASSWORD_RESET', success: true }),
      }),
    );
  });
});

describe('OTP (HMAC)', () => {
  const otp = new HmacOtpService(TEST_OTP_SECRET);

  it('gera 6 dígitos e verifica apenas o código correto', () => {
    const { code, hash } = otp.generate();
    expect(code).toMatch(/^\d{6}$/);
    expect(otp.verify(code, hash)).toBe(true);
    expect(otp.verify(code === '000000' ? '000001' : '000000', hash)).toBe(false);
    expect(otp.verify('abc', hash)).toBe(false);
  });

  it('o hash depende do segredo (inútil sem a chave, mesmo por força bruta)', () => {
    const { code, hash } = otp.generate();
    expect(new HmacOtpService('outro-segredo-completamente-diferente!!').verify(code, hash)).toBe(false);
  });
});

describe('Templates de email', () => {
  it('escapa HTML de conteúdo dinâmico (nome de cliente malicioso)', () => {
    const html = layout({ title: 'T', preheader: 'p', body: paragraph(`Olá ${escapeHtml('<script>alert(1)</script>')}`) });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('Estatísticas do painel', () => {
  it('lastMonths devolve 12 meses contínuos até ao atual', () => {
    const months = lastMonths(12, new Date('2026-03-10T00:00:00Z'));
    expect(months).toHaveLength(12);
    expect(months[0]).toBe('2025-04');
    expect(months[11]).toBe('2026-03');
  });

  it('fillMonths preenche meses sem registos com zero', () => {
    const filled = fillMonths(['2026-01', '2026-02', '2026-03'], [{ month: '2026-02', count: 4 }]);
    expect([...filled.values()]).toEqual([0, 4, 0]);
  });

  it('agrega totais, séries e MRR em AOA', async () => {
    const stats: IStatsRepository = {
      countClients: vi.fn(async () => ({ total: 10, active: 8 })),
      countClientsCreatedSince: vi.fn(async () => 3),
      clientsCreatedPerMonth: vi.fn(async () => [{ month: '2026-03', count: 3 }]),
      documentsCreatedPerMonth: vi.fn(async () => [{ month: '2026-03', count: 7 }]),
      documentsCompletedPerMonth: vi.fn(async () => [{ month: '2026-02', count: 2 }]),
      documentsByStatus: vi.fn(async () => [
        { status: 'COMPLETED', count: 2 },
        { status: 'IN_ANALYSIS', count: 4 },
        { status: 'DRAFT', count: 1 },
      ]),
      countOpenTickets: vi.fn(async () => 5),
      subscriptionsByStatus: vi.fn(async () => [{ status: 'ACTIVE' as const, count: 2 }]),
      activeSubscriptionAmounts: vi.fn(async () => [
        { amount: 125_000, billingCycle: 'MONTHLY' as const },
        { amount: 1_200_000, billingCycle: 'ANNUAL' as const },
      ]),
    };

    const out = await new GetStatsOverviewUseCase(stats).execute(new Date('2026-03-20T00:00:00Z'));

    expect(out.totals).toMatchObject({
      clients: 10,
      activeClients: 8,
      newClientsThisMonth: 3,
      documents: 7,
      documentsInProgress: 4,
      documentsCompleted: 2,
      openTickets: 5,
      activeSubscriptions: 2,
      monthlyRecurringRevenue: 225_000,
    });
    expect(out.clientsPerMonth).toHaveLength(12);
    expect(out.documentsPerMonth.at(-1)).toEqual({ month: '2026-03', created: 7, completed: 0 });
    expect(out.documentsPerMonth.at(-2)).toEqual({ month: '2026-02', created: 0, completed: 2 });
  });
});
