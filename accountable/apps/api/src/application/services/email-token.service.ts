import { InvalidTokenError } from '../../domain/errors/index.js';
import type {
  EmailTokenKind,
  EmailTokenRecord,
  ITokenRepository,
} from '../../domain/repositories/index.js';
import { MAX_OTP_ATTEMPTS, type IOtpService, type ITokenService } from '../contracts/index.js';

export interface IssuedEmailToken {
  /** Token do link (vai no URL do email). */
  rawToken: string;
  /** Código de 6 dígitos (vai no corpo do email). */
  code: string;
  expiresAt: Date;
}

/**
 * Tokens enviados por email com dupla via: link (token longo) OU código OTP de 6 dígitos.
 * Na BD ficam apenas o SHA-256 do link e o HMAC do código.
 */
export class EmailTokenService {
  constructor(
    private readonly tokenRepository: ITokenRepository,
    private readonly tokenService: ITokenService,
    private readonly otpService: IOtpService,
  ) {}

  /** Emite um novo token e invalida os anteriores ainda ativos do mesmo dono. */
  async issue(kind: EmailTokenKind, ownerId: string, ttlMs: number): Promise<IssuedEmailToken> {
    const rawToken = this.tokenService.generateSecureToken();
    const otp = this.otpService.generate();
    const expiresAt = new Date(Date.now() + ttlMs);

    await this.tokenRepository.invalidateActive(kind, ownerId);
    await this.tokenRepository.create(kind, {
      ownerId,
      tokenHash: this.tokenService.hashToken(rawToken),
      otpHash: otp.hash,
      expiresAt,
    });

    return { rawToken, code: otp.code, expiresAt };
  }

  /** Valida um token de link. Não o consome — o chamador decide quando marcar como usado. */
  async findValidByLink(kind: EmailTokenKind, rawToken: string): Promise<EmailTokenRecord> {
    const record = await this.tokenRepository.findByTokenHash(kind, this.tokenService.hashToken(rawToken));
    if (!record) {
      throw new InvalidTokenError('Link inválido ou expirado.');
    }
    if (record.usedAt !== null) {
      throw new InvalidTokenError('Este link já foi utilizado.');
    }
    if (record.expiresAt.getTime() <= Date.now()) {
      throw new InvalidTokenError('Este link expirou. Peça um novo.');
    }
    return record;
  }

  /**
   * Valida um código OTP contra o token ativo mais recente do dono. Cada erro consome
   * uma tentativa; ao fim de MAX_OTP_ATTEMPTS o código fica bloqueado.
   */
  async findValidByCode(kind: EmailTokenKind, ownerId: string | null, code: string): Promise<EmailTokenRecord> {
    const invalid = new InvalidTokenError('Código inválido ou expirado.');
    if (!ownerId) throw invalid;

    const record = await this.tokenRepository.findLatestActive(kind, ownerId);
    if (!record || !record.otpHash) throw invalid;

    if (record.otpAttempts >= MAX_OTP_ATTEMPTS) {
      throw new InvalidTokenError('Demasiadas tentativas. Peça um novo código.');
    }

    if (!this.otpService.verify(code, record.otpHash)) {
      await this.tokenRepository.incrementOtpAttempts(kind, record.id);
      const remaining = MAX_OTP_ATTEMPTS - record.otpAttempts - 1;
      throw new InvalidTokenError(
        remaining > 0
          ? `Código inválido. Restam ${remaining} tentativa(s).`
          : 'Demasiadas tentativas. Peça um novo código.',
      );
    }

    return record;
  }

  /** Consome o token (uso único). Falha se outra requisição o consumiu primeiro. */
  async consume(kind: EmailTokenKind, record: EmailTokenRecord): Promise<void> {
    const consumed = await this.tokenRepository.markUsed(kind, record.id);
    if (!consumed) {
      throw new InvalidTokenError('Este link ou código já foi utilizado.');
    }
  }

  /**
   * Após verificar por OTP, emite um novo token de link (substituindo o anterior) para
   * o passo seguinte do fluxo (ex.: definir a senha). O link original deixa de valer.
   */
  async reissueLink(kind: EmailTokenKind, record: EmailTokenRecord): Promise<string> {
    const rawToken = this.tokenService.generateSecureToken();
    await this.tokenRepository.replaceTokenHash(kind, record.id, this.tokenService.hashToken(rawToken));
    return rawToken;
  }
}
