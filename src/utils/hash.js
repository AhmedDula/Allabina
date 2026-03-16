import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

// Hash password with salt + pepper
export const hashPassword = async (password) => {
  const peppered = password + env.security.pepper;
  return bcrypt.hash(peppered, env.security.bcryptSaltRounds);
};

// Compare plain password with hashed password
export const comparePassword = async (password, hashedPassword) => {
  const peppered = password + env.security.pepper;
  return bcrypt.compare(peppered, hashedPassword);
};