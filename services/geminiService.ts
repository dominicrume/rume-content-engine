import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GeneratedContent, ContentTheme, StrategyResult } from "../types";

// RD-1 Configuration Constants
const FAST_MODEL = 'gemini-3-flash-preview'; // Speed & Audio Accuracy
const DEEP_MODEL = 'gemini-3-pro-preview';   // Reasoning & Strategy

const RD_IDENTITY_BIBLE = `
NAME: Rume Dominic (RD)
ROLE: Visionary Problem Solver, Chief Editorial Officer.
INDUSTRY: High-trust, high-liquidity, institutional brokerage, asset infrastructure, AI, Business Strategy.
TARGET AUDIENCE: Young Global Entrepreneurs, Career Individuals, Established Investors.

BRAND VOICE:
- Authoritative yet calm.
- Outspoken yet not argumentative.
- Effortlessly innovative and daring.
- Witty, informational, tech-savvy.

MISSION: To be a channel of blessing.
VISION: To make money.
TAGLINE: "5× Cheaper. 7× Faster. Powered by the Rume Dominic Strategy Framework."
VALUES: Integrity, character, possibility mentality, discipline, sacrifice, capacity building, spirituality, accountability.

CORE FRAMEWORKS (Wealth of the Blockchain, Vorem's Mission):
- Bridge Founder Consciousness to Market Authority.
- Communicate, Code, Capital, Convert.

BOOKS:
- Wealth of the Blockchain
- An evolution into the metaverse
- From code to consciousness
- Inside the heart of a global Entrepreneur

BANNED LEXICON:
- Revolutionize, Landscape, Game-changer, Delve, Unleash, Excited to announce, Unlock, Foster.

WRITING CADENCE (F-Pattern):
- Start with a contrarian truth or strong hook (< 80 chars).
- Short, declarative sentences. High impact. Low fluff.
- Structure: Hook -> Body (The Problem, The RD Shift, The Practical Action) -> CTA.
`;

const SYSTEM_INSTRUCTION = `
${RD_IDENTITY_BIBLE}

You are the RD-1 Content Engine. You act as the digital brain of Rume Dominic.

Output Format for Post Generation:
You must return a valid JSON object:
{
  "theme": "Infrastructure" | "Sovereignty" | "Wealth" | "AI",
  "hook": "The short hook string",
  "body": "The main content formatted in markdown (The Problem, The RD Shift, The Practical Action)",
  "cta": "Soft lead into RD ecosystem (Vorem, Books, Consulting)"
}

Step 1: Cleanup input (remove fillers).
Step 2: Classify theme.
Step 3: Generate post avoiding banned words.
Step 4: Scrutinize your own output before returning.
`;

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiInstance;
};

export const initializeSession = () => {
  return getAI();
};

export const processInput = async (
  input: string | { mimeType: string; data: string },
  isRefinement: boolean = false
): Promise<GeneratedContent> => {
  const ai = getAI();

  let messageContent: any;
  if (typeof input === 'string') {
    messageContent = isRefinement 
      ? `REFINE the previous post based on this feedback: "${input}". Ensure JSON format is maintained. Remember the RD Voice: Calm, Authoritative, Witty.`
      : `Generate a LinkedIn/Medium/X post based on this raw thought: "${input}"`;
  } else {
    // Audio input
    messageContent = {
      parts: [
        {
          inlineData: {
            mimeType: input.mimeType,
            data: input.data
          }
        },
        {
          text: "Transcribe this audio. IGNORE silence or background noise. Extract the core business insight. Generate a high-impact post in JSON format."
        }
      ]
    };
  }

  try {
    // Use FLASH model for low latency audio/text processing
    const response = await ai.models.generateContent({
        model: FAST_MODEL,
        contents: messageContent,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json'
        }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);

    return {
      hook: data.hook || "Error generating hook",
      body: data.body || "Error generating body",
      cta: data.cta || "",
      theme: (data.theme as ContentTheme) || ContentTheme.Unclassified,
      rawResponse: text
    };
  } catch (error) {
    console.error("Gemini processing error:", error);
    throw new Error("RD-1 Intelligence Layer failed to process data.");
  }
};

export const scrutinizeContent = async (): Promise<GeneratedContent> => {
  const ai = getAI();
  // Use PRO model for deep reasoning/scrutiny
  const prompt = `
    SCRUTINIZE MODE ACTIVATED.
    Role: act as a hostile critic. 
    Task: Find flaws, weak arguments, or passive language in the previously generated draft.
    Action: Rewrite the post to be 20% more aggressive, sharper, and remove any remaining fluff.
    Maintain the JSON output format.
  `;

  try {
    const response = await ai.models.generateContent({
        model: DEEP_MODEL, // Deep reasoning
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json'
        }
    });
    
    const text = response.text || "{}";
    const data = JSON.parse(text);

    return {
      hook: data.hook,
      body: data.body,
      cta: data.cta,
      theme: data.theme as ContentTheme,
      rawResponse: text
    };
  } catch (error) {
    console.error("Scrutiny failed:", error);
    throw error;
  }
};

export const generateStrategy = async (redditContext: string): Promise<StrategyResult> => {
  const ai = getAI();
  // Use PRO model for strategic reasoning
  const strategyPrompt = `
    IDENTITY: You are a World-Class Content Strategist for Rume Dominic (RD).
    CONTEXT: ${RD_IDENTITY_BIBLE}
    
    TASK: Turn the provided Reddit audience problems into viral content ideas.
    
    INPUT DATA (REDDIT):
    ${redditContext}

    STEP 1: ANALYZE THE PAIN POINT
    - Identify the specific struggle.
    - Confirm the "Activity Level" is high (implied by the user providing this data).
    - Ensure it matches the RD Ideal Customer Profile (Entrepreneurs, Investors, Tech-savvy).
    
    STEP 2: GENERATE 15 IDEAS
    1. 5 "How to" articles (tactical, step-by-step).
    2. 5 listicles (tools, mistakes, tips, examples).
    3. 3 contrarian takes (challenge conventional advice).
    4. 2 frameworks (systematic approaches with memorable names).

    OUTPUT JSON FORMAT:
    {
      "painPointAnalysis": "A short summary of the core pain point identified.",
      "howTo": [{ "headline": "...", "hook": "...", "angle": "..." }],
      "listicles": [{ "headline": "...", "hook": "...", "angle": "..." }],
      "contrarian": [{ "headline": "...", "hook": "...", "angle": "..." }],
      "frameworks": [{ "headline": "...", "hook": "...", "angle": "..." }]
    }
  `;

  try {
    const result = await ai.models.generateContent({
      model: DEEP_MODEL,
      contents: strategyPrompt,
      config: { responseMimeType: 'application/json' }
    });
    
    const text = result.text || "{}";
    return JSON.parse(text) as StrategyResult;
  } catch (error) {
    console.error("Strategy generation failed:", error);
    throw new Error("Failed to generate content strategy.");
  }
};