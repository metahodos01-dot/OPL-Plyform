
import React, { useState, useCallback, useEffect } from 'react';
import { VoiceRecorder } from './components/VoiceRecorder';
import { ReportSummary } from './components/ReportSummary';
import { extractReportData } from './geminiService';
import { sendToGoogleSheets } from './googleSheetsService';
import { ProblemReport, AppStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [report, setReport] = useState<ProblemReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debug per verificare se l'ambiente è caricato
  useEffect(() => {
    console.log("App inizializzata. Stato:", status);
  }, []);

  const handleTranscript = useCallback(async (transcript: string) => {
    const cleanTranscript = transcript.trim();
    if (!cleanTranscript) {
      setError("Trascrizione vuota.");
      setStatus(AppStatus.IDLE);
      return;
    }

    try {
      setStatus(AppStatus.PROCESSING);
      setError(null);
      
      const extractedData = await extractReportData(cleanTranscript);
      setReport(extractedData);

      await sendToGoogleSheets(extractedData);
      
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error("Error in handleTranscript:", err);
      setError(err.message || "Errore durante l'elaborazione.");
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
        <div className="inline-block p-4 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
           <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
           </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">Segnalazione Vocale</h1>
        <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
          Registra un problema: l'IA estrarrà i dati automaticamente.
        </p>
      </header>

      <main className="w-full max-w-md flex flex-col items-center">
        <VoiceRecorder 
          onTranscriptComplete={handleTranscript} 
          status={status} 
          setStatus={setStatus} 
        />

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm w-full animate-fade-in-up">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
                <button onClick={reset} className="mt-2 text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-800">Riprova</button>
              </div>
            </div>
          </div>
        )}

        {status === AppStatus.SUCCESS && report && (
          <div className="w-full">
            <ReportSummary report={report} />
            <button
              onClick={reset}
              className="mt-6 w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
            >
              Nuova Segnalazione
            </button>
          </div>
        )}

        <div className="mt-12 w-full">
          <a 
            href="https://docs.google.com/spreadsheets/d/1m_5vYddbk4yFybSti5wodNmSssaDI44Zoi1YePYmm6E/edit#gid=0" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 text-indigo-600 hover:bg-gray-50 transition-colors font-semibold"
          >
            <span>Apri Foglio Google</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </main>

      <footer className="mt-auto py-8 text-gray-400 text-xs text-center">
        &copy; {new Date().getFullYear()} Voice Report AI &bull; Progetto Industriale
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      ` }} />
    </div>
  );
};

export default App;
