import axios from 'axios';
import AIProfile from '../models/AIProfile.js';
import User from '../models/User.js';

export const generateCareerRoadmap = async (req, res) => {
  let aiProfile = null; // Declare outside try block to avoid ReferenceError

  try {
    const {
      currentSkills,
      careerInterests,
      educationalBackground,
      workExperience,
      careerGoals,
      personalValues,
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
      status: 'pending',
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
      - Personal Values: ${personalValues.join(', ')}

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
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a career advisor that outputs JSON only.',
          },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Career Roadmap Generator',
          'Content-Type': 'application/json',
        },
      }
    );

    const rawOutput = response.data.choices[0].message.content.trim();

    let aiResponse;
    try {
      aiResponse = JSON.parse(rawOutput);
    } catch (err) {
      console.error('JSON Parse Error:', rawOutput);

      // Update AI profile with error status
      if (aiProfile) {
        aiProfile.status = 'failed';
        aiProfile.errorMessage = 'Failed to parse JSON from AI';
        await aiProfile.save();
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to parse JSON from AI',
        rawOutput,
      });
    }

    // Update AI profile with successful response
    aiProfile.aiResponse = aiResponse;
    aiProfile.status = 'completed';
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
    console.error('OpenRouter Error:', error.response?.data || error.message);

    // Update AI profile with error status if it exists
    if (aiProfile) {
      aiProfile.status = 'failed';
      aiProfile.errorMessage = error.message;
      await aiProfile.save();
    }

    res.status(500).json({
      success: false,
      message: 'Error generating career plan',
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
      .select(
        'profile status createdAt aiResponse.summary aiResponse.totalEstimatedDuration'
      );

    res.status(200).json({
      success: true,
      profiles,
    });
  } catch (error) {
    console.error('Error fetching user profiles:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profiles',
      error: error.message,
    });
  }
};

// Get specific AI profile by ID
export const getProfileById = async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.userId;

    const profile = await AIProfile.findOne({
      _id: profileId,
      userId,
    }).populate('userId', 'username email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

// Update progress for a profile
export const updateProgress = async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.userId;
    const { completedSteps, note, noteStepNumber } = req.body || {};

    const profile = await AIProfile.findOne({ _id: profileId, userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (Array.isArray(completedSteps)) {
      // Deduplicate while merging
      const merged = new Set([...(profile.progress?.completedSteps || []), ...completedSteps]);
      profile.progress = profile.progress || {};
      profile.progress.completedSteps = Array.from(merged).sort((a, b) => a - b);
    }

    if (note && typeof note === 'string' && Number.isFinite(Number(noteStepNumber))) {
      profile.progress = profile.progress || {};
      profile.progress.notes = profile.progress.notes || [];
      profile.progress.notes.push({ stepNumber: Number(noteStepNumber), note });
    }

    await profile.save();
    return res.json({ success: true, progress: profile.progress });
  } catch (error) {
    console.error('Update progress error:', error.message);
    return res.status(500).json({ success: false, message: 'Error updating progress', error: error.message });
  }
};

// Ask AI to suggest next steps based on progress
export const suggestNextSteps = async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.userId;
    const { completedSteps, message, history } = req.body || {};

    const profile = await AIProfile.findOne({ _id: profileId, userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const mergedCompleted = Array.from(
      new Set([...(profile.progress?.completedSteps || []), ...(Array.isArray(completedSteps) ? completedSteps : [])])
    ).sort((a, b) => a - b);

    const roadmap = profile.aiResponse?.roadmap || [];
    const summary = profile.aiResponse?.summary || '';

    // Build context-aware prompt
    let userContext = '';
    if (message && message.trim()) {
      userContext = `\n\nUser's current question/difficulty: "${message.trim()}"\nPlease address this specific concern in your suggestions.`;
    }

    const roadmapSummary = roadmap.length > 0 
      ? roadmap.map(p => `Step ${p.stepNumber || 'N/A'}: ${p.title || 'Untitled'}`).join('\n')
      : 'No roadmap steps available.';

    const systemPrompt = `You are a helpful career coach assisting a user with their career roadmap. 
Always provide practical, actionable next steps. Output only valid JSON - no markdown, no explanations.`;

    const userPrompt = `You are helping a user follow their career roadmap.

Original roadmap steps:
${roadmapSummary}

Summary: ${summary || 'Career development path'}

The user has completed steps with stepNumber(s): ${mergedCompleted.length > 0 ? mergedCompleted.join(', ') : 'none (just starting)'}.${userContext}

Based on their progress${message ? ' and their current question' : ''}, provide 3-5 highly relevant, actionable next steps that will help them advance.

Each step should be specific and practical. Output JSON only in this exact format:
{
  "nextSteps": [
    { 
      "title": "Short actionable task title (max 60 chars)",
      "description": "Brief explanation (1-2 sentences)",
      "estimatedDuration": "time estimate",
      "resources": ["resource 1", "resource 2"]
    }
  ]
}`;

    // Build messages array with conversation history if provided
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history if provided (last 6 messages)
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6); // Last 6 messages
      recentHistory.forEach(msg => {
        if (msg.role && msg.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }

    // Add the current prompt
    messages.push({ role: 'user', content: userPrompt });

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Career Roadmap Next Steps',
          'Content-Type': 'application/json',
        },
      }
    );

    const raw = response.data.choices?.[0]?.message?.content?.trim() || '{}';
    
    // Try to extract JSON from markdown code blocks if present
    let jsonStr = raw;
    const jsonMatch = raw.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Next steps JSON parse error:', raw);
      // Return empty array instead of error so frontend can use fallback
      return res.json({ success: true, nextSteps: [] });
    }

    const nextSteps = parsed.nextSteps || [];
    
    // Validate and ensure we have at least title for each step
    const validSteps = nextSteps
      .filter(step => step && (step.title || step))
      .map(step => ({
        title: step.title || step,
        description: step.description || '',
        estimatedDuration: step.estimatedDuration || '',
        resources: Array.isArray(step.resources) ? step.resources : []
      }));

    return res.json({ success: true, nextSteps: validSteps });
  } catch (error) {
    console.error('Suggest next steps error:', error.message);
    // Return empty array so frontend can use fallback instead of showing error
    return res.json({ success: true, nextSteps: [] });
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
      userId,
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
      message: 'Profile deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting profile:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting profile',
      error: error.message,
    });
  }
};
