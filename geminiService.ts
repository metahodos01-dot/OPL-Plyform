
import { GoogleGenAI, Type } from "@google/genai";
import { ProblemReport } from "./types";

// Funzione interna per ottenere l'API KEY in modo sicuro
const getApiKey = (): string | undefined => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    console.error("Errore nell'accesso a process.env:", e);
    return undefined;
  }
};

export const extractReportData = async (transcription: string): Promise<ProblemReport> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API_KEY non trovata. Assicurati di averla configurata su Vercel.");
  }

  // Inizializziamo l'istanza solo quando serve per evitare crash all'avvio
  const ai = new GoogleGenAI({ apiKey });

  try {
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

    const text = response.text;
    if (!text) throw new Error("Risposta vuota dal modello.");
    
    return JSON.parse(text.trim()) as ProblemReport;
  } catch (error) {
    console.error("Errore durante l'estrazione dati Gemini:", error);
    throw error;
  }
};
