/**
 * @fileoverview Application entry point.
 * Mounts the React application to the DOM with StrictMode enabled.
 * @module main
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

/**
 * Creates and renders the React root.
 * StrictMode enables additional development checks and warnings.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
