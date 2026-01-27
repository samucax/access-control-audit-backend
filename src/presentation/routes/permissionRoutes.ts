import { Router } from 'express';
import { PermissionController } from '../controllers/PermissionController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';
import { validate } from '../../infrastructure/middleware/validationMiddleware';
import {
  createPermissionSchema,
  permissionIdParamSchema,
  listPermissionsQuerySchema,
} from '../validators/permissionValidator';

type PermissionMiddleware = (resource: string, action: string) => ReturnType<typeof authMiddleware>;

/**
 * Creates permission routes
 */
export const createPermissionRoutes = (
  permissionController: PermissionController,
  requirePermission: PermissionMiddleware
): Router => {
  const router = Router();

  // All permission routes require authentication
  router.use(authMiddleware);

  /**
   * POST /permissions
   * Create a new permission
   */
  router.post(
    '/',
    requirePermission('permissions', 'create'),
    validate(createPermissionSchema),
    permissionController.create
  );

  /**
   * GET /permissions
   * List all permissions
   */
  router.get(
    '/',
    requirePermission('permissions', 'read'),
    validate(listPermissionsQuerySchema, 'query'),
    permissionController.list
  );

  /**
   * GET /permissions/:id
   * Get a permission by ID
   */
  router.get(
    '/:id',
    requirePermission('permissions', 'read'),
    validate(permissionIdParamSchema, 'params'),
    permissionController.getById
  );

  /**
   * DELETE /permissions/:id
   * Delete a permission
   */
  router.delete(
    '/:id',
    requirePermission('permissions', 'delete'),
    validate(permissionIdParamSchema, 'params'),
    permissionController.delete
  );

  return router;
};
