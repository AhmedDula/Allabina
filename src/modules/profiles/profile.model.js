import mongoose from "mongoose";
import { ROLES } from "../../constants/roles.js";

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    profileType: {
      type: String,
      enum: [ROLES.CLIENT, ROLES.FREELANCER],
      required: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: null,
    },
    location: {
      type: String,
      maxlength: [100, "Location cannot exceed 100 characters"],
      default: null,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    // ── Client fields ──────────────────────────────────
    companyName: {
      type: String,
      maxlength: [100, "Company name cannot exceed 100 characters"],
      default: null,
    },

    // ── Freelancer fields ──────────────────────────────
    skills: {
      type: [String],
      default: [],
    },
    portfolio: [
      {
        title: { type: String, required: true },
        description: { type: String, default: null },
        url: { type: String, default: null },
        image: { type: String, default: null },
      },
    ],
    hourlyRate: {
      type: Number,
      min: [0, "Hourly rate cannot be negative"],
      default: null,
    },
    languages: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
profileSchema.index({ profileType: 1 });
profileSchema.index({ "rating.average": -1 });

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
