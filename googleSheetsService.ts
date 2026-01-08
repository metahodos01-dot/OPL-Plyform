
import { ProblemReport } from "./types";

/**
 * Servizio per l'invio dei dati al Google Sheet tramite l'URL fornito.
 */
export const sendToGoogleSheets = async (report: ProblemReport): Promise<boolean> => {
  const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbybW0th0p0obqszRf50nP5lx0bMqTF35HwE8z4mt2HEFdN5eSSXpiwWw1ISxrMa9N10Vw/exec';

  console.log("Inviando dati a Google Sheets...", report);
  
  try {
    // Con Google Apps Script, per evitare problemi CORS 'preflight', 
    // a volte è necessario non inviare header Content-Type o usare mode: no-cors
    await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors', // Fondamentale per bypassare blocchi CORS restrittivi di Apps Script
      cache: 'no-cache',
      body: JSON.stringify(report)
    });

    // Nota: con mode 'no-cors' la risposta sarà sempre opaca, quindi assumiamo successo
    return true;
  } catch (error) {
    console.error("Errore durante l'invio a Google Sheets:", error);
    throw error;
  }
};
