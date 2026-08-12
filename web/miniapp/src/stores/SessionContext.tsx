import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import Taro from '@tarojs/taro'
import {
  getInfo,
  login,
  loginByMiniProgram,
  logout,
  type LoginParams,
  type MiniProgramLoginParams,
  type UserInfo,
} from '@/api/auth'
import { getToken, removeToken, setToken } from '@/utils/auth'

type SessionStatus = 'loading' | 'anonymous' | 'authenticated'

interface SessionContextValue {
  status: SessionStatus
  user?: UserInfo
  signIn: (params: LoginParams) => Promise<void>
  signInByMiniProgram: (params: MiniProgramLoginParams) => Promise<void>
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [user, setUser] = useState<UserInfo>()

  useEffect(() => {
    let active = true
    const bootstrap = async () => {
      if (!getToken()) {
        if (active) setStatus('anonymous')
        return
      }
      try {
        const response = await getInfo()
        if (active) {
          setUser(response.data)
          setStatus('authenticated')
        }
      } catch {
        removeToken()
        if (active) setStatus('anonymous')
      }
    }
    void bootstrap()
    const handleUnauthorized = () => {
      setUser(undefined)
      setStatus('anonymous')
    }
    Taro.eventCenter.on('ruoyi:unauthorized', handleUnauthorized)
    return () => {
      active = false
      Taro.eventCenter.off('ruoyi:unauthorized', handleUnauthorized)
    }
  }, [])

  const value = useMemo<SessionContextValue>(() => ({
    status,
    user,
    signIn: async params => {
      const loginResponse = await login(params)
      setToken(loginResponse.data.access_token)
      const sessionResponse = await getInfo()
      setUser(sessionResponse.data)
      setStatus('authenticated')
    },
    signInByMiniProgram: async params => {
      const loginResponse = await loginByMiniProgram(params)
      setToken(loginResponse.data.access_token)
      const sessionResponse = await getInfo()
      setUser(sessionResponse.data)
      setStatus('authenticated')
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

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used inside SessionProvider')
  return context
}
