import express, { Application } from 'express';
import cors from 'cors';
import { config } from './infrastructure/config';
import { errorMiddleware, notFoundMiddleware } from './infrastructure/middleware/errorMiddleware';
import { createPermissionMiddleware } from './infrastructure/middleware/permissionMiddleware';

// Repositories
import { MongoUserRepository } from './infrastructure/database/mongoose/repositories/MongoUserRepository';
import { MongoRoleRepository } from './infrastructure/database/mongoose/repositories/MongoRoleRepository';
import { MongoPermissionRepository } from './infrastructure/database/mongoose/repositories/MongoPermissionRepository';
import { MongoAuditLogRepository } from './infrastructure/database/mongoose/repositories/MongoAuditLogRepository';
import { MongoRefreshTokenRepository } from './infrastructure/database/mongoose/repositories/MongoRefreshTokenRepository';

// Services
import { PolicyService } from './application/services/PolicyService';

// Use Cases - Auth
import { LoginUseCase } from './application/use-cases/auth/LoginUseCase';
import { RefreshTokenUseCase } from './application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from './application/use-cases/auth/LogoutUseCase';

// Use Cases - Users
import { CreateUserUseCase } from './application/use-cases/users/CreateUserUseCase';
import { GetUserUseCase } from './application/use-cases/users/GetUserUseCase';
import { ListUsersUseCase } from './application/use-cases/users/ListUsersUseCase';
import { UpdateUserUseCase } from './application/use-cases/users/UpdateUserUseCase';
import { DeleteUserUseCase } from './application/use-cases/users/DeleteUserUseCase';

// Use Cases - Roles
import { CreateRoleUseCase } from './application/use-cases/roles/CreateRoleUseCase';
import { GetRoleUseCase } from './application/use-cases/roles/GetRoleUseCase';
import { ListRolesUseCase } from './application/use-cases/roles/ListRolesUseCase';
import { UpdateRoleUseCase } from './application/use-cases/roles/UpdateRoleUseCase';
import { DeleteRoleUseCase } from './application/use-cases/roles/DeleteRoleUseCase';

// Use Cases - Permissions
import { CreatePermissionUseCase } from './application/use-cases/permissions/CreatePermissionUseCase';
import { GetPermissionUseCase } from './application/use-cases/permissions/GetPermissionUseCase';
import { ListPermissionsUseCase } from './application/use-cases/permissions/ListPermissionsUseCase';
import { DeletePermissionUseCase } from './application/use-cases/permissions/DeletePermissionUseCase';

// Use Cases - Audit Logs
import { ListAuditLogsUseCase } from './application/use-cases/audit-logs/ListAuditLogsUseCase';
import { GetAuditLogStatsUseCase } from './application/use-cases/audit-logs/GetAuditLogStatsUseCase';
import { GetResourceAuditTrailUseCase } from './application/use-cases/audit-logs/GetResourceAuditTrailUseCase';

// Controllers
import { AuthController } from './presentation/controllers/AuthController';
import { UserController } from './presentation/controllers/UserController';
import { RoleController } from './presentation/controllers/RoleController';
import { PermissionController } from './presentation/controllers/PermissionController';
import { AuditLogController } from './presentation/controllers/AuditLogController';

// Routes
import { createAuthRoutes } from './presentation/routes/authRoutes';
import { createUserRoutes } from './presentation/routes/userRoutes';
import { createRoleRoutes } from './presentation/routes/roleRoutes';
import { createPermissionRoutes } from './presentation/routes/permissionRoutes';
import { createAuditLogRoutes } from './presentation/routes/auditLogRoutes';

/**
 * Creates and configures the Express application
 * Implements Dependency Injection for clean architecture
 */
