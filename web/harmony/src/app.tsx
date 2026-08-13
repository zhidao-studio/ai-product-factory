import { type PropsWithChildren } from 'react'
import { ThemeProvider } from './theme/ThemeProvider'
import './theme/variables.scss'
import './app.scss'

export default function App({ children }: PropsWithChildren) {
  return <ThemeProvider>{children}</ThemeProvider>
}
