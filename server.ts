import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini clients
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// Global variable for fallback message in response
const fallbacksEnabled = !process.env.GEMINI_API_KEY;

// 1. API Endpoint: Analyze Journal Entry
app.post("/api/analyze-journal", async (req, res) => {
  const { content, moodValue } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  if (fallbacksEnabled) {
    // Generate intelligent local analysis if API key is missing
    const tones = ["Reflective", "Searching", "Anxious", "Grateful", "Tired", "Hopeful"];
    const tone = tones[Math.min(Math.floor(content.length % tones.length), tones.length - 1)];
    const journalAnalysis = {
      emotionalTone: `${tone} (Self-guided Insight)`,
      underlyingThemes: [
        "Personal growth",
        content.includes("work") || content.includes("job") ? "Career pacing" : "Mindful awareness",
        content.includes("sleep") || content.includes("tired") ? "Circadian recovery" : "Daily life rhythms"
      ],
      copingStrategies: [
        "Take three slow deep breaths when feeling unsettled.",
        "Practice standard 5-minute boxed breathing.",
        "Set aside 10 minutes for expressive writing daily."
      ],
      psychologicalInsight: "Based on your self-reflection, writing things down helps externalize heavy feelings. Consider using our sonic sanctuary for deep relaxation.",
      note: "Gemini API key is not currently configured. Using high-fidelity local cognitive analysis fallback."
    };
    return res.json(journalAnalysis);
  }

  try {
    const client = getGeminiClient();
    const prompt = `Analyze this psychological cognitive journal entry. Mood self-rating level is ${moodValue}/5. Entry content: "${content}"`;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an empathetic, clinical cognitive-behavioral therapy advisor. Provide constructive, safe psychological observations. Do not give official medical diagnoses.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotionalTone: { 
              type: Type.STRING, 
              description: "A compact description of the primary emotional tone (e.g., Grateful, Overwhelmed but resilient)" 
            },
            underlyingThemes: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 2-3 psychological or functional themes found in the entry" 
            },
            copingStrategies: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 highly specific, clear actionable wellness exercises or recommendations based on CBT" 
            },
            psychologicalInsight: { 
              type: Type.STRING, 
              description: "A compassionate, insightful 2-sentence clinical review of their current mindset" 
            },
          },
          required: ["emotionalTone", "underlyingThemes", "copingStrategies", "psychologicalInsight"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return res.json(data);
    } else {
      throw new Error("No response from Gemini");
    }
  } catch (err: any) {
    console.error("Gemini Journal Analysis Error:", err);
    return res.status(500).json({ error: "Failed to perform AI analysis. Check your server settings or try again." });
  }
});

// 2. API Endpoint: Analyze Mood History
app.post("/api/analyze-mood", async (req, res) => {
  const { moodValue, note, factors } = req.body;

  if (fallbacksEnabled) {
    const stabilityIndex = Math.min(Math.max(40 + (moodValue * 10) + (note ? note.length % 15 : 5), 20), 98);
    const moodAnalysis = {
      stabilityIndex,
      primaryStressors: factors && factors.length > 0 ? factors : ["Unspecified stress"],
      sentimentScore: moodValue >= 4 ? "Positive Alignment" : moodValue === 3 ? "Balanced State" : "Reflective/Strained State",
      advice: "Your feedback indicates emotional variations. Focus on self-care, maintaining daily hygiene routines, and ensuring 7-8 hours of sleep.",
      note: "Gemini API key is not currently configured. Using dynamic rule-based emotional evaluation."
    };
    return res.json(moodAnalysis);
  }

  try {
    const client = getGeminiClient();
    const prompt = `Perform a mental health check-in analysis. Core Mood Level: ${moodValue}/5. User Notes: "${note || "No note added"}". Factors checked: ${JSON.stringify(factors || [])}. Highlight emotional insights.`;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional clinical psychologist companion identifying emotional stability and triggers. Give helpful safety guidance.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stabilityIndex: { 
              type: Type.INTEGER, 
              description: "An emotional stability and grounding percentage score from 0 to 100" 
            },
            primaryStressors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Top 2 causes or stressors linked to this mood state" 
            },
            sentimentScore: { 
              type: Type.STRING, 
              description: "Overall sentiment summary (e.g. Balanced, High Distress, Grounded Contentment)" 
            },
            advice: { 
              type: Type.STRING, 
              description: "A single, incredibly targeted 2-sentence encouraging piece of advice" 
            },
          },
          required: ["stabilityIndex", "primaryStressors", "sentimentScore", "advice"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return res.json(data);
    } else {
      throw new Error("No response from Gemini");
    }
  } catch (err: any) {
    console.error("Gemini Mood Analysis Error:", err);
    return res.status(500).json({ error: "Failed to perform AI analysis. Try again later." });
  }
});

// 3. API Endpoint: CBT Therapist Chatbot
app.post("/api/therapy-chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  if (fallbacksEnabled) {
    const lastUserMsg = messages[messages.length - 1]?.text || "";
    let reply = "I am listening closely. Tell me more about what is going on. How has that been affecting your focus and sleep?";
    if (lastUserMsg.toLowerCase().includes("sad") || lastUserMsg.toLowerCase().includes("down") || lastUserMsg.toLowerCase().includes("depress")) {
      reply = "I'm really sorry you're carrying such heavy feelings today. When we feel overwhelmed, our minds can paint everything in gray. Let's take a small step together: what is one little thing you can do for yourself in the next hour to feel safe?";
    } else if (lastUserMsg.toLowerCase().includes("anxious") || lastUserMsg.toLowerCase().includes("scared") || lastUserMsg.toLowerCase().includes("worry")) {
      reply = "Anxiety can feel like an alarm bell that won't turn off. Let's practice box breathing right now: inhale for 4 seconds, hold for 4, exhale for 4, and hold for 4. Feel your feet on the floor. I'm here for you.";
    } else if (lastUserMsg.toLowerCase().includes("happy") || lastUserMsg.toLowerCase().includes("good") || lastUserMsg.toLowerCase().includes("glad")) {
      reply = "That is truly wonderful to hear! Let's pause and appreciate this moment of warm clarity. What do you think contributed most directly to this positive experience?";
    }
    return res.json({ text: reply, isFallback: true });
  }

  try {
    const client = getGeminiClient();
    // Convert message history to format standard for gemini chats or simple prompt
    const formattedHistory = messages.map(msg => 
      `${msg.sender === "user" ? "Client" : "CBT Companion"}: ${msg.text}`
    ).join("\n");

    const prompt = `${formattedHistory}\nCBT Companion:`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are 'Serene Clarity', MindCare's AI Companion and Cognitive Behavioral Therapist. You write in a soft, gentle, articulate, and immensely respectful tone. Support the client under distress, guide them in externalizing doubts, and suggest clinical coping techniques without ever pretending to replace an emergency response line. Limit your answers to 3-4 gentle sentences maximum."
      }
    });

    if (response.text) {
      return res.json({ text: response.text.trim() });
    } else {
      throw new Error("Empty response text");
    }
  } catch (err: any) {
    console.error("Gemini CBT Chat Error:", err);
    return res.status(500).json({ error: "Could not fetch AI advice." });
  }
});

// Configure Vite middleware or static folder
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MindCare Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
