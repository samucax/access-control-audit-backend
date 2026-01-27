import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';
import { validate } from '../../infrastructure/middleware/validationMiddleware';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  listUsersQuerySchema,
} from '../validators/userValidator';

type PermissionMiddleware = (resource: string, action: string) => ReturnType<typeof authMiddleware>;

/**
 * Creates user routes
 */
export const createUserRoutes = (
  userController: UserController,
  requirePermission: PermissionMiddleware
): Router => {
  const router = Router();

  // All user routes require authentication
  router.use(authMiddleware);

  /**
   * POST /users
   * Create a new user
   */
  router.post(
    '/',
    requirePermission('users', 'create'),
    validate(createUserSchema),
    userController.create
  );

  /**
   * GET /users
   * List all users with pagination
   */
  router.get(
    '/',
    requirePermission('users', 'read'),
    validate(listUsersQuerySchema, 'query'),
    userController.list
  );

  /**
   * GET /users/:id
   * Get a user by ID
   */
  router.get(
    '/:id',
    requirePermission('users', 'read'),
    validate(userIdParamSchema, 'params'),
    userController.getById
  );

  /**
   * PATCH /users/:id
   * Update a user
   */
  router.patch(
    '/:id',
    requirePermission('users', 'update'),
    validate(userIdParamSchema, 'params'),
    validate(updateUserSchema),
    userController.update
  );

  /**
   * DELETE /users/:id
   * Delete a user
   */
  router.delete(
    '/:id',
    requirePermission('users', 'delete'),
    validate(userIdParamSchema, 'params'),
    userController.delete
  );

  return router;
};
