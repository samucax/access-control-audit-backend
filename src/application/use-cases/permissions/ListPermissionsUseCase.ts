import { IPermissionRepository } from '../../../domain/repositories/IPermissionRepository';
import { Permission } from '../../../domain/entities/Permission';

export interface ListPermissionsInput {
  resource?: string;
}

/**
 * List Permissions Use Case
 * Retrieves all permissions, optionally filtered by resource
 */
export class ListPermissionsUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(input: ListPermissionsInput = {}): Promise<Permission[]> {
    const { resource } = input;

    if (resource) {
      return this.permissionRepository.findByResource(resource);
    }

    return this.permissionRepository.findAll();
  }
}
