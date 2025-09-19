import axios from "axios";
import AIProfile from "../models/AIProfile.js";
import User from "../models/User.js";

export const generateCareerRoadmap = async (req, res) => {
  let aiProfile = null; // Declare outside try block to avoid ReferenceError
  
  try {
    const { 
      currentSkills, 
      careerInterests, 
      educationalBackground, 
      workExperience, 
      careerGoals, 
      personalValues 
    } = req.body;

    // Get user ID from authenticated request
    const userId = req.userId;

    // Create AI profile record first
    aiProfile = new AIProfile({
      userId,
      profile: {
        currentSkills,
        careerInterests,
        educationalBackground,
        workExperience,
        careerGoals,
        personalValues,
      },
      status: "pending",
    });

    await aiProfile.save();

    // Strong prompt to force JSON response with correct difficulty values
    const prompt = `
      Generate a comprehensive career roadmap based on the following user profile:
      - Current Skills: ${currentSkills}
      - Career Interests: ${careerInterests}
      - Educational Background: ${educationalBackground}
      - Work Experience: ${workExperience} years
      - Career Goals: ${careerGoals}
      - Personal Values: ${personalValues.join(", ")}

      Create a detailed, step-by-step roadmap that considers their educational background and experience level.
      Output only valid JSON, no markdown or explanations. 
      Format:
      {
        "roadmap": [
          {
            "stepNumber": 1,
            "title": "Step title",
            "description": "Detailed explanation of this step with actionable advice",
            "timeline": "Months 1-3",
            "resources": ["Resource 1", "Resource 2"],
            "estimatedDuration": "2-3 months",
            
          }
        ],
        "summary": "Brief overview of the career path",
        "totalEstimatedDuration": "12-18 months"
      }
    `;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a career advisor that outputs JSON only." },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Career Roadmap Generator",
          "Content-Type": "application/json",
        },
      }
    );

    const rawOutput = response.data.choices[0].message.content.trim();

    let aiResponse;
    try {
      aiResponse = JSON.parse(rawOutput);
    } catch (err) {
      console.error("JSON Parse Error:", rawOutput);
      
      // Update AI profile with error status
      if (aiProfile) {
        aiProfile.status = "failed";
        aiProfile.errorMessage = "Failed to parse JSON from AI";
        await aiProfile.save();
      }

      return res.status(500).json({
        success: false,
        message: "Failed to parse JSON from AI",
        rawOutput,
      });
    }

    // Update AI profile with successful response
    aiProfile.aiResponse = aiResponse;
    aiProfile.status = "completed";
    await aiProfile.save();

    // Update user's aiProfiles array
    await User.findByIdAndUpdate(
      userId,
      { $push: { aiProfiles: aiProfile._id } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      roadmap: aiResponse.roadmap,
      summary: aiResponse.summary,
      totalEstimatedDuration: aiResponse.totalEstimatedDuration,
      profileId: aiProfile._id,
    });
  } catch (error) {
    console.error("OpenRouter Error:", error.response?.data || error.message);
    
    // Update AI profile with error status if it exists
    if (aiProfile) {
      aiProfile.status = "failed";
      aiProfile.errorMessage = error.message;
      await aiProfile.save();
    }

    res.status(500).json({
      success: false,
      message: "Error generating career plan",
      error: error.response?.data || error.message,
    });
  }
};

// Get user's AI profiles
export const getUserProfiles = async (req, res) => {
  try {
    const userId = req.userId;

    const profiles = await AIProfile.find({ userId })
      .sort({ createdAt: -1 })
      .select("profile status createdAt aiResponse.summary aiResponse.totalEstimatedDuration");

    res.status(200).json({
      success: true,
      profiles,
    });
  } catch (error) {
    console.error("Error fetching user profiles:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching user profiles",
      error: error.message,
    });
  }
};

// Get specific AI profile by ID
export const getProfileById = async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.userId;

    const profile = await AIProfile.findOne({ _id: profileId, userId })
      .populate("userId", "username email");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// Delete AI profile by ID
export const deleteProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.userId;

    // Find and delete the profile (only if it belongs to the user)
    const deletedProfile = await AIProfile.findOneAndDelete({ 
      _id: profileId, 
      userId 
    });

    if (!deletedProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found or you don't have permission to delete it",
      });
    }

    // Remove the profile ID from user's aiProfiles array
    await User.findByIdAndUpdate(
      userId,
      { $pull: { aiProfiles: profileId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile:", error.message);
    res.status(500).json({
      success: false,
      message: "Error deleting profile",
      error: error.message,
    });
  }
};