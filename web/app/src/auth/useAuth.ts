/**
 * 登录态 Hook（App 端路由守卫的数据源）
 *
 * 复用 src/utils/auth.ts 的系统安全存储，并订阅请求层触发的 Token 清理，
 * 维护 React state 驱动「未登录→登录页 / 已登录→主页」切换。
 */
import { useCallback, useEffect, useState } from 'react';
import {
  getToken,
  hydrateToken,
  removeToken as clearToken,
  setToken as persistToken,
  subscribeToken,
} from '../utils/auth';

export function useAuth() {
  const [token, setTokenState] = useState<string>(() => getToken());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeToken(nextToken => {
      if (active) setTokenState(nextToken);
    });

    hydrateToken()
      .catch(() => {
        // 安全存储层已记录无敏感信息的错误摘要；界面按未登录态继续。
      })
      .finally(() => {
        if (active) setIsReady(true);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (newToken: string) => {
    await persistToken(newToken);
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
  }, []);

  return { token, isReady, isLoggedIn: !!token, login, logout };
}
