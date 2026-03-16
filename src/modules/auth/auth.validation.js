import Joi from "joi";
import { ROLES } from "../../constants/roles.js";

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),

  password: Joi.string()
    .min(8)
    .max(32)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password cannot exceed 32 characters",
      "string.pattern.base":
        "Password must contain uppercase, lowercase, and a number",
      "any.required": "Password is required",
    }),

  role: Joi.string()
    .valid(ROLES.CLIENT, ROLES.FREELANCER)
    .default(ROLES.CLIENT)
    .messages({
      "any.only": "Role must be client or freelancer",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),

  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});