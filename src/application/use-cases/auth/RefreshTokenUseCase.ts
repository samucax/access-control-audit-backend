import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { UnauthorizedError } from '../../../shared/errors/AppError';
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiration,
  TokenPayload,
} from '../../../shared/utils/jwt';

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
}

/**
 * Refresh Token Use Case
 * Handles token refresh and rotation
 */
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const { refreshToken } = input;

    // Verify the refresh token
    let decoded: { userId: string; email: string; roleId: string };
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Check if token exists and is valid in database
    const isValid = await this.refreshTokenRepository.isTokenValid(refreshToken);
    if (!isValid) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    // Get user to ensure they still exist and are active
    const user = await this.userRepository.findById(decoded.userId);
    if (!user || !user.isActive) {
      // Revoke the token if user is invalid
      await this.refreshTokenRepository.revokeToken(refreshToken);
      throw new UnauthorizedError('User not found or deactivated');
    }

    // Revoke the old refresh token (token rotation)
    await this.refreshTokenRepository.revokeToken(refreshToken);

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Store new refresh token
    await this.refreshTokenRepository.create({
      token: newRefreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiration(),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
