import { IRoleRepository } from '../../../domain/repositories/IRoleRepository';
import { Role, RoleWithPermissions } from '../../../domain/entities/Role';
import { NotFoundError } from '../../../shared/errors/AppError';

export interface GetRoleInput {
  roleId: string;
  includePermissions?: boolean;
}

/**
 * Get Role Use Case
 * Retrieves a single role by ID
 */
export class GetRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(input: GetRoleInput): Promise<Role | RoleWithPermissions> {
    const { roleId, includePermissions } = input;

    const role = includePermissions
      ? await this.roleRepository.findByIdWithPermissions(roleId)
      : await this.roleRepository.findById(roleId);

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    return role;
  }
}
