import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getInfo,
  login,
  logout,
  type UserInfo,
} from '@/api/auth'
import { getToken, removeToken, setToken } from '@/utils/auth'
import { SessionContext, type SessionContextValue, type SessionStatus } from './sessionContextValue'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [user, setUser] = useState<UserInfo>()

  const refresh = async () => {
    if (!getToken()) {
      setUser(undefined)
      setStatus('anonymous')
      return undefined
    }
    try {
      const response = await getInfo()
      setUser(response.data)
      setStatus('authenticated')
      return response.data
    } catch {
      removeToken()
      setUser(undefined)
      setStatus('anonymous')
      return undefined
    }
  }

  useEffect(() => {
    void refresh()
    const handleUnauthorized = () => {
      setUser(undefined)
      setStatus('anonymous')
    }
    window.addEventListener('ruoyi:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('ruoyi:unauthorized', handleUnauthorized)
  }, [])

  const value = useMemo<SessionContextValue>(() => ({
    status,
    user,
    refresh,
    signIn: async params => {
      const response = await login(params)
      setToken(response.data.access_token)
      const session = await getInfo()
      setUser(session.data)
      setStatus('authenticated')
      return session.data
    },
    signOut: async () => {
      try {
        await logout()
      } finally {
        removeToken()
        setUser(undefined)
        setStatus('anonymous')
      }
    },
  }), [status, user])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
