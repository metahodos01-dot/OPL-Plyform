
import { GoogleGenAI, Type } from "@google/genai";
import { ProblemReport } from "./types";

/**
 * Estrae i dati strutturati da una trascrizione vocale usando Gemini AI.
 */
export const extractReportData = async (transcription: string): Promise<ProblemReport> => {
  // Cerchiamo la chiave in ordine di priorità:
  // 1. Variabile d'ambiente locale (process.env)
  // 2. localStorage (dove App.tsx la salva manualmente)
  // 3. Fallback su window per ambienti particolari
  const apiKey = 
    (process.env as any).API_KEY || 
    localStorage.getItem('GEMINI_API_KEY') || 
    (window as any).process?.env?.API_KEY;

  if (!apiKey) {
    throw new Error("Chiave API non trovata. Inseriscila nuovamente cliccando su 'Cambia Chiave'.");
  }

  // Inizializziamo il client Gemini con la chiave trovata
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analizza questa segnalazione vocale ed estrai i dati nel formato JSON richiesto.
      Trascrizione: "${transcription}"
      
      Regole di estrazione:
      - Data registrazione: usa la data di oggi (${new Date().toLocaleDateString('it-IT')}).
      - numero ODL: estrai codici tipo ODL-123 o simili. Se non presente, scrivi "N/D".
      - Descrizione: sintesi chiara del problema segnalato.
      - tipo di problema: una parola (es. Meccanico, Elettrico, Software, Logistica).
      - operatore coinvolto: nome dell'operatore che segnala o coinvolto.`,
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
    if (!resultText) throw new Error("L'IA ha risposto ma il testo è vuoto.");
    
    return JSON.parse(resultText.trim()) as ProblemReport;
  } catch (error: any) {
    console.error("Gemini Error:", error);

    // Se l'errore indica che la chiave non è valida
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("invalid API key")) {
       localStorage.removeItem('GEMINI_API_KEY'); // Puliamo la chiave errata
       throw new Error("La chiave API non è valida o è scaduta. Inseriscine una nuova.");
    }

    if (error.message?.includes("billing") || error.message?.includes("quota")) {
      throw new Error("La chiave funziona ma il piano gratuito è esaurito o il billing non è attivo su Google Cloud.");
    }
    
    throw new Error(`Errore IA: ${error.message || 'Verifica la tua connessione o la validità della chiave'}`);
  }
};
