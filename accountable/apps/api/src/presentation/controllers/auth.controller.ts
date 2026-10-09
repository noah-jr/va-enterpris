import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse, LoginResponseDTO } from '@accountable/types';
import {
  registerClientSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  setPasswordSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '@accountable/schemas';
import type {
  RegisterClientUseCase,
  ResendVerificationUseCase,
  VerifyEmailUseCase,
  SetClientPasswordUseCase,
  LoginClientUseCase,
  LoginUserUseCase,
  RequestPasswordResetUseCase,
  CompletePasswordResetUseCase,
  CompletePasswordResetInput,
  ChangeOwnPasswordUseCase,
} from '../../application/use-cases/auth/index.js';
import type { AuthSessionService } from '../../application/services/auth-session.service.js';
import type { IClientRepository, IUserRepository } from '../../domain/repositories/index.js';
import { UnauthorizedError } from '../../domain/errors/index.js';
import { isLocalEnvironment } from '../../infrastructure/config/runtime.js';

/** O refresh token só é enviado para os endpoints de auth — nunca em cada pedido. */
const REFRESH_COOKIE_PATH = '/api/v1/auth';

export interface AuthControllerDependencies {
  registerClientUseCase: RegisterClientUseCase;
  resendVerificationUseCase: ResendVerificationUseCase;
  verifyEmailUseCase: VerifyEmailUseCase;
  setClientPasswordUseCase: SetClientPasswordUseCase;
  loginClientUseCase: LoginClientUseCase;
  loginUserUseCase: LoginUserUseCase;
  forgotClientPasswordUseCase: RequestPasswordResetUseCase;
  resetClientPasswordUseCase: CompletePasswordResetUseCase;
  forgotUserPasswordUseCase: RequestPasswordResetUseCase;
  resetUserPasswordUseCase: CompletePasswordResetUseCase;
  changeOwnPasswordUseCase: ChangeOwnPasswordUseCase;
  sessionService: AuthSessionService;
  clientRepository: IClientRepository;
  userRepository: IUserRepository;
}

const GENERIC_RESET_MESSAGE =
  'Se o email existir na nossa plataforma, receberá um link e um código para recuperar a senha.';

function toResetInput(body: {
  token?: string;
  email?: string;
  code?: string;
  password: string;
}): CompletePasswordResetInput {
  return body.token
    ? { token: body.token, password: body.password }
    : { email: body.email!, code: body.code!, password: body.password };
}

export class AuthController {
  constructor(private readonly deps: AuthControllerDependencies) {}

  private getRequestContext(request: FastifyRequest) {
    return {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };
  }

  private setAuthCookies(
    reply: FastifyReply,
    tokens: { accessToken: string; accessExpiresIn: number; refreshToken: string; refreshExpiresAt: Date },
  ): void {
    const secure = !isLocalEnvironment();

    reply.setCookie('access_token', tokens.accessToken, {
      path: '/',
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: tokens.accessExpiresIn,
    });

    reply.setCookie('refresh_token', tokens.refreshToken, {
      path: REFRESH_COOKIE_PATH,
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: Math.max(0, Math.floor((tokens.refreshExpiresAt.getTime() - Date.now()) / 1000)),
    });

    // Remove o cookie de refresh legado (antes vivia em path '/').
    reply.clearCookie('refresh_token', { path: '/' });
  }

  private clearAuthCookies(reply: FastifyReply): void {
    reply.clearCookie('access_token', { path: '/' });
    reply.clearCookie('refresh_token', { path: REFRESH_COOKIE_PATH });
    reply.clearCookie('refresh_token', { path: '/' });
  }

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = registerClientSchema.parse(request.body);
    const result = await this.deps.registerClientUseCase.execute(
      body,
      this.getRequestContext(request),
    );

    const response: ApiResponse<typeof result> = {
      data: result,
      message: 'Registo efetuado com sucesso. Verifique o seu email para ativar a conta.',
    };

    reply.status(201).send(response);
  }

  async verifyEmail(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = verifyEmailSchema.parse(request.body);
    const result = await this.deps.verifyEmailUseCase.execute(body, this.getRequestContext(request));

    const response: ApiResponse<typeof result> = {
      data: result,
      message: 'Email verificado com sucesso. Prossiga para definir a sua senha.',
    };

    reply.status(200).send(response);
  }

  async setPassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = setPasswordSchema.parse(request.body);
    await this.deps.setClientPasswordUseCase.execute(
      { token: body.token, password: body.password },
      this.getRequestContext(request),
    );

    const response: ApiResponse<null> = {
      data: null,
      message: 'Senha definida com sucesso. Pode agora iniciar sessão.',
    };

    reply.status(200).send(response);
  }

  async loginClient(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = loginSchema.parse(request.body);
    const result = await this.deps.loginClientUseCase.execute(
      body,
      this.getRequestContext(request),
    );

    this.setAuthCookies(reply, result);

    const response: ApiResponse<LoginResponseDTO> = {
      data: {
        userId: result.userId,
        userType: 'client',
        roles: result.roles,
        permissions: result.permissions,
      },
      message: 'Sessão iniciada com sucesso.',
    };

    reply.status(200).send(response);
  }

  async loginUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = loginSchema.parse(request.body);
    const result = await this.deps.loginUserUseCase.execute(
      body,
      this.getRequestContext(request),
    );

    this.setAuthCookies(reply, result);

    const response: ApiResponse<LoginResponseDTO> = {
      data: {
        userId: result.userId,
        userType: 'user',
        roles: result.roles,
        permissions: result.permissions,
      },
      message: 'Sessão iniciada com sucesso.',
    };

    reply.status(200).send(response);
  }

  async resendVerification(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = resendVerificationSchema.parse(request.body);
    await this.deps.resendVerificationUseCase.execute(body.email, this.getRequestContext(request));

    const response: ApiResponse<null> = {
      data: null,
      message: 'Se existir uma conta por ativar com este email, enviámos um novo link e código de ativação.',
    };
    reply.status(200).send(response);
  }

  async forgotPassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = forgotPasswordSchema.parse(request.body);
    await this.deps.forgotClientPasswordUseCase.execute(body.email, this.getRequestContext(request));
    const response: ApiResponse<null> = { data: null, message: GENERIC_RESET_MESSAGE };
    reply.status(200).send(response);
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = resetPasswordSchema.parse(request.body);
    await this.deps.resetClientPasswordUseCase.execute(toResetInput(body), this.getRequestContext(request));
    const response: ApiResponse<null> = {
      data: null,
      message: 'Senha recuperada com sucesso. Pode agora iniciar sessão com a nova senha.',
    };
    reply.status(200).send(response);
  }

  async forgotUserPassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = forgotPasswordSchema.parse(request.body);
    await this.deps.forgotUserPasswordUseCase.execute(body.email, this.getRequestContext(request));
    const response: ApiResponse<null> = { data: null, message: GENERIC_RESET_MESSAGE };
    reply.status(200).send(response);
  }

  async resetUserPassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = resetPasswordSchema.parse(request.body);
    await this.deps.resetUserPasswordUseCase.execute(toResetInput(body), this.getRequestContext(request));
    const response: ApiResponse<null> = {
      data: null,
      message: 'Senha definida com sucesso. Pode agora iniciar sessão.',
    };
    reply.status(200).send(response);
  }

  /** Alteração de senha pelo próprio. Termina as outras sessões e renova a do dispositivo atual. */
  async changePassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.auth) throw new UnauthorizedError('Não autenticado.');
    const body = changePasswordSchema.parse(request.body);
    const ctx = this.getRequestContext(request);

    await this.deps.changeOwnPasswordUseCase.execute(
      { currentPassword: body.currentPassword, newPassword: body.newPassword },
      { actorId: request.auth.sub, actorType: request.auth.type, ...ctx },
    );

    const claims = await this.deps.sessionService.resolveClaims(request.auth.type, request.auth.sub);
    if (claims) {
      this.setAuthCookies(reply, await this.deps.sessionService.issue(claims, ctx));
    }

    const response: ApiResponse<null> = {
      data: null,
      message: 'Senha alterada com sucesso. As restantes sessões foram terminadas.',
    };
    reply.status(200).send(response);
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const token = request.cookies?.refresh_token;

    if (!token) {
      throw new UnauthorizedError('Refresh token não fornecido.');
    }

    let refreshed: Awaited<ReturnType<AuthSessionService['refresh']>>;
    try {
      refreshed = await this.deps.sessionService.refresh(token, this.getRequestContext(request));
    } catch (error) {
      this.clearAuthCookies(reply);
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Sessão expirada. Faça login novamente.');
    }

    this.setAuthCookies(reply, refreshed.tokens);

    const response: ApiResponse<null> = {
      data: null,
      message: 'Sessão renovada com sucesso.',
    };

    reply.status(200).send(response);
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.deps.sessionService.revoke(request.cookies?.refresh_token);
    this.clearAuthCookies(reply);

    const response: ApiResponse<null> = {
      data: null,
      message: 'Sessão terminada com sucesso.',
    };

    reply.status(200).send(response);
  }

  async me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.auth) {
      throw new UnauthorizedError('Não autenticado.');
    }

    // Roles/permissões vêm sempre da base de dados (não do token, que pode estar desatualizado).
    const claims = await this.deps.sessionService.resolveClaims(request.auth.type, request.auth.sub);
    if (!claims) {
      throw new UnauthorizedError('Conta inativa ou inexistente.');
    }

    if (request.auth.type === 'client') {
      const client = await this.deps.clientRepository.findById(request.auth.sub);
      if (!client) {
        throw new UnauthorizedError('Cliente não encontrado.');
      }

      const response: ApiResponse<{
        id: string;
        nip: string;
        name: string;
        email: string;
        phone: string | null;
        company: string | null;
        department: string | null;
        userType: 'client';
        roles: string[];
        permissions: string[];
      }> = {
        data: {
          id: client.id,
          nip: client.nip,
          name: client.name,
          email: client.email,
          phone: client.phone,
          company: client.company,
          department: client.department,
          userType: 'client',
          roles: claims.roles ?? [],
          permissions: claims.permissions ?? [],
        },
      };

      reply.status(200).send(response);
      return;
    }

    const user = await this.deps.userRepository.findById(claims.sub);

    const response: ApiResponse<{
      id: string;
      email: string;
      name: string | null;
      roles: string[];
      permissions: string[];
      userType: 'user';
    }> = {
      data: {
        id: claims.sub,
        email: claims.email,
        name: user?.name ?? null,
        roles: claims.roles ?? [],
        permissions: claims.permissions ?? [],
        userType: 'user',
      },
    };

    reply.status(200).send(response);
  }
}
