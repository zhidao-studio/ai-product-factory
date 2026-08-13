/**
 * App 入口（App 端 / React Native）
 *
 * 用 useAuth 做路由守卫：未登录渲染登录页（LoginScreen），已登录渲染主页（HomeScreen）。
 * 外层 ThemeProvider 注入设计系统主题；SafeAreaProvider 处理刘海/安全区。
 */
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useThemeMode } from './src/theme/ThemeProvider';
import { useThemeTokens } from './src/theme/useThemeTokens';
import { useAuth } from './src/auth/useAuth';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';

function AppContent() {
  const auth = useAuth();
  const { colors } = useThemeTokens();
  const { isReady: isThemeReady } = useThemeMode();

  if (!auth.isReady || !isThemeReady) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.colorBgLayout }]}>
        <ActivityIndicator color={colors.colorPrimary} />
      </View>
    );
  }

  return auth.isLoggedIn ? (
    <HomeScreen onLogout={auth.logout} />
  ) : (
    <LoginScreen onLogin={auth.login} />
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
