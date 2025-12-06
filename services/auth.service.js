import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import  RefreshToken  from "../models/RefreshToken.js";
import { tokenService } from "./token.service.js";

const { JWT_REFRESH_SECRET } = process.env;

export const authService = {
  register: async ({ email, password, name }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("Email already registered");

    const user = new User({ email, password, name });
    user.verificationToken = crypto.randomBytes(20).toString("hex");
    await user.save();

    return { message: "User registered successfully" };
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid email or password");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Invalid email or password");

    if (!user.isVerified) throw new Error("Email not verified");

    const accessToken = tokenService.generateAccessToken({ userId: user._id });
    const refreshToken = tokenService.generateRefreshToken({ userId: user._id });

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: tokenService.getRefreshTokenExpiryDate(),
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, name: user.name },
    };
  },

  refreshAccessToken: async (token) => {
    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken) throw new Error("Invalid refresh token");

    let payload;
    try {
      payload = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch {
      throw new Error("Invalid refresh token");
    }

    const accessToken = tokenService.generateAccessToken({ userId: payload.userId });
    return { accessToken };
  },
};
