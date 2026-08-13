/**
 * App Token 安全存储。
 *
 * 请求拦截器同步读取内存镜像；应用首屏在 hydrateToken 完成前不会发起业务请求。
 * 持久化使用 iOS Keychain / Android Keystore，不把访问令牌写入明文存储。
 */
import {
  ACCESSIBLE,
  getGenericPassword,
  resetGenericPassword,
  setGenericPassword,
} from 'react-native-keychain';

const TOKEN_SERVICE = 'Client-App-Token';
const TOKEN_ACCOUNT = 'access-token';
const TOKEN_TOMBSTONE = '__client_app_token_revoked__';

type TokenListener = (token: string) => void;

let memoryToken = '';
let hydrated = false;
let hydratePromise: Promise<string> | null = null;
let storageQueue: Promise<void> = Promise.resolve();
const listeners = new Set<TokenListener>();

function enqueueStorage<T>(operation: () => Promise<T>): Promise<T> {
  const result = storageQueue.then(operation, operation);
  storageQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function reportStorageError(action: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  // 不记录 Token，只保留安全存储动作和错误摘要，便于原生日志定位。
  console.error(`[auth-storage] ${action}: ${message}`);
}

async function persistTombstone(): Promise<void> {
  const result = await setGenericPassword(TOKEN_ACCOUNT, TOKEN_TOMBSTONE, {
    service: TOKEN_SERVICE,
    accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  if (!result) throw new Error('Token tombstone storage failed');
}

function notifyTokenChanged(): void {
  listeners.forEach(listener => listener(memoryToken));
}

export function getToken(): string {
  return memoryToken;
}

export function subscribeToken(listener: TokenListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function hydrateToken(): Promise<string> {
  if (hydrated) return Promise.resolve(memoryToken);
  if (hydratePromise) return hydratePromise;

  const pending = enqueueStorage(async () => {
    try {
      const credentials = await getGenericPassword({ service: TOKEN_SERVICE });
      memoryToken =
        credentials && credentials.password !== TOKEN_TOMBSTONE
          ? credentials.password
          : '';
      if (credentials && credentials.password === TOKEN_TOMBSTONE) {
        try {
          await resetGenericPassword({ service: TOKEN_SERVICE });
        } catch (error) {
          // 墓碑本身不会被当成 Token；清理失败只影响存储卫生。
          reportStorageError('clear token tombstone failed', error);
        }
      }
    } catch (error) {
      memoryToken = '';
      reportStorageError('read token failed', error);
      try {
        await persistTombstone();
      } catch (tombstoneError) {
        reportStorageError(
          'invalidate unreadable token failed',
          tombstoneError,
        );
        throw tombstoneError;
      }
    } finally {
      hydrated = true;
      hydratePromise = null;
      notifyTokenChanged();
    }
    return memoryToken;
  });

  hydratePromise = pending;
  return pending;
}

export async function setToken(token: string): Promise<void> {
  await enqueueStorage(async () => {
    const result = await setGenericPassword(TOKEN_ACCOUNT, token, {
      service: TOKEN_SERVICE,
      accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    if (!result) {
      throw new Error('Token secure storage failed');
    }
    memoryToken = token;
    hydrated = true;
    notifyTokenChanged();
  });
}

export async function removeToken(): Promise<void> {
  memoryToken = '';
  hydrated = true;
  notifyTokenChanged();
  await enqueueStorage(async () => {
    try {
      const cleared = await resetGenericPassword({ service: TOKEN_SERVICE });
      if (!cleared) await persistTombstone();
    } catch (error) {
      reportStorageError('remove token failed', error);
      try {
        await persistTombstone();
      } catch (tombstoneError) {
        reportStorageError('revoke token fallback failed', tombstoneError);
        throw tombstoneError;
      }
    }
  });
}
