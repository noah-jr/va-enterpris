import {
  RegisterClientUseCase,
  ResendVerificationUseCase,
  VerifyEmailUseCase,
  SetClientPasswordUseCase,
  LoginClientUseCase,
  LoginUserUseCase,
  RequestPasswordResetUseCase,
  CompletePasswordResetUseCase,
  ChangeOwnPasswordUseCase,
  type PasswordResetAudience,
} from '../application/use-cases/auth/index.js';
import { AuthController } from '../presentation/controllers/auth.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildAuthController(infra: Infrastructure): AuthController {
  const { hasher, tokenService, emailService, config, repositories, unitOfWork, sessionService, emailTokens } = infra;
  const { clientRepository, userRepository, tokenRepository, auditRepository } = repositories;

  const clientAudience: PasswordResetAudience = {
    kind: 'CLIENT_PASSWORD_RESET',
    sessionType: 'client',
    resetPageUrl: `${config.appUrl}/auth/reset-password`,
    entity: 'Client',
    async findEligibleByEmail(email) {
      const client = await clientRepository.findByEmail(email);
      if (!client || !client.emailVerified || !client.isActive) return null;
      return { id: client.id, name: client.name, email: client.email };
    },
    async findIdByEmail(email) {
      return (await clientRepository.findByEmail(email))?.id ?? null;
    },
    async setPassword(id, passwordHash) {
      await clientRepository.update(id, { passwordHash });
    },
    auditActor: (id) => ({ clientId: id }),
  };

  const userAudience: PasswordResetAudience = {
    kind: 'USER_PASSWORD_RESET',
    sessionType: 'user',
    resetPageUrl: `${config.adminUrl}/reset-password`,
    entity: 'User',
    async findEligibleByEmail(email) {
      const user = await userRepository.findByEmail(email);
      if (!user || !user.isActive) return null;
      return { id: user.id, name: user.name ?? user.email, email: user.email };
    },
    async findIdByEmail(email) {
      return (await userRepository.findByEmail(email))?.id ?? null;
    },
    async setPassword(id, passwordHash) {
      await userRepository.update(id, { passwordHash });
    },
    auditActor: (id) => ({ userId: id }),
  };

  return new AuthController({
    registerClientUseCase: new RegisterClientUseCase(
      clientRepository,
      emailTokens,
      emailService,
      auditRepository,
      unitOfWork,
      config.appUrl,
    ),
    resendVerificationUseCase: new ResendVerificationUseCase(
      clientRepository,
      emailTokens,
      emailService,
      auditRepository,
      config.appUrl,
    ),
    verifyEmailUseCase: new VerifyEmailUseCase(clientRepository, emailTokens, auditRepository, unitOfWork),
    setClientPasswordUseCase: new SetClientPasswordUseCase(
      clientRepository,
      tokenRepository,
      hasher,
      auditRepository,
      tokenService,
      unitOfWork,
    ),
    loginClientUseCase: new LoginClientUseCase(clientRepository, hasher, sessionService, auditRepository),
    loginUserUseCase: new LoginUserUseCase(userRepository, hasher, sessionService, auditRepository),
    forgotClientPasswordUseCase: new RequestPasswordResetUseCase(clientAudience, emailTokens, emailService, auditRepository),
    resetClientPasswordUseCase: new CompletePasswordResetUseCase(
      clientAudience,
      emailTokens,
      hasher,
      auditRepository,
      sessionService,
      unitOfWork,
    ),
    forgotUserPasswordUseCase: new RequestPasswordResetUseCase(userAudience, emailTokens, emailService, auditRepository),
    resetUserPasswordUseCase: new CompletePasswordResetUseCase(
      userAudience,
      emailTokens,
      hasher,
      auditRepository,
      sessionService,
      unitOfWork,
    ),
    changeOwnPasswordUseCase: new ChangeOwnPasswordUseCase(
      clientRepository,
      userRepository,
      hasher,
      sessionService,
      auditRepository,
      unitOfWork,
    ),
    sessionService,
    clientRepository,
    userRepository,
  });
}
