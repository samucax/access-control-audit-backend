import { Permission, CreatePermissionDTO, UpdatePermissionDTO } from '../entities/Permission';

/**
 * Permission Repository Interface
 * Defines the contract for permission data access operations
 */
export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  findByResourceAndAction(resource: string, action: string): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  findByIds(ids: string[]): Promise<Permission[]>;
  findByResource(resource: string): Promise<Permission[]>;
  create(data: CreatePermissionDTO): Promise<Permission>;
  update(id: string, data: UpdatePermissionDTO): Promise<Permission | null>;
  delete(id: string): Promise<boolean>;
  existsByName(name: string): Promise<boolean>;
}
