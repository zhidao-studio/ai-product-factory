import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { ThemeProvider } from './theme/ThemeProvider'
import './theme/variables.scss'
import './app.scss'

export default function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    console.log('App launched.')
  })

  return <ThemeProvider>{children}</ThemeProvider>
}
