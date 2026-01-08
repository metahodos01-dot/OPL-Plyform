
import React from 'react';
import { ProblemReport } from '../types';

interface ReportSummaryProps {
  report: ProblemReport;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({ report }) => {
  const fields = [
    { label: 'Data', value: report.date, icon: '📅' },
    { label: 'ODL', value: report.odl, icon: '🔢' },
    { label: 'Descrizione', value: report.description, icon: '📝' },
    { label: 'Tipo Problema', value: report.problemType, icon: '⚠️' },
    { label: 'Operatore', value: report.operator, icon: '👷' },
  ];

  return (
    <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-indigo-50 w-full max-w-md animate-fade-in-up">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">✅</span> Segnalazione Inviata con Successo
      </h3>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.label} className="flex flex-col border-b border-gray-50 pb-2">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1 flex items-center">
              <span className="mr-1">{field.icon}</span> {field.label}
            </span>
            <span className="text-gray-700 font-medium">{field.value || 'Non specificato'}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-[10px] text-gray-400 italic text-center">
        Dati salvati automaticamente su Google Sheets
      </p>
    </div>
  );
};
