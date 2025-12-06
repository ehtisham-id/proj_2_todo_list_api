import jwt from 'jsonwebtoken';

const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY } = process.env;

export const tokenService = {
  generateAccessToken: (payload) =>
    jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRY }),

  generateRefreshToken: (payload) =>
    jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY }),

  getRefreshTokenExpiryDate: () => {
    const now = new Date();
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  },
};
