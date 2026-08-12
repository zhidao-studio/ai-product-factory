import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme/variables.css'
import { ThemeProvider } from './theme/ThemeProvider'
import { SessionProvider } from './stores/SessionContext'
import { AppErrorBoundary } from './app/AppErrorBoundary'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AppErrorBoundary>
        <SessionProvider>
          <App />
        </SessionProvider>
      </AppErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
)
