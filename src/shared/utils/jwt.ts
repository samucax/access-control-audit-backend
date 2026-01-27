import jwt from 'jsonwebtoken';
import { config } from '../../infrastructure/config';

export interface TokenPayload {
  userId: string;
  email: string;
  roleId: string;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

/**
 * Generate an access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Generate a refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Verify an access token
 */
export const verifyAccessToken = (token: string): DecodedToken => {
  return jwt.verify(token, config.jwt.secret) as DecodedToken;
};

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token: string): DecodedToken => {
  return jwt.verify(token, config.jwt.refreshSecret) as DecodedToken;
};

/**
 * Calculate token expiration date
 */
export const getRefreshTokenExpiration = (): Date => {
  const expiresIn = config.jwt.refreshExpiresIn;
  const match = expiresIn.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error('Invalid JWT_REFRESH_EXPIRES_IN format');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const now = new Date();
  switch (unit) {
    case 's':
      return new Date(now.getTime() + value * 1000);
    case 'm':
      return new Date(now.getTime() + value * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'd':
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    default:
      throw new Error('Invalid time unit in JWT_REFRESH_EXPIRES_IN');
  }
};
