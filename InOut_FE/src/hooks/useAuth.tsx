import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'
import { setAccessToken } from './tokenStore'

type User = { id: string; userName: string; email?: string; roles?: string[] }
type AuthCtx = { user: User | null; login: (userName: string, password: string) => Promise<void>; logout: () => Promise<void> }

const AuthContext = createContext<AuthCtx | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  const login = async (userName: string, password: string) => {
    const r = await api.post('/api/auth/login', { userName, password })
    const token = r.data?.accessToken ?? null
    setAccessToken(token)
    setUser(r.data?.user ?? null)
  }

  const logout = async () => {
    await api.post('/api/auth/logout')
    setAccessToken(null)
    setUser(null)
  }

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/api/auth/me')
        setUser(r.data)
      } catch { /* not logged */ }
    })()
  }, [])

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => { const c = useContext(AuthContext); if (!c) throw new Error('useAuth must be inside AuthProvider'); return c }
