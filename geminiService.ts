
import { GoogleGenAI, Type } from "@google/genai";
import { ProblemReport } from "./types";

/**
 * Estrae i dati strutturati da una trascrizione vocale usando Gemini AI.
 */
export const extractReportData = async (transcription: string): Promise<ProblemReport> => {
  // Recupero la chiave API disponibile
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("Chiave API non configurata. Seleziona una chiave tramite il pulsante apposito.");
  }

  // Creazione istanza al momento della chiamata (fondamentale per Live/Nano Banana models)
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analizza questa segnalazione vocale ed estrai i dati nel formato JSON richiesto.
      Trascrizione: "${transcription}"
      
      Regole di estrazione:
      - Data registrazione: usa ${new Date().toLocaleDateString('it-IT')}
      - numero ODL: estrai il codice alfanumerico (es. ODL1234). Se non presente metti "N/D".
      - Descrizione: un riassunto chiaro del problema.
      - tipo di problema: categoria sintetica (Meccanico, Elettrico, Software, Sicurezza, ecc.).
      - operatore coinvolto: nome della persona che parla o citata come responsabile.`,
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
    if (!resultText) throw new Error("L'IA non ha restituito una risposta valida.");
    
    return JSON.parse(resultText.trim()) as ProblemReport;
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    
    // Gestione specifica errore chiave non trovata o non valida
    if (error.message?.includes("Requested entity was not found") || error.status === 404) {
      throw new Error("La chiave API selezionata non è valida o appartiene a un progetto non abilitato. Per favore seleziona una chiave valida.");
    }
    
    throw new Error(`Errore AI: ${error.message || 'Impossibile processare la richiesta'}`);
  }
};