export const createApp = (): Application => {
  const app = express();

  // ============================================
  // Middleware
  // ============================================
  app.use(cors({ origin: config.cors.origin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Trust proxy for accurate IP addresses
  app.set('trust proxy', true);

  // ============================================
  // Dependency Injection - Repositories
  // ============================================
  const userRepository = new MongoUserRepository();
  const roleRepository = new MongoRoleRepository();
  const permissionRepository = new MongoPermissionRepository();
  const auditLogRepository = new MongoAuditLogRepository();
  const refreshTokenRepository = new MongoRefreshTokenRepository();

  // ============================================
  // Dependency Injection - Services
  // ============================================
  const policyService = new PolicyService(userRepository, roleRepository, permissionRepository);

  // ============================================
  // Permission Middleware Factory
  // ============================================
  const requirePermission = createPermissionMiddleware(policyService, auditLogRepository);

  // ============================================
  // Dependency Injection - Use Cases
  // ============================================

  // Auth Use Cases
  const loginUseCase = new LoginUseCase(userRepository, refreshTokenRepository, auditLogRepository);
  const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, refreshTokenRepository);
  const logoutUseCase = new LogoutUseCase(refreshTokenRepository, auditLogRepository);

  // User Use Cases
  const createUserUseCase = new CreateUserUseCase(
    userRepository,
    roleRepository,
    auditLogRepository
  );
  const getUserUseCase = new GetUserUseCase(userRepository);
  const listUsersUseCase = new ListUsersUseCase(userRepository);
  const updateUserUseCase = new UpdateUserUseCase(
    userRepository,
    roleRepository,
    auditLogRepository
  );
  const deleteUserUseCase = new DeleteUserUseCase(
    userRepository,
    refreshTokenRepository,
    auditLogRepository
  );

  // Role Use Cases
  const createRoleUseCase = new CreateRoleUseCase(
    roleRepository,
    permissionRepository,
    auditLogRepository
  );
  const getRoleUseCase = new GetRoleUseCase(roleRepository);
  const listRolesUseCase = new ListRolesUseCase(roleRepository);
  const updateRoleUseCase = new UpdateRoleUseCase(
    roleRepository,
    permissionRepository,
    auditLogRepository
  );
  const deleteRoleUseCase = new DeleteRoleUseCase(
    roleRepository,
    userRepository,
    auditLogRepository
  );

  // Permission Use Cases
  const createPermissionUseCase = new CreatePermissionUseCase(
    permissionRepository,
    auditLogRepository
  );
  const getPermissionUseCase = new GetPermissionUseCase(permissionRepository);
  const listPermissionsUseCase = new ListPermissionsUseCase(permissionRepository);
  const deletePermissionUseCase = new DeletePermissionUseCase(
    permissionRepository,
    auditLogRepository
  );

  // Audit Log Use Cases
  const listAuditLogsUseCase = new ListAuditLogsUseCase(auditLogRepository);
  const getAuditLogStatsUseCase = new GetAuditLogStatsUseCase(auditLogRepository);
  const getResourceAuditTrailUseCase = new GetResourceAuditTrailUseCase(auditLogRepository);

  // ============================================
  // Dependency Injection - Controllers
  // ============================================
  const authController = new AuthController(loginUseCase, refreshTokenUseCase, logoutUseCase);
  const userController = new UserController(
    createUserUseCase,
    getUserUseCase,
    listUsersUseCase,
    updateUserUseCase,
    deleteUserUseCase
  );
  const roleController = new RoleController(
    createRoleUseCase,
    getRoleUseCase,
    listRolesUseCase,
    updateRoleUseCase,
    deleteRoleUseCase
  );
  const permissionController = new PermissionController(
    createPermissionUseCase,
    getPermissionUseCase,
    listPermissionsUseCase,
    deletePermissionUseCase
  );
  const auditLogController = new AuditLogController(
    listAuditLogsUseCase,
    getAuditLogStatsUseCase,
    getResourceAuditTrailUseCase
  );

  // ============================================
  // Routes
  // ============================================
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.use('/api/v1/auth', createAuthRoutes(authController));
  app.use('/api/v1/users', createUserRoutes(userController, requirePermission));
  app.use('/api/v1/roles', createRoleRoutes(roleController, requirePermission));
  app.use('/api/v1/permissions', createPermissionRoutes(permissionController, requirePermission));
  app.use('/api/v1/audit-logs', createAuditLogRoutes(auditLogController, requirePermission));

  // ============================================
  // Error Handling
  // ============================================
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
