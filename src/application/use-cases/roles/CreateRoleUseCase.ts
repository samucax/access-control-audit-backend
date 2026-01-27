import { IRoleRepository } from '../../../domain/repositories/IRoleRepository';
import { IPermissionRepository } from '../../../domain/repositories/IPermissionRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { Role, CreateRoleDTO } from '../../../domain/entities/Role';
import { ConflictError, BadRequestError } from '../../../shared/errors/AppError';

export interface CreateRoleInput extends CreateRoleDTO {
  actorId: string;
  actorEmail: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Create Role Use Case
 * Handles role creation with permission validation
 */
export class CreateRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(input: CreateRoleInput): Promise<Role> {
    const { name, description, permissionIds, actorId, actorEmail, ipAddress, userAgent } = input;

    // Check if role name already exists
    const nameExists = await this.roleRepository.existsByName(name);
    if (nameExists) {
      throw new ConflictError('Role name already exists');
    }

    // Validate all permission IDs exist
    if (permissionIds.length > 0) {
      const existingPermissions = await this.permissionRepository.findByIds(permissionIds);
      if (existingPermissions.length !== permissionIds.length) {
        throw new BadRequestError('One or more permission IDs are invalid');
      }
    }

    // Create role
    const role = await this.roleRepository.create({
      name,
      description,
      permissionIds,
    });

    // Log the action
    await this.auditLogRepository.create({
      actorId,
      actorEmail,
      action: 'CREATE',
      resource: 'roles',
      resourceId: role.id,
      ipAddress,
      userAgent,
      metadata: {
        roleName: role.name,
        permissionCount: permissionIds.length,
      },
    });

    return role;
  }
}
