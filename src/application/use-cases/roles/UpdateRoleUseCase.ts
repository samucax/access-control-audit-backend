import { IRoleRepository } from '../../../domain/repositories/IRoleRepository';
import { IPermissionRepository } from '../../../domain/repositories/IPermissionRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { Role, UpdateRoleDTO } from '../../../domain/entities/Role';
import { ConflictError, NotFoundError, BadRequestError, ForbiddenError } from '../../../shared/errors/AppError';

export interface UpdateRoleInput extends UpdateRoleDTO {
  roleId: string;
  actorId: string;
  actorEmail: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Update Role Use Case
 * Handles role updates with validation
 */
export class UpdateRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(input: UpdateRoleInput): Promise<Role> {
    const { roleId, name, description, permissionIds, actorId, actorEmail, ipAddress, userAgent } =
      input;

    // Get existing role
    const existingRole = await this.roleRepository.findById(roleId);
    if (!existingRole) {
      throw new NotFoundError('Role not found');
    }

    // Prevent modification of system roles
    if (existingRole.isSystem) {
      throw new ForbiddenError('Cannot modify system roles');
    }

    // Check name uniqueness if changing
    if (name && name !== existingRole.name) {
      const nameExists = await this.roleRepository.existsByName(name);
      if (nameExists) {
        throw new ConflictError('Role name already exists');
      }
    }

    // Validate permission IDs if provided
    if (permissionIds && permissionIds.length > 0) {
      const existingPermissions = await this.permissionRepository.findByIds(permissionIds);
      if (existingPermissions.length !== permissionIds.length) {
        throw new BadRequestError('One or more permission IDs are invalid');
      }
    }

    // Build update data
    const updateData: UpdateRoleDTO = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (permissionIds !== undefined) updateData.permissionIds = permissionIds;

    // Update role
    const updatedRole = await this.roleRepository.update(roleId, updateData);
    if (!updatedRole) {
      throw new NotFoundError('Role not found');
    }

    // Log the action
    await this.auditLogRepository.create({
      actorId,
      actorEmail,
      action: 'UPDATE',
      resource: 'roles',
      resourceId: roleId,
      ipAddress,
      userAgent,
      metadata: {
        changes: updateData,
        previousValues: {
          name: existingRole.name,
          description: existingRole.description,
          permissionIds: existingRole.permissionIds,
        },
      },
    });

    return updatedRole;
  }
}
