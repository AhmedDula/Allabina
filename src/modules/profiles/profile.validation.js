import Joi from "joi";

const portfolioItemSchema = Joi.object({
  title: Joi.string().max(100).required().messages({
    "any.required": "Portfolio item title is required",
    "string.max": "Title cannot exceed 100 characters",
  }),
  description: Joi.string().max(500).optional().messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  url: Joi.string().uri().optional().messages({
    "string.uri": "Invalid URL format",
  }),
  image: Joi.string().optional(),
});

export const updateClientProfileSchema = Joi.object({
  bio: Joi.string().max(500).optional().messages({
    "string.max": "Bio cannot exceed 500 characters",
  }),
  location: Joi.string().max(100).optional().messages({
    "string.max": "Location cannot exceed 100 characters",
  }),
  companyName: Joi.string().max(100).optional().messages({
    "string.max": "Company name cannot exceed 100 characters",
  }),
}).min(1).messages({
  "object.min": "At least one field is required",
});

export const updateFreelancerProfileSchema = Joi.object({
  bio: Joi.string().max(500).optional().messages({
    "string.max": "Bio cannot exceed 500 characters",
  }),
  location: Joi.string().max(100).optional().messages({
    "string.max": "Location cannot exceed 100 characters",
  }),
  skills: Joi.array().items(Joi.string()).max(20).optional().messages({
    "array.max": "Cannot exceed 20 skills",
  }),
  portfolio: Joi.array().items(portfolioItemSchema).max(10).optional().messages({
    "array.max": "Cannot exceed 10 portfolio items",
  }),
  hourlyRate: Joi.number().min(0).optional().messages({
    "number.min": "Hourly rate cannot be negative",
  }),
  languages: Joi.array().items(Joi.string()).max(10).optional().messages({
    "array.max": "Cannot exceed 10 languages",
  }),
}).min(1).messages({
  "object.min": "At least one field is required",
});