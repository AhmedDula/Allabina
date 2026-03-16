import Joi from "joi";
import dotenv from "dotenv";

dotenv.config();

const envSchema = Joi.object({
  // App
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(3000),

  // Database
  MONGO_URI: Joi.string().required(),

  // JWT
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES: Joi.string().default("15m"),
  JWT_REFRESH_EXPIRES: Joi.string().default("7d"),

  // Security
  BCRYPT_SALT_ROUNDS: Joi.number().default(12),
  PEPPER: Joi.string().min(32).required(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),

  // Client
  CLIENT_URL: Joi.string().uri().required(),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);

// Stop the app if any required env var is missing
if (error) {
  console.error("❌ Invalid environment variables:", error.message);
  process.exit(1);
}

export const env = {
  app: {
    nodeEnv: value.NODE_ENV,
    port: value.PORT,
  },
  db: {
    mongoUri: value.MONGO_URI,
  },
  jwt: {
    accessSecret: value.JWT_ACCESS_SECRET,
    refreshSecret: value.JWT_REFRESH_SECRET,
    accessExpires: value.JWT_ACCESS_EXPIRES,
    refreshExpires: value.JWT_REFRESH_EXPIRES,
  },
  security: {
    bcryptSaltRounds: value.BCRYPT_SALT_ROUNDS,
    pepper: value.PEPPER,
  },
  cloudinary: {
    cloudName: value.CLOUDINARY_CLOUD_NAME,
    apiKey: value.CLOUDINARY_API_KEY,
    apiSecret: value.CLOUDINARY_API_SECRET,
  },
  client: {
    url: value.CLIENT_URL,
  },
};