const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = "https://api.openai.com/v1/chat/completions";
    this.model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
  }

  async generateResumeContent(prompt, context) {
    try {
      // Define context-specific system prompts
      let systemPrompt =
        "You are a professional resume writer. Generate concise, professional content.";

      if (context === "summary") {
        systemPrompt =
          "Create a concise professional summary highlighting core competencies and career achievements. Use 3-4 sentences maximum. Focus on value proposition and key strengths. Avoid first-person pronouns.";
      } else if (context === "experience") {
        systemPrompt =
          "Create 3-4 bullet points for job responsibilities and achievements. Start with strong action verbs. Focus on quantifiable results and metrics. Format as bullet points with clear, concise language.";
      } else if (context === "skills") {
        systemPrompt =
          "List relevant technical and soft skills for this profession. Present as comma-separated values. Prioritize in-demand skills relevant to the industry.";
      }

      const messages = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ];

      const response = await axios.post(
        this.baseURL,
        {
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 350,
          timeout: 10000, // 10 second timeout
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        !response.data ||
        !response.data.choices ||
        !response.data.choices[0]
      ) {
        throw new Error("Invalid response from AI service");
      }

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error("AI API Error:", error.response?.data || error.message);

      // More specific error messages
      if (error.response?.status === 429) {
        throw new Error(
          "AI service rate limit exceeded. Please try again in a few moments."
        );
      }

      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        throw new Error("AI service request timed out. Please try again.");
      }

      if (!this.apiKey) {
        throw new Error(
          "AI service configuration error. Please contact support."
        );
      }

      throw new Error(
        "Unable to generate content. Please try a different prompt or try again later."
      );
    }
  }
}

module.exports = new AIService();
