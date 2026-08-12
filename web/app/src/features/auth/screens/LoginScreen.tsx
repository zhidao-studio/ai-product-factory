import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Card, Text, Toast } from '@ant-design/react-native';
import { getSmsCode } from '../../../api/auth';
import { useSession } from '../../../stores/SessionContext';
import { useThemeTokens } from '../../../theme/useThemeTokens';

type LoginMode = 'password' | 'sms';

const PHONE_RE = /^1[3-9]\d{9}$/;
const COUNTDOWN_SECS = 60;

export function LoginScreen() {
  const { signInByPhone, signInBySms } = useSession();
  const { colors, spacing, radius, sizes, font } = useThemeTokens();
  const [mode, setMode] = useState<LoginMode>('password');
  const [phoneNumber, setPhoneNumber] = useState('13800138000');
  const [password, setPassword] = useState('admin123');
  const [smsCode, setSmsCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startCountdown = () => {
    setCountdown(COUNTDOWN_SECS);
    timerRef.current = setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
  };

  const sendSmsCode = async () => {
    if (!PHONE_RE.test(phoneNumber)) {
      Toast.show({ content: '请输入正确的手机号' });
      return;
    }
    if (countdown > 0) return;
    try {
      await getSmsCode(phoneNumber);
      startCountdown();
      Toast.show({ content: '验证码已发送' });
    } catch {
      // 请求层已统一展示后端错误。
    }
  };

  const submit = async () => {
    if (!PHONE_RE.test(phoneNumber)) {
      Toast.show({ content: '请输入正确的手机号' });
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'password') {
        await signInByPhone(phoneNumber, password);
      } else {
        await signInBySms(phoneNumber, smsCode);
      }
      Toast.show({ content: '登录成功' });
    } catch {
      // 请求层已统一展示后端错误。
    } finally {
      setSubmitting(false);
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
            <Button size="small" type={mode === 'password' ? 'primary' : 'ghost'} onPress={() => setMode('password')}>
              密码登录
            </Button>
            <Button size="small" type={mode === 'sms' ? 'primary' : 'ghost'} onPress={() => setMode('sms')}>
              验证码登录
            </Button>
          </View>

          <TextInput
            style={[styles.input, inputStyle]}
            placeholder="请输入手机号"
            placeholderTextColor={colors.colorTextPlaceholder}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={11}
            autoCapitalize="none"
          />

          {mode === 'password' ? (
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, inputStyle, styles.flexInput]}
                placeholder="请输入密码"
                placeholderTextColor={colors.colorTextPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((value) => !value)}>
                <Text style={{ color: colors.colorPrimary, fontSize: font.fontSizeSM }}>
                  {showPassword ? '隐藏' : '显示'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, inputStyle, styles.flexInput]}
                placeholder="请输入短信验证码"
                placeholderTextColor={colors.colorTextPlaceholder}
                value={smsCode}
                onChangeText={setSmsCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Button size="small" type="ghost" disabled={countdown > 0} onPress={sendSmsCode}>
                {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
              </Button>
            </View>
          )}

          <Button type="primary" loading={submitting} onPress={submit} style={{ marginTop: spacing.sm }}>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  flexInput: {
    flex: 1,
  },
});
