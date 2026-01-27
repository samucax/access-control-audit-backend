import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IRoleRepository } from '../../../domain/repositories/IRoleRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { User, CreateUserDTO } from '../../../domain/entities/User';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';

export interface CreateUserInput extends CreateUserDTO {
  actorId: string;
  actorEmail: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Create User Use Case
 * Handles user creation with validation and audit logging
 */
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const { email, password, firstName, lastName, roleId, actorId, actorEmail, ipAddress, userAgent } =
      input;

    // Check if email already exists
    const emailExists = await this.userRepository.existsByEmail(email);
    if (emailExists) {
      throw new ConflictError('Email already registered');
    }

    // Verify role exists
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // Create user
    const user = await this.userRepository.create({
      email,
      password,
      firstName,
      lastName,
      roleId,
    });

    // Log the action
    await this.auditLogRepository.create({
      actorId,
      actorEmail,
      action: 'CREATE',
      resource: 'users',
      resourceId: user.id,
      ipAddress,
      userAgent,
      metadata: {
        createdUserEmail: user.email,
        assignedRole: role.name,
      },
    });

    return user;
  }
}
