import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  UserWithRole,
} from '../../../../domain/entities/User';
import { UserModel, IUserDocument } from '../models/UserModel';
import { hashPassword } from '../../../../shared/utils/password';

/**
 * MongoDB implementation of User Repository
 */
export class MongoUserRepository implements IUserRepository {
  private mapToEntity(doc: IUserDocument): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      firstName: doc.firstName,
      lastName: doc.lastName,
      roleId: doc.roleId.toString(),
      isActive: doc.isActive,
      lastLoginAt: doc.lastLoginAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? this.mapToEntity(user) : null;
  }

  async findByIdWithRole(id: string): Promise<UserWithRole | null> {
    const user = await UserModel.findById(id).populate({
      path: 'roleId',
      populate: {
        path: 'permissionIds',
        select: 'name resource action',
      },
    });

    if (!user) return null;

    const role = user.roleId as unknown as {
      _id: string;
      name: string;
      permissionIds: { name: string }[];
    };

    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: {
        id: role._id.toString(),
        name: role.name,
        permissions: role.permissionIds.map((p) => p.name),
      },
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return user ? this.mapToEntity(user) : null;
  }

  async findAll(page: number, limit: number): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      UserModel.countDocuments(),
    ]);

    return {
      users: users.map((user) => this.mapToEntity(user)),
      total,
    };
  }

  async findByRoleId(roleId: string): Promise<User[]> {
    const users = await UserModel.find({ roleId });
    return users.map((user) => this.mapToEntity(user));
  }

  async create(data: CreateUserDTO): Promise<User> {
    const hashedPassword = await hashPassword(data.password);

    const user = await UserModel.create({
      ...data,
      email: data.email.toLowerCase(),
      password: hashedPassword,
    });

    return this.mapToEntity(user);
  }

  async update(id: string, data: UpdateUserDTO): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    return user ? this.mapToEntity(user) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { $set: { lastLoginAt: new Date() } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }
}
