import { GoogleGenAI } from "@google/genai";
import { SegmentData } from "../types";
import { STATUS_CONFIG } from "../constants";

export const generateSiteReport = async (segments: SegmentData[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare data for the prompt
    const summaryData = segments.map(s => ({
      name: s.name,
      part: s.part,
      status: STATUS_CONFIG[s.status].label,
      progress: s.progress + '%',
      remarks: s.remarks,
      updated: new Date(s.lastUpdated).toLocaleDateString()
    }));

    const prompt = `
      You are a senior construction project manager assistant. 
      Analyze the following construction site data and generate a professional Daily Progress Report in English.
      
      The report should include:
      1. **Overall Progress Summary**: High-level view of how many segments are active, completed, or suspended.
      2. **Key Activities Today**: Highlight segments currently in 'In Progress'.
      3. **Risk Analysis**: Identify potential issues based on 'Remarks' or 'Suspended' status (e.g. waiting for drawings, material delays).
      4. **Recommendations**: Suggested next steps for the site manager.

      Data:
      ${JSON.stringify(summaryData, null, 2)}
      
      Format with Markdown. Keep it concise but professional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Failed to generate report, please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Service unavailable. Please check network or API Key.";
  }
};

export const analyzeSegmentRisk = async (segment: SegmentData): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Analyze the risk for this specific construction segment:
      Name: ${segment.name}
      Part: ${segment.part}
      Status: ${STATUS_CONFIG[segment.status].label}
      Progress: ${segment.progress}%
      Remarks: ${segment.remarks}
      
      Provide a 1-sentence risk assessment or safety tip in English.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No risk alerts";
  } catch (error) {
    return "Analysis unavailable";
  }
};