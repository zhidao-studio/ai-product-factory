/**
 * HarmonyOS 原生轻量级持久化。
 *
 * Taro 4.2.1 harmony-cpp 尚未实现同步 Storage API，且其异步实现绑定了
 * 插件示例 bundleName。这里直接使用 HarmonyOS Preferences，并复用 Taro
 * 已初始化的 UIAbility Context，避免依赖不完整的平台兼容层。
 */
import dataPreferences from '@ohos.data.preferences';
import { Current } from '@tarojs/runtime';

const STORE_NAME = 'ruoyi-client-preferences';

interface HarmonyRuntimeCurrent {
  contextPromise: Promise<unknown>;
}

interface NativePreferences {
  get(key: string, defaultValue: string): Promise<unknown>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  flush(): Promise<void>;
}

let preferencesReady: Promise<NativePreferences> | null = null;

function getPreferences(): Promise<NativePreferences> {
  if (!preferencesReady) {
    preferencesReady = (async () => {
      const context = await (Current as unknown as HarmonyRuntimeCurrent).contextPromise;
      if (!context) throw new Error('HarmonyOS 应用上下文尚未初始化');
      return dataPreferences.getPreferences(context, STORE_NAME) as Promise<NativePreferences>;
    })();
  }
  return preferencesReady;
}

export async function getStoredString(key: string): Promise<string> {
  const preferences = await getPreferences();
  const value = await preferences.get(key, '');
  return typeof value === 'string' ? value : '';
}

export async function setStoredString(key: string, value: string): Promise<void> {
  const preferences = await getPreferences();
  await preferences.put(key, value);
  await preferences.flush();
}

export async function removeStoredValue(key: string): Promise<void> {
  const preferences = await getPreferences();
  await preferences.delete(key);
  await preferences.flush();
}
