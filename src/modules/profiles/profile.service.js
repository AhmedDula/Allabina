import Profile from "./profile.model.js";
import ApiError from "../../utils/ApiError.js";
import { ROLES } from "../../constants/roles.js";

// Get my profile — create if not exists
export const getMyProfile = async (userId, role) => {
  let profile = await Profile.findOne({ userId });

  // Auto-create profile on first access
  if (!profile) {
    profile = await Profile.create({
      userId,
      profileType: role,
    });
  }

  return profile;
};

// Get profile by userId — public
export const getProfileByUserId = async (userId) => {
  const profile = await Profile.findOne({ userId }).populate(
    "userId",
    "name"
  );
  if (!profile) throw ApiError.notFound("Profile not found");
  return profile;
};

// Update client profile
export const updateClientProfile = async (userId, data) => {
  const profile = await Profile.findOne({ userId });
  if (!profile) throw ApiError.notFound("Profile not found");

  // Ensure client is updating client profile only
  if (profile.profileType !== ROLES.CLIENT) {
    throw ApiError.forbidden("Not a client profile");
  }

  const updated = await Profile.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, runValidators: true }
  );

  return updated;
};

// Update freelancer profile
export const updateFreelancerProfile = async (userId, data) => {
  const profile = await Profile.findOne({ userId });
  if (!profile) throw ApiError.notFound("Profile not found");

  // Ensure freelancer is updating freelancer profile only
  if (profile.profileType !== ROLES.FREELANCER) {
    throw ApiError.forbidden("Not a freelancer profile");
  }

  const updated = await Profile.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, runValidators: true }
  );

  return updated;
};

// Add portfolio item — freelancer only
export const addPortfolioItem = async (userId, item) => {
  const profile = await Profile.findOne({ userId });
  if (!profile) throw ApiError.notFound("Profile not found");

  if (profile.profileType !== ROLES.FREELANCER) {
    throw ApiError.forbidden("Not a freelancer profile");
  }

  if (profile.portfolio.length >= 10) {
    throw ApiError.badRequest("Cannot exceed 10 portfolio items");
  }

  profile.portfolio.push(item);
  await profile.save();

  return profile;
};

// Remove portfolio item — freelancer only
export const removePortfolioItem = async (userId, itemId) => {
  const profile = await Profile.findOne({ userId });
  if (!profile) throw ApiError.notFound("Profile not found");

  if (profile.profileType !== ROLES.FREELANCER) {
    throw ApiError.forbidden("Not a freelancer profile");
  }

  const itemExists = profile.portfolio.id(itemId);
  if (!itemExists) throw ApiError.notFound("Portfolio item not found");

  profile.portfolio.pull(itemId);
  await profile.save();

  return profile;
};

// Get all freelancer profiles — public
export const getFreelancerProfiles = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { profileType: ROLES.FREELANCER };

  // Filter by skill
  if (query.skill) {
    filter.skills = { $in: [query.skill] };
  }

  // Filter by max hourly rate
  if (query.maxRate) {
    filter.hourlyRate = { $lte: parseFloat(query.maxRate) };
  }

  const [profiles, total] = await Promise.all([
    Profile.find(filter)
      .populate("userId", "name")
      .skip(skip)
      .limit(limit)
      .sort("-rating.average"),
    Profile.countDocuments(filter),
  ]);

  return {
    profiles,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};