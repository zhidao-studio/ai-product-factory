/** HarmonyOS 统一请求层，使用 Taro.request。 */
import Taro from '@tarojs/taro';
import { getToken, removeToken } from '@/utils/auth';
import { appEnv } from '@/utils/env';
import {
  decryptBase64,
  decryptWithAes,
  decryptWithRsa,
  encryptBase64,
  encryptWithAes,
  encryptWithRsa,
  generateAesKey
} from '@/utils/crypto';

const SUCCESS = 200;
const ENCRYPT_HEADER = 'encrypt-key';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
type QueryValue = string | number | boolean | null | undefined;

export interface RequestConfig<D = unknown> {
  url: string;
  method?: Lowercase<RequestMethod> | RequestMethod;
  headers?: Record<string, string | number | boolean | undefined> & {
    isToken?: false;
    isEncrypt?: 'true' | 'false' | boolean;
  };
  data?: D;
  params?: Record<string, QueryValue>;
  timeout?: number;
}

export interface R<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

type HandledRequestError = Error & { isHandled?: boolean };

function createHandledError(message: string): HandledRequestError {
  const error = new Error(message) as HandledRequestError;
  error.isHandled = true;
  return error;
}

export function isHandledRequestError(error: unknown): boolean {
  return Boolean((error as { isHandled?: boolean } | undefined)?.isHandled);
}

function showRequestError(content: string): void {
  Taro.showToast({ title: content, icon: 'none' });
}

async function showRelogin(): Promise<void> {
  await removeToken();
  Taro.showToast({ title: '登录状态已过期，请重新登录', icon: 'none' });
}

function appendQuery(url: string, params?: Record<string, QueryValue>): string {
  if (!params) return url;
  const query = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return query ? `${url}${url.includes('?') ? '&' : '?'}${query}` : url;
}

function resolveUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${appEnv.baseApi.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function getResponseHeader(headers: Record<string, unknown>, name: string): string | undefined {
  const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase());
  return typeof entry?.[1] === 'string' ? entry[1] : undefined;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error && 'errMsg' in error) {
    const message = String((error as { errMsg?: unknown }).errMsg || '');
    if (message.includes('timeout')) return '系统接口请求超时';
    if (message) return message;
  }
  return error instanceof Error && error.message ? error.message : '后端接口连接异常';
}

export default async function request<T = unknown, D = unknown>(config: RequestConfig<D>): Promise<T> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json;charset=utf-8',
      clientid: appEnv.clientId,
    };
    const isToken = config.headers?.isToken === false;
    const isEncrypt = config.headers?.isEncrypt === true || config.headers?.isEncrypt === 'true';

    Object.entries(config.headers || {}).forEach(([key, value]) => {
      if (key !== 'isToken' && key !== 'isEncrypt' && value !== undefined) {
        headers[key] = String(value);
      }
    });

    const token = await getToken();
    if (token && !isToken) headers.Authorization = `Bearer ${token}`;

    const method = (config.method || 'GET').toUpperCase() as RequestMethod;
    let data: unknown = config.data;
    if (appEnv.encryptEnabled && isEncrypt && (method === 'POST' || method === 'PUT')) {
      const aesKey = await generateAesKey();
      const encryptedKey = await encryptWithRsa(encryptBase64(aesKey), appEnv.rsaPublicKey);
      headers[ENCRYPT_HEADER] = encryptedKey;
      data = await encryptWithAes(JSON.stringify(config.data ?? {}), aesKey);
    }

    const response = await Taro.request({
      url: appendQuery(resolveUrl(config.url), config.params),
      method,
      header: headers,
      data,
      timeout: config.timeout ?? 50000,
    });

    if (response.statusCode === 401) {
      await showRelogin();
      throw createHandledError('无效的会话，或者会话已过期，请重新登录。');
    }

    let payload: unknown = response.data;
    const responseKey = getResponseHeader(response.header as Record<string, unknown>, ENCRYPT_HEADER);
    if (appEnv.encryptEnabled && responseKey) {
      const base64Key = await decryptWithRsa(responseKey, appEnv.rsaPrivateKey);
      if (typeof payload !== 'string') throw new Error('响应解密失败');
      payload = JSON.parse(await decryptWithAes(payload, decryptBase64(base64Key)));
    }

    const result = payload as Partial<R<unknown>>;
    const code = result.code ?? SUCCESS;
    const message = result.msg || '系统未知错误';
    if (code === 401) {
      await showRelogin();
      throw createHandledError(message);
    }
    if (response.statusCode < 200 || response.statusCode >= 300 || code !== SUCCESS) {
      showRequestError(message);
      throw createHandledError(message);
    }
    return payload as T;
  } catch (error) {
    if (isHandledRequestError(error)) throw error;
    const message = getErrorMessage(error);
    showRequestError(message);
    throw createHandledError(message);
  }
}
