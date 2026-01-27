import { Request, Response, NextFunction } from 'express';
import { CreateRoleUseCase } from '../../application/use-cases/roles/CreateRoleUseCase';
import { GetRoleUseCase } from '../../application/use-cases/roles/GetRoleUseCase';
import { ListRolesUseCase } from '../../application/use-cases/roles/ListRolesUseCase';
import { UpdateRoleUseCase } from '../../application/use-cases/roles/UpdateRoleUseCase';
import { DeleteRoleUseCase } from '../../application/use-cases/roles/DeleteRoleUseCase';

/**
 * Role Controller
 * Handles HTTP requests for role management endpoints
 */
export class RoleController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = await this.createRoleUseCase.execute({
        ...req.body,
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
      });

      res.status(201).json({
        success: true,
        data: role,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = await this.getRoleUseCase.execute({
        roleId: req.params.id,
        includePermissions: req.query.includePermissions === 'true',
      });

      res.status(200).json({
        success: true,
        data: role,
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await this.listRolesUseCase.execute();

      res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = await this.updateRoleUseCase.execute({
        roleId: req.params.id,
        ...req.body,
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
      });

      res.status(200).json({
        success: true,
        data: role,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteRoleUseCase.execute({
        roleId: req.params.id,
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
      });

      res.status(200).json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
