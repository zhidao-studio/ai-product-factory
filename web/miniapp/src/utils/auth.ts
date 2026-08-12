/** Token 持久化（Taro 跨端存储，键名与各端一致） */
import Taro from '@tarojs/taro';

const TOKEN_KEY = 'Admin-Token';

export function getToken(): string {
  return Taro.getStorageSync(TOKEN_KEY) || '';
}

export function setToken(token: string): void {
  Taro.setStorageSync(TOKEN_KEY, token);
}

export function removeToken(): void {
  Taro.removeStorageSync(TOKEN_KEY);
}
