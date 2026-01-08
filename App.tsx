
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
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [manualKey, setManualKey] = useState<string>('');

  useEffect(() => {
    // Controllo se esiste già una chiave nel sistema (aistudio bridge)
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        if (selected) setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleManualKeySubmit = () => {
    if (manualKey.trim().length < 20) {
      setError("La chiave inserita sembra troppo corta.");
      return;
    }
    // Iniettiamo la chiave nell'ambiente virtuale per GeminiService
    (process.env as any).API_KEY = manualKey.trim();
    setHasKey(true);
    setError(null);
  };

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

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

  if (!hasKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Configura Gemini</h2>
          <p className="text-slate-500 text-center mb-8 text-sm px-4">Incolla la tua chiave API qui sotto per attivare l'intelligenza artificiale.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Incolla Chiave API</label>
              <input 
                type="text"
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:outline-none transition-all font-mono text-sm"
              />
            </div>
            
            <button 
              onClick={handleManualKeySubmit}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
            >
              Attiva Applicazione
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">oppure</span></div>
            </div>
            
            <button 
              onClick={handleSelectKey}
              className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm"
            >
              Usa Selettore di Sistema
            </button>
          </div>

          {error && <p className="mt-4 text-center text-red-500 text-xs font-medium">{error}</p>}

          <p className="mt-8 text-[10px] text-slate-400 text-center leading-relaxed italic">
            Nota: Assicurati che la chiave sia abilitata per il modello "gemini-3-flash-preview".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <header className="mb-12 text-center">
        <div className="inline-block p-4 bg-indigo-600 rounded-2xl mb-4 shadow-xl shadow-indigo-100">
           <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
           </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">Registratore Vocale</h1>
        <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">
          Trasforma la tua voce in dati strutturati per il registro.
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
              <div className="ml-3">
                <p className="text-sm font-medium">Errore: {error}</p>
                <button onClick={reset} className="mt-2 text-xs font-bold uppercase text-red-600 hover:text-red-800">Riprova</button>
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
            className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-slate-200 text-indigo-600 hover:bg-slate-50 transition-colors font-semibold"
          >
            <span>Vai al Foglio Google</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </main>

      <footer className="mt-auto py-8 text-slate-400 text-xs text-center">
        &copy; {new Date().getFullYear()} Vocal Report AI
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
