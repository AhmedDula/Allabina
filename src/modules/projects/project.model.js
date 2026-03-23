import mongoose from "mongoose";
import { PROJECT_STATUS } from "../../constants/projectStatus.js";

const projectSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [30, "Description must be at least 30 characters"],
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    budget: {
      min: {
        type: Number,
        required: [true, "Minimum budget is required"],
        min: [0, "Budget cannot be negative"],
      },
      max: {
        type: Number,
        required: [true, "Maximum budget is required"],
        min: [0, "Budget cannot be negative"],
      },
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.OPEN,
    },
    attachments: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    categories: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
projectSchema.index({ clientId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ skills: 1 });
projectSchema.index({ createdAt: -1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;