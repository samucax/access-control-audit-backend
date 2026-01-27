import { IPermissionRepository } from '../../../../domain/repositories/IPermissionRepository';
import {
  Permission,
  CreatePermissionDTO,
  UpdatePermissionDTO,
} from '../../../../domain/entities/Permission';
import { PermissionModel, IPermissionDocument } from '../models/PermissionModel';

/**
 * MongoDB implementation of Permission Repository
 */
export class MongoPermissionRepository implements IPermissionRepository {
  private mapToEntity(doc: IPermissionDocument): Permission {
    return {
      id: doc._id.toString(),
      name: doc.name,
      resource: doc.resource,
      action: doc.action,
      description: doc.description,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string): Promise<Permission | null> {
    const permission = await PermissionModel.findById(id);
    return permission ? this.mapToEntity(permission) : null;
  }

  async findByName(name: string): Promise<Permission | null> {
    const permission = await PermissionModel.findOne({ name });
    return permission ? this.mapToEntity(permission) : null;
  }

  async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
    const permission = await PermissionModel.findOne({ resource, action });
    return permission ? this.mapToEntity(permission) : null;
  }

  async findAll(): Promise<Permission[]> {
    const permissions = await PermissionModel.find().sort({ resource: 1, action: 1 });
    return permissions.map((permission) => this.mapToEntity(permission));
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    const permissions = await PermissionModel.find({ _id: { $in: ids } });
    return permissions.map((permission) => this.mapToEntity(permission));
  }

  async findByResource(resource: string): Promise<Permission[]> {
    const permissions = await PermissionModel.find({ resource }).sort({ action: 1 });
    return permissions.map((permission) => this.mapToEntity(permission));
  }

  async create(data: CreatePermissionDTO): Promise<Permission> {
    const permission = await PermissionModel.create(data);
    return this.mapToEntity(permission);
  }

  async update(id: string, data: UpdatePermissionDTO): Promise<Permission | null> {
    const permission = await PermissionModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    return permission ? this.mapToEntity(permission) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await PermissionModel.findByIdAndDelete(id);
    return result !== null;
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await PermissionModel.countDocuments({ name });
    return count > 0;
  }
}
