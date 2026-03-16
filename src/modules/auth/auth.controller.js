import asyncHandler from "../../middlewares/asyncHandler.js";
import * as authService from "./auth.service.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../../config/cookie.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  res
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .status(201)
    .json({
      success: true,
      message: "Registered successfully",
      data: { user },
    });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .status(200)
    .json({
      success: true,
      message: "Logged in successfully",
      data: { user },
    });
});

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const { accessToken } = await authService.refresh(token);

  res
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .status(200)
    .json({
      success: true,
      message: "Token refreshed successfully",
    });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  await authService.logout(token);

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json({
      success: true,
      message: "Logged out successfully",
    });
});