import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getStoredString, setStoredString } from '../platform/native-storage';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'harmony-theme-mode';

interface ThemeContextValue {
  resolvedMode: ThemeMode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  resolvedMode: 'light',
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [resolvedMode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    getStoredString(STORAGE_KEY)
      .then((mode) => setMode(mode === 'dark' ? 'dark' : 'light'))
      .catch(() => setMode('light'));
  }, []);

  const toggle = () => {
    const nextMode = resolvedMode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
    void setStoredString(STORAGE_KEY, nextMode).catch(() => undefined);
  };

  return <ThemeContext.Provider value={{ resolvedMode, toggle }}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeContext);
}
