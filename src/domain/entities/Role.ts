/**
 * Role Domain Entity
 * Framework-agnostic representation of a Role
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleWithPermissions extends Omit<Role, 'permissionIds'> {
  permissions: {
    id: string;
    name: string;
    resource: string;
    action: string;
  }[];
}

export interface CreateRoleDTO {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
  permissionIds?: string[];
}
