/**
 * 登录页（App 端）
 *
 * 支持两种登录方式，对接后端 AuthController：
 *  - 手机号 + 密码：grantType=phonePassword（免图形验证码）
 *  - 手机号 + 短信验证码：grantType=sms（需先 GET /resource/sms/code 获取）
 *
 * 样式统一取自设计系统 Token（src/theme/tokens），随主题模式切换浅色/深色。
 */
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text, Toast } from '@ant-design/react-native';
import { useThemeTokens } from '../theme/useThemeTokens';
import {
  AntdCardBody,
  useAntdComponentStyles,
} from '../theme/useAntdComponentStyles';
import { getSmsCode, loginByPhone, loginBySms } from '../api/auth';
import { isHandledRequestError } from '../api/request';

type LoginMode = 'password' | 'sms';

const PHONE_RE = /^1[3-9]\d{9}$/;
const COUNTDOWN_SECS = 60;

export default function LoginScreen({
  onLogin,
}: {
  onLogin: (token: string) => Promise<void>;
}) {
  const { breakpoints, colors, spacing, radius, sizes, font } =
    useThemeTokens();
  const { buttonHeight, buttonStyles, cardStyles, interactionColor } =
    useAntdComponentStyles();
  const { fontScale, width } = useWindowDimensions();
  const touchHeight =
    Platform.OS === 'ios' ? sizes.touchMinIos : sizes.touchMinAndroid;
  const inputMinHeight = Math.max(
    touchHeight,
    Math.ceil(font.fontSizeLG * fontScale * font.lineHeight + spacing.base),
  );
  const stackCompactControls = fontScale > 1.2 || width < 360;
  const smsButtonStyle = StyleSheet.flatten([
    { minHeight: buttonHeight },
    stackCompactControls ? styles.fullWidth : undefined,
  ]);

  const [mode, setMode] = useState<LoginMode>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(COUNTDOWN_SECS);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendSms = async () => {
    if (!PHONE_RE.test(phone)) {
      Toast.show({ content: '请输入正确的手机号' });
      return;
    }
    if (countdown > 0) return;
    try {
      await getSmsCode(phone);
      startCountdown();
      Toast.show({ content: '验证码已发送' });
    } catch {
      // 错误已在请求层提示（如短信服务未配置）
    }
  };

  const handleLogin = async () => {
    if (!PHONE_RE.test(phone)) {
      Toast.show({ content: '请输入正确的手机号' });
      return;
    }
    setLoading(true);
    try {
      const res =
        mode === 'password'
          ? await loginByPhone(phone, password)
          : await loginBySms(phone, smsCode);
      await onLogin(res.data.access_token);
      Toast.show({ content: '登录成功' });
    } catch (error) {
      if (!isHandledRequestError(error)) {
        Toast.show({ content: '登录状态保存失败，请重试' });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    minHeight: inputMinHeight,
    borderWidth: sizes.lineWidth,
    borderColor: colors.colorBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.colorText,
    backgroundColor: colors.colorBgContainer,
    fontSize: font.fontSizeLG,
    lineHeight: Math.round(font.fontSizeLG * font.lineHeight),
  } as const;

  const labelStyle = {
    color: colors.colorText,
    fontSize: font.fontSizeLG,
    fontWeight: font.fontWeightMedium,
    marginBottom: spacing.xs,
  } as const;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.colorBgLayout }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { padding: spacing.base },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Card
            styles={cardStyles}
            style={[
              styles.card,
              {
                backgroundColor: colors.colorBgContainer,
                maxWidth: breakpoints.xs,
              },
            ]}
          >
            <Card.Header styles={cardStyles} title="手机号登录" />
            <AntdCardBody styles={cardStyles}>
              <View style={{ paddingHorizontal: spacing.base }}>
                <View
                  style={[
                    styles.segment,
                    { gap: spacing.xs, marginBottom: spacing.sm },
                  ]}
                >
                  <TouchableOpacity
                    accessibilityRole="tab"
                    accessibilityState={{ selected: mode === 'password' }}
                    style={[
                      styles.segmentItem,
                      {
                        minHeight: touchHeight,
                        borderWidth: sizes.lineWidth,
                        borderColor:
                          mode === 'password'
                            ? interactionColor
                            : colors.colorBorder,
                        backgroundColor: colors.colorBgContainer,
                        borderRadius: radius.lg,
                      },
                    ]}
                    onPress={() => setMode('password')}
                  >
                    <Text
                      style={{
                        color:
                          mode === 'password'
                            ? interactionColor
                            : colors.colorTextSecondary,
                      }}
                    >
                      密码登录
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="tab"
                    accessibilityState={{ selected: mode === 'sms' }}
                    style={[
                      styles.segmentItem,
                      {
                        minHeight: touchHeight,
                        borderWidth: sizes.lineWidth,
                        borderColor:
                          mode === 'sms'
                            ? interactionColor
                            : colors.colorBorder,
                        backgroundColor: colors.colorBgContainer,
                        borderRadius: radius.lg,
                      },
                    ]}
                    onPress={() => setMode('sms')}
                  >
                    <Text
                      style={{
                        color:
                          mode === 'sms'
                            ? interactionColor
                            : colors.colorTextSecondary,
                      }}
                    >
                      验证码登录
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={labelStyle}>手机号</Text>
                <TextInput
                  accessibilityLabel="手机号"
                  style={[inputStyle, { marginBottom: spacing.sm }]}
                  placeholder="请输入手机号"
                  placeholderTextColor={colors.colorTextPlaceholder}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={11}
                  autoCapitalize="none"
                />

                {mode === 'password' ? (
                  <View>
                    <Text style={labelStyle}>密码</Text>
                    <View
                      style={[
                        styles.inputWrap,
                        { gap: spacing.xs, marginBottom: spacing.sm },
                      ]}
                    >
                      <TextInput
                        accessibilityLabel="密码"
                        style={[inputStyle, styles.flexInput]}
                        placeholder="请输入密码"
                        placeholderTextColor={colors.colorTextPlaceholder}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={
                          showPassword ? '隐藏密码' : '显示密码'
                        }
                        style={[
                          styles.passwordToggle,
                          {
                            minHeight: buttonHeight,
                            minWidth: buttonHeight,
                          },
                        ]}
                        onPress={() => setShowPassword(v => !v)}
                      >
                        <Text
                          style={{
                            color: interactionColor,
                            fontSize: font.fontSizeLG,
                          }}
                        >
                          {showPassword ? '隐藏' : '显示'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View>
                    <Text style={labelStyle}>短信验证码</Text>
                    <View
                      style={[
                        styles.inputWrap,
                        stackCompactControls
                          ? styles.inputWrapStacked
                          : styles.inputWrapInline,
                        {
                          gap: spacing.xs,
                          marginBottom: spacing.sm,
                        },
                      ]}
                    >
                      <TextInput
                        accessibilityLabel="短信验证码"
                        style={[
                          inputStyle,
                          stackCompactControls
                            ? styles.fullWidth
                            : styles.flexInput,
                        ]}
                        placeholder="请输入短信验证码"
                        placeholderTextColor={colors.colorTextPlaceholder}
                        value={smsCode}
                        onChangeText={setSmsCode}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                      <Button
                        styles={buttonStyles}
                        size="small"
                        type="ghost"
                        disabled={countdown > 0}
                        onPress={handleSendSms}
                        style={smsButtonStyle}
                      >
                        {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                      </Button>
                    </View>
                  </View>
                )}

                <Button
                  styles={buttonStyles}
                  type="primary"
                  loading={loading}
                  onPress={handleLogin}
                  style={{ marginTop: spacing.sm, minHeight: buttonHeight }}
                >
                  登录
                </Button>
              </View>
            </AntdCardBody>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    alignSelf: 'center',
  },
  segment: {
    flexDirection: 'row',
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapInline: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  inputWrapStacked: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  flexInput: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  passwordToggle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
