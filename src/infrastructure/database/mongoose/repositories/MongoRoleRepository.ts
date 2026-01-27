import { IRoleRepository } from '../../../../domain/repositories/IRoleRepository';
import {
  Role,
  CreateRoleDTO,
  UpdateRoleDTO,
  RoleWithPermissions,
} from '../../../../domain/entities/Role';
import { RoleModel, IRoleDocument } from '../models/RoleModel';

/**
 * MongoDB implementation of Role Repository
 */
export class MongoRoleRepository implements IRoleRepository {
  private mapToEntity(doc: IRoleDocument): Role {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      permissionIds: doc.permissionIds.map((id) => id.toString()),
      isSystem: doc.isSystem,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string): Promise<Role | null> {
    const role = await RoleModel.findById(id);
    return role ? this.mapToEntity(role) : null;
  }

  async findByIdWithPermissions(id: string): Promise<RoleWithPermissions | null> {
    const role = await RoleModel.findById(id).populate('permissionIds');

    if (!role) return null;

    const permissions = role.permissionIds as unknown as Array<{
      _id: string;
      name: string;
      resource: string;
      action: string;
    }>;

    return {
      id: role._id.toString(),
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: permissions.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        resource: p.resource,
        action: p.action,
      })),
    };
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await RoleModel.findOne({ name });
    return role ? this.mapToEntity(role) : null;
  }

  async findAll(): Promise<Role[]> {
    const roles = await RoleModel.find().sort({ name: 1 });
    return roles.map((role) => this.mapToEntity(role));
  }

  async create(data: CreateRoleDTO): Promise<Role> {
    const role = await RoleModel.create(data);
    return this.mapToEntity(role);
  }

  async update(id: string, data: UpdateRoleDTO): Promise<Role | null> {
    const role = await RoleModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    return role ? this.mapToEntity(role) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await RoleModel.findByIdAndDelete(id);
    return result !== null;
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await RoleModel.countDocuments({ name });
    return count > 0;
  }

  async getPermissionIds(roleId: string): Promise<string[]> {
    const role = await RoleModel.findById(roleId).select('permissionIds');
    return role ? role.permissionIds.map((id) => id.toString()) : [];
  }
}
