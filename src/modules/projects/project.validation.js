import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// ── Create Project Schema ─────────────────────────────────
export const createProjectSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).required().messages({
    "string.min": "Title must be at least 5 characters",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().trim().min(50).max(5000).required().messages({
    "string.min": "Description must be at least 50 characters",
    "string.max": "Description cannot exceed 5000 characters",
    "any.required": "Description is required",
  }),
  category: Joi.string().trim().max(100).required().messages({
    "any.required": "Category is required",
    "string.max": "Category cannot exceed 100 characters",
  }),
  skills: Joi.array().items(Joi.string().trim()).optional(),
  budget: Joi.object({
    type: Joi.string().valid("fixed", "hourly", "range").required().messages({
      "any.required": "Budget type is required",
      "any.only": "Budget type must be fixed, hourly, or range",
    }),
    minAmount: Joi.number().min(1).required().messages({
      "number.min": "Minimum amount must be at least 1",
      "any.required": "Minimum amount is required",
    }),
    maxAmount: Joi.number().min(1).when("type", {
      is: "range",
      then: Joi.number().required(),
      otherwise: Joi.optional(),
    }),
    currency: Joi.string().trim().uppercase().max(3).default("USD"),
  }).required(),
  duration: Joi.number().min(1).max(365).required().messages({
    "number.min": "Duration must be at least 1 day",
    "number.max": "Duration cannot exceed 365 days",
    "any.required": "Duration is required",
  }),
  deadline: Joi.date().greater("now").optional().messages({
    "date.greater": "Deadline must be in the future",
  }),
});

// ── Update Project Schema ─────────────────────────────────
export const updateProjectSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required().messages({
      "string.pattern.base": "Invalid project ID",
      "any.required": "Project ID is required",
    }),
  }),
  body: Joi.object({
    title: Joi.string().trim().min(5).max(200).optional(),
    description: Joi.string().trim().min(50).max(5000).optional(),
    category: Joi.string().trim().max(100).optional(),
    skills: Joi.array().items(Joi.string().trim()).optional(),
    budget: Joi.object({
      type: Joi.string().valid("fixed", "hourly", "range").optional(),
      minAmount: Joi.number().min(1).optional(),
      maxAmount: Joi.number().min(1).optional(),
      currency: Joi.string().trim().uppercase().max(3).optional(),
    }).optional(),
    duration: Joi.number().min(1).max(365).optional(),
    deadline: Joi.date().greater("now").optional().messages({
      "date.greater": "Deadline must be in the future",
    }),
  }),
});

// ── Project ID Param Schema ───────────────────────────────
export const projectIdParamSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required().messages({
      "string.pattern.base": "Invalid project ID",
      "any.required": "Project ID is required",
    }),
  }),
});
