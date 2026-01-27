import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';
import { validate } from '../../infrastructure/middleware/validationMiddleware';
import { loginSchema, refreshTokenSchema, logoutSchema } from '../validators/authValidator';

/**
 * Creates auth routes
 */
export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  /**
   * POST /auth/login
   * Public endpoint for user authentication
   */
  router.post('/login', validate(loginSchema), authController.login);

  /**
   * POST /auth/refresh
   * Public endpoint for token refresh
   */
  router.post('/refresh', validate(refreshTokenSchema), authController.refresh);

  /**
   * POST /auth/logout
   * Protected endpoint for user logout
   */
  router.post('/logout', authMiddleware, validate(logoutSchema), authController.logout);

  /**
   * GET /auth/me
   * Protected endpoint to get current user info
   */
  router.get('/me', authMiddleware, authController.me);

  return router;
};
