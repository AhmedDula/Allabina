import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// ── Create Project Schema ─────────────────────────────────
export const createProjectSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).required().messages({
    "string.min": "Title must be at least 5 characters",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().trim().min(30).max(5000).required().messages({
    "string.min": "Description must be at least 30 characters",
    "string.max": "Description cannot exceed 5000 characters",
    "any.required": "Description is required",
  }),
  categories: Joi.array().items(Joi.string().trim()).optional(),
  skills: Joi.array().items(Joi.string().trim()).optional(),
  budget: Joi.object({
    min: Joi.number().min(1).required().messages({
      "number.base": "Minimum budget must be a number",
      "number.min": "Minimum budget must be at least 1",
      "any.required": "Minimum budget is required"
    }),
    max: Joi.number().min(Joi.ref('min')).required().messages({
      "number.base": "Maximum budget must be a number",
      "number.min": "Maximum budget must be greater than or equal to minimum budget",
      "any.required": "Maximum budget is required"
    })
  }).required(),
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
    description: Joi.string().trim().min(30).max(5000).optional().messages({
      "string.min": "Description must be at least 30 characters",
      "string.max": "Description cannot exceed 5000 characters",
    }),
    categories: Joi.array().items(Joi.string().trim()).optional(),
    skills: Joi.array().items(Joi.string().trim()).optional(),
   budget: Joi.object({
    min: Joi.number().min(1).required().messages({
      "number.base": "Minimum budget must be a number",
      "number.min": "Minimum budget must be at least 1",
      "any.required": "Minimum budget is required"
    }),
    max: Joi.number().min(Joi.ref('min')).required().messages({
      "number.base": "Maximum budget must be a number",
      "number.min": "Maximum budget must be greater than or equal to minimum budget",
      "any.required": "Maximum budget is required"
    })
  }).required(),
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
