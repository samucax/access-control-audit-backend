import { Router } from 'express';
import { RoleController } from '../controllers/RoleController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';
import { validate } from '../../infrastructure/middleware/validationMiddleware';
import { createRoleSchema, updateRoleSchema, roleIdParamSchema } from '../validators/roleValidator';

type PermissionMiddleware = (resource: string, action: string) => ReturnType<typeof authMiddleware>;

/**
 * Creates role routes
 */
export const createRoleRoutes = (
  roleController: RoleController,
  requirePermission: PermissionMiddleware
): Router => {
  const router = Router();

  // All role routes require authentication
  router.use(authMiddleware);

  /**
   * POST /roles
   * Create a new role
   */
  router.post(
    '/',
    requirePermission('roles', 'create'),
    validate(createRoleSchema),
    roleController.create
  );

  /**
   * GET /roles
   * List all roles
   */
  router.get('/', requirePermission('roles', 'read'), roleController.list);

  /**
   * GET /roles/:id
   * Get a role by ID
   */
  router.get(
    '/:id',
    requirePermission('roles', 'read'),
    validate(roleIdParamSchema, 'params'),
    roleController.getById
  );

  /**
   * PATCH /roles/:id
   * Update a role
   */
  router.patch(
    '/:id',
    requirePermission('roles', 'update'),
    validate(roleIdParamSchema, 'params'),
    validate(updateRoleSchema),
    roleController.update
  );

  /**
   * DELETE /roles/:id
   * Delete a role
   */
  router.delete(
    '/:id',
    requirePermission('roles', 'delete'),
    validate(roleIdParamSchema, 'params'),
    roleController.delete
  );

  return router;
};
