
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisReport, InterventionProject, Zone, PhaseStatus } from "../types";

// --- SYSTEM INSTRUCTIONS (PASTE UPDATES FROM AI STUDIO HERE) ---

const FORENSIC_PROMPT = `
You are an expert Environmental Forensic Scientist with real-time web access. 
You have access to three data streams: 
1. **Sensor Data** (Chemical composition).
2. **Visual Feed** (Site images).
3. **Audio Feed** (Recorded ambient noise from the site/drone).

Your goal is to triangulate these sources to find the *exact* cause of pollution.

Analytical Framework:
- **Listen (Audio):** Identify machinery (jackhammers = construction), traffic patterns (horns/idling engines), or silence.
- **See (Vision):** Look for smoke color (Black = Diesel, White = Biomass), dust plumes, or traffic density.
- **Measure (Sensors):** Use PM ratios and Gas levels to confirm the physical evidence.
- **Search (Grounding):** You MUST use Google Search to verify local news (e.g., "fire in {CITY} today", "traffic jam in {ZONE}") or weather conditions that corroborate the sensor data.

If inputs conflict (e.g., Image is clear, but Sensors are high), use the Audio and Search findings to resolve it.

**OUTPUT FORMAT RULE:** 
You MUST return the result as a raw JSON object (no markdown formatting) with this exact structure:
{
  "summary": "Executive summary citing specific evidence and any relevant news found via search.",
  "recommendation": "Primary actionable advice.",
  "causes": [
    { "factor": "Source Name", "confidence": 0-100, "reasoning": "Explanation citing sensor/audio/visual/web evidence." }
  ]
}
`;

const PROJECT_MANAGER_PROMPT = `
You are a Senior Project Manager for Urban Infrastructure. 
Convert air quality diagnostic reports into actionable, agile intervention projects.

Planning Strategy:
- **Phase 1 (Immediate):** Containment & Mitigation (0-48 hours).
- **Phase 2 (Scaling):** Process Improvement & Enforcement (1-2 weeks).
- **Phase 3 (Long-term):** Structural/Policy Changes (1-3 months).

Tone: Professional, directive, and operational.

**OUTPUT FORMAT RULE:**
You MUST return the result as a raw JSON object (no markdown formatting) with this exact structure:
{
  "title": "Project Title",
  "notes": "Strategic notes citing specific local regulations found via search.",
  "phases": [
    { 
       "name": "Phase Name", 
       "description": "Phase Description", 
       "actions": ["Action 1", "Action 2"] 
    }
  ]
}
`;

// --- API CLIENT ---

