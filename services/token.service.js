import jwt from 'jsonwebtoken';
import ms from 'ms';

export const tokenService = {
  generateAccessToken: (payload) =>
    jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY }),

  generateRefreshToken: (payload) =>
    jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY }),

  getRefreshTokenExpiryDate: () => {
    return new Date(Date.now() + ms(process.env.JWT_REFRESH_EXPIRY));
  },
};
