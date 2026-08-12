/** 微信小程序产品用户 Token，与其他端会话隔离。 */
import Taro from '@tarojs/taro';

const TOKEN_KEY = 'Client-Miniapp-Token';

export function getToken(): string {
  return Taro.getStorageSync(TOKEN_KEY) || '';
}

export function setToken(token: string): void {
  Taro.setStorageSync(TOKEN_KEY, token);
}

export function removeToken(): void {
  Taro.removeStorageSync(TOKEN_KEY);
}
