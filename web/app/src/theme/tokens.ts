/**
 * 设计系统 Token 单源（裸值，不依赖 antd / antd-mobile）
 *
 * 与 docs/design-tokens.ts / docs/design-tokens.json 同源，仅做值封装，
 * 供 React Native（@ant-design/react-native）映射成 ThemeProvider 的主题对象。
 * 修改 Token 请回到 docs 单源，再同步本文件。
 */
import { Platform } from 'react-native';

export const colors = {
  colorPrimary: '#1677FF',
  colorPrimaryHover: '#4096FF',
  colorPrimaryActive: '#0958D9',
  colorSuccess: '#52C41A',
  colorWarning: '#FAAD14',
  colorError: '#FF4D4F',
  colorInfo: '#1677FF',
  colorText: 'rgba(0,0,0,0.88)',
  colorTextSecondary: 'rgba(0,0,0,0.65)',
  colorTextTertiary: 'rgba(0,0,0,0.45)',
  colorTextDisabled: 'rgba(0,0,0,0.25)',
  colorTextPlaceholder: 'rgba(0,0,0,0.25)',
  colorBorder: '#D9D9D9',
  colorSplit: 'rgba(5,5,5,0.06)',
  colorBgLayout: '#F5F5F5',
  colorBgContainer: '#FFFFFF',
  colorBgElevated: '#FFFFFF',
  colorBgMask: 'rgba(0,0,0,0.45)',
  colorLink: '#1677FF',
} as const;

export const darkColors = {
  colorPrimary: '#1668DC',
  colorText: 'rgba(255,255,255,0.85)',
  colorTextSecondary: 'rgba(255,255,255,0.65)',
  colorTextTertiary: 'rgba(255,255,255,0.45)',
  colorTextPlaceholder: 'rgba(255,255,255,0.25)',
  colorBgLayout: '#000000',
  colorBgContainer: '#1F1F1F',
  colorBgElevated: '#262626',
  colorBorder: '#424242',
  colorSplit: 'rgba(255,255,255,0.12)',
} as const;

const darkSemanticColors = {
  ...colors,
  ...darkColors,
  colorTextDisabled: darkColors.colorTextPlaceholder,
  colorLink: colors.colorPrimaryHover,
} as const;

export const font = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  fontSize: 14,
  fontSizeLG: 16,
  fontSizeSM: 12,
  fontSizeHeading1: 38,
  fontSizeHeading2: 30,
  fontSizeHeading3: 24,
  fontSizeHeading4: 20,
  fontSizeHeading5: 16,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightStrong: 600,
  lineHeight: 1.571,
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  base: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  xs: 2,
  sm: 4,
  base: 6,
  lg: 8,
  outer: 4,
  circle: '50%',
  capsule: 'calc(100% / 2)',
} as const;

export const sizes = {
  controlHeight: 32,
  controlHeightLG: 40,
  controlHeightSM: 24,
  lineWidth: 1,
  lineType: 'solid',
  tableRowHeight: 48,
  touchMinIos: 44,
  touchMinAndroid: 48,
  touchMinHarmony: 48,
  touchMinH5: 44,
  touchMinMini: 44,
} as const;

export const shadows = {
  tertiary: '0 1px 2px 0 rgba(0,0,0,0.05)',
  default:
    '0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)',
} as const;

export const motion = {
  durationMicro: 100,
  durationSmall: 200,
  durationPage: 300,
  easeInOut: 'cubic-bezier(0.645,0.045,0.355,1)',
  easeOut: 'cubic-bezier(0.215,0.61,0.355,1)',
  easeOutBack: 'cubic-bezier(0.12,0.4,0.29,1.46)',
} as const;

export const zIndex = {
  base: 0,
  sticky: 10,
  popup: 1000,
  modal: 1000,
  notification: 2000,
} as const;

export const breakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
  xxxl: 1920,
} as const;

/** 图表色板（light/dark 双套） */
export const chartCategorical = [
  { name: 'C1', light: '#1677FF', dark: '#4096FF' },
  { name: 'C2', light: '#13C2C2', dark: '#36CFC9' },
  { name: 'C3', light: '#52C41A', dark: '#73D13D' },
  { name: 'C4', light: '#99CC33', dark: '#B7E861' },
  { name: 'C5', light: '#FAAD14', dark: '#FFC53D' },
  { name: 'C6', light: '#FA8C16', dark: '#FFA940' },
  { name: 'C7', light: '#FF4D4F', dark: '#FF7875' },
  { name: 'C8', light: '#722ED1', dark: '#9254DE' },
  { name: 'C9', light: '#EB2F96', dark: '#F759AB' },
  { name: 'C10', light: '#5B8FF9', dark: '#85A5FF' },
] as const;

