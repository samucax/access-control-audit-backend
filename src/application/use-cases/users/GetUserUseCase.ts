import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User, UserWithRole } from '../../../domain/entities/User';
import { NotFoundError } from '../../../shared/errors/AppError';

export interface GetUserInput {
  userId: string;
  includeRole?: boolean;
}

/**
 * Get User Use Case
 * Retrieves a single user by ID
 */
export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: GetUserInput): Promise<User | UserWithRole> {
    const { userId, includeRole } = input;

    const user = includeRole
      ? await this.userRepository.findByIdWithRole(userId)
      : await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}
