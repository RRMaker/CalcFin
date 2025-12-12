import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    weaknessScores: {
      type: Type.OBJECT,
      description: "A map of Calculus 1 topics to their weakness score (0-100), where 100 is very weak.",
      properties: {
        "Limits": { type: Type.NUMBER },
        "Derivatives": { type: Type.NUMBER },
        "Chain Rule": { type: Type.NUMBER },
        "Related Rates": { type: Type.NUMBER },
        "Curve Sketching": { type: Type.NUMBER },
        "Optimization": { type: Type.NUMBER },
        "Trig Differentiation": { type: Type.NUMBER },
        "Applications of Derivatives": { type: Type.NUMBER },
        "Integrals": { type: Type.NUMBER },
        "Applications of Integrals": { type: Type.NUMBER },
      },
      required: [
        "Limits", "Derivatives", "Chain Rule", "Related Rates", 
        "Curve Sketching", "Optimization", "Trig Differentiation", 
        "Applications of Derivatives", "Integrals", "Applications of Integrals"
      ],
    },
    actionPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          text: { type: Type.STRING },
          topic: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["concept", "technical"] },
          status: { type: Type.STRING, enum: ["incomplete", "practicing", "complete"] },
        },
        required: ["id", "text", "topic", "type", "status"],
      },
    },
  },
  required: ["weaknessScores", "actionPlan"],
};

const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export interface UploadCategories {
  exams: File[];
  quizzes: File[];
  homework: File[];
  notes: File[];
}

export const analyzeStudentWork = async (categories: UploadCategories): Promise<AnalysisResponse> => {
  try {
    const examParts = await Promise.all(categories.exams.map(fileToPart));
    const quizParts = await Promise.all(categories.quizzes.map(fileToPart));
    const homeworkParts = await Promise.all(categories.homework.map(fileToPart));
    const notesParts = await Promise.all(categories.notes.map(fileToPart));
    
    const parts: any[] = [];

    if (examParts.length > 0) {
      parts.push({ text: "--- CATEGORY: EXAMS ---" });
      parts.push(...examParts);
    }
    if (quizParts.length > 0) {
      parts.push({ text: "--- CATEGORY: QUIZZES ---" });
      parts.push(...quizParts);
    }
    if (homeworkParts.length > 0) {
      parts.push({ text: "--- CATEGORY: HOMEWORK ---" });
      parts.push(...homeworkParts);
    }
    if (notesParts.length > 0) {
      parts.push({ text: "--- CATEGORY: STUDENT NOTES ---" });
      parts.push(...notesParts);
    }

    const prompt = `Analyze the provided Calculus 1 student work (images/PDFs), categorized by source (Exams, Quizzes, Homework, Notes). 
      
      **TOPIC DETECTION INSTRUCTIONS (CRITICAL):**
      - Be hyper-vigilant in scanning for specific topics. Do not overlook any visible work.
      - **Integrals:** Visually scan for "squiggles" (integral symbols ∫) and terms like "Antiderivative". These MUST be classified under "Integrals" or "Applications of Integrals".
      - **Related Rates & Optimization:** Check word problems carefully. If these topics appear, they must be reflected in the scores.
      - **Complete Coverage:** Ensure every visible problem is mapped to one of the 10 tracked topics. Do not leave any area out if evidence exists in the files.

      Identify where points were lost and infer underlying conceptual gaps. 
      
      Important: Calculate 'weaknessScores' (0-100, where 100 is extreme weakness) using the following STRICT logic:
      1. First, assess the raw weakness based on:
         - Exams: 65% weight. Treat ANY error as a sign of significant weakness.
         - Quizzes: 35% weight.
      2. Then, MULTIPLY the raw weakness score by 0.75.
      3. FLOOR RULE: If a student made ANY mistake in a topic, the final score for that topic MUST be at least 40.
      4. Cap the final score at 100.
      
      - Homework and Notes: Do not calculate numeric scores from these. Use them only to qualitatively explain WHY the student is making mistakes (misconceptions, missing steps) to inform the 'actionPlan'.
      
      If a specific category (e.g., Exams) is missing, re-distribute the weight to the available quantitative categories (e.g., Quizzes become 100%).

      ACTION PLAN COMPOSITION RULES (STRICT):
      1. Composition: At least 35% of action items MUST be type 'concept'. No more than 65% can be type 'technical'.
      2. 'concept': Focus on understanding, classification, definitions, theorems, and problem setup. Prioritize understanding over procedure. If unsure whether an issue is conceptual or technical, classify it as 'concept'.
      3. 'technical': Focus on specific procedural steps, algebraic manipulation, or notation. Do NOT generate a 'technical' task unless it directly contributed to lost points on Exams or Quizzes.
      4. CORRELATION CONSTRAINT: If any topic in 'weaknessScores' has a value greater than 0, there MUST be at least one corresponding item in 'actionPlan' with that same 'topic'.
      
      If no files are provided, generate a sample analysis based on common Calculus 1 mistakes following the rules above.
      
      Return a JSON object with:
      1. 'weaknessScores': The calculated scores based on the weighting above.
      2. 'actionPlan': A list of actionable study tasks based on the qualitative analysis of all materials, strictly adhering to the composition rules.
    `;

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        seed: 42,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AnalysisResponse;
  } catch (error) {
    console.error("Error analyzing work:", error);
    throw error;
  }
};
