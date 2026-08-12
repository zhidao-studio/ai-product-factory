/**
 * 登录态 Hook（App 端路由守卫的数据源）
 *
 * 复用 src/utils/auth.ts 的 token 持久化（localStorage 或内存兜底），
 * 并维护一份 React state 用于驱动「未登录→登录页 / 已登录→主页」的切换。
 */
import { useCallback, useState } from 'react';
import { getToken, setToken as persistToken, removeToken as clearToken } from '../utils/auth';

export function useAuth() {
  const [token, setTokenState] = useState<string>(() => getToken());

  const login = useCallback((newToken: string) => {
    persistToken(newToken);
    setTokenState(newToken);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState('');
  }, []);

  return { token, isLoggedIn: !!token, login, logout };
}
