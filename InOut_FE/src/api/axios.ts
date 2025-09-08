import axios, { type AxiosRequestConfig } from 'axios'
import { getAccessToken, setAccessToken } from '../hooks/tokenStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && config.headers) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (v?: any) => void; reject: (e?: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async (err) => {
    const originalRequest = err.config as AxiosRequestConfig & { _retry?: boolean }
    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          if (originalRequest.headers) originalRequest.headers['Authorization'] = 'Bearer ' + token
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true
      try {
        const r = await api.post('/api/auth/refresh', null)
        const newToken = r.data?.accessToken
        setAccessToken(newToken ?? null)
        processQueue(null, newToken ?? null)
        if (originalRequest.headers) originalRequest.headers['Authorization'] = 'Bearer ' + newToken
        return api(originalRequest)
      } catch (e) {
        processQueue(e, null)
        return Promise.reject(e)
      } finally { isRefreshing = false }
    }
    return Promise.reject(err)
  }
)

export default api
