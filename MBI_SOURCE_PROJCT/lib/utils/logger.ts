// lib/utils/logger.ts

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

const isDev = process.env.NODE_ENV === 'development'

const logger = {
  auth: (msg: string, data?: any) => {
    if (isDev) console.log(`🔐 [AUTH] ${msg}`, data ?? '')
  },
  
  api: (msg: string, data?: any) => {
    if (isDev) console.log(`🌐 [API] ${msg}`, data ?? '')
  },
  
  router: (msg: string, data?: any) => {
    if (isDev) console.log(`🧭 [ROUTER] ${msg}`, data ?? '')
  },
  
  sidebar: (msg: string, data?: any) => {
    if (isDev) console.log(`📋 [SIDEBAR] ${msg}`, data ?? '')
  },
  
  error: (msg: string, err?: any) => {
    if (isDev) console.error(`❌ [ERROR] ${msg}`, err ?? '')
  },
  
  warn: (msg: string, data?: any) => {
    if (isDev) console.warn(`⚠️ [WARN] ${msg}`, data ?? '')
  },

  success: (msg: string, data?: any) => {
    if (isDev) console.log(`✅ [SUCCESS] ${msg}`, data ?? '')
  }
}

export default logger