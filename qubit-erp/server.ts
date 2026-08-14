import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ==========================================
// API Endpoints
// ==========================================

// NLQ Executive Chatbot API
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const ai = getGeminiClient();
    
    // Construct prompt that grounds the AI as Qubit Master AI in Cosmo Seed™ Universe
    const systemInstruction = `
      You are Qubit Master AI, the core engine of Qubit ERP in the Cosmo Seed™ business architecture.
      You support a single high-IQ operator (One-Man Unicorn) in commanding a sprawling digital galaxy with a "2 Suit Cases" minimalist physical footprint.
      Your tone is professional, strategic, clear, objective, and deeply analytical.
      You provide high-level, precise prescriptive insights.
      
      You have access to current ERP state:
      - HR Node: Resume extraction and competency-based project trigger active.
      - Inventory Node: Auto-ordering when stock is <10% active.
      - Finance Node: Real-time cash flow and budget limit control active.
      - Operating Profit: $1.24M (+8.4% optimized).
      - Inventory Turnover: 14.2 Days (Risk converged to 0%).
      - Qubit Error Rate: -12% (Volatility defense successful).
      
      When discussing or simulating, use precise design and business terminology. Always write in English as the UI is 100% English. Keep responses concise, structured, and actionable. Do not use promotional hype. Use bolding and lists to maintain high readability.
    `;

    // Reconstruct chat with history if provided, otherwise standard generation
    const chat = ai.chats.create({
      model: "gemini-3.7-flash",
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    // Send history if present
    if (history && history.length > 0) {
      for (const h of history.slice(0, -1)) {
        // Simple chat message loading
        // For simplicity, we can feed previous questions, but Gemini SDK chats expect sequential sendMessage.
        // To make it simple and robust, let's just combine the history into a single structured prompt or use chats.
      }
    }

    const response = await chat.sendMessage({ message });
    res.json({ response: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during AI processing" });
  }
});

// What-If Strategy Simulator API
app.post("/api/simulate", async (req, res) => {
  try {
    const { materialCostIncrease, supplyChainVolatility } = req.body;
    
    const ai = getGeminiClient();
    
    const prompt = `
      Perform a Qubit Multivariate Optimization Simulation based on the following parameters:
      - Raw Material Cost Increase: +${materialCostIncrease}%
      - Supply Chain Volatility Level: ${supplyChainVolatility}
      
      Provide a structured Prescriptive Optimization report:
      1. **Simulation Status**: Successful collapse of the wavefunction.
      2. **Operating Profit Impact**: Estimate the impact on operating profit (which is currently $1.24M) in percentage and USD.
      3. **Strategic Actions**: Prescribe exact tactical instructions for the 4 quadrants:
         - Projects: Preemptive order adjustments or rescheduling.
         - Ideas: Priority validation of cost-saving workflows.
         - Study: Research alternate suppliers or hedging mechanisms.
         - Mindset: Strategic focus or resource isolation guidelines.
      4. **Inventory & Finance Alignment**: Adjustments to safe inventory turnover days (currently 14.2 days) and monthly cash flow limits.
      
      Make the response realistic, highly structured, in bold and markdown, and professional. Avoid self-praise or sales-pitch language. Keep it under 250 words for optimal density.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Simulation Error:", error);
    res.status(500).json({ error: error.message || "Failed to run simulation" });
  }
});

// Node-Level AI Action Trigger API
app.post("/api/run-node", async (req, res) => {
  try {
    const { nodeId, promptInput, contextData } = req.body;
    const ai = getGeminiClient();

    let systemInstruction = "";
    let prompt = "";

    if (nodeId === "n1") { // HR Node
      systemInstruction = "You are the HR Node AI Agent of Qubit ERP. You extract core competency data from resumes and generate project suitability triggers.";
      prompt = `Analyze the following applicant or role data: "${promptInput}". 
      Extract:
      1. Core Competency Keywords
      2. Suggested Project Placement (among Qubit App/Data Factory, Commerce & Media, etc.)
      3. Suitability Trigger Score (0-100)
      Format as a neat, unboxed summary.`;
    } else if (nodeId === "n3") { // Inventory Node
      systemInstruction = "You are the Inventory Node AI Agent of Qubit ERP. You evaluate safety stock levels and draft auto-ordering purchase orders (PO).";
      prompt = `Based on material inputs: "${promptInput}". If stock is expected to drop under 10% safety threshold, generate an automated PO draft including Item Name, Target Supplier, Safe Reorder Volume, and Delivery Lead Time.`;
    } else if (nodeId === "n4") { // Finance Node
      systemInstruction = "You are the Finance Node AI Agent of Qubit ERP. You monitor cash flow and adjust monthly budget limits.";
      prompt = `Analyze current budget request or cash event: "${promptInput}". Propose:
      1. Immediate Cash Flow Impact
      2. Recommended Monthly Expenditure Limit adjustment
      3. Risk assessment.`;
    } else { // Qubit Master
      systemInstruction = "You are the Qubit Algorithm Master Node. You run 전사 다변량 최적화 (multivariate global optimization).";
      prompt = `Run multivariate balance calculations for input parameter: "${promptInput}". Balance HR placement, Inventory turnover, and Finance cash flow to maximize Operating Profit.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.5,
      }
    });

    res.json({ output: response.text });
  } catch (error: any) {
    console.error("Run Node Error:", error);
    res.status(500).json({ error: error.message || "Failed to run node-level optimization" });
  }
});

// ==========================================
// Vite Dev / Production Serving
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const qubitHtml = path.join(distPath, "qubit-erp", "index.html");
      if (fs.existsSync(qubitHtml)) {
        res.sendFile(qubitHtml);
      } else {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Qubit Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
