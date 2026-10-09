// ============================================================
// Auth types
// ============================================================

export interface ClientAuthPayload {
  sub: string; // client id
  email: string;
  type: 'client';
  iat: number;
  exp: number;
}

export interface UserAuthPayload {
  sub: string; // user id
  email: string;
  type: 'user';
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

export type AuthPayload = ClientAuthPayload | UserAuthPayload;

export interface RegisterClientDTO {
  nip: string;
  name: string;
  email: string;
}

export interface VerifyEmailDTO {
  token: string;
}

export interface SetPasswordDTO {
  token: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
}

// ============================================================
// Auth response DTOs
// ============================================================

/**
 * Resposta de login. Os tokens NUNCA vêm no corpo: a sessão vive apenas nos
 * cookies httpOnly `access_token` e `refresh_token`.
 */
export interface LoginResponseDTO {
  userId: string;
  userType: 'client' | 'user';
  roles: string[];
  permissions: string[];
}
