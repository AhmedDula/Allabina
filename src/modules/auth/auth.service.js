import User from "./user.model.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";
import ApiError from "../../utils/ApiError.js";

// Generate both tokens and save refresh token in DB
const generateAndSaveTokens = async (user) => {
  const payload = { id: user._id, role: user.role };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Save hashed refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

// Register new user
export const register = async (data) => {
  const { name, email, password, role } = data;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) throw ApiError.unauthorized("invalid email or password");

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  const { accessToken, refreshToken } = await generateAndSaveTokens(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

// Login user
export const login = async (data) => {
  const { email, password } = data;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid credentials");

  // Check if account is active
  if (!user.isActive) throw ApiError.forbidden("Account is deactivated");

  // Compare password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw ApiError.unauthorized("Invalid credentials");

  const { accessToken, refreshToken } = await generateAndSaveTokens(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

// Refresh access token
export const refresh = async (token) => {
  if (!token) throw ApiError.unauthorized("No refresh token");

  // Find user with this refresh token
  const user = await User.findOne({ refreshToken: token }).select("+refreshToken");
  if (!user) throw ApiError.unauthorized("Invalid refresh token");

  // Generate new access token only
  const payload = { id: user._id, role: user.role };
  const accessToken = generateAccessToken(payload);

  return { accessToken };
};

// Logout user
export const logout = async (token) => {
  if (!token) return;

  // Clear refresh token from DB
  await User.findOneAndUpdate(
    { refreshToken: token },
    { refreshToken: null }
  );
};