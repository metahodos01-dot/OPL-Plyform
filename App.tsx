
import React, { useState, useCallback } from 'react';
import { VoiceRecorder } from './components/VoiceRecorder';
import { ReportSummary } from './components/ReportSummary';
import { extractReportData } from './geminiService';
import { sendToGoogleSheets } from './googleSheetsService';
import { ProblemReport, AppStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [report, setReport] = useState<ProblemReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranscript = useCallback(async (transcript: string) => {
    const cleanTranscript = transcript.trim();
    if (!cleanTranscript) {
      setError("Non ho sentito nulla. Prova a parlare più chiaramente o controlla il microfono.");
      setStatus(AppStatus.IDLE);
      return;
    }

    try {
      setStatus(AppStatus.PROCESSING);
      setError(null);
      
      // Step 1: Estrazione dati con Gemini
      const extractedData = await extractReportData(cleanTranscript);
      setReport(extractedData);

      // Step 2: Invio al foglio Google
      await sendToGoogleSheets(extractedData);
      
      setStatus(AppStatus.SUCCESS);
    } catch (err) {
      console.error("Error processing report:", err);
      setError("Si è verificato un errore nell'invio. Verifica che lo script Google sia pubblicato correttamente.");
      setStatus(AppStatus.ERROR);
    }
  }, []);

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setReport(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <header className="mb-12 text-center">
        <div className="inline-block p-2 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
           <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
           </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Segnalazione Vocale</h1>
        <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
          Registra il problema: l'IA estrarrà i dati e popolerà il foglio Google automaticamente.
        </p>
      </header>

      <main className="w-full max-w-md flex flex-col items-center">
        <VoiceRecorder 
          onTranscriptComplete={handleTranscript} 
          status={status} 
          setStatus={setStatus} 
        />

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm w-full transition-all">
            <p className="text-sm font-medium">{error}</p>
            <button onClick={reset} className="mt-2 text-xs font-bold underline hover:no-underline uppercase tracking-tight">Riprova</button>
          </div>
        )}

        {status === AppStatus.SUCCESS && report && (
          <>
            <ReportSummary report={report} />
            <button
              onClick={reset}
              className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-all shadow-md active:scale-95"
            >
              Nuova Segnalazione
            </button>
          </>
        )}

        <div className="mt-12 text-center">
          <a 
            href="https://docs.google.com/spreadsheets/d/1m_5vYddbk4yFybSti5wodNmSssaDI44Zoi1YePYmm6E/edit#gid=0" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center justify-center gap-2 group p-3 bg-white rounded-lg shadow-sm border border-gray-100"
          >
            Vedi il Foglio Google
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </main>

      <footer className="mt-auto pt-12 pb-6 text-gray-400 text-xs">
        &copy; {new Date().getFullYear()} Voice Report System &bull; Powered by Gemini AI
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      ` }} />
    </div>
  );
};

export default App;
