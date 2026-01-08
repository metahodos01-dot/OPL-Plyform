
import { GoogleGenAI, Type } from "@google/genai";
import { ProblemReport } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const extractReportData = async (transcription: string): Promise<ProblemReport> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract the following details from this problem report transcript: 
    "${transcription}"
    
    If the date is not specified, use today's date: ${new Date().toLocaleDateString('it-IT')}.
    Ensure 'odl' is extracted as a string.
    Categorize 'problemType' into a short category (e.g., Meccanico, Elettrico, Software, Logistico).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "Data registrazione (DD/MM/YYYY)" },
          odl: { type: Type.STRING, description: "Numero ODL" },
          description: { type: Type.STRING, description: "Descrizione del problema" },
          problemType: { type: Type.STRING, description: "Tipo di problema" },
          operator: { type: Type.STRING, description: "Operatore coinvolto" }
        },
        required: ["date", "odl", "description", "problemType", "operator"]
      }
    }
  });

  return JSON.parse(response.text.trim()) as ProblemReport;
};
