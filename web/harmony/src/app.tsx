import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { ThemeProvider } from './theme/ThemeProvider'
import { SessionProvider } from './stores/SessionContext'
import './theme/variables.scss'
import './app.scss'

export default function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    console.log('App launched.')
  })

  return (
    <ThemeProvider>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  )
}
