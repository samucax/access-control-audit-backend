import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { NotFoundError, BadRequestError } from '../../../shared/errors/AppError';

export interface DeleteUserInput {
  userId: string;
  actorId: string;
  actorEmail: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Delete User Use Case
 * Handles user deletion with validation and audit logging
 */
export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(input: DeleteUserInput): Promise<void> {
    const { userId, actorId, actorEmail, ipAddress, userAgent } = input;

    // Prevent self-deletion
    if (userId === actorId) {
      throw new BadRequestError('Cannot delete your own account');
    }

    // Get existing user for audit
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Revoke all user's tokens
    await this.refreshTokenRepository.revokeAllUserTokens(userId);

    // Delete user
    const deleted = await this.userRepository.delete(userId);
    if (!deleted) {
      throw new NotFoundError('User not found');
    }

    // Log the action
    await this.auditLogRepository.create({
      actorId,
      actorEmail,
      action: 'DELETE',
      resource: 'users',
      resourceId: userId,
      ipAddress,
      userAgent,
      metadata: {
        deletedUserEmail: existingUser.email,
        deletedUserName: `${existingUser.firstName} ${existingUser.lastName}`,
      },
    });
  }
}