const getAiClient = () => {
  // API key must be provided via environment variable
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- SERVICES ---

export const generateZoneAnalysis = async (zone: Zone, imageFile?: File, audioBlob?: Blob): Promise<Omit<AnalysisReport, 'id' | 'timestamp'>> => {
  const ai = getAiClient();
  
  // Inject dynamic variables into the prompt if needed, 
  // though here we pass context in the user prompt to keep the system instruction static and cache-friendly.
  const systemInstruction = FORENSIC_PROMPT.replace('{CITY}', zone.city).replace('{ZONE}', zone.name);

  // Construct Multi-modal Content
  const parts: any[] = [];

  // 1. Add Image if present
  if (imageFile) {
    try {
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });

        parts.push({
            inlineData: {
                mimeType: imageFile.type,
                data: base64Data
            }
        });
    } catch (e) {
        console.error("Failed to process image", e);
    }
  }

  // 2. Add Audio if present
  if (audioBlob) {
     try {
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Audio blob to data URL typically looks like "data:audio/webm;base64,..."
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(audioBlob);
        });

        parts.push({
            inlineData: {
                mimeType: audioBlob.type || 'audio/webm', // Default to webm for browser recordings
                data: base64Data
            }
        });
     } catch (e) {
         console.error("Failed to process audio", e);
     }
  }

  // 3. Add Text Prompt
  const promptText = `
    Analyze the following Tri-Modal Data for Zone: ${zone.name}, ${zone.city}.
    
    [Sensor Data]
    - AQI: ${zone.currentAqi}
    - PM2.5: ${zone.metrics.pm25} | PM10: ${zone.metrics.pm10}
    - NO2: ${zone.metrics.no2} | O3: ${zone.metrics.o3}
    - Description: ${zone.description}
    
    [Visual/Audio Evidence]
    ${imageFile ? '- Image attached.' : '- No visual feed.'}
    ${audioBlob ? '- Audio recording attached (Remote Feed). Analyze background noise.' : '- No audio feed.'}
    
    Task:
    1. Identify the root cause.
    2. If Audio is present, explicitly mention what sound signatures were detected (e.g., heavy machinery vs traffic).
    3. If Image is present, correlate it with the sensor values.
    4. **MANDATORY GROUNDING:** Use Google Search to check for specific recent incidents (fires, construction bans, accidents) in ${zone.city} that explain these metrics.
  `;
  
  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: parts },
      config: {
        systemInstruction: systemInstruction,
        // We add googleSearch to give it external awareness (Grounding)
        tools: [{ googleSearch: {} }],
        // NOTE: responseMimeType and responseSchema are NOT compatible with googleSearch tools
        // We rely on the systemInstruction to enforce JSON structure.
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Clean up Markdown code blocks if present (e.g. ```json ... ```)
    text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    const parsed = JSON.parse(text);
    return {
      ...parsed,
      zoneId: zone.id
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      zoneId: zone.id,
      summary: "AI Service Unavailable or Content Policy Block. Falling back to sensor-only mode.",
      recommendation: "Manual audit required.",
      causes: [
        { factor: "System Error", confidence: 0, reasoning: "Could not connect to Generative AI service." },
        { factor: "Unknown", confidence: 50, reasoning: "Analysis failed." }
      ]
    };
  }
};

export const generateInterventionPlan = async (zone: Zone, analysis: AnalysisReport): Promise<Omit<InterventionProject, 'id' | 'startDate' | 'status' | 'basedOnAnalysisId' | 'zoneId'>> => {
  const ai = getAiClient();

  const prompt = `
    Create an intervention project based on this analysis:
    
    Context:
    - Zone: ${zone.name} (${zone.city})
    - Diagnosis: ${analysis.summary}
    - Primary Cause: ${analysis.causes[0]?.factor || 'General Pollution'}
    
    Task:
    1. **SEARCH FIRST:** Use Google Search to find current air quality regulations, construction bans, or GRAP (Graded Response Action Plan) stages active in ${zone.city} *right now*.
    2. **COMPLY:** Ensure the "Immediate" phase actions align with these specific local rules (e.g. "Enforce GRAP Stage 3 ban on demolition").
    3. **PLAN:** Define the 3 phases (Immediate, Scaling, Long-term).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: PROJECT_MANAGER_PROMPT,
        // Enable Grounding to find real regulations
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" <-- Removed to allow tools
        // responseSchema <-- Removed to allow tools
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");

    // Clean up Markdown code blocks if present
    text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    const parsed = JSON.parse(text);
    return {
      ...parsed,
      phases: parsed.phases?.map((p: any, idx: number) => ({
        ...p,
        id: `gen-ph-${Date.now()}-${idx}`,
        status: 'PENDING' as PhaseStatus,
        actions: p.actions || []
      })) || []
    };

  } catch (error) {
    console.error("Gemini Project Gen Failed:", error);
    return {
      title: "Manual Intervention Project (Offline)",
      notes: "AI generation failed. Please fill details manually. Ensure compliance with local regulations.",
      phases: [
        { id: 'fallback-ph-1', status: 'PENDING', name: "Phase 1: Immediate", description: "Immediate actions (Fallback)", actions: ["Assess site", "Check sensors"] },
        { id: 'fallback-ph-2', status: 'PENDING', name: "Phase 2: Scaling", description: "Scaling operations (Fallback)", actions: ["Deploy resources"] },
        { id: 'fallback-ph-3', status: 'PENDING', name: "Phase 3: Long-term", description: "Long term monitoring (Fallback)", actions: ["Monitor"] },
      ]
    };
  }
};
