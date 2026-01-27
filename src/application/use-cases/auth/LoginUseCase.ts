import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { UnauthorizedError } from '../../../shared/errors/AppError';
import { comparePassword } from '../../../shared/utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiration,
  TokenPayload,
} from '../../../shared/utils/jwt';

export interface LoginInput {
  email: string;
  password: string;
  ipAddress: string;
  userAgent: string;
}

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Login Use Case
 * Handles user authentication and token generation
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const { email, password, ipAddress, userAgent } = input;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      await this.logFailedAttempt(email, ipAddress, userAgent);
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      await this.logFailedAttempt(email, ipAddress, userAgent, user.id);
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      await this.logFailedAttempt(email, ipAddress, userAgent, user.id);
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    await this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiration(),
    });

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Log successful login
    await this.auditLogRepository.create({
      actorId: user.id,
      actorEmail: user.email,
      action: 'LOGIN',
      resource: 'auth',
      ipAddress,
      userAgent,
      metadata: { method: 'password' },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  private async logFailedAttempt(
    email: string,
    ipAddress: string,
    userAgent: string,
    userId?: string
  ): Promise<void> {
    await this.auditLogRepository.create({
      actorId: userId || '000000000000000000000000',
      actorEmail: email,
      action: 'LOGIN_FAILED',
      resource: 'auth',
      ipAddress,
      userAgent,
      metadata: { reason: userId ? 'invalid_password' : 'user_not_found' },
    });
  }
}
