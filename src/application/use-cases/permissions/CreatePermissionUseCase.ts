import { IPermissionRepository } from '../../../domain/repositories/IPermissionRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { Permission, CreatePermissionDTO } from '../../../domain/entities/Permission';
import { ConflictError } from '../../../shared/errors/AppError';

export interface CreatePermissionInput extends CreatePermissionDTO {
  actorId: string;
  actorEmail: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Create Permission Use Case
 * Handles permission creation
 */
export class CreatePermissionUseCase {
  constructor(
    private readonly permissionRepository: IPermissionRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(input: CreatePermissionInput): Promise<Permission> {
    const { name, resource, action, description, actorId, actorEmail, ipAddress, userAgent } = input;

    // Check if permission name already exists
    const nameExists = await this.permissionRepository.existsByName(name);
    if (nameExists) {
      throw new ConflictError('Permission name already exists');
    }

    // Check if resource-action combination exists
    const existingPermission = await this.permissionRepository.findByResourceAndAction(
      resource,
      action
    );
    if (existingPermission) {
      throw new ConflictError(`Permission for ${resource}:${action} already exists`);
    }

    // Create permission
    const permission = await this.permissionRepository.create({
      name,
      resource,
      action,
      description,
    });

    // Log the action
    await this.auditLogRepository.create({
      actorId,
      actorEmail,
      action: 'CREATE',
      resource: 'permissions',
      resourceId: permission.id,
      ipAddress,
      userAgent,
      metadata: {
        permissionName: permission.name,
        permissionKey: `${resource}:${action}`,
      },
    });

    return permission;
  }
}
