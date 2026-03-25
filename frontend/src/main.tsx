import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/campus-theme.css'
import App from './App.tsx'

if (typeof localStorage !== 'undefined' && localStorage.getItem('campus_pref_dark') === '1') {
  document.documentElement.dataset.campusDark = '1'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
