"use client"

import { useEffect, useState } from "react"
import { CircularMetricCard } from "./charts/circular-metric"
import { SystemChart } from "./charts/system-chart"
import { LoadChart } from "./charts/load-chart"
import { MemoryChart } from "./charts/memory-chart"
import { Cpu, HardDrive, MemoryStick, Activity, Server, Clock } from "lucide-react"

interface SystemData {
  cpu: {
    usage: number
    cores: number
    loadAverage: number[]
  }
  memory: {
    total: number
    used: number
    free: number
    usage: number
  }
  disk: {
    usage: number
  }
  system: {
    uptime: number
    platform: string
    arch: string
    hostname: string
  }
  timestamp: string
}

export default function SystemDashboard() {
  const [systemData, setSystemData] = useState<SystemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const response = await fetch("/api/system")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        if (!data.system || !data.cpu || !data.memory || !data.disk) {
          throw new Error("Invalid system data structure")
        }

        setSystemData(data)
        setError(null)
      } catch (error) {
        console.error("Failed to fetch system data:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch system data")
      } finally {
        setLoading(false)
      }
    }

    fetchSystemData()
    const interval = setInterval(fetchSystemData, 5000)

    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024)
    return gb.toFixed(1)
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading system information...</p>
        </div>
      </div>
    )
  }

  if (error || !systemData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Server className="h-8 w-8 mx-auto text-destructive" />
          <p className="text-muted-foreground">{error || "Failed to load system information"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6 pb-25 md:pb-0 mb-0 md:mb-12">

        {/* Header for System [Admin] -- done */}

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">System Dashboard</h1>
          {/* Reading Hostnames */}
          <p className="text-muted-foreground"> 
            Real-time monitoring of {systemData.system?.hostname || "Unknown Host"} •{" "}
            {systemData.system?.platform || "Unknown"} {systemData.system?.arch || ""}
          </p>
        </div>

        {/* Grids for Metrices -- done */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <CircularMetricCard
            title="CPU Usage"
            value={systemData.cpu?.usage || 0}
            unit="%"
            usage={systemData.cpu?.usage || 0}
            icon={<Cpu className="h-4 w-4" />}
            color={
              (systemData.cpu?.usage || 0) > 80 ? "danger" : (systemData.cpu?.usage || 0) > 60 ? "warning" : "default"
            }
          />

          <CircularMetricCard
            title="Memory Usage"
            value={Number.parseFloat(formatBytes(systemData.memory?.used || 0))}
            unit="GB"
            usage={systemData.memory?.usage || 0}
            icon={<MemoryStick className="h-4 w-4" />}
            color={
              (systemData.memory?.usage || 0) > 80
                ? "danger"
                : (systemData.memory?.usage || 0) > 60
                  ? "warning"
                  : "default"
            }
          />

          <CircularMetricCard
            title="Disk Usage"
            value={systemData.disk?.usage || 0}
            unit="%"
            usage={systemData.disk?.usage || 0}
            icon={<HardDrive className="h-4 w-4" />}
            color={
              (systemData.disk?.usage || 0) > 80 ? "danger" : (systemData.disk?.usage || 0) > 60 ? "warning" : "default"
            }
          />

          <CircularMetricCard
            title="System Uptime"
            value={0}
            unit={formatUptime(systemData.system?.uptime || 0)}
            icon={<Clock className="h-4 w-4" />}
          />
        </div>

        {/* Performance Chart -- done */}
        <SystemChart />

        {/* System Details -- need fix */}
        <div className="grid gap-6 md:grid-cols-2">
          <LoadChart loadAverage={systemData.cpu?.loadAverage || [0, 0, 0]} cores={systemData.cpu?.cores || 0} />

          <MemoryChart
            total={systemData.memory?.total || 0}
            used={systemData.memory?.used || 0}
            free={systemData.memory?.free || 0}
            usage={systemData.memory?.usage || 0}
          />
        </div>
      </div>
    </div>
  )
}
