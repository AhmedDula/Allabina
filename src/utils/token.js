import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// Generate access token — short lived
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  });
};

// Generate refresh token — long lived
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  });
};

// Verify access token
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.accessSecret);
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwt.refreshSecret);
};