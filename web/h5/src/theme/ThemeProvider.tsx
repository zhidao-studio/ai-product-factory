/**
 * 全局主题 Provider（h5 / antd-mobile）
 *
 * antd-mobile 通过 CSS 变量驱动主题，本 Provider 仅负责：
 *  - 解析主题模式（light / dark / system）
 *  - 将实际模式写入 <html data-theme>，触发 variables.css 中对应变量集
 *  - 持久化偏好到 localStorage
 * 业务组件使用 CSS 变量即可自动换肤，零侵入。
 */
import { useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type ThemeMode } from './themeContext';

const STORAGE_KEY = 'ruoyi-h5-theme-mode';

function getSystemMode(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>(getSystemMode);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedMode: 'light' | 'dark' = mode === 'system' ? systemMode : mode;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedMode;
  }, [resolvedMode]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const toggle = () => setMode(resolvedMode === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
