
import React, { useState, useRef, useEffect } from 'react';
import { AppStatus } from '../types';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => void;
  status: AppStatus;
  setStatus: (status: AppStatus) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptComplete, status, setStatus }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true; // Abilitiamo interim per feedback immediato
      recognition.lang = 'it-IT';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const fullTranscript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setLastTranscript(fullTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Ignoriamo no-speech se stiamo ancora registrando, succede spesso in pause brevi
          return;
        }
        setIsRecording(false);
        setStatus(AppStatus.ERROR);
      };

      recognition.onend = () => {
        // Se la registrazione finisce ma eravamo in stato isRecording, riavviala o processa
        if (isRecording) {
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isRecording, setStatus]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      
      // Se abbiamo del testo, procediamo con l'invio
      if (lastTranscript.trim()) {
        setStatus(AppStatus.PROCESSING);
        onTranscriptComplete(lastTranscript);
      } else {
        setStatus(AppStatus.IDLE);
      }
    } else {
      setLastTranscript('');
      setStatus(AppStatus.RECORDING);
      setIsRecording(true);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Errore avvio riconoscimento:", e);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-xl border border-gray-100 transition-all hover:shadow-2xl w-full">
      <div className="relative mb-8">
        {isRecording && (
          <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20"></div>
        )}
        <button
          onClick={toggleRecording}
          disabled={status === AppStatus.PROCESSING}
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-200 shadow-2xl' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg'
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="text-center w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {isRecording ? 'Sto ascoltando...' : 'Pronto a registrare'}
        </h2>
        
        {isRecording && lastTranscript && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 italic animate-pulse max-h-24 overflow-y-auto">
            "{lastTranscript}..."
          </div>
        )}

        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          {isRecording 
            ? 'Parla della segnalazione. Premi il quadrato per finire.' 
            : 'Premi il microfono e descrivi il problema.'}
        </p>
      </div>

      {status === AppStatus.PROCESSING && (
        <div className="mt-6 flex items-center text-indigo-600 font-medium animate-pulse">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Analisi segnalazione...
        </div>
      )}
    </div>
  );
};
