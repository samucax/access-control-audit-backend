import { Router } from 'express';
import { AuditLogController } from '../controllers/AuditLogController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';
import { validate } from '../../infrastructure/middleware/validationMiddleware';
import {
  listAuditLogsQuerySchema,
  auditLogStatsQuerySchema,
  resourceAuditTrailParamsSchema,
} from '../validators/auditLogValidator';

type PermissionMiddleware = (resource: string, action: string) => ReturnType<typeof authMiddleware>;

/**
 * Creates audit log routes
 */
export const createAuditLogRoutes = (
  auditLogController: AuditLogController,
  requirePermission: PermissionMiddleware
): Router => {
  const router = Router();

  // All audit log routes require authentication
  router.use(authMiddleware);

  /**
   * GET /audit-logs
   * List all audit logs with filtering and pagination
   */
  router.get(
    '/',
    requirePermission('audit-logs', 'read'),
    validate(listAuditLogsQuerySchema, 'query'),
    auditLogController.list
  );

  /**
   * GET /audit-logs/stats
   * Get aggregated audit log statistics
   */
  router.get(
    '/stats',
    requirePermission('audit-logs', 'read'),
    validate(auditLogStatsQuerySchema, 'query'),
    auditLogController.getStats
  );

  /**
   * GET /audit-logs/trail/:resource/:resourceId
   * Get audit trail for a specific resource
   */
  router.get(
    '/trail/:resource/:resourceId',
    requirePermission('audit-logs', 'read'),
    validate(resourceAuditTrailParamsSchema, 'params'),
    auditLogController.getResourceAuditTrail
  );

  return router;
};
