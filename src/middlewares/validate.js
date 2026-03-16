import ApiError from "../utils/ApiError.js";

// Validates req.body against a Joi schema
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return next(ApiError.badRequest(message));
  }

  next();
};

export default validate;