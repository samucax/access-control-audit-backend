import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors/AppError';
import { PolicyService } from '../../application/services/PolicyService';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository';

/**
 * Creates a permission middleware factory
 * Returns a middleware that checks if the user has the required permission
 */
export const createPermissionMiddleware = (
  policyService: PolicyService,
  auditLogRepository: IAuditLogRepository
) => {
  return (resource: string, action: string) => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          throw new UnauthorizedError('Authentication required');
        }

        const hasPermission = await policyService.hasPermission(req.user.userId, resource, action);

        if (!hasPermission) {
          // Log permission denied
          await auditLogRepository.create({
            actorId: req.user.userId,
            actorEmail: req.user.email,
            action: 'PERMISSION_DENIED',
            resource,
            ipAddress: req.ip || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown',
            metadata: {
              requiredPermission: `${resource}:${action}`,
              requestPath: req.path,
              requestMethod: req.method,
            },
          });

          throw new ForbiddenError(`Permission denied: ${resource}:${action}`);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };
};

/**
 * Creates a middleware that checks for any of the specified permissions
 */
export const createAnyPermissionMiddleware = (
  policyService: PolicyService,
  auditLogRepository: IAuditLogRepository
) => {
  return (permissions: string[]) => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          throw new UnauthorizedError('Authentication required');
        }

        const hasAnyPermission = await policyService.hasAnyPermission(
          req.user.userId,
          permissions
        );

        if (!hasAnyPermission) {
          // Log permission denied
          await auditLogRepository.create({
            actorId: req.user.userId,
            actorEmail: req.user.email,
            action: 'PERMISSION_DENIED',
            resource: 'multiple',
            ipAddress: req.ip || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown',
            metadata: {
              requiredPermissions: permissions,
              requestPath: req.path,
              requestMethod: req.method,
            },
          });

          throw new ForbiddenError('Permission denied');
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };
};
