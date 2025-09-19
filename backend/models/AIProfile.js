import mongoose from "mongoose";

// AI Profile schema to store user profile data and AI responses
const aiProfileSchema = new mongoose.Schema(
  {
    // Reference to the user who created this profile
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // User profile data from the input form
    profile: {
      currentSkills: {
        type: String,
        required: true,
        trim: true,
      },
      careerInterests: {
        type: String,
        required: true,
        trim: true,
      },
      educationalBackground: {
        type: String,
        required: true,
        enum: [
          "high-school",
          "bachelor",
          "master",
          "phd",
          "bootcamp",
          "self-taught",
        ],
      },
      workExperience: {
        type: String,
        required: true,
        enum: ["0", "1-2", "3-5", "5-10", "10+"],
      },
      careerGoals: {
        type: String,
        required: true,
        trim: true,
      },
      personalValues: [
        {
          type: String,
          enum: [
            "Work-Life Balance",
            "High Salary",
            "Remote Work",
            "Innovation",
            "Leadership",
            "Social Impact",
          ],
        },
      ],
    },

    // AI generated response
    aiResponse: {
      roadmap: [
        {
          stepNumber: {
            type: Number,
            required: true,
          },
          title: {
            type: String,
            required: true,
            trim: true,
          },
          description: {
            type: String,
            required: true,
            trim: true,
          },
          timeline: {
            type: String,
            required: true,
            trim: true,
          },
          resources: [
            {
              type: String,
              trim: true,
            },
          ],
          estimatedDuration: {
            type: String,
            trim: true,
          },
          difficulty: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner",
          },
        },
      ],
      summary: {
        type: String,
        trim: true,
      },
      totalEstimatedDuration: {
        type: String,
        trim: true,
      },
    },

    // Metadata
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    errorMessage: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
aiProfileSchema.index({ userId: 1 });
aiProfileSchema.index({ createdAt: -1 });

export default mongoose.model("AIProfile", aiProfileSchema);
