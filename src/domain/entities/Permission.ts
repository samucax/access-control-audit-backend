/**
 * Permission Domain Entity
 * Framework-agnostic representation of a Permission
 */
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: PermissionAction;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

export interface CreatePermissionDTO {
  name: string;
  resource: string;
  action: PermissionAction;
  description: string;
}

export interface UpdatePermissionDTO {
  name?: string;
  description?: string;
}

/**
 * Permission string format: "resource:action"
 * Example: "users:create", "roles:manage"
 */
export const formatPermission = (resource: string, action: string): string => {
  return `${resource}:${action}`;
};

export const parsePermission = (permission: string): { resource: string; action: string } => {
  const [resource, action] = permission.split(':');
  return { resource, action };
};
