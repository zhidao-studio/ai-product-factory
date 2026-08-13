/**
 * 设计 Token 访问 Hook（App / React Native）
 *
 * 统一从这里取色板与间距/圆角等 token，避免各页面散落硬编码值（铁律①：UI 以设计系统为准）。
 * 颜色随主题模式自动切换到 light / dark 双套。
 */
import { useThemeMode } from './ThemeProvider';
import {
  breakpoints,
  font,
  getSemanticColors,
  radius,
  sizes,
  spacing,
} from './tokens';

export function useThemeTokens() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  return {
    mode,
    isDark,
    colors: getSemanticColors(mode),
    spacing,
    radius,
    sizes,
    font,
    breakpoints,
  };
}
