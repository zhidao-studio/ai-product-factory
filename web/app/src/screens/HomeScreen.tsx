/**
 * 主页（App 端，已登录态）
 *
 * 进入即拉取当前应用用户信息（/client/user/info）。提供主题切换与退出登录，
 * 退出或 token 失效时回调 onLogout 回到登录页（路由守卫接管）。
 */
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text, Toast } from '@ant-design/react-native';
import { useThemeTokens } from '../theme/useThemeTokens';
import { useThemeMode } from '../theme/ThemeProvider';
import {
  AntdCardBody,
  useAntdComponentStyles,
} from '../theme/useAntdComponentStyles';
import { getInfo, logout, type UserInfo } from '../api/auth';
import { getToken } from '../utils/auth';

export default function HomeScreen({
  onLogout,
}: {
  onLogout: () => Promise<void>;
}) {
  const { breakpoints, colors, spacing, font } = useThemeTokens();
  const { buttonHeight, buttonStyles, cardStyles } =
    useAntdComponentStyles();
  const { preference, toggle } = useThemeMode();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadInfo = async () => {
    setLoadingInfo(true);
    setLoadFailed(false);
    try {
      const res = await getInfo();
      setUser(res.data);
    } catch {
      // 401 由请求层清理 Token；网络或服务异常保留登录态，允许用户重试。
      setLoadFailed(true);
    } finally {
      setLoadingInfo(false);
    }
  };

  useEffect(() => {
    loadInfo();
  }, []);

  const handleLogout = () => {
    Alert.alert('退出登录', '确定退出当前应用用户账号吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          const accessToken = getToken();
          if (accessToken) logout(accessToken).catch(() => undefined);
          try {
            await onLogout();
            Toast.show({ content: '已退出登录' });
          } catch {
            Toast.show({ content: '安全凭证清理失败，请重试' });
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.colorBgLayout }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { padding: spacing.base },
        ]}
      >
        <View style={[styles.content, { maxWidth: breakpoints.xs }]}>
          <Card
            styles={cardStyles}
            style={{ backgroundColor: colors.colorBgContainer }}
          >
            <Card.Header styles={cardStyles} title="当前账号" />
            <AntdCardBody styles={cardStyles}>
              <View style={{ paddingHorizontal: spacing.base }}>
                {loadingInfo ? (
                  <ActivityIndicator color={colors.colorPrimary} />
                ) : user ? (
                  <View style={{ gap: spacing.xs }}>
                    <Text
                      style={{
                        color: colors.colorText,
                        fontSize: font.fontSizeLG,
                      }}
                    >
                      用户ID：{String(user.userId)}
                    </Text>
                    <Text
                      style={{
                        color: colors.colorText,
                        fontSize: font.fontSizeLG,
                      }}
                    >
                      用户名：{user.userName}
                    </Text>
                    <Text
                      style={{
                        color: colors.colorText,
                        fontSize: font.fontSizeLG,
                      }}
                    >
                      昵称：{user.nickName}
                    </Text>
                    <Text
                      style={{
                        color: colors.colorText,
                        fontSize: font.fontSizeLG,
                      }}
                    >
                      角色：{(user.roles || []).join('、') || '-'}
                    </Text>
                    <Text
                      style={{
                        color: colors.colorText,
                        fontSize: font.fontSizeLG,
                      }}
                    >
                      设备类型：{user.deviceType}
                    </Text>
                  </View>
                ) : loadFailed ? (
                  <View style={{ gap: spacing.xs }}>
                    <Text
                      style={{
                        color: colors.colorTextSecondary,
                        fontSize: font.fontSizeLG,
                      }}
                    >
                      用户信息加载失败，请检查网络后重试
                    </Text>
                    <Button
                      styles={buttonStyles}
                      size="small"
                      onPress={loadInfo}
                      style={{ minHeight: buttonHeight }}
                    >
                      重新加载
                    </Button>
                  </View>
                ) : null}
                <Button
                  styles={buttonStyles}
                  size="small"
                  style={{ marginTop: spacing.sm, minHeight: buttonHeight }}
                  onPress={toggle}
                >
                  主题：
                  {preference === 'system'
                    ? '跟随系统'
                    : preference === 'dark'
                    ? '深色'
                    : '浅色'}
                </Button>
              </View>
            </AntdCardBody>
          </Card>

          <Button
            styles={buttonStyles}
            type="warning"
            loading={loggingOut}
            onPress={handleLogout}
            style={{ marginTop: spacing.base, minHeight: buttonHeight }}
          >
            退出登录
          </Button>
        </View>
      </ScrollView>
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
  content: {
    width: '100%',
    alignSelf: 'center',
  },
});
