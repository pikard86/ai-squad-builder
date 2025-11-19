import { GoogleGenAI, Type, Schema, Part } from "@google/genai";
import { CardData } from '../types';

const API_KEY = process.env.API_KEY || '';

// Schema for the Resume Card
const cardSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Candidate's full name" },
    position: { type: Type.STRING, description: "Primary job title or role (e.g. 'Senior Engineer', 'Product Manager'). Keep it short (max 3 words)." },
    nationality: { type: Type.STRING, description: "Inferred nationality or 'World' if unknown. Use ISO 2-letter code if possible, or Full Country Name." },
    overall: { type: Type.INTEGER, description: "Calculated overall rating 1-99 based on experience, impact, and skills." },
    summary: { type: Type.STRING, description: "A very short, punchy 2-sentence bio." },
    attributes: {
      type: Type.ARRAY,
      description: "Exactly 6 key skill categories with scores (0-99).",
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "Short 3-4 letter label: CODE, ARCH, LEAD, COMM, PROB, EXP" },
          value: { type: Type.INTEGER, description: "Score 0-99" },
          fullLabel: { type: Type.STRING, description: "Full name of the attribute" }
        },
        required: ["label", "value", "fullLabel"]
      }
    },
    techSkills: {
      type: Type.ARRAY,
      description: "A list of the top 6-8 specific technologies, languages, or frameworks found in the resume with a proficiency score (0-99).",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the technology (e.g., React, Python, AWS, Kubernetes)" },
          rating: { type: Type.INTEGER, description: "Proficiency score 0-99 based on usage frequency and context." }
        },
        required: ["name", "rating"]
      }
    }
  },
  required: ["name", "position", "overall", "attributes", "summary", "nationality", "techSkills"]
};

export const analyzeResume = async (
  base64Data: string,
  mimeType: string,
  extractedText?: string
): Promise<CardData> => {
  if (!API_KEY) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  let parts: Part[] = [];

  // If PDF, we can send the base64 directly as inlineData
  if (mimeType === 'application/pdf') {
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: 'application/pdf'
      }
    });
    parts.push({
      text: "Analyze this resume PDF. Create a 'FUT Player Card' profile for this candidate."
    });
  } else if (extractedText) {
    // If text (from DOCX), just send text
    parts.push({
      text: `Analyze the following resume text. Create a 'FUT Player Card' profile for this candidate.\n\nRESUME TEXT:\n${extractedText}`
    });
  } else {
    throw new Error("Unsupported input for analysis");
  }

  const systemPrompt = `
    You are an elite Technical Recruiter and Talent Scout. Analyze the resume to generate a 'FIFA Ultimate Team' style player card.
    
    STRICT SCORING RUBRIC (0-99):
    
    1. **CODE (Coding & Implementation)**:
       - <60: Scripting only, HTML/CSS.
       - 60-75: Solid proficiency in one major language (JS, Python, Java).
       - 76-85: Polyglot, advanced patterns, optimization.
       - 86-99: Core contributor to major OS/Frameworks, Kernel hacking, or extreme algorithmic depth.

    2. **ARCH (Architecture & System Design)**:
       - <60: Basic MVC, monolithic features.
       - 60-75: Microservices basics, API design, database schema design.
       - 76-85: Distributed systems, high availability, cloud-native architecture (AWS/Azure/GCP).
       - 86-99: Principal/Staff level design, massive scale (millions of QPS), global distribution.

    3. **LEAD (Leadership & Management)**:
       - <50: Individual Contributor (IC) only.
       - 50-70: Mentoring juniors, code review ownership.
       - 71-85: Tech Lead, Team Lead, Engineering Manager.
       - 86-99: CTO, VP of Engineering, Head of Department.

    4. **COMM (Communication & Soft Skills)**:
       - Base on: Documentation, presentation mentions, cross-functional collaboration (Product/Design), public speaking.
       - 80+ requires evidence of writing blogs, speaking at conferences, or leading large cross-team initiatives.

    5. **PROB (Problem Solving)**:
       - Base on: Achievements in optimizing performance, fixing critical incidents, complex debugging, or mathematical background.
       - Look for keywords: "Optimized", "Reduced latency", "Solved", "Algorithm".

    6. **EXP (Experience & Tenure)**:
       - < 2 years: 50-69
       - 2-5 years: 70-79
       - 5-8 years: 80-88
       - 8+ years: 89-99

    **TECH SKILLS:**
    Extract specific technologies (e.g., React, Node.js, Python, Docker, Kubernetes, AWS, Java, Go).
    Rate them based on how central they are to the candidate's recent experience.

    **OVERALL RATING:**
    Weighted average of the attributes, heavily weighted towards their primary role (e.g., CODE/ARCH for Devs, LEAD for Managers).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: cardSchema,
        systemInstruction: systemPrompt
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsedData = JSON.parse(text) as Omit<CardData, 'id'>;
    
    // Add a random ID
    return {
      ...parsedData,
      id: crypto.randomUUID()
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};