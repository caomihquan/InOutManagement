import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'
import { setAccessToken, getAccessToken } from './tokenStore'

type User = { id: string; userName: string; email?: string; roles?: string[] | null }

type AuthCtx = {
  user: User | null
  login: (userName: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<string | null>
  getAccessToken: () => string | null
}

const AuthContext = createContext<AuthCtx | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  const login = async (userName: string, password: string) => {
    const res = await api.post('/api/auth/login', { userName, password })
    const token = res.data?.accessToken ?? null
    const u = res.data?.user ?? null
    setAccessToken(token)
    setUser(u)
  }

  const logout = async () => {
    await api.post('/api/auth/logout')
    setAccessToken(null)
    setUser(null)
  }

  const refresh = async () => {
    const r = await api.post('/api/auth/refresh', null)
    const newToken = r.data?.accessToken ?? null
    setAccessToken(newToken)
    return newToken
  }

  // Try to fetch current user on start (backend may use refresh cookie to issue access token)
  useEffect(() => {
    (async () => {
      try {
        // Option A: call /api/auth/me which may return user if refresh cookie exists
        const r = await api.get('/api/auth/me')
        setUser(r.data)
      } catch {
        // no-op
      }
    })()
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, refresh, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
