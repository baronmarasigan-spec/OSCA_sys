
import { GoogleGenAI } from "@google/genai";
import { Application, Complaint } from "../types";

/**
 * Helper to check if AI features can be enabled.
 */
export const isAiConfigured = () => {
  // Guidelines state API_KEY is a hard requirement and handled externally.
  return !!process.env.API_KEY;
};

/**
 * Generates an executive summary based on the current system state.
 */
export const generateExecutiveSummary = async (applications: Application[], complaints: Complaint[]) => {
  const dataContext = `
    Total Applications: ${applications.length}
    Pending Applications: ${applications.filter(a => a.status === 'Pending').length}
    Recent Complaints: ${complaints.length}
    Sample Complaint Subjects: ${complaints.map(c => c.subject).join(', ')}
  `;

  try {
    // Initializing directly with process.env.API_KEY as per guidelines. 
    // Creating instance right before call as per best practices in guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following data context and provide a brief, 2-sentence executive summary highlighting key areas requiring attention.
      
      Data Context:
      ${dataContext}
      `,
      config: {
        systemInstruction: "You are an AI assistant for a Senior Citizen Management System administrator.",
      }
    });

    return response.text || "Summary analysis completed.";
  } catch (error) {
    console.error("Gemini Executive Summary Error:", error);
    return "The system encountered an error while analyzing recent data.";
  }
};

/**
 * Analyzes a specific complaint to generate a short dashboard tag.
 */
export const analyzeComplaint = async (complaintDetails: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this senior citizen complaint in 5 words or less for a quick status dashboard tag: "${complaintDetails}"`,
    });
    
    return response.text || "Complaint analyzed.";
  } catch (error) {
    console.error("Gemini Complaint Analysis Error:", error);
    return "Analysis failed";
  }
};
