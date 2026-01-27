/**
 * RefreshToken Domain Entity
 * Framework-agnostic representation of a Refresh Token
 */
export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

export interface CreateRefreshTokenDTO {
  token: string;
  userId: string;
  expiresAt: Date;
}
