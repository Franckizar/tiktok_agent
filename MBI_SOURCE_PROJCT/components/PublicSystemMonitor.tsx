'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  Server,
  Cpu,
  HardDrive,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
  Zap,
} from 'lucide-react'
import axios from 'axios'

// Standalone API client (no authentication required)
const actuatorClient = axios.create({
  baseURL: 'http://localhost:8088',
  headers: {
    'Content-Type': 'application/json',
  },
})

interface HealthResponse {
  status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN'
  components?: {
    [key: string]: {
      status: string
      details?: any
    }
  }
}

interface MetricDetailResponse {
  name: string
  measurements: Array<{
    statistic: string
    value: number
  }>
}

interface JvmMetricsSummary {
  memoryUsed: number
  memoryMax: number
  memoryCommitted: number
  threadsLive: number
  threadsPeak: number
  cpuUsage: number
}

export default function PublicSystemMonitor() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [jvmMetrics, setJvmMetrics] = useState<JvmMetricsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setLastRefresh(new Date())
    fetchData()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchData()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchData = async () => {
    setIsLoading(true)
    setError('')
    try {
      // Fetch health
      const healthResponse = await actuatorClient.get<HealthResponse>('/actuator/health')
      setHealth(healthResponse.data)

      // Fetch JVM metrics in parallel
      const [memUsed, memMax, memCommitted, threadsLive, threadsPeak, cpuUsage] = await Promise.all([
        actuatorClient.get<MetricDetailResponse>('/actuator/metrics/jvm.memory.used'),
        actuatorClient.get<MetricDetailResponse>('/actuator/metrics/jvm.memory.max'),
        actuatorClient.get<MetricDetailResponse>('/actuator/metrics/jvm.memory.committed'),
        actuatorClient.get<MetricDetailResponse>('/actuator/metrics/jvm.threads.live'),
        actuatorClient.get<MetricDetailResponse>('/actuator/metrics/jvm.threads.peak'),
        actuatorClient.get<MetricDetailResponse>('/actuator/metrics/process.cpu.usage'),
      ])

      setJvmMetrics({
        memoryUsed: memUsed.data.measurements[0]?.value || 0,
        memoryMax: memMax.data.measurements[0]?.value || 0,
        memoryCommitted: memCommitted.data.measurements[0]?.value || 0,
        threadsLive: threadsLive.data.measurements[0]?.value || 0,
        threadsPeak: threadsPeak.data.measurements[0]?.value || 0,
        cpuUsage: (cpuUsage.data.measurements[0]?.value || 0) * 100,
      })

      setLastRefresh(new Date())
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch system metrics')
      console.error('Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return mb.toFixed(2) + ' MB'
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'UP':
        return 'bg-green-500'
      case 'DOWN':
        return 'bg-red-500'
      case 'OUT_OF_SERVICE':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'UP':
        return <CheckCircle className="h-5 w-5" />
      case 'DOWN':
        return <XCircle className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="h-10 w-10 text-blue-600" />
                System Monitor
              </h1>
              <p className="text-gray-600 mt-2">Real-time application health and performance metrics</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Last updated: {isMounted && lastRefresh ? lastRefresh.toLocaleTimeString() : '--:--:--'}
              </div>
              <Button
                onClick={fetchData}
                disabled={isLoading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Refresh</span>
              </Button>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                size="sm"
                variant={autoRefresh ? 'default' : 'outline'}
                className={autoRefresh ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <Zap className={`h-4 w-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
                <span className="ml-2">Auto Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jvm">JVM Metrics</TabsTrigger>
            <TabsTrigger value="health">Health Details</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {/* Health Status Card */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className={`${getHealthStatusColor(health?.status || '')} p-2 rounded-full text-white`}>
                        {getHealthStatusIcon(health?.status || '')}
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{health?.status || 'UNKNOWN'}</div>
                        <div className="text-xs text-gray-600">Application Status</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CPU Usage Card */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    CPU Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  ) : (
                    <div>
                      <div className="text-2xl font-bold">{jvmMetrics?.cpuUsage.toFixed(2)}%</div>
                      <Progress value={jvmMetrics?.cpuUsage || 0} className="mt-2" />
                      <div className="text-xs text-gray-600 mt-1">Process CPU Usage</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Memory Usage Card */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  ) : (
                    <div>
                      <div className="text-2xl font-bold">{formatBytes(jvmMetrics?.memoryUsed || 0)}</div>
                      <Progress
                        value={((jvmMetrics?.memoryUsed || 0) / (jvmMetrics?.memoryMax || 1)) * 100}
                        className="mt-2"
                      />
                      <div className="text-xs text-gray-600 mt-1">
                        Max: {formatBytes(jvmMetrics?.memoryMax || 0)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Threads Card */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Active Threads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  ) : (
                    <div>
                      <div className="text-2xl font-bold">{jvmMetrics?.threadsLive || 0}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Peak: {jvmMetrics?.threadsPeak || 0}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detailed Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  System Metrics Summary
                </CardTitle>
                <CardDescription>Detailed runtime metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium">Memory Used</span>
                        <span className="text-sm font-bold">{formatBytes(jvmMetrics?.memoryUsed || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium">Memory Committed</span>
                        <span className="text-sm font-bold">{formatBytes(jvmMetrics?.memoryCommitted || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium">Memory Max</span>
                        <span className="text-sm font-bold">{formatBytes(jvmMetrics?.memoryMax || 0)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">Live Threads</span>
                        <span className="text-sm font-bold">{jvmMetrics?.threadsLive || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">Peak Threads</span>
                        <span className="text-sm font-bold">{jvmMetrics?.threadsPeak || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">CPU Usage</span>
                        <span className="text-sm font-bold">{jvmMetrics?.cpuUsage.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* JVM Metrics Tab */}
          <TabsContent value="jvm">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  JVM Performance Metrics
                </CardTitle>
                <CardDescription>Java Virtual Machine runtime statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Memory Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        Memory Management
                      </h3>
                      <div className="grid gap-3">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Heap Memory Used</span>
                            <span className="text-lg font-bold">{formatBytes(jvmMetrics?.memoryUsed || 0)}</span>
                          </div>
                          <Progress
                            value={((jvmMetrics?.memoryUsed || 0) / (jvmMetrics?.memoryMax || 1)) * 100}
                            className="h-2"
                          />
                          <div className="text-xs text-gray-600 mt-1">
                            {(((jvmMetrics?.memoryUsed || 0) / (jvmMetrics?.memoryMax || 1)) * 100).toFixed(1)}% of{' '}
                            {formatBytes(jvmMetrics?.memoryMax || 0)}
                          </div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Memory Committed</span>
                            <span className="text-lg font-bold">{formatBytes(jvmMetrics?.memoryCommitted || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Thread Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Thread Activity
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Live Threads</span>
                            <span className="text-2xl font-bold">{jvmMetrics?.threadsLive || 0}</span>
                          </div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Peak Threads</span>
                            <span className="text-2xl font-bold">{jvmMetrics?.threadsPeak || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CPU Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        CPU Performance
                      </h3>
                      <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Process CPU Usage</span>
                          <span className="text-2xl font-bold">{jvmMetrics?.cpuUsage.toFixed(2)}%</span>
                        </div>
                        <Progress value={jvmMetrics?.cpuUsage || 0} className="h-2" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Details Tab */}
          <TabsContent value="health">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Health Check Details
                </CardTitle>
                <CardDescription>Component-level health status</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Overall Status */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`${getHealthStatusColor(health?.status || '')} p-3 rounded-full text-white`}>
                            {getHealthStatusIcon(health?.status || '')}
                          </div>
                          <div>
                            <div className="text-xl font-bold">Overall Status</div>
                            <div className="text-sm text-gray-600">Application health</div>
                          </div>
                        </div>
                        <Badge className={`${getHealthStatusColor(health?.status || '')} text-white text-lg px-4 py-2`}>
                          {health?.status || 'UNKNOWN'}
                        </Badge>
                      </div>
                    </div>

                    {/* Components */}
                    {health?.components && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Component Status</h3>
                        {Object.entries(health.components).map(([key, value]) => (
                          <div key={key} className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`${getHealthStatusColor(value.status)} p-2 rounded-full text-white`}>
                                  {getHealthStatusIcon(value.status)}
                                </div>
                                <div>
                                  <div className="font-semibold capitalize">{key.replace(/_/g, ' ')}</div>
                                  {value.details && (
                                    <div className="text-xs text-gray-600 mt-1">
                                      <pre className="whitespace-pre-wrap">{JSON.stringify(value.details, null, 2)}</pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge variant={value.status === 'UP' ? 'default' : 'destructive'}>
                                {value.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 