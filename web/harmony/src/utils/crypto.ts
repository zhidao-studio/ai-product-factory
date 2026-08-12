/**
 * AES 工具（与后端 @ApiEncrypt 对称加密一致）
 * 流程：前端随机生成 16 字节 AES 密钥 → AES-ECB/Pkcs7 加密请求体 →
 *       用 RSA 公钥加密该 AES 密钥放入 encrypt-key 请求头 → 后端解密后回解。
 * 与 admin/h5 的 src/utils/crypto.ts 严格一致。
 */
import CryptoJS from 'crypto-js/core';
import 'crypto-js/aes';
import 'crypto-js/enc-base64';
import 'crypto-js/mode-ecb';
import 'crypto-js/pad-pkcs7';
import Taro from '@tarojs/taro';

function bytesToHex(array: Uint8Array): string {
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function generateRandomString(): Promise<string> {
  if (process.env.TARO_ENV === 'weapp') {
    const result = await Taro.getRandomValues({ length: 16 });
    return bytesToHex(new Uint8Array(result.randomValues));
  }
  if (typeof globalThis.crypto?.getRandomValues !== 'function') {
    throw new Error('当前运行环境不支持密码学安全随机数');
  }
  const array = new Uint8Array(32);
  globalThis.crypto.getRandomValues(array);
  return bytesToHex(array).slice(0, 32);
}

/** 生成 16 字节 AES 密钥（32 位 hex 字符串解析为 WordArray） */
export async function generateAesKey(): Promise<CryptoJS.lib.WordArray> {
  return CryptoJS.enc.Utf8.parse(await generateRandomString());
}

export function encryptBase64(str: CryptoJS.lib.WordArray): string {
  return CryptoJS.enc.Base64.stringify(str);
}

export function decryptBase64(str: string): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Base64.parse(str);
}

export function encryptWithAes(message: string, aesKey: CryptoJS.lib.WordArray): string {
  return CryptoJS.AES.encrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
}

export function decryptWithAes(message: string, aesKey: CryptoJS.lib.WordArray): string {
  const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
