import asyncHandler from "./asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/token.js";

// Protect routes — verify JWT access token from cookie
const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(ApiError.unauthorized("Not authenticated"));
  }

  const decoded = verifyAccessToken(token);
  req.user = decoded;

  next();
});

export default protect;