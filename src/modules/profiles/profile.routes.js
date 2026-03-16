import { Router } from "express";
import * as profileController from "./profile.controller.js";
import protect from "../../middlewares/protect.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { ROLES } from "../../constants/roles.js";
import {
  updateClientProfileSchema,
  updateFreelancerProfileSchema,
} from "./profile.validation.js";

const router = Router();

// ── Public Routes ─────────────────────────────────────
router.get("/freelancers", profileController.getFreelancerProfiles);
router.get("/me",protect, profileController.getMyProfile);
router.get("/:userId", profileController.getProfileByUserId);

// ── Protected Routes ────────────
router.use(protect);


router.patch(
  "/me",
  authorize(ROLES.CLIENT, ROLES.FREELANCER),
  (req, res, next) => {
    const schema =
      req.user.role === ROLES.CLIENT
        ? updateClientProfileSchema
        : updateFreelancerProfileSchema;
    return validate(schema)(req, res, next);
  },
  profileController.updateMyProfile
);

router.post(
  "/me/portfolio",
  authorize(ROLES.FREELANCER),
  profileController.addPortfolioItem
);

router.delete(
  "/me/portfolio/:itemId",
  authorize(ROLES.FREELANCER),
  profileController.removePortfolioItem
);

export default router;
