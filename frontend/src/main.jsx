/**
 * @fileoverview Application entry point.
 * Mounts the React application to the DOM with StrictMode enabled.
 * @module main
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { initSentry } from './config/sentry'
import App from './App.jsx'
import './styles/globals.css'

/**
 * Initialize Sentry error tracking (must be before render).
 * Only activates when VITE_SENTRY_DSN environment variable is set.
 */
initSentry();

/**
 * Creates and renders the React root.
 * StrictMode enables additional development checks and warnings.
 * Sentry.ErrorBoundary captures unhandled React errors.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
