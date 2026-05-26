import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import * as Sentry from '@sentry/react';

import App from './App';
import { initSentry } from './lib/sentry';
import './styles/globals.css';

initSentry();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center p-6 text-center">
          <div>
            <h1 className="text-2xl font-bold text-red-600">Une erreur est survenue</h1>
            <p className="mt-2 text-gray-600">
              L'équipe a été notifiée. Veuillez rafraîchir la page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded bg-indigo-600 px-4 py-2 text-white"
            >
              Rafraîchir
            </button>
          </div>
        </div>
      }
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);
