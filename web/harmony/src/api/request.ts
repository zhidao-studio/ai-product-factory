import Taro from '@tarojs/taro';
import { getToken, removeToken } from '@/utils/auth';
import { appEnv } from '@/utils/env';

const SUCCESS = 200;
const encryptHeader = 'encrypt-key';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface RequestConfig<D = unknown> {
  url: string;
  method?: Lowercase<HttpMethod> | HttpMethod;
  data?: D;
  params?: Record<string, unknown>;
  timeout?: number;
  headers?: Record<string, string | number | boolean | undefined> & {
    isToken?: false;
    isEncrypt?: 'true' | 'false' | boolean;
    repeatSubmit?: false;
  };
}

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

function joinUrl(baseUrl: string, path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function appendParams(url: string, params?: Record<string, unknown>): string {
  if (!params) return url;
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  if (!query) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}

function showRequestError(content: string): void {
  Taro.showToast({ title: content, icon: 'none' });
}

function showRelogin(): void {
  if (isRelogin.show) return;
  isRelogin.show = true;
  removeToken();
  Taro.eventCenter.trigger('ruoyi:unauthorized');
  Taro.showToast({ title: '登录状态已过期，请重新登录', icon: 'none' });
  isRelogin.show = false;
}

function normalizeHeaders(headers: RequestConfig['headers']): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers || {})
      .filter(([key, value]) => !['isToken', 'isEncrypt', 'repeatSubmit'].includes(key) && value !== undefined)
      .map(([key, value]) => [key, String(value)])
  );
}

export default async function request<T = unknown, D = unknown>(config: RequestConfig<D>): Promise<T> {
  if (!appEnv.baseApi) {
    const message = '未配置小程序 API 域名，请设置 TARO_APP_API_BASE_URL';
    showRequestError(message);
    throw createHandledError(message);
  }

  const method = (config.method || 'GET').toUpperCase() as HttpMethod;
  const isToken = config.headers?.isToken === false;
  const isEncrypt = config.headers?.isEncrypt === 'true' || config.headers?.isEncrypt === true;
  const headers = normalizeHeaders(config.headers);
  headers['Content-Type'] = headers['Content-Type'] || 'application/json;charset=utf-8';
  headers.clientid = appEnv.clientId;
  if (getToken() && !isToken) headers.Authorization = `Bearer ${getToken()}`;

  let data: unknown = config.data;
  if (appEnv.encryptEnabled && isEncrypt && (method === 'POST' || method === 'PUT')) {
    const [cryptoUtils, rsaUtils] = await Promise.all([
      import('@/utils/crypto'),
      import('@/utils/jsencrypt')
    ]);
    const { encryptBase64, encryptWithAes, generateAesKey } = cryptoUtils;
    const { encrypt } = rsaUtils;
    const aesKey = await generateAesKey();
    const encryptedKey = encrypt(encryptBase64(aesKey));
    if (encryptedKey) headers[encryptHeader] = encryptedKey;
    const plainText = typeof data === 'object' ? JSON.stringify(data) : String(data ?? '');
    data = encryptWithAes(plainText, aesKey);
  }

  try {
    const response = await Taro.request<R<unknown> | string, unknown>({
      url: appendParams(joinUrl(appEnv.baseApi, config.url), config.params),
      method,
      data,
      header: headers,
      timeout: config.timeout || 50000
    });

    if (response.statusCode === 401) {
      showRelogin();
      throw createHandledError('无效的会话，或者会话已过期，请重新登录。');
    }

    let responseData: R<unknown> | string = response.data;
    const responseKey = response.header[encryptHeader] || response.header['Encrypt-Key'];
    if (appEnv.encryptEnabled && responseKey && typeof responseData === 'string') {
      const [cryptoUtils, rsaUtils] = await Promise.all([
        import('@/utils/crypto'),
        import('@/utils/jsencrypt')
      ]);
      const { decryptBase64, decryptWithAes } = cryptoUtils;
      const { decrypt } = rsaUtils;
      const base64Key = decrypt(String(responseKey));
      if (base64Key) {
        const aesKey = decryptBase64(base64Key);
        responseData = JSON.parse(decryptWithAes(responseData, aesKey)) as R<unknown>;
      }
    }

    if (typeof responseData === 'string') {
      throw createHandledError('后端返回了无法识别的数据格式');
    }
    if (responseData.code === 401) {
      showRelogin();
      throw createHandledError(responseData.msg || '登录状态已过期');
    }
    if (responseData.code !== SUCCESS) {
      showRequestError(responseData.msg || '系统未知错误');
      throw createHandledError(responseData.msg || '系统未知错误');
    }
    return responseData as T;
  } catch (error) {
    if (isHandledRequestError(error)) throw error;
    const message = error instanceof Error ? error.message : '后端接口连接异常';
    showRequestError(message);
    throw createHandledError(message);
  }
}
