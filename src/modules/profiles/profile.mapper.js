// Map profile document to clean response object
export const mapProfile = (profile) => {
  const base = {
    id: profile._id,
    userId: profile.userId,
    profileType: profile.profileType,
    profileImage: profile.profileImage,
    bio: profile.bio,
    location: profile.location,
    rating: profile.rating,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };

  // Client profile
  if (profile.profileType === "client") {
    return {
      ...base,
      companyName: profile.companyName,
    };
  }

  // Freelancer profile
  if (profile.profileType === "freelancer") {
    return {
      ...base,
      skills: profile.skills,
      portfolio: profile.portfolio,
      hourlyRate: profile.hourlyRate,
      languages: profile.languages,
    };
  }

  return base;
};