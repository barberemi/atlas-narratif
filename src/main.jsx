import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { getDb } from './db/client'

// Démarre le worker PGlite immédiatement, avant que React ne monte,
// pour que le chargement WASM (~4 MB) ne soit pas bloqué par le render.
getDb();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
