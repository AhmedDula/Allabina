import User from "../auth/user.model.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import ApiError from "../../utils/ApiError.js";
import { paginate } from "../../utils/pagination.js";

// Get current user
export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return user;
};

// Update current user
export const updateMe = async (userId, data) => {
  // Prevent updating sensitive fields
  const { name, email } = data;

  // Check if email already taken by another user
  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) throw ApiError.conflict("Email already exists");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { name, email },
    { returnDocument: "after", runValidators: true },
  );

  if (!user) throw ApiError.notFound("User not found");
  return user;
};

// Update password
export const updatePassword = async (userId, data) => {
  const { currentPassword, newPassword } = data;

  // Get user with password
  const user = await User.findById(userId).select("+password");
  if (!user) throw ApiError.notFound("User not found");

  // Verify current password
  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) throw ApiError.unauthorized("Current password is incorrect");

  // Hash new password and save
  user.password = await hashPassword(newPassword);
  user.refreshToken = null; // Force logout from all devices
  await user.save();
};

// Delete current user
export const deleteMe = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw ApiError.notFound("User not found");
};

// Get all users — admin only
export const getAllUsers = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.role) {
    const roles = query.role.split(",");
    filter.role = { $in: roles };
  }
  if (query.isActive !== undefined) filter.isActive = query.isActive === "true";

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort("-createdAt"),
    User.countDocuments(filter),
  ]);
  return {
    users,
    pagination: paginate(total, page, limit),
  };
};

// Get user by id — admin only
export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return user;
};

// Update user status — admin only
export const updateUserStatus = async (adminId, userId, isActive) => {
  // Prevent admin from deactivating himself
  if (adminId.toString() === userId.toString()) {
    throw ApiError.badRequest("Cannot change your own status");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true },
  );

  if (!user) throw ApiError.notFound("User not found");
  return user;
};
