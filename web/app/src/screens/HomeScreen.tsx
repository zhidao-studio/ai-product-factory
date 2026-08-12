/**
 * 主页（App 端，已登录态）
 *
 * 进入即拉取当前产品用户信息（/client/user/info）。提供主题切换与退出登录，
 * 退出或 token 失效时回调 onLogout 回到登录页（路由守卫接管）。
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text, Toast } from '@ant-design/react-native';
import { useThemeTokens } from '../theme/useThemeTokens';
import { useThemeMode } from '../theme/ThemeProvider';
import { getInfo, logout, type UserInfo } from '../api/auth';

export default function HomeScreen({ onLogout }: { onLogout: () => void }) {
  const { colors, spacing, font, sizes } = useThemeTokens();
  const touchHeight = Platform.OS === 'ios' ? sizes.touchMinIos : sizes.touchMinAndroid;
  const { mode, toggle } = useThemeMode();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const loadInfo = async () => {
    try {
      const res = await getInfo();
      setUser(res.data);
    } catch {
      // token 失效或接口异常：回到登录页
      onLogout();
    }
  };

  useEffect(() => {
    loadInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    Alert.alert('退出登录', '确定退出当前产品用户账号吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await logout();
          } catch {
            // 服务端会话已失效时仍需清理本地 Token。
          } finally {
            setLoading(false);
            onLogout();
            Toast.show({ content: '已退出登录' });
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.colorBgLayout, padding: spacing.base }]}>
      <Card style={{ backgroundColor: colors.colorBgContainer }}>
        <Card.Header title="当前账号" />
        <Card.Body>
          {user ? (
            <View style={{ gap: spacing.xs }}>
              <Text style={{ fontSize: font.fontSize }}>用户ID：{String(user.userId)}</Text>
              <Text style={{ fontSize: font.fontSize }}>用户名：{user.userName}</Text>
              <Text style={{ fontSize: font.fontSize }}>昵称：{user.nickName}</Text>
              <Text style={{ fontSize: font.fontSize }}>
                角色：{(user.roles || []).join('、') || '-'}
              </Text>
              <Text style={{ fontSize: font.fontSize }}>设备类型：{user.deviceType}</Text>
            </View>
          ) : (
            <ActivityIndicator color={colors.colorPrimary} />
          )}
          <Button
            size="small"
            style={{ marginTop: spacing.sm, minHeight: touchHeight }}
            onPress={toggle}
          >
            切换{mode === 'dark' ? '浅色' : '深色'}模式
          </Button>
        </Card.Body>
      </Card>

      <Button
        type="warning"
        loading={loading}
        onPress={handleLogout}
        style={{ marginTop: spacing.base, minHeight: touchHeight }}
      >
        退出登录
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
