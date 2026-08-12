/**
 * RN 无 DOM lib，补充最小全局声明供请求层/加解密使用。
 * （h5 / miniapp 由各自 DOM/Taro 类型提供，无需此文件）
 */
declare global {
  interface Crypto {
    getRandomValues<T extends ArrayBufferView | null>(array: T): T;
  }
  const crypto: Crypto;
  var __RUOYI_APP_CONFIG__:
    | {
        apiBaseUrl: string;
        encryptEnabled?: boolean;
      }
    | undefined;
}

export {};
