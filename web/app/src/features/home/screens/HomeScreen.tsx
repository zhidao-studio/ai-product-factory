import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, Toast } from '@ant-design/react-native';
import { useSession } from '../../../stores/SessionContext';
import { useThemeMode } from '../../../theme/ThemeProvider';
import { colors, spacing } from '../../../theme/tokens';

export function HomeScreen() {
  const { user, signOut } = useSession();
  const { mode, toggle } = useThemeMode();
  return (
    <View style={styles.container}>
      <Card>
        <Card.Header title="当前会话" />
        <Card.Body>
          <View style={styles.content}>
            <Text>用户ID：{String(user?.userId || '')}</Text>
            <Text>用户名：{user?.userName}</Text>
            <Text>昵称：{user?.nickName}</Text>
            <Text>渠道：{user?.channel}</Text>
            <Text>角色：{user?.roles.join('、') || '-'}</Text>
            <Button onPress={toggle}>切换{mode === 'dark' ? '浅色' : '深色'}主题</Button>
            <Button
              type="warning"
              onPress={async () => {
                await signOut();
                Toast.show({ content: '已退出登录' });
              }}
            >
              退出登录
            </Button>
          </View>
        </Card.Body>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.base,
    backgroundColor: colors.colorBgLayout
  },
  content: {
    gap: spacing.sm
  }
});
