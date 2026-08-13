/** HarmonyOS 请求加密工具，AES、RSA 和安全随机数均使用系统 Crypto Framework。 */
import cryptoFramework from '@ohos.security.cryptoFramework';
import buffer from '@ohos.buffer';

const RSA_TRANSFORMATION = 'RSA1024|PKCS1';
const AES_TRANSFORMATION = 'AES256|ECB|PKCS7';

type CachedKey<T> = {
  source: string;
  promise: Promise<T>;
};

let publicKeyCache: CachedKey<CryptoFrameworkPublicKey> | undefined;
let privateKeyCache: CachedKey<CryptoFrameworkPrivateKey> | undefined;

function base64ToBytes(value: string): Uint8Array {
  const decoded = buffer.from(value, 'base64');
  return new Uint8Array(decoded.buffer, decoded.byteOffset, decoded.length);
}

function utf8ToBytes(value: string): Uint8Array {
  const encoded = buffer.from(value, 'utf-8');
  return new Uint8Array(encoded.buffer, encoded.byteOffset, encoded.length);
}

function bytesToBase64(value: Uint8Array): string {
  return buffer.from(value).toString('base64');
}

function bytesToUtf8(value: Uint8Array): string {
  return buffer.from(value).toString('utf-8');
}

async function getPublicKey(source: string): Promise<CryptoFrameworkPublicKey> {
  if (publicKeyCache?.source !== source) {
    const generator = cryptoFramework.createAsyKeyGenerator('RSA1024');
    publicKeyCache = {
      source,
      promise: generator
        .convertKey({ data: base64ToBytes(source) }, null)
        .then((keyPair) => keyPair.pubKey),
    };
  }
  return publicKeyCache.promise;
}

async function getPrivateKey(source: string): Promise<CryptoFrameworkPrivateKey> {
  if (privateKeyCache?.source !== source) {
    const generator = cryptoFramework.createAsyKeyGenerator('RSA1024');
    privateKeyCache = {
      source,
      promise: generator
        .convertKey(null, { data: base64ToBytes(source) })
        .then((keyPair) => keyPair.priKey),
    };
  }
  return privateKeyCache.promise;
}

async function convertAesKey(source: Uint8Array): Promise<CryptoFrameworkSymmetricKey> {
  return cryptoFramework.createSymKeyGenerator('AES256').convertKey({ data: source });
}

export async function generateAesKey(): Promise<Uint8Array> {
  const entropy = cryptoFramework.createRandom().generateRandomSync(16).data;
  if (entropy.length !== 16) {
    throw new Error('HarmonyOS 安全随机数生成失败，已拒绝发送加密登录请求');
  }
  // RuoYi 后端将 Base64 解码结果按 UTF-8 字符串作为 AES 密码，
  // 因此保持与 Admin/H5 一致：16 字节熵编码为 32 位 hex，得到 AES-256 密钥。
  return utf8ToBytes(buffer.from(entropy).toString('hex'));
}

export async function encryptWithRsa(message: string, publicKeySource: string): Promise<string> {
  const cipher = cryptoFramework.createCipher(RSA_TRANSFORMATION);
  await cipher.init(cryptoFramework.CryptoMode.ENCRYPT_MODE, await getPublicKey(publicKeySource), null);
  const encrypted = await cipher.doFinal({ data: utf8ToBytes(message) });
  if (!encrypted?.data.length) {
    throw new Error('HarmonyOS RSA 请求密钥加密失败');
  }
  return bytesToBase64(encrypted.data);
}

export async function decryptWithRsa(message: string, privateKeySource: string): Promise<string> {
  const cipher = cryptoFramework.createCipher(RSA_TRANSFORMATION);
  await cipher.init(cryptoFramework.CryptoMode.DECRYPT_MODE, await getPrivateKey(privateKeySource), null);
  const decrypted = await cipher.doFinal({ data: base64ToBytes(message) });
  if (!decrypted?.data.length) {
    throw new Error('HarmonyOS RSA 响应密钥解密失败');
  }
  return bytesToUtf8(decrypted.data);
}

export function encryptBase64(value: Uint8Array): string {
  return bytesToBase64(value);
}

export function decryptBase64(value: string): Uint8Array {
  return base64ToBytes(value);
}

export async function encryptWithAes(message: string, aesKey: Uint8Array): Promise<string> {
  const cipher = cryptoFramework.createCipher(AES_TRANSFORMATION);
  await cipher.init(cryptoFramework.CryptoMode.ENCRYPT_MODE, await convertAesKey(aesKey), null);
  const encrypted = await cipher.doFinal({ data: utf8ToBytes(message) });
  if (!encrypted?.data.length) {
    throw new Error('HarmonyOS AES 请求体加密失败');
  }
  return bytesToBase64(encrypted.data);
}

export async function decryptWithAes(message: string, aesKey: Uint8Array): Promise<string> {
  const cipher = cryptoFramework.createCipher(AES_TRANSFORMATION);
  await cipher.init(cryptoFramework.CryptoMode.DECRYPT_MODE, await convertAesKey(aesKey), null);
  const decrypted = await cipher.doFinal({ data: base64ToBytes(message) });
  if (!decrypted?.data.length) {
    throw new Error('HarmonyOS AES 响应体解密失败');
  }
  return bytesToUtf8(decrypted.data);
}
