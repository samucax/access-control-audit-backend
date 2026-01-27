import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';

export interface LogoutInput {
  userId: string;
  email: string;
  refreshToken?: string;
  logoutAll?: boolean;
  ipAddress: string;
  userAgent: string;
}

/**
 * Logout Use Case
 * Handles user logout and token revocation
 */
export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    const { userId, email, refreshToken, logoutAll, ipAddress, userAgent } = input;

    if (logoutAll) {
      // Revoke all user's refresh tokens
      await this.refreshTokenRepository.revokeAllUserTokens(userId);
    } else if (refreshToken) {
      // Revoke only the provided refresh token
      await this.refreshTokenRepository.revokeToken(refreshToken);
    }

    // Log the logout action
    await this.auditLogRepository.create({
      actorId: userId,
      actorEmail: email,
      action: 'LOGOUT',
      resource: 'auth',
      ipAddress,
      userAgent,
      metadata: { logoutAll: logoutAll || false },
    });
  }
}
