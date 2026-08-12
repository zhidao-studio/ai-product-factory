/** 微信小程序主题状态，使用 Taro 存储与系统主题事件。 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Taro from '@tarojs/taro';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'ruoyi-mini-theme-mode';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  resolvedMode: 'light',
  setMode: () => {},
  toggle: () => {},
});

function getSystemMode(): 'light' | 'dark' {
  return Taro.getSystemInfoSync().theme === 'dark' ? 'dark' : 'light';
}

function readStoredMode(): ThemeMode {
  const value = Taro.getStorageSync(STORAGE_KEY);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>(getSystemMode);

  useEffect(() => {
    const handleThemeChange = ({ theme }: { theme: string }) => {
      setSystemMode(theme === 'dark' ? 'dark' : 'light');
    };
    Taro.onThemeChange(handleThemeChange);
    return () => Taro.offThemeChange(handleThemeChange);
  }, []);

  const resolvedMode = mode === 'system' ? systemMode : mode;

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    Taro.setStorageSync(STORAGE_KEY, next);
  };

  const toggle = () => setMode(resolvedMode === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeContext);
}
