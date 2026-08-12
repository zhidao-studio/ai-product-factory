/**
 * Sample React Native App（已接入设计系统主题 + 后端数据对接）
 *
 * 顶部用 ThemeProvider 注入 @ant-design/react-native 主题（品牌色等核心 Token），
 * 并演示真实前后端交互：获取验证码 → 登录 → 携带 Token 获取用户信息。
 */
import { useEffect, useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Text, Toast } from '@ant-design/react-native';
import { ThemeProvider, useThemeMode } from './src/theme/ThemeProvider';
import {
  getCodeImg,
  login,
  logout,
  getInfo,
  type VerifyCodeResult,
  type UserInfo
} from './src/api/auth';
import { setToken, removeToken, getToken } from './src/utils/auth';

function Demo() {
  const { mode, toggle } = useThemeMode();
  const insets = useSafeAreaInsets();

  const [captcha, setCaptcha] = useState<VerifyCodeResult | null>(null);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  const loadCaptcha = async () => {
    try {
      const res = await getCodeImg();
      setCaptcha(res.data);
    } catch {
      // 错误已在请求层提示
    }
  };

  useEffect(() => {
    loadCaptcha();
    if (getToken()) {
      getInfo()
        .then((r) => setUser(r.data))
        .catch(() => removeToken());
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await login({ username, password, code, uuid: captcha?.uuid });
      setToken(res.data.access_token);
      Toast.show({ content: '登录成功' });
      const info = await getInfo();
      setUser(info.data);
      await loadCaptcha();
      setCode('');
    } catch {
      await loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    removeToken();
    setUser(null);
    Toast.show({ content: '已退出登录' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Card>
        <Card.Header title="RuoYi App 设计系统" />
        <Card.Body>
          <Text>当前主题：{mode === 'dark' ? '深色' : '浅色'}</Text>
          <Button onPress={toggle} type="primary">
            切换{mode === 'dark' ? '浅色' : '深色'}模式
          </Button>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header title="登录（对接后端 /auth/login）" />
        <Card.Body>
          {user ? (
            <View>
              <Text>用户ID：{String(user.userId)}</Text>
              <Text>用户名：{user.userName}</Text>
              <Text>昵称：{user.nickName}</Text>
              <Text>角色：{(user.roles || []).join('、') || '-'}</Text>
              <Button onPress={handleLogout} type="warning">
                退出登录
              </Button>
            </View>
          ) : (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="用户名"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="密码"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <View style={styles.captchaRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="验证码"
                  value={code}
                  onChangeText={setCode}
                />
                {captcha?.captchaEnabled && captcha.img ? (
                  <Image source={{ uri: captcha.img }} style={styles.captchaImg} />
                ) : null}
              </View>
              <Button onPress={handleLogin} type="primary" loading={loading}>
                登录
              </Button>
              <Text>默认账号 admin / 123456（以后端初始化数据为准）</Text>
            </View>
          )}
        </Card.Body>
      </Card>
    </View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Demo />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5'
  },
  form: {
    gap: 12
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff'
  },
  captchaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  captchaImg: {
    width: 100,
    height: 40,
    borderWidth: 1,
    borderColor: '#d9d9d9'
  }
});

export default App;
