import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IRoleRepository } from '../../../domain/repositories/IRoleRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { User, UpdateUserDTO } from '../../../domain/entities/User';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';

export interface UpdateUserInput extends UpdateUserDTO {
  userId: string;
  actorId: string;
  actorEmail: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Update User Use Case
 * Handles user updates with validation and audit logging
 */
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(input: UpdateUserInput): Promise<User> {
    const {
      userId,
      email,
      firstName,
      lastName,
      roleId,
      isActive,
      actorId,
      actorEmail,
      ipAddress,
      userAgent,
    } = input;

    // Get existing user
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Check email uniqueness if changing
    if (email && email !== existingUser.email) {
      const emailExists = await this.userRepository.existsByEmail(email);
      if (emailExists) {
        throw new ConflictError('Email already registered');
      }
    }

    // Verify role exists if changing
    if (roleId && roleId !== existingUser.roleId) {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new NotFoundError('Role not found');
      }
    }

    // Build update data
    const updateData: UpdateUserDTO = {};
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (roleId !== undefined) updateData.roleId = roleId;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update user
    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    // Log the action
    await this.auditLogRepository.create({
      actorId,
      actorEmail,
      action: 'UPDATE',
      resource: 'users',
      resourceId: userId,
      ipAddress,
      userAgent,
      metadata: {
        changes: updateData,
        previousValues: {
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          roleId: existingUser.roleId,
          isActive: existingUser.isActive,
        },
      },
    });

    return updatedUser;
  }
}
