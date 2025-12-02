import { GoogleGenAI, Type, Schema, Part } from "@google/genai";
import { CardData, TeamLineup, Formation, TeamSynergy, ROLE_LABELS } from '../types';

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

export const analyzeTeamSynergy = async (
  lineup: TeamLineup,
  formation: Formation
): Promise<TeamSynergy> => {
  if (!API_KEY) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Filter out empty slots for the prompt
  const assignedPlayers = Object.entries(lineup.players)
    .filter(([_, player]) => player !== null)
    .map(([role, player]) => ({
      roleId: role,
      roleName: ROLE_LABELS[role] || role,
      player: {
        name: player?.name,
        position: player?.position,
        overall: player?.overall,
        attributes: player?.attributes,
        techSkills: player?.techSkills
      }
    }));

  if (assignedPlayers.length === 0) {
    throw new Error("Lineup is empty");
  }

  const prompt = `
    Analyze the fitness and synergy of this software engineering team based on the chosen formation.

    **Formation**: ${formation.name}
    **Description**: ${formation.description}

    **Current Lineup Assignments**:
    ${JSON.stringify(assignedPlayers, null, 2)}

    **Task**:
    1. Evaluate each player's fitness for their ASSIGNED ROLE (0-100). 
       - Low score (Red): Huge mismatch (e.g., Junior in Lead role, Backend dev in UX role, or mismatch in tech stack).
       - Medium score (Yellow): Okay but not ideal (e.g., Generalist in Specialist role).
       - High score (Green): Perfect match (Skills and Experience align with Role).
    2. Provide a short reason for the score.
    3. Calculate an OVERALL TEAM SYNERGY score (0-100) based on role coverage and balance.

    **Output Format (JSON)**:
    {
      "overallScore": number,
      "summary": "string",
      "roleFitness": {
        "roleId_1": { "score": number, "reason": "string" },
        "roleId_2": { "score": number, "reason": "string" },
        ...
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);

    const synergy: TeamSynergy = {
      overallScore: result.overallScore || 0,
      summary: result.summary || "Analysis failed.",
      roleFitness: {}
    };

    if (result.roleFitness) {
        for (const [key, val] of Object.entries(result.roleFitness)) {
             // @ts-ignore
             synergy.roleFitness[key] = { roleId: key, score: val.score, reason: val.reason };
        }
    }

    return synergy;

  } catch (error) {
    console.error("Team Synergy Analysis Error:", error);
    throw error;
  }
};

export const autoArrangeLineup = async (
  roster: CardData[],
  formation: Formation
): Promise<Record<string, string>> => {
  if (!API_KEY) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Summarize roster to save tokens
  const simplifiedRoster = roster.map(p => ({
    id: p.id,
    name: p.name,
    position: p.position,
    overall: p.overall,
    attributes: p.attributes.reduce((acc, attr) => ({...acc, [attr.label]: attr.value}), {}),
    techSkills: p.techSkills?.map(t => `${t.name} (${t.rating})`).join(', ')
  }));

  const slots = formation.slots.map(s => ({
    id: s.id,
    roleName: ROLE_LABELS[s.id] || s.id
  }));

  const prompt = `
    You are a Squad Builder AI. Assign the best players from the roster to the formation slots to maximize Team Overall and Synergy.
    
    **Constraints:**
    1. Each player can only be assigned to one slot.
    2. Try to fill all slots if possible.
    3. Match player skills/roles to the slot requirements (e.g. 'fe1' needs Frontend skills, 'devops' needs CI/CD/Cloud).
    4. It is better to leave a slot empty than to put a completely unqualified person (e.g. Junior Frontend as Engineering Manager), but prefer filling slots if they are somewhat capable.

    **Roster**:
    ${JSON.stringify(simplifiedRoster)}

    **Formation Slots**:
    ${JSON.stringify(slots)}

    **Task**:
    Return a JSON object where keys are Slot IDs and values are Player IDs.
    
    **Example Output**:
    {
      "manager": "player_id_123",
      "fe1": "player_id_456"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);
    return result; // Record<string, string>

  } catch (error) {
    console.error("Auto Arrange Error:", error);
    throw error;
  }
};