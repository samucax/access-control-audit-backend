import { IPermissionRepository } from '../../../domain/repositories/IPermissionRepository';
import { Permission } from '../../../domain/entities/Permission';
import { NotFoundError } from '../../../shared/errors/AppError';

export interface GetPermissionInput {
  permissionId: string;
}

/**
 * Get Permission Use Case
 * Retrieves a single permission by ID
 */
export class GetPermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(input: GetPermissionInput): Promise<Permission> {
    const permission = await this.permissionRepository.findById(input.permissionId);

    if (!permission) {
      throw new NotFoundError('Permission not found');
    }

    return permission;
  }
}
