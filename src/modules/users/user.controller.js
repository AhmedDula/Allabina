import asyncHandler from "../../middlewares/asyncHandler.js";
import * as userService from "./user.service.js";

// GET /api/users/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getMe(req.user.id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// PATCH /api/users/me
export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMe(req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
});

// PATCH /api/users/me/password
export const updatePassword = asyncHandler(async (req, res) => {
  await userService.updatePassword(req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// DELETE /api/users/me
export const deleteMe = asyncHandler(async (req, res) => {
  await userService.deleteMe(req.user.id);

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json({
      success: true,
      message: "Account deleted successfully",
    });
});

// GET /api/users — admin only
export const getAllUsers = asyncHandler(async (req, res) => {
  const { users, pagination } = await userService.getAllUsers(req.query);

  res.status(200).json({
    success: true,
    pagination,
    data: { users },
  });
});

// GET /api/users/:id — admin only
export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// PATCH /api/users/:id/status — admin only
export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateUserStatus(
    req.user.id,
    req.params.id,
    req.body.isActive
  );

  res.status(200).json({
    success: true,
    message: `Account ${req.body.isActive ? "activated" : "deactivated"} successfully`,
    data: { user },
  });
});