import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50, 'Role name is too long'),
  description: z.string().min(1, 'Description is required').max(255, 'Description is too long'),
  permissionIds: z.array(z.string()).default([]),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().min(1).max(255).optional(),
  permissionIds: z.array(z.string()).optional(),
});

export const roleIdParamSchema = z.object({
  id: z.string().min(1, 'Role ID is required'),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type RoleIdParam = z.infer<typeof roleIdParamSchema>;
