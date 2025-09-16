import axios from "axios";

export const generateCareerRoadmap = async (req, res) => {
  try {
    const { currentRole, experience, skills, interests, goals } = req.body;

    // Strong prompt to force JSON response
    const prompt = `
      Generate a career roadmap based on the following user profile:
      - Current Role: ${currentRole}
      - Experience Level: ${experience}
      - Skills: ${skills.join(", ")}
      - Interests: ${interests.join(", ")}
      - Goals: ${goals.map(goal => `${goal.title} (Target Role: ${goal.targetRole})`).join(", ")}

      Output only valid JSON, no markdown or explanations. 
      Format:
      [
        {
          "stepNumber": 1,
          "title": "Step title",
          "description": "Detailed explanation of this step",
          "timeline": "Months 1-3"
        }
      ]
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

    let roadmapJSON;
    try {
      roadmapJSON = JSON.parse(rawOutput);
    } catch (err) {
      console.error("JSON Parse Error:", rawOutput);
      return res.status(500).json({
        success: false,
        message: "Failed to parse JSON from AI",
        rawOutput,
      });
    }

    res.status(200).json({
      success: true,
      roadmap: roadmapJSON,
    });
  } catch (error) {
    console.error("OpenRouter Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Error generating career plan",
      error: error.response?.data || error.message,
    });
  }
};
