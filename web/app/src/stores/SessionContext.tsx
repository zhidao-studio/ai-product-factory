import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getInfo, loginByPhone, loginBySms, logout, type UserInfo } from '../api/auth';
import { hydrateToken, removeToken, setToken } from '../utils/auth';
import { subscribeUnauthorized } from './sessionEvents';

type SessionStatus = 'loading' | 'anonymous' | 'authenticated';

interface SessionContextValue {
  status: SessionStatus;
  user?: UserInfo;
  signInByPhone: (phoneNumber: string, password: string) => Promise<void>;
  signInBySms: (phoneNumber: string, smsCode: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<UserInfo>();

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      const token = await hydrateToken();
      if (!token) {
        if (active) setStatus('anonymous');
        return;
      }
      try {
        const response = await getInfo();
        if (active) {
          setUser(response.data);
          setStatus('authenticated');
        }
      } catch {
        await removeToken();
        if (active) setStatus('anonymous');
      }
    };
    bootstrap().catch(() => {
      if (active) setStatus('anonymous');
    });
    const unsubscribe = subscribeUnauthorized(() => {
      setUser(undefined);
      setStatus('anonymous');
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<SessionContextValue>(() => ({
    status,
    user,
    signInByPhone: async (phoneNumber, password) => {
      const loginResponse = await loginByPhone(phoneNumber, password);
      await setToken(loginResponse.data.access_token);
      const sessionResponse = await getInfo();
      setUser(sessionResponse.data);
      setStatus('authenticated');
    },
    signInBySms: async (phoneNumber, smsCode) => {
      const loginResponse = await loginBySms(phoneNumber, smsCode);
      await setToken(loginResponse.data.access_token);
      const sessionResponse = await getInfo();
      setUser(sessionResponse.data);
      setStatus('authenticated');
    },
    signOut: async () => {
      try {
        await logout();
      } finally {
        await removeToken();
        setUser(undefined);
        setStatus('anonymous');
      }
    }
  }), [status, user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider');
  return context;
}
