import ApiError from "../utils/ApiError.js";

// Restrict access to specific roles
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden("You do not have permission"));
  }
  next();
};

export default authorize;