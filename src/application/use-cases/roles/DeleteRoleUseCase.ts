import { IRoleRepository } from '../../../domain/repositories/IRoleRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../../shared/errors/AppError';

export interface DeleteRoleInput {
  roleId: string;
  actorId: string;
  actorEmail: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Delete Role Use Case
 * Handles role deletion with validation
 */
export class DeleteRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRepository: IUserRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(input: DeleteRoleInput): Promise<void> {
    const { roleId, actorId, actorEmail, ipAddress, userAgent } = input;

    // Get existing role
    const existingRole = await this.roleRepository.findById(roleId);
    if (!existingRole) {
      throw new NotFoundError('Role not found');
    }

    // Prevent deletion of system roles
    if (existingRole.isSystem) {
      throw new ForbiddenError('Cannot delete system roles');
    }

    // Check if any users are assigned to this role
    const usersWithRole = await this.userRepository.findByRoleId(roleId);
    if (usersWithRole.length > 0) {
      throw new BadRequestError(
        `Cannot delete role. ${usersWithRole.length} user(s) are still assigned to this role.`
      );
    }

    // Delete role
    const deleted = await this.roleRepository.delete(roleId);
    if (!deleted) {
      throw new NotFoundError('Role not found');
    }

    // Log the action
    await this.auditLogRepository.create({
      actorId,
      actorEmail,
      action: 'DELETE',
      resource: 'roles',
      resourceId: roleId,
      ipAddress,
      userAgent,
      metadata: {
        deletedRoleName: existingRole.name,
      },
    });
  }
}
