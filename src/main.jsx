import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Um erro não tratado desmonta o React inteiro e deixava só o fundo escuro.
// Mostra o aviso da rede de segurança do index.html no lugar.
createRoot(document.getElementById('root'), {
  onUncaughtError: (error) => {
    console.error(error)
    window.__siteFail?.(error)
  },
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// O app chegou a rodar: a rede de segurança não precisa disparar por tempo.
window.__siteStarted = true
