
import { GoogleGenAI, Type } from "@google/genai";
import { ProblemReport } from "./types";

/**
 * Estrae i dati strutturati da una trascrizione vocale usando Gemini AI.
 */
export const extractReportData = async (transcription: string): Promise<ProblemReport> => {
  // Recupero sicuro dell'API KEY solo a runtime
  let apiKey: string | undefined;
  
  try {
    // Tentativo di accesso via process.env (Vercel/Node) o window.process
    apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : (window as any).process?.env?.API_KEY;
  } catch (e) {
    console.error("Errore critico nell'accesso alle variabili d'ambiente:", e);
  }

  if (!apiKey) {
    throw new Error("API_KEY mancante. Verifica le impostazioni del progetto.");
  }

  // Inizializzazione istanza locale per ogni richiesta
  const genAI = new GoogleGenAI({ apiKey });

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analizza questa segnalazione vocale ed estrai i dati nel formato JSON richiesto.
      Trascrizione: "${transcription}"
      
      Regole di estrazione:
      - Data registrazione (usa: ${new Date().toLocaleDateString('it-IT')})
      - numero ODL (se non presente scrivi "N/D")
      - Descrizione (riassunto del problema)
      - tipo di problema (es: Meccanico, Elettrico, Software, ecc.)
      - operatore coinvolto (nome della persona)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            odl: { type: Type.STRING },
            description: { type: Type.STRING },
            problemType: { type: Type.STRING },
            operator: { type: Type.STRING }
          },
          required: ["date", "odl", "description", "problemType", "operator"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("L'IA non ha restituito dati validi.");
    
    return JSON.parse(resultText.trim()) as ProblemReport;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(`Errore durante l'analisi: ${error.message || 'Controlla la tua connessione o API Key'}`);
  }
};
