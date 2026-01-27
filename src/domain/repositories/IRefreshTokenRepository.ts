import { RefreshToken, CreateRefreshTokenDTO } from '../entities/RefreshToken';

/**
 * RefreshToken Repository Interface
 * Defines the contract for refresh token data access operations
 */
export interface IRefreshTokenRepository {
  create(data: CreateRefreshTokenDTO): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  findByUserId(userId: string): Promise<RefreshToken[]>;
  revokeToken(token: string): Promise<boolean>;
  revokeAllUserTokens(userId: string): Promise<boolean>;
  deleteExpiredTokens(): Promise<number>;
  isTokenValid(token: string): Promise<boolean>;
}
