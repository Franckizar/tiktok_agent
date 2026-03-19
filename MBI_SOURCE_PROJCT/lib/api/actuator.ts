// lib/api/actuator.ts
import { api } from './index'

// Health check response
export interface HealthResponse {
  status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN'
  components?: {
    [key: string]: {
      status: string
      details?: any
    }
  }
  details?: any
}

// Metrics list response
export interface MetricsResponse {
  names: string[]
}

// Individual metric response
export interface MetricDetailResponse {
  name: string
  description?: string
  baseUnit?: string
  measurements: Array<{
    statistic: string
    value: number
  }>
  availableTags?: Array<{
    tag: string
    values: string[]
  }>
}

// Info response
export interface InfoResponse {
  app?: {
    name?: string
    version?: string
    description?: string
  }
  build?: {
    version?: string
    artifact?: string
    name?: string
    time?: string
    group?: string
  }
  git?: {
    branch?: string
    commit?: {
      id?: string
      time?: string
    }
  }
  [key: string]: any
}

// JVM metrics summary for dashboard
export interface JvmMetricsSummary {
  memoryUsed: number
  memoryMax: number
  memoryCommitted: number
  threadsLive: number
  threadsPeak: number
  cpuUsage: number
  gcCount: number
  gcTime: number
}

export const actuatorApi = {
  // Get health status
  getHealth: () =>
    api.get<HealthResponse>('/actuator/health'),

  // Get all available metrics names
  getMetrics: () =>
    api.get<MetricsResponse>('/actuator/metrics'),

  // Get specific metric detail
  getMetricDetail: (metricName: string) =>
    api.get<MetricDetailResponse>(`/actuator/metrics/${metricName}`),

  // Get application info
  getInfo: () =>
    api.get<InfoResponse>('/actuator/info'),

  // Get Prometheus formatted metrics (raw text)
  getPrometheusMetrics: () =>
    api.get<string>('/actuator/prometheus', {
      headers: {
        'Accept': 'text/plain'
      },
      responseType: 'text' as any
    }),

  // Helper: Get JVM metrics summary for dashboard
  getJvmMetricsSummary: async (): Promise<JvmMetricsSummary> => {
    try {
      const [memUsed, memMax, memCommitted, threadsLive, threadsPeak, cpuUsage] = await Promise.all([
        api.get<MetricDetailResponse>('/actuator/metrics/jvm.memory.used'),
        api.get<MetricDetailResponse>('/actuator/metrics/jvm.memory.max'),
        api.get<MetricDetailResponse>('/actuator/metrics/jvm.memory.committed'),
        api.get<MetricDetailResponse>('/actuator/metrics/jvm.threads.live'),
        api.get<MetricDetailResponse>('/actuator/metrics/jvm.threads.peak'),
        api.get<MetricDetailResponse>('/actuator/metrics/process.cpu.usage'),
      ])

      return {
        memoryUsed: memUsed.data.measurements[0]?.value || 0,
        memoryMax: memMax.data.measurements[0]?.value || 0,
        memoryCommitted: memCommitted.data.measurements[0]?.value || 0,
        threadsLive: threadsLive.data.measurements[0]?.value || 0,
        threadsPeak: threadsPeak.data.measurements[0]?.value || 0,
        cpuUsage: (cpuUsage.data.measurements[0]?.value || 0) * 100, // Convert to percentage
        gcCount: 0, // Can be fetched separately if needed
        gcTime: 0,
      }
    } catch (error) {
      console.error('Failed to fetch JVM metrics:', error)
      throw error
    }
  },

  // Helper: Get HTTP metrics summary
  getHttpMetricsSummary: async () => {
    try {
      const response = await api.get<MetricDetailResponse>('/actuator/metrics/http.server.requests')
      return response.data
    } catch (error) {
      console.error('Failed to fetch HTTP metrics:', error)
      throw error
    }
  },
}