import { Request, Response, NextFunction } from 'express';
import { ListAuditLogsUseCase } from '../../application/use-cases/audit-logs/ListAuditLogsUseCase';
import { GetAuditLogStatsUseCase } from '../../application/use-cases/audit-logs/GetAuditLogStatsUseCase';
import { GetResourceAuditTrailUseCase } from '../../application/use-cases/audit-logs/GetResourceAuditTrailUseCase';
import { AuditAction } from '../../domain/entities/AuditLog';

/**
 * AuditLog Controller
 * Handles HTTP requests for audit log endpoints
 */
export class AuditLogController {
  constructor(
    private readonly listAuditLogsUseCase: ListAuditLogsUseCase,
    private readonly getAuditLogStatsUseCase: GetAuditLogStatsUseCase,
    private readonly getResourceAuditTrailUseCase: GetResourceAuditTrailUseCase
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listAuditLogsUseCase.execute({
        actorId: req.query.actorId as string | undefined,
        action: req.query.action as AuditAction | undefined,
        resource: req.query.resource as string | undefined,
        resourceId: req.query.resourceId as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        page: req.query.page as unknown as number,
        limit: req.query.limit as unknown as number,
      });

      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getAuditLogStatsUseCase.execute({
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        groupBy: req.query.groupBy as 'action' | 'resource' | 'actor',
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getResourceAuditTrail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const logs = await this.getResourceAuditTrailUseCase.execute({
        resource: req.params.resource,
        resourceId: req.params.resourceId,
      });

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  };
}
