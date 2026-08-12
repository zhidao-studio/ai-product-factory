/**
 * 全局主题 Provider（admin / PC Web）
 *
 * - 通过 antd ConfigProvider 注入 design-tokens（lightTheme / darkTheme，开启 cssVar）
 * - 包裹 antd App 组件，解决 message / Modal 等静态方法丢失 context 的问题
 * - 主题偏好持久化到 localStorage，首次访问跟随系统 prefers-color-scheme
 * - 暴露 useThemeMode() 供设置页切换 亮/暗/跟随
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ConfigProvider, App as AntdApp, theme as antdTheme } from 'antd';
import { darkTheme, lightTheme } from './design-tokens';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'ruoyi-theme-mode';

interface ThemeContextValue {
  mode: ThemeMode;
  /** 实际生效的亮/暗，已根据 system 解析 */
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

  // 跟随系统变化时实时更新
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedMode: 'light' | 'dark' = mode === 'system' ? systemMode : mode;

  // 写入 <html data-theme> 供原生 CSS / 暗色组件读取
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedMode;
  }, [resolvedMode]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const toggle = () => setMode(resolvedMode === 'dark' ? 'light' : 'dark');

  const themeConfig = resolvedMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, setMode, toggle }}>
      <ConfigProvider theme={themeConfig}>
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeContext);
}

export { antdTheme };
