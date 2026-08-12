/**
 * RSA 工具（与后端 @ApiEncrypt 一致）
 * 公钥加密 sent AES 密钥；私钥解密响应头 encrypt-key 中的 AES 密钥。
 * 与 admin/h5/miniapp 同源实现。
 */
import { JSEncrypt } from 'jsencrypt';
import { appEnv } from './env';

export function encrypt(txt: string): string | false {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(appEnv.rsaPublicKey);
  return encryptor.encrypt(txt);
}

export function decrypt(txt: string): string | false {
  const encryptor = new JSEncrypt();
  encryptor.setPrivateKey(appEnv.rsaPrivateKey);
  return encryptor.decrypt(txt);
}
