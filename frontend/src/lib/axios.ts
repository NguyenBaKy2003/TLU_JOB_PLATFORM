import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { 
  getAccessToken, 
  getRefreshToken, 
  setAccessToken, 
  setRefreshToken, 
  clearTokens,
  shouldRefreshToken
} from "./auth-helpers"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken()
  
  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

      try {
        const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
      null, 
      {
        params: { refreshToken },
      }
    )

    const { accessToken, refreshToken: newRefreshToken } = response.data.data

    setAccessToken(accessToken)
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken)
    }

    return accessToken
  } catch (error) {
    clearTokens()
    window.location.href = "/auth/login"
    throw error
  }
}

// Request Interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken()

    if (accessToken && !config.url?.includes("/auth/refresh")) {
      // Check if token should be refreshed proactively
      if (shouldRefreshToken(accessToken) && !isRefreshing) {
        try {
          isRefreshing = true
          const newToken = await refreshAccessToken()
          config.headers.Authorization = `Bearer ${newToken}`
          processQueue(null, newToken)
        } catch (error) {
          processQueue(error, null)
          throw error
        } finally {
          isRefreshing = false
        }
      } else if (isRefreshing) {
        // Wait for token refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              config.headers.Authorization = `Bearer ${token}`
              resolve(config)
            },
            reject: (err: any) => {
              reject(err)
            }
          })
        })
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/refresh")) {
        clearTokens()
        window.location.href = "/auth/login"
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(api(originalRequest))
            },
            reject: (err: any) => {
              reject(err)
            }
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        window.location.href = "/auth/login"
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api