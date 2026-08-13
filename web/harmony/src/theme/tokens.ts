/** HarmonyOS 端设计 Token，数值对齐根目录设计系统。 */
export const colors = {
  colorPrimary: '#1677FF',
  colorPrimaryActive: '#0958D9',
  colorSuccess: '#52C41A',
  colorWarning: '#FAAD14',
  colorError: '#FF4D4F',
  colorText: 'rgba(0,0,0,0.88)',
  colorTextSecondary: 'rgba(0,0,0,0.65)',
  colorTextPlaceholder: 'rgba(0,0,0,0.25)',
  colorTextInverse: 'rgba(255,255,255,0.85)',
  colorBorder: '#D9D9D9',
  colorSplit: 'rgba(5,5,5,0.06)',
  colorBgLayout: '#F5F5F5',
  colorBgContainer: '#FFFFFF',
} as const;

export const darkColors = {
  colorPrimary: '#1668DC',
  colorText: 'rgba(255,255,255,0.85)',
  colorTextSecondary: 'rgba(255,255,255,0.65)',
  colorTextPlaceholder: 'rgba(255,255,255,0.25)',
  colorBorder: '#424242',
  colorSplit: 'rgba(255,255,255,0.12)',
  colorBgLayout: '#000000',
  colorBgContainer: '#1F1F1F',
} as const;

export const spacing = { xxs: 4, xs: 8, sm: 12, base: 16, md: 20, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { xs: 2, sm: 4, base: 6, lg: 8 } as const;
export const sizes = { touchMinHarmony: 48, iconHarmony: 24 } as const;
export const breakpoints = { compact: 600, medium: 840, expanded: 1280 } as const;
