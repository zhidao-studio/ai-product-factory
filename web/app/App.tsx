/**
 * App 入口（App 端 / React Native）
 *
 * 用 useAuth 做路由守卫：未登录渲染登录页（LoginScreen），已登录渲染主页（HomeScreen）。
 * 外层 ThemeProvider 注入设计系统主题；SafeAreaProvider 处理刘海/安全区。
 */
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { useAuth } from './src/auth/useAuth';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  const auth = useAuth();

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {auth.isLoggedIn ? (
          <HomeScreen onLogout={auth.logout} />
        ) : (
          <LoginScreen onLogin={auth.login} />
        )}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
