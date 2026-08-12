/**
 * AES 工具（与后端 @ApiEncrypt 对称加密一致）
 * 流程：前端随机生成 16 字节 AES 密钥 → AES-ECB/Pkcs7 加密请求体 →
 *       用 RSA 公钥加密该 AES 密钥放入 encrypt-key 请求头 → 后端解密后回解。
 * 该实现与 admin/src/utils/crypto.ts 严格一致。
 */
import * as CryptoJSModule from 'crypto-js';

const CryptoJS = ('default' in CryptoJSModule ? CryptoJSModule.default : CryptoJSModule) as typeof CryptoJSModule;

function generateRandomString(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

/** 生成 16 字节 AES 密钥（32 位 hex 字符串解析为 WordArray） */
export function generateAesKey(): CryptoJSModule.lib.WordArray {
  return CryptoJS.enc.Utf8.parse(generateRandomString());
}

export function encryptBase64(str: CryptoJSModule.lib.WordArray): string {
  return CryptoJS.enc.Base64.stringify(str);
}

export function decryptBase64(str: string): CryptoJSModule.lib.WordArray {
  return CryptoJS.enc.Base64.parse(str);
}

export function encryptWithAes(message: string, aesKey: CryptoJSModule.lib.WordArray): string {
  return CryptoJS.AES.encrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
}

export function decryptWithAes(message: string, aesKey: CryptoJSModule.lib.WordArray): string {
  const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
