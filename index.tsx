
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const init = () => {
  const container = document.getElementById('root');
  if (!container) return;

  try {
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
  } catch (err) {
    console.error("Mount error:", err);
    container.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; color: #ef4444; text-align: center;">
        <h2 style="margin-bottom: 10px;">Errore di avvio</h2>
        <p style="color: #4b5563;">${err instanceof Error ? err.message : "Errore sconosciuto"}</p>
        <button onclick="location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">Ricarica</button>
      </div>
    `;
  }
};

if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}
