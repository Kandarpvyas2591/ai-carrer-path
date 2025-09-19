import mongoose from "mongoose";

// Minimal user schema for final-year project
const userSchema = new mongoose.Schema(
  {
    // Auth basics
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Minimal profile for AI path generation
    profile: {
      currentRole: { type: String, trim: true },
      experience: {
        type: String,
        enum: ["entry", "mid", "senior"],
        default: "entry",
      },
      skills: [{ type: String, trim: true }],
      interests: [{ type: String, trim: true }],
      goals: [
        {
          title: { type: String, required: true, trim: true },
          description: { type: String, trim: true },
          targetRole: { type: String, trim: true },
          targetDate: { type: Date },
          isAchieved: { type: Boolean, default: false },
        },
      ],
    },

    // Reference to AI profiles created by this user
    aiProfiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AIProfile",
      },
    ],

    // Simple progress tracking (optional but minimal)
    // progress: {
    //   currentStep: { type: Number, default: 0 },
    //   percent: { type: Number, min: 0, max: 100, default: 0 },
    // },
  },
  { timestamps: true }
);


export default mongoose.model("User", userSchema);