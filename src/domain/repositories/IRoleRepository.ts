import { Role, CreateRoleDTO, UpdateRoleDTO, RoleWithPermissions } from '../entities/Role';

/**
 * Role Repository Interface
 * Defines the contract for role data access operations
 */
export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByIdWithPermissions(id: string): Promise<RoleWithPermissions | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  create(data: CreateRoleDTO): Promise<Role>;
  update(id: string, data: UpdateRoleDTO): Promise<Role | null>;
  delete(id: string): Promise<boolean>;
  existsByName(name: string): Promise<boolean>;
  getPermissionIds(roleId: string): Promise<string[]>;
}
