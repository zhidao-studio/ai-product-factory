import { createContext } from 'react'
import type { LoginParams, UserInfo } from '@/api/auth'

export type SessionStatus = 'loading' | 'anonymous' | 'authenticated'

export interface SessionContextValue {
  status: SessionStatus
  user?: UserInfo
  signIn: (params: LoginParams) => Promise<UserInfo>
  signOut: () => Promise<void>
  refresh: () => Promise<UserInfo | undefined>
}

export const SessionContext = createContext<SessionContextValue | null>(null)
