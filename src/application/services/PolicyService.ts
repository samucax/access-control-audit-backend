import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IRoleRepository } from '../../domain/repositories/IRoleRepository';
import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository';
import { formatPermission } from '../../domain/entities/Permission';

/**
 * Policy Service
 * Handles RBAC permission evaluation
 */
export class PolicyService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository
  ) {}

  /**
   * Check if a user has a specific permission
   * @param userId - The user's ID
   * @param resource - The resource being accessed (e.g., "users", "roles")
   * @param action - The action being performed (e.g., "create", "read", "update", "delete")
   * @returns true if the user has the permission, false otherwise
   */
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    // Get user with role
    const user = await this.userRepository.findByIdWithRole(userId);
    if (!user || !user.isActive) {
      return false;
    }

    // Get role with permissions
    const role = await this.roleRepository.findByIdWithPermissions(user.role.id);
    if (!role) {
      return false;
    }

    // Check for "manage" permission on the resource (grants all actions)
    const managePermission = formatPermission(resource, 'manage');
    const hasManagePermission = role.permissions.some((p) => p.name === managePermission);
    if (hasManagePermission) {
      return true;
    }

    // Check for specific permission
    const requiredPermission = formatPermission(resource, action);
    return role.permissions.some((p) => p.name === requiredPermission);
  }

  /**
   * Check if a user has any of the specified permissions
   * @param userId - The user's ID
   * @param permissions - Array of permission strings (e.g., ["users:create", "users:manage"])
   * @returns true if the user has at least one of the permissions
   */
  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    const user = await this.userRepository.findByIdWithRole(userId);
    if (!user || !user.isActive) {
      return false;
    }

    const role = await this.roleRepository.findByIdWithPermissions(user.role.id);
    if (!role) {
      return false;
    }

    const userPermissions = role.permissions.map((p) => p.name);
    return permissions.some((permission) => userPermissions.includes(permission));
  }

  /**
   * Check if a user has all of the specified permissions
   * @param userId - The user's ID
   * @param permissions - Array of permission strings
   * @returns true if the user has all of the permissions
   */
  async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    const user = await this.userRepository.findByIdWithRole(userId);
    if (!user || !user.isActive) {
      return false;
    }

    const role = await this.roleRepository.findByIdWithPermissions(user.role.id);
    if (!role) {
      return false;
    }

    const userPermissions = role.permissions.map((p) => p.name);
    return permissions.every((permission) => userPermissions.includes(permission));
  }

  /**
   * Get all permissions for a user
   * @param userId - The user's ID
   * @returns Array of permission strings
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userRepository.findByIdWithRole(userId);
    if (!user || !user.isActive) {
      return [];
    }

    const role = await this.roleRepository.findByIdWithPermissions(user.role.id);
    if (!role) {
      return [];
    }

    return role.permissions.map((p) => p.name);
  }
}
