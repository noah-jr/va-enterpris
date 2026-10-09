import { ConflictError } from '../../../domain/errors/index.js';
import type { IClientRepository, IAuditRepository } from '../../../domain/repositories/index.js';
import type { IEmailService, IUnitOfWork } from '../../contracts/index.js';
import type { EmailTokenService, IssuedEmailToken } from '../../services/email-token.service.js';

export const EMAIL_VERIFICATION_TTL_HOURS = 24;

export interface RegisterClientInput {
  nip: string;
  name: string;
  email: string;
}

export interface RegisterClientOutput {
  clientId: string;
  email: string;
}

export class RegisterClientUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly emailTokens: EmailTokenService,
    private readonly emailService: IEmailService,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly appUrl: string,
  ) {}

  async execute(
    input: RegisterClientInput,
    context: { ipAddress?: string; userAgent?: string },
  ): Promise<RegisterClientOutput> {
    const [existingEmail, existingNip] = await Promise.all([
      this.clientRepository.findByEmail(input.email),
      this.clientRepository.findByNip(input.nip),
    ]);

    // Security: do not reveal whether email or NIP already exists with a specific message
    if (existingEmail !== null || existingNip !== null) {
      throw new ConflictError(
        'Já existe uma conta com os dados fornecidos. Verifique o seu email e NIP.',
      );
    }

    const { client, issued } = await this.unitOfWork.run(async () => {
      const created = await this.clientRepository.create({
        nip: input.nip,
        name: input.name,
        email: input.email,
      });

      const token: IssuedEmailToken = await this.emailTokens.issue(
        'EMAIL_VERIFICATION',
        created.id,
        EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000,
      );

      await this.auditRepository.log({
        clientId: created.id,
        action: 'CLIENT_CREATED',
        entity: 'Client',
        entityId: created.id,
        newValues: { nip: created.nip, email: created.email, name: created.name },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return { client: created, issued: token };
    });

    // O email só é enviado depois do commit — nunca para uma conta que fez rollback.
    await this.emailService.sendEmailVerification({
      to: client.email,
      name: client.name,
      verificationUrl: `${this.appUrl}/auth/verify-email?token=${issued.rawToken}`,
      code: issued.code,
      expiresInHours: EMAIL_VERIFICATION_TTL_HOURS,
    });

    return { clientId: client.id, email: client.email };
  }
}

/** Reenvia o email de ativação (novo link + novo código; os anteriores deixam de valer). */
export class ResendVerificationUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly emailTokens: EmailTokenService,
    private readonly emailService: IEmailService,
    private readonly auditRepository: IAuditRepository,
    private readonly appUrl: string,
  ) {}

  /** Resposta idêntica exista ou não a conta — sem enumeração. */
  async execute(email: string, context: { ipAddress?: string; userAgent?: string } = {}): Promise<void> {
    const client = await this.clientRepository.findByEmail(email);
    if (!client || client.emailVerified) return;

    const issued = await this.emailTokens.issue(
      'EMAIL_VERIFICATION',
      client.id,
      EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000,
    );

    await this.auditRepository.log({
      clientId: client.id,
      action: 'VERIFICATION_RESENT',
      entity: 'Client',
      entityId: client.id,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    await this.emailService.sendEmailVerification({
      to: client.email,
      name: client.name,
      verificationUrl: `${this.appUrl}/auth/verify-email?token=${issued.rawToken}`,
      code: issued.code,
      expiresInHours: EMAIL_VERIFICATION_TTL_HOURS,
    });
  }
}
