import { User, CreateUserDTO, UpdateUserDTO, UserWithRole } from '../entities/User';

/**
 * User Repository Interface
 * Defines the contract for user data access operations
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByIdWithRole(id: string): Promise<UserWithRole | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(page: number, limit: number): Promise<{ users: User[]; total: number }>;
  findByRoleId(roleId: string): Promise<User[]>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  updateLastLogin(id: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}
