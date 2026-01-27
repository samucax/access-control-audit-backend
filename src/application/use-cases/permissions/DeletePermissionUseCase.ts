import { IPermissionRepository } from '../../../domain/repositories/IPermissionRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { NotFoundError } from '../../../shared/errors/AppError';

export interface DeletePermissionInput {
  permissionId: string;
  actorId: string;
  actorEmail: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Delete Permission Use Case
 * Handles permission deletion
 */
export class DeletePermissionUseCase {
  constructor(
    private readonly permissionRepository: IPermissionRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(input: DeletePermissionInput): Promise<void> {
    const { permissionId, actorId, actorEmail, ipAddress, userAgent } = input;

    // Get existing permission
    const existingPermission = await this.permissionRepository.findById(permissionId);
    if (!existingPermission) {
      throw new NotFoundError('Permission not found');
    }

    // Delete permission
    const deleted = await this.permissionRepository.delete(permissionId);
    if (!deleted) {
      throw new NotFoundError('Permission not found');
    }

    // Log the action
    await this.auditLogRepository.create({
      actorId,
      actorEmail,
      action: 'DELETE',
      resource: 'permissions',
      resourceId: permissionId,
      ipAddress,
      userAgent,
      metadata: {
        deletedPermissionName: existingPermission.name,
        deletedPermissionKey: `${existingPermission.resource}:${existingPermission.action}`,
      },
    });
  }
}
