/**
 * 全局主题 Provider（app / React Native，@ant-design/react-native）
 *
 * - 通过 @ant-design/react-native 的 Provider theme 注入品牌色等核心 Token
 * - 默认跟随系统外观（useColorScheme），并持久化 system / light / dark 偏好
 * - StatusBar 前景色随模式联动
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance, StatusBar, useColorScheme } from 'react-native';
import { Provider } from '@ant-design/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAntdRnTheme, type ThemeMode } from './tokens';

export type ThemePreference = 'system' | ThemeMode;

interface ThemeContextValue {
  mode: ThemeMode;
  preference: ThemePreference;
  isReady: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  preference: 'system',
  isReady: false,
  toggle: () => {},
});

const THEME_PREFERENCE_KEY = 'Client-App-Theme-Preference';
const THEME_PREFERENCES: ThemePreference[] = ['system', 'light', 'dark'];

function isThemePreference(value: string | null): value is ThemePreference {
  return value !== null && THEME_PREFERENCES.includes(value as ThemePreference);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemMode = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);
  const mode: ThemeMode =
    preference === 'system'
      ? systemMode === 'dark'
        ? 'dark'
        : 'light'
      : preference;
  const antdTheme = useMemo(() => getAntdRnTheme(mode), [mode]);
  const contextValue = useMemo(
    () => ({
      mode,
      preference,
      isReady,
      toggle: () => {
        const next =
          THEME_PREFERENCES[
            (THEME_PREFERENCES.indexOf(preference) + 1) %
              THEME_PREFERENCES.length
          ];
        setPreference(next);
        AsyncStorage.setItem(THEME_PREFERENCE_KEY, next).catch(error => {
          console.error(
            `[theme-storage] persist preference failed: ${String(error)}`,
          );
        });
      },
    }),
    [isReady, mode, preference],
  );

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_PREFERENCE_KEY)
      .then(storedPreference => {
        if (active && isThemePreference(storedPreference)) {
          setPreference(storedPreference);
        }
      })
      .catch(error => {
        console.error(
          `[theme-storage] restore preference failed: ${String(error)}`,
        );
      })
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    Appearance.setColorScheme(
      preference === 'system' ? 'unspecified' : preference,
    );
  }, [preference]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
      />
      <Provider theme={antdTheme}>{children}</Provider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeContext);
}
