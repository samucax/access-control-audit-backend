import { IRefreshTokenRepository } from '../../../../domain/repositories/IRefreshTokenRepository';
import { RefreshToken, CreateRefreshTokenDTO } from '../../../../domain/entities/RefreshToken';
import { RefreshTokenModel, IRefreshTokenDocument } from '../models/RefreshTokenModel';

/**
 * MongoDB implementation of RefreshToken Repository
 */
export class MongoRefreshTokenRepository implements IRefreshTokenRepository {
  private mapToEntity(doc: IRefreshTokenDocument): RefreshToken {
    return {
      id: doc._id.toString(),
      token: doc.token,
      userId: doc.userId.toString(),
      expiresAt: doc.expiresAt,
      isRevoked: doc.isRevoked,
      createdAt: doc.createdAt,
    };
  }

  async create(data: CreateRefreshTokenDTO): Promise<RefreshToken> {
    const refreshToken = await RefreshTokenModel.create(data);
    return this.mapToEntity(refreshToken);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await RefreshTokenModel.findOne({ token });
    return refreshToken ? this.mapToEntity(refreshToken) : null;
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const tokens = await RefreshTokenModel.find({ userId, isRevoked: false });
    return tokens.map((token) => this.mapToEntity(token));
  }

  async revokeToken(token: string): Promise<boolean> {
    const result = await RefreshTokenModel.findOneAndUpdate(
      { token },
      { $set: { isRevoked: true } }
    );
    return result !== null;
  }

  async revokeAllUserTokens(userId: string): Promise<boolean> {
    const result = await RefreshTokenModel.updateMany(
      { userId, isRevoked: false },
      { $set: { isRevoked: true } }
    );
    return result.modifiedCount > 0;
  }

  async deleteExpiredTokens(): Promise<number> {
    const result = await RefreshTokenModel.deleteMany({
      $or: [{ expiresAt: { $lt: new Date() } }, { isRevoked: true }],
    });
    return result.deletedCount;
  }

  async isTokenValid(token: string): Promise<boolean> {
    const refreshToken = await RefreshTokenModel.findOne({
      token,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
    return refreshToken !== null;
  }
}
