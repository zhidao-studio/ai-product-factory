import { getStoredString, removeStoredValue, setStoredString } from '../platform/native-storage';

const TOKEN_KEY = 'Client-Harmony-Token';
let tokenCache = '';
let tokenReady: Promise<void> | null = null;

/** 页面渲染后从 HarmonyOS Preferences 异步恢复 Token。 */
export async function initializeToken(): Promise<void> {
  if (!tokenReady) {
    tokenReady = getStoredString(TOKEN_KEY)
      .then((token) => {
        tokenCache = token;
      })
      .catch(() => {
        tokenCache = '';
      });
  }
  await tokenReady;
}

export async function getToken(): Promise<string> {
  await initializeToken();
  return tokenCache;
}

export async function setToken(token: string): Promise<void> {
  tokenCache = token;
  await setStoredString(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  tokenCache = '';
  await removeStoredValue(TOKEN_KEY).catch(() => undefined);
}
