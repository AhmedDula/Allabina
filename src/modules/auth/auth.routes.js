import { Router } from "express";
import * as authController from "./auth.controller.js";
import validate from "../../middlewares/validate.js";
import { authLimiter } from "../../middlewares/rateLimiter.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = Router();

// Apply rate limiter to all auth routes
router.use(authLimiter);

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;