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
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Card, Text, Toast } from '@ant-design/react-native';
import { useThemeTokens } from '../theme/useThemeTokens';
import { getSmsCode, loginByPhone, loginBySms } from '../api/auth';

type LoginMode = 'password' | 'sms';

const PHONE_RE = /^1[3-9]\d{9}$/;
const COUNTDOWN_SECS = 60;

export default function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const { colors, spacing, radius, sizes, font } = useThemeTokens();

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
      setCountdown((prev) => {
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
      onLogin(res.data.access_token);
      Toast.show({ content: '登录成功' });
    } catch {
      // 错误已在请求层提示
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    height: sizes.controlHeightLG,
    borderWidth: sizes.lineWidth,
    borderColor: colors.colorBorder,
    borderRadius: radius.base,
    paddingHorizontal: spacing.sm,
    color: colors.colorText,
    backgroundColor: colors.colorBgContainer,
    fontSize: font.fontSize,
  } as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.colorBgLayout, padding: spacing.base }]}>
      <Card style={{ backgroundColor: colors.colorBgContainer }}>
        <Card.Header title="手机号登录" />
        <Card.Body>
          <View style={styles.segment}>
            <Button
              size="small"
              type={mode === 'password' ? 'primary' : 'ghost'}
              onPress={() => setMode('password')}
            >
              密码登录
            </Button>
            <Button
              size="small"
              type={mode === 'sms' ? 'primary' : 'ghost'}
              onPress={() => setMode('sms')}
            >
              验证码登录
            </Button>
          </View>

          <TextInput
            style={[styles.input, inputStyle]}
            placeholder="请输入手机号"
            placeholderTextColor={colors.colorTextPlaceholder}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={11}
            autoCapitalize="none"
          />

          {mode === 'password' ? (
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, inputStyle, { flex: 1 }]}
                placeholder="请输入密码"
                placeholderTextColor={colors.colorTextPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Text style={{ color: colors.colorPrimary, fontSize: font.fontSizeSM }}>
                  {showPassword ? '隐藏' : '显示'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, inputStyle, { flex: 1 }]}
                placeholder="请输入短信验证码"
                placeholderTextColor={colors.colorTextPlaceholder}
                value={smsCode}
                onChangeText={setSmsCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Button
                size="small"
                type="ghost"
                disabled={countdown > 0}
                onPress={handleSendSms}
              >
                {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
              </Button>
            </View>
          )}

          <Button
            type="primary"
            loading={loading}
            onPress={handleLogin}
            style={{ marginTop: spacing.sm }}
          >
            登录
          </Button>
        </Card.Body>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  segment: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
});
