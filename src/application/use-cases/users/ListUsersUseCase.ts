import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';

export interface ListUsersInput {
  page: number;
  limit: number;
}

export interface ListUsersOutput {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * List Users Use Case
 * Retrieves paginated list of users
 */
export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: ListUsersInput): Promise<ListUsersOutput> {
    const { page, limit } = input;

    const { users, total } = await this.userRepository.findAll(page, limit);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
