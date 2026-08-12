import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { useSession } from '../stores/SessionContext';
import { colors } from '../theme/tokens';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { status } = useSession();
  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.colorPrimary} />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerBackTitle: '返回' }}>
        {status === 'authenticated' ? (
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: '登录' }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
