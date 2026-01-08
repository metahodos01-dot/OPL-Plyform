
import { GoogleGenAI, Type } from "@google/genai";
import { ProblemReport } from "./types";

// Inizializzazione sicura: se la chiave manca, non crasha l'app immediatamente
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("ERRORE: API_KEY mancante nelle variabili d'ambiente.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const extractReportData = async (transcription: string): Promise<ProblemReport> => {
  const ai = getAIClient();
  if (!ai) throw new Error("API Key non configurata");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Estrai i seguenti dettagli dalla trascrizione di questo rapporto di problema:
    "${transcription}"
    
    Se la data non è specificata, usa la data di oggi: ${new Date().toLocaleDateString('it-IT')}.
    Assicurati che 'odl' sia estratto come stringa.
    Categorizza 'problemType' in una breve categoria (es. Meccanico, Elettrico, Software, Logistico).`,
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

  if (!response.text) throw new Error("Risposta vuota da Gemini");
  return JSON.parse(response.text.trim()) as ProblemReport;
};
