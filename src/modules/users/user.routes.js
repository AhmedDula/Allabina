import { Router } from "express";
import * as userController from "./user.controller.js";
import protect from "../../middlewares/protect.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { ROLES } from "../../constants/roles.js";
import {
  updateMeSchema,
  updatePasswordSchema,
  updateUserStatusSchema,
} from "./user.validation.js";

const router = Router();
router.use(protect); // All routes require authentication
// ── Me Routes — all authenticated users ──────────────
router.get("/me", userController.getMe);
router.patch("/me", validate(updateMeSchema), userController.updateMe);
router.patch("/me/password", validate(updatePasswordSchema), userController.updatePassword);
router.delete("/me", userController.deleteMe);

// ── Admin Routes ──────────────────────────────────────
router.get("/", authorize(ROLES.ADMIN), userController.getAllUsers);
router.get("/:id", authorize(ROLES.ADMIN), userController.getUserById);
router.patch("/:id/status", authorize(ROLES.ADMIN), validate(updateUserStatusSchema), userController.updateUserStatus);

export default router;