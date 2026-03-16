import asyncHandler from "../../middlewares/asyncHandler.js";
import * as profileService from "./profile.service.js";
import { mapProfile } from "./profile.mapper.js";
import { ROLES } from "../../constants/roles.js";
import ApiError from "../../utils/ApiError.js";

// GET /api/profiles/me
export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getMyProfile(req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    data: { profile: mapProfile(profile.toObject()) },
  });
});

// GET /api/profiles/:userId
export const getProfileByUserId = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfileByUserId(req.params.userId);

  res.status(200).json({
    success: true,
    data: { profile: mapProfile(profile.toObject()) },
  });
});

// PATCH /api/profiles/me
export const updateMyProfile = asyncHandler(async (req, res) => {
  let profile;

  if (req.user.role === ROLES.CLIENT) {
    profile = await profileService.updateClientProfile(req.user.id, req.body);
  } else if (req.user.role === ROLES.FREELANCER) {
    profile = await profileService.updateFreelancerProfile(req.user.id, req.body);
  } else {
    throw ApiError.forbidden("Admins do not have profiles");
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: { profile: mapProfile(profile.toObject()) },
  });
});

// POST /api/profiles/me/portfolio
export const addPortfolioItem = asyncHandler(async (req, res) => {
  const profile = await profileService.addPortfolioItem(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Portfolio item added successfully",
    data: { profile: mapProfile(profile.toObject()) },
  });
});

// DELETE /api/profiles/me/portfolio/:itemId
export const removePortfolioItem = asyncHandler(async (req, res) => {
  const profile = await profileService.removePortfolioItem(
    req.user.id,
    req.params.itemId
  );

  res.status(200).json({
    success: true,
    message: "Portfolio item removed successfully",
    data: { profile: mapProfile(profile.toObject()) },
  });
});

// GET /api/profiles/freelancers
export const getFreelancerProfiles = asyncHandler(async (req, res) => {
  const { profiles, pagination } = await profileService.getFreelancerProfiles(
    req.query
  );

  res.status(200).json({
    success: true,
    pagination,
    data: { profiles: profiles.map((p) => mapProfile(p.toObject())) },
  });
});