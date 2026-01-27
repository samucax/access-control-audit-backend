import { z } from 'zod';

export const createPermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required').max(100, 'Permission name is too long'),
  resource: z.string().min(1, 'Resource is required').max(50, 'Resource name is too long'),
  action: z.enum(['create', 'read', 'update', 'delete', 'manage'], {
    errorMap: () => ({ message: 'Invalid action type' }),
  }),
  description: z.string().min(1, 'Description is required').max(255, 'Description is too long'),
});

export const permissionIdParamSchema = z.object({
  id: z.string().min(1, 'Permission ID is required'),
});

export const listPermissionsQuerySchema = z.object({
  resource: z.string().optional(),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type PermissionIdParam = z.infer<typeof permissionIdParamSchema>;
export type ListPermissionsQuery = z.infer<typeof listPermissionsQuerySchema>;
