import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisReport, InterventionProject, Zone, PhaseStatus } from "../types";

const getAiClient = () => {
  // API key must be provided via environment variable
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateZoneAnalysis = async (zone: Zone): Promise<Omit<AnalysisReport, 'id' | 'timestamp'>> => {
  const ai = getAiClient();
  
  // System Instruction: Sets the persona and analytical framework
  const systemInstruction = `
    You are an expert Environmental Data Scientist specializing in urban air quality. 
    Your task is to analyze real-time sensor data to diagnose pollution events.

    Analytical Framework:
    1. **Particulate Ratio (PM2.5/PM10):** 
       - High ratio (>0.6) suggests combustion (traffic, biomass burning).
       - Low ratio (<0.5) suggests coarse dust (construction, road dust).
    2. **Gaseous Markers:**
       - High NO2 correlates with vehicular exhaust.
       - High Ozone (O3) suggests photochemical smog requires sunlight and precursors.
    3. **Context:** Use the zone description (e.g., "Industrial", "Residential") to weight probabilities.

    Output Rule: Return ONLY valid JSON matching the schema.
  `;

  // User Prompt: The specific data context
  const prompt = `
    Analyze the following Air Quality Zone data:
    
    Zone Profile:
    - Name: ${zone.name}
    - City: ${zone.city}
    - Description: ${zone.description}
    
    Sensor Readings:
    - AQI: ${zone.currentAqi}
    - PM 2.5: ${zone.metrics.pm25} µg/m³
    - PM 10: ${zone.metrics.pm10} µg/m³
    - NO2: ${zone.metrics.no2} ppb
    - Ozone (O3): ${zone.metrics.o3} ppb
    
    Generate a diagnosis with probable causes, a concise executive summary, and a primary recommendation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Executive summary of the pollution event (max 2 sentences)." },
            recommendation: { type: Type.STRING, description: "The single most effective immediate action." },
            causes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  factor: { type: Type.STRING, description: "Pollution source (e.g., 'Construction Dust', 'Diesel Exhaust')." },
                  confidence: { type: Type.INTEGER, description: "Confidence score (0-100)." },
                  reasoning: { type: Type.STRING, description: "Scientific deduction based on the specific metrics provided." }
                },
                required: ["factor", "confidence", "reasoning"]
              }
            }
          },
          required: ["summary", "recommendation", "causes"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text);
    return {
      ...parsed,
      zoneId: zone.id
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback mock response if API fails or key is missing
    return {
      zoneId: zone.id,
      summary: "AI Service Unavailable. Automated fallback diagnosis: Elevated Particulate Matter detected.",
      recommendation: "Deploy manual inspection team to verify local sources.",
      causes: [
        { factor: "System Error", confidence: 0, reasoning: "Could not connect to Generative AI service." },
        { factor: "Potential Dust", confidence: 50, reasoning: "Based on raw PM10 values (Fallback)." }
      ]
    };
  }
};

export const generateInterventionPlan = async (zone: Zone, analysis: AnalysisReport): Promise<Omit<InterventionProject, 'id' | 'startDate' | 'status' | 'basedOnAnalysisId' | 'zoneId'>> => {
  const ai = getAiClient();

  const systemInstruction = `
    You are a Senior Project Manager for Urban Infrastructure. 
    Convert air quality diagnostic reports into actionable, agile intervention projects.
    
    Planning Strategy:
    - **Phase 1 (Immediate):** Containment & Mitigation (0-48 hours).
    - **Phase 2 (Scaling):** Process Improvement & Enforcement (1-2 weeks).
    - **Phase 3 (Long-term):** Structural/Policy Changes (1-3 months).
    
    Tone: Professional, directive, and operational.
  `;

  const prompt = `
    Create an intervention project based on this analysis:
    
    Context:
    - Zone: ${zone.name} (${zone.city})
    - Diagnosis: ${analysis.summary}
    - Primary Cause: ${analysis.causes[0]?.factor || 'General Pollution'}
    
    Requirements:
    1. Generate a professional Project Title.
    2. Write brief strategic notes.
    3. Define 3 phases (Immediate, Scaling, Long-term) with specific actions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            notes: { type: Type.STRING },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  actions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["name", "description", "actions"]
              }
            }
          },
          required: ["title", "notes", "phases"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

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
      title: "Manual Intervention Project",
      notes: "AI generation failed. Please fill details manually.",
      phases: [
        { id: 'fallback-ph-1', status: 'PENDING', name: "Phase 1: Immediate", description: "Immediate actions (Fallback)", actions: ["Assess site", "Check sensors"] },
        { id: 'fallback-ph-2', status: 'PENDING', name: "Phase 2: Scaling", description: "Scaling operations (Fallback)", actions: ["Deploy resources"] },
        { id: 'fallback-ph-3', status: 'PENDING', name: "Phase 3: Long-term", description: "Long term monitoring (Fallback)", actions: ["Monitor"] },
      ]
    };
  }
};
