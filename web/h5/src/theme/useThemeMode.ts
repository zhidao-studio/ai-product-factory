import { useContext } from 'react'
import { ThemeContext } from './themeContext'

export function useThemeMode() {
  return useContext(ThemeContext)
}
