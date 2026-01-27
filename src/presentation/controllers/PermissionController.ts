import { Request, Response, NextFunction } from 'express';
import { CreatePermissionUseCase } from '../../application/use-cases/permissions/CreatePermissionUseCase';
import { GetPermissionUseCase } from '../../application/use-cases/permissions/GetPermissionUseCase';
import { ListPermissionsUseCase } from '../../application/use-cases/permissions/ListPermissionsUseCase';
import { DeletePermissionUseCase } from '../../application/use-cases/permissions/DeletePermissionUseCase';

/**
 * Permission Controller
 * Handles HTTP requests for permission management endpoints
 */
export class PermissionController {
  constructor(
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly getPermissionUseCase: GetPermissionUseCase,
    private readonly listPermissionsUseCase: ListPermissionsUseCase,
    private readonly deletePermissionUseCase: DeletePermissionUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permission = await this.createPermissionUseCase.execute({
        ...req.body,
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
      });

      res.status(201).json({
        success: true,
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permission = await this.getPermissionUseCase.execute({
        permissionId: req.params.id,
      });

      res.status(200).json({
        success: true,
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permissions = await this.listPermissionsUseCase.execute({
        resource: req.query.resource as string | undefined,
      });

      res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deletePermissionUseCase.execute({
        permissionId: req.params.id,
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
      });

      res.status(200).json({
        success: true,
        message: 'Permission deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
