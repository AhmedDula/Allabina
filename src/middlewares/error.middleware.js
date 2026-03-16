import { env } from "../config/env.js";

const errorMiddleware = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Handle Mongoose bad ObjectId — e.g. /users/invalid_id
  if (err.name === "CastError") {
    statusCode = 404;
    message = `Resource not found`;
  }

  // Handle Mongoose duplicate key — e.g. duplicate email
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Handle Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    // Show stack trace in development only
    ...(env.app.nodeEnv === "development" && { stack: err.stack }),
  });
};

export default errorMiddleware;