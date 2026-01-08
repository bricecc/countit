import { GoogleGenAI } from "@google/genai";
import { Counter } from "../types";

// Helper to create the AI client safely
const createAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is not set.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeHabits = async (counters: Counter[]): Promise<string> => {
  const ai = createAIClient();
  if (!ai) {
    return "Please configure your API Key to use AI insights.";
  }

  // Prepare data for the prompt
  const summary = counters.map(c => ({
    title: c.title,
    category: c.category,
    count: c.count,
    lastActivity: c.history.length > 0 ? new Date(c.history[c.history.length - 1]).toLocaleString() : 'Never',
    historyCount: c.history.length,
    timestamps: c.trackTime ? c.history.slice(-10) : [] // Send last 10 timestamps for context
  }));

  const prompt = `
    Analyze the following tracking data for my habits and counters.
    Data: ${JSON.stringify(summary)}

    Please provide a brief, friendly, and motivating analysis (approx 100 words).
    1. Identify any trends (if time data is present).
    2. Give a shoutout for positive progress.
    3. Suggest a small improvement or observation.
    
    Structure the response as simple Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate insights at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while analyzing your data. Please check your connection.";
  }
};