import Joi from "joi";

export const updateMeSchema = Joi.object({
  name: Joi.string().min(3).max(50).messages({
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 50 characters",
  }),

  email: Joi.string().email().messages({
    "string.email": "Invalid email format",
  }),
}).min(1).messages({
  "object.min": "At least one field is required",
});

export const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),

  newPassword: Joi.string()
    .min(8)
    .max(32)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password cannot exceed 32 characters",
      "string.pattern.base": "Password must contain uppercase, lowercase, and a number",
      "any.required": "New password is required",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Confirm password is required",
    }),
});

export const updateUserStatusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    "any.required": "isActive is required",
    "boolean.base": "isActive must be a boolean",
  }),
});