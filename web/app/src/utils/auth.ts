/**
 * Token 持久化
 * RN 调试环境未必提供 localStorage，这里优先用全局 localStorage，缺失时退回内存存储。
 * 生产建议接入 @react-native-async-storage/async-storage（本脚手架未默认引入）。
 */
const TOKEN_KEY = 'Client-App-Token';

let memoryToken = '';

export function getToken(): string {
  try {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    // ignore
  }
  return memoryToken;
}

export function setToken(token: string): void {
  memoryToken = token;
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function removeToken(): void {
  memoryToken = '';
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}
