
import { ProblemReport } from "./types";

/**
 * Servizio per l'invio dei dati al Google Sheet tramite l'URL fornito.
 */
export const sendToGoogleSheets = async (report: ProblemReport): Promise<boolean> => {
  // Nuovo URL fornito dall'utente
  const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbybW0th0p0obqszRf50nP5lx0bMqTF35HwE8z4mt2HEFdN5eSSXpiwWw1ISxrMa9N10Vw/exec';

  console.log("Inviando dati a Google Sheets...", report);
  
  try {
    // Usiamo fetch con mode: 'no-cors' per evitare problemi di preflight con Apps Script
    // Il payload viene inviato come stringa JSON
    await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report)
    });

    // Con no-cors non possiamo leggere la risposta, ma l'invio avviene correttamente
    return true;
  } catch (error) {
    console.error("Errore durante l'invio a Google Sheets:", error);
    throw error;
  }
};
