import mongoose from "mongoose";
import { PROJECT_STATUS } from "../../constants/projectStatus.js";

const projectSchema = new mongoose.Schema(
  {
    // ── Basic Info ────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      minlength: [50, "Description must be at least 50 characters"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    // ── Client Info ───────────────────────────────────────
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client is required"],
      index: true,
    },

    // ── Category & Skills ─────────────────────────────────
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },
    skills: {
      type: [String],
      default: [],
    },

    // ── Budget ────────────────────────────────────────────
    budget: {
      type: {
        type: String,
        enum: ["fixed", "hourly", "range"],
        required: [true, "Budget type is required"],
    },
      minAmount: {
        type: Number,
        required: [true, "Minimum amount is required"],
        min: [1, "Amount must be at least 1"],
      },
      maxAmount: {
        type: Number,
        min: [1, "Amount must be at least 1"],
        validate: {
          validator: function (v) {
            // Only required if budget type is 'range'
            if (this.budget?.type === "range") {
              return v != null && v >= this.budget.minAmount;
            }
            return true;
          },
          message: "Max amount must be greater than or equal to min amount",
        },
      },
      currency: {
        type: String,
        default: "USD",
        uppercase: true,
        trim: true,
      },
    },

    // ── Timeline ──────────────────────────────────────────
    duration: {
      type: Number, // in days
      required: [true, "Project duration is required"],
      min: [1, "Duration must be at least 1 day"],
      max: [365, "Duration cannot exceed 365 days"],
    },
    deadline: {
      type: Date,
      validate: {
        validator: function (v) {
          return v > new Date();
        },
        message: "Deadline must be in the future",
      },
    },

    // ── Status ────────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.OPEN,
      index: true,
    },

    // ── Proposals ───────────────────────────────────────────
    proposalsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Assigned Freelancer ───────────────────────────────
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Visibility ─────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Views ────────────────────────────────
    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Images ────────────────────────────────
    image: {
      url: {
        type: String,
        required: true, // Required field
      },
      publicId: {
        type: String,
        required: true, // Required field
      },
      originalName: {
        type: String,
        required: true, // Required field
      },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ── Indexes ─────────────────────────────────────────────
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ client: 1, status: 1 });
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ skills: 1 });
projectSchema.index({ "budget.minAmount": 1, "budget.maxAmount": 1 });
projectSchema.index({ title: "text", description: "text" }); // For text search

// ── Virtuals ────────────────────────────────────────────
projectSchema.virtual("mainPhoto").get(function () {
  return this.image ? this.image.url : null;
});

// Ensure virtuals are included in JSON output
projectSchema.set("toJSON", { virtuals: true });
projectSchema.set("toObject", { virtuals: true });

const Project = mongoose.model("Project", projectSchema);

export default Project;
