import { Router } from "express";
import * as projectController from "./project.controller.js";
import protect from "../../middlewares/protect.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { ROLES } from "../../constants/roles.js";
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
} from "./project.validation.js";
import upload from "../../utils/upload.js";

const router = Router();

// ── Public Routes ───────────────────────────────────────
router.get("/", projectController.getAllProjects);
router.get("/search", projectController.searchProjects);
router.get("/me", protect, authorize(ROLES.CLIENT), projectController.getMyProjects);
router.get("/:id", validate(projectIdParamSchema), projectController.getProjectById);

// ── Protected Routes ───────────────────────────────────
router.use(protect);

// Client Routes
router.post("/", authorize(ROLES.CLIENT), upload.single("image"), validate(createProjectSchema), projectController.createProject);
router.patch("/:id", authorize(ROLES.CLIENT), upload.single("image"), validate(updateProjectSchema), projectController.updateProject);
router.delete("/:id", authorize(ROLES.CLIENT), validate(projectIdParamSchema), projectController.deleteProject);

export default router;
