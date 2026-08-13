import {
  useMemo,
  type ComponentProps,
  type ComponentType,
  type PropsWithChildren,
} from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { Button, Card } from '@ant-design/react-native';
import { useThemeTokens } from './useThemeTokens';
import { colors as baseColors, darkColors } from './tokens';

type CardStyles = NonNullable<ComponentProps<typeof Card>['styles']>;
type ButtonStyles = NonNullable<ComponentProps<typeof Button>['styles']>;

/** 上游 CardBody 类型遗漏 children；运行时 React.Component 原生支持。 */
export const AntdCardBody = Card.Body as unknown as ComponentType<
  PropsWithChildren<ComponentProps<typeof Card.Body>>
>;

/**
 * Ant Design RN 5.4.3 的旧 WithTheme 会缓存首次主题样式。
 * 通过公开 styles 属性覆盖本项目实际使用的 Card / Button 语义样式，
 * 避免切换主题时重挂 TextInput、滚动容器或整个 Screen。
 */
export function useAntdComponentStyles() {
  const { mode, colors, spacing, radius, sizes, font } = useThemeTokens();
  const { fontScale } = useWindowDimensions();
  const touchHeight =
    Platform.OS === 'ios' ? sizes.touchMinIos : sizes.touchMinAndroid;
  const buttonHeight = Math.max(
    touchHeight,
    Math.ceil(font.fontSizeLG * fontScale * font.lineHeight + spacing.base),
  );
  const interactionColor =
    mode === 'dark'
      ? baseColors.colorPrimaryHover
      : baseColors.colorPrimaryActive;
  const primaryFill = baseColors.colorPrimaryActive;

  const cardStyles = useMemo<CardStyles>(
    () => ({
      card: {
        backgroundColor: colors.colorBgContainer,
        borderColor: colors.colorBorder,
        borderRadius: radius.lg,
      },
      headerContent: {
        color: colors.colorText,
        fontSize: font.fontSizeLG,
      },
      headerExtra: {
        color: colors.colorTextSecondary,
        fontSize: font.fontSizeLG,
      },
      body: {
        borderColor: colors.colorBorder,
      },
      footerContent: {
        color: colors.colorTextSecondary,
        fontSize: font.fontSizeLG,
      },
      footerExtra: {
        color: colors.colorTextSecondary,
        fontSize: font.fontSizeLG,
      },
    }),
    [colors, font.fontSizeLG, radius.lg],
  );

  const buttonStyles = useMemo<ButtonStyles>(
    () => ({
      wrapperStyle: { borderRadius: radius.lg },
      largeRaw: { height: buttonHeight },
      smallRaw: { height: buttonHeight },
      largeRawText: { fontSize: font.fontSizeLG },
      smallRawText: { fontSize: font.fontSizeLG },
      defaultRaw: {
        backgroundColor: colors.colorBgContainer,
        borderColor: colors.colorBorder,
      },
      defaultRawText: { color: colors.colorText },
      defaultHighlight: {
        backgroundColor: colors.colorBgLayout,
        borderColor: colors.colorBorder,
      },
      defaultHighlightText: { color: colors.colorTextSecondary },
      primaryRaw: {
        backgroundColor: primaryFill,
        borderColor: primaryFill,
      },
      primaryRawText: { color: baseColors.colorBgContainer },
      primaryHighlight: {
        backgroundColor: primaryFill,
        borderColor: primaryFill,
      },
      primaryHighlightText: { color: baseColors.colorBgContainer },
      ghostRaw: {
        backgroundColor: 'transparent',
        borderColor: interactionColor,
      },
      ghostRawText: { color: interactionColor },
      ghostHighlight: {
        backgroundColor: 'transparent',
        borderColor: interactionColor,
      },
      ghostHighlightText: { color: interactionColor },
      warningRaw: {
        backgroundColor: colors.colorError,
        borderColor: colors.colorError,
      },
      warningRawText: { color: darkColors.colorBgLayout },
      warningHighlight: {
        backgroundColor: colors.colorError,
        borderColor: colors.colorError,
      },
      warningHighlightText: { color: darkColors.colorBgLayout },
      indicator: { marginRight: spacing.xs },
    }),
    [
      colors,
      font.fontSizeLG,
      interactionColor,
      primaryFill,
      radius.lg,
      spacing.xs,
      buttonHeight,
    ],
  );

  return { buttonHeight, buttonStyles, cardStyles, interactionColor };
}
