/**
 * 全局主题 Provider（app / React Native，@ant-design/react-native）
 *
 * - 通过 @ant-design/react-native 的 Provider theme 注入品牌色等核心 Token
 * - 默认跟随系统外观（useColorScheme），并支持手动切换 mode
 * - StatusBar 前景色随模式联动
 *
 * 持久化可后续接入 @react-native-async-storage/async-storage（本脚手架未默认引入）。
 */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Provider } from '@ant-design/react-native';
import { getAntdRnTheme, type ThemeMode } from './tokens';

interface ThemeContextValue {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  toggle: () => {},
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemMode = useColorScheme();
  const [override, setOverride] = useState<ThemeMode | null>(null);
  const mode: ThemeMode = override ?? (systemMode === 'dark' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode: setOverride,
        toggle: () => setOverride(mode === 'dark' ? 'light' : 'dark'),
      }}
    >
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <Provider theme={getAntdRnTheme(mode)}>{children}</Provider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeContext);
}