export const chartSequentialBlue = [
  '#E6F4FF',
  '#69B1FF',
  '#1677FF',
  '#0958D9',
] as const;
export const chartDivergingBlueRed = ['#1677FF', '#F5F5F5', '#FF4D4F'] as const;
export const chartAxis = {
  light: 'rgba(5,5,5,0.06)',
  dark: 'rgba(255,255,255,0.12)',
} as const;

export type ThemeMode = 'light' | 'dark';

/** 返回结构一致的语义色，页面无需处理暗色色板缺少字段的问题。 */
export function getSemanticColors(mode: ThemeMode = 'light') {
  return mode === 'dark' ? darkSemanticColors : colors;
}

/**
 * 映射为 @ant-design/react-native 的 Provider theme（Partial<Theme>）。
 * 仅覆盖品牌色 / 文本 / 背景 / 边框等核心语义键，其余沿用库默认主题。
 */
export function getAntdRnTheme(mode: ThemeMode = 'light') {
  const palette = getSemanticColors(mode);
  const touchHeight =
    Platform.OS === 'ios' ? sizes.touchMinIos : sizes.touchMinAndroid;
  // Button 5.x 会在这些字段后拼接 alpha，必须提供六位 HEX，不能传 rgba()。
  const alphaCompatibleText =
    mode === 'dark' ? colors.colorBgContainer : darkColors.colorBgLayout;
  return {
    color_text_base: alphaCompatibleText,
    color_text_base_inverse: colors.colorBgContainer,
    color_text_caption: palette.colorTextSecondary,
    color_text_paragraph: palette.colorText,
    color_text_placeholder: palette.colorTextPlaceholder,
    color_text_disabled: palette.colorTextDisabled,
    color_link: palette.colorLink,
    fill_base: palette.colorBgContainer,
    fill_body: palette.colorBgLayout,
    fill_tap: palette.colorBorder,
    fill_disabled: palette.colorBorder,
    fill_grey: palette.colorBgLayout,
    fill_mask: palette.colorBgMask,
    brand_primary: palette.colorPrimary,
    brand_primary_tap: colors.colorPrimaryActive,
    brand_success: palette.colorSuccess,
    brand_warning: palette.colorWarning,
    brand_error: palette.colorError,
    border_color_base: palette.colorBorder,
    border_color_thin: palette.colorSplit,
    border_width_sm: sizes.lineWidth,
    border_width_md: sizes.lineWidth,
    border_width_lg: sizes.lineWidth,
    font_size_base: font.fontSizeLG,
    font_size_subhead: font.fontSizeLG,
    font_size_caption: font.fontSizeLG,
    font_size_caption_sm: font.fontSizeSM,
    font_size_heading: font.fontSizeLG,
    button_font_size: font.fontSizeLG,
    button_font_size_sm: font.fontSizeSM,
    button_height: touchHeight,
    button_height_sm: touchHeight,
    primary_button_fill: colors.colorPrimaryActive,
    primary_button_fill_tap: colors.colorPrimaryActive,
    ghost_button_color: palette.colorPrimary,
    ghost_button_fill_tap: colors.colorPrimaryActive,
    warning_button_fill: palette.colorError,
    warning_button_fill_tap: palette.colorError,
    radius_xs: radius.xs,
    radius_sm: radius.sm,
    radius_md: radius.lg,
    radius_lg: radius.lg,
    h_spacing_sm: spacing.xxs,
    h_spacing_md: spacing.xs,
    h_spacing_lg: spacing.base,
    v_spacing_xs: spacing.xxs,
    v_spacing_sm: spacing.xs,
    v_spacing_md: spacing.sm,
    v_spacing_lg: spacing.base,
    v_spacing_xl: spacing.md,
    toast_fill: colors.colorText,
    toast_zindex: zIndex.notification,
  };
}

export default {
  colors,
  darkColors,
  font,
  spacing,
  radius,
  sizes,
  shadows,
  motion,
  zIndex,
  breakpoints,
  chartCategorical,
};
