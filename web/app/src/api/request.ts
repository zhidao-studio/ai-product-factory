/**
 * 统一请求层（与后端 RuoYi-Vue-Plus 契约严格对齐，参考 admin/h5/miniapp 同源实现）
 *
 * 约定：
 *  - 统一返回体 R<T> = { code: number; msg: string; data: T }
 *  - code === 200 成功，其它视为业务错误（取 msg 提示）
 *  - 鉴权头 Authorization: Bearer <token>（Sa-Token）
 *  - clientid 头标识客户端
 *  - 登录/注册等接口打 isEncrypt: 'true' 时，按后端 @ApiEncrypt 做 AES+RSA 加密
 *  - 响应头带 encrypt-key 时，按同样的 AES 密钥解密响应体
 *
 * 注意：RN 调试时请确认 baseApi 指向可达的后端地址（如安卓模拟器用 http://10.0.2.2:8080/dev-api）。
 */
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { Toast } from '@ant-design/react-native';
import { getToken, removeToken } from '../utils/auth';
import { appEnv } from '../utils/env';
import {
  decryptBase64,
  decryptWithAes,
  encryptBase64,
  encryptWithAes,
  generateAesKey
} from '../utils/crypto';
import { decrypt, encrypt } from '../utils/jsencrypt';

const SUCCESS = 200;
const encryptHeader = 'encrypt-key';

export interface RequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  headers?: AxiosRequestConfig<D>['headers'] & {
    isToken?: false;
    isEncrypt?: 'true' | 'false' | boolean;
  };
}

/** 后端统一返回体 */
export interface R<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export const isRelogin = { show: false };

type HandledRequestError = Error & { isHandled?: boolean };

function createHandledError(message: string): HandledRequestError {
  const error = new Error(message) as HandledRequestError;
  error.isHandled = true;
  return error;
}

export function isHandledRequestError(error: unknown): boolean {
  return Boolean((error as { isHandled?: boolean } | undefined)?.isHandled);
}

const service = axios.create({
  baseURL: appEnv.baseApi,
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    clientid: appEnv.clientId
  }
});

service.interceptors.request.use((config) => {
  const isToken = config.headers?.['isToken'] === false;
  const isEncrypt = config.headers?.['isEncrypt'] === 'true' || config.headers?.['isEncrypt'] === true;

  if (getToken() && !isToken) {
    config.headers.set('Authorization', `Bearer ${getToken()}`);
  }

  if (appEnv.encryptEnabled && isEncrypt && (config.method === 'post' || config.method === 'put')) {
    const aesKey = generateAesKey();
    const encryptedKey = encrypt(encryptBase64(aesKey));
    if (encryptedKey) {
      config.headers.set(encryptHeader, encryptedKey);
    }
    const data = typeof config.data === 'object' ? JSON.stringify(config.data) : String(config.data ?? '');
    config.data = encryptWithAes(data, aesKey);
  }

  config.headers.delete('isToken');
  config.headers.delete('isEncrypt');

  return config;
});

function normalizeErrorMessage(message?: string): string | undefined {
  if (!message) return undefined;
  if (message === 'Network Error') return '后端接口连接异常';
  if (message.includes('timeout')) return '系统接口请求超时';
  if (message.includes('Request failed with status code')) return `系统接口${message.slice(-3)}异常`;
  return message;
}

async function parseResponseErrorData(data: unknown): Promise<string | undefined> {
  if (!data) return undefined;
  if (typeof data === 'string') {
    const text = data.trim();
    if (!text) return undefined;
    try {
      return parseResponseErrorData(JSON.parse(text));
    } catch {
      return text;
    }
  }
  if (typeof data === 'object') {
    const payload = data as { msg?: string; message?: string };
    return payload.msg || payload.message;
  }
  return undefined;
}

async function getErrorMessage(error: AxiosError): Promise<string> {
  const responseMessage = await parseResponseErrorData(error.response?.data);
  return responseMessage || normalizeErrorMessage(error.message) || '系统未知错误';
}

function showRequestError(content: string): void {
  Toast.show({ content });
}

function showRelogin(): void {
  if (isRelogin.show) return;
  isRelogin.show = true;
  Toast.show({ content: '登录状态已过期，请重新登录' });
  removeToken();
  isRelogin.show = false;
}

service.interceptors.response.use(
  (response) => {
    const keyStr = response.headers[encryptHeader];
    if (appEnv.encryptEnabled && keyStr) {
      const base64Str = decrypt(keyStr);
      if (base64Str) {
        const aesKey = decryptBase64(base64Str);
        response.data = JSON.parse(decryptWithAes(response.data, aesKey));
      }
    }

    const code = response.data?.code ?? SUCCESS;
    const msg = response.data?.msg || '系统未知错误';

    if (code === 401) {
      showRelogin();
      return Promise.reject(createHandledError('无效的会话，或者会话已过期，请重新登录。'));
    }

    if (code !== SUCCESS) {
      showRequestError(msg);
      return Promise.reject(createHandledError(msg));
    }

    return response.data;
  },
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      showRelogin();
      return Promise.reject(createHandledError('无效的会话，或者会话已过期，请重新登录。'));
    }
    const msg = axios.isAxiosError(error)
      ? await getErrorMessage(error)
      : normalizeErrorMessage(error?.message) || '系统未知错误';
    showRequestError(msg);
    return Promise.reject(createHandledError(msg));
  }
);

export default function request<T = unknown, D = unknown>(config: RequestConfig<D>): Promise<T> {
  return service.request(config) as unknown as Promise<T>;
}
