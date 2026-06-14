import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { store } from './store/store'
import { rehydrateAuth } from './store/slices/authSlice'

// Rehydrate auth credentials from localStorage synchronously on boot
store.dispatch(rehydrateAuth())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
