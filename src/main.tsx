import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Unbekannter Laufzeitfehler' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0d12] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full p-6 rounded-2xl bg-[#131722] border border-rose-500/40 space-y-4">
            <h1 className="text-xl font-bold text-rose-400">Etwas ist schiefgelaufen</h1>
            <p className="text-sm text-slate-300">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm cursor-pointer"
            >
              App neu laden
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Register PWA Offline Service Worker (caches app shell, Bravura fonts & SoundFont)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // ignore registration error in unsupported contexts
    });
  });
}

if (window.location.protocol !== 'file:') {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>
  );
}
