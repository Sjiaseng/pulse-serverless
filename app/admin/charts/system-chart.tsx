"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"

interface ChartData {
  time: string
  cpu: number
  memory: number
  disk: number
}

export function SystemChart() {
  const [data, setData] = useState<ChartData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/system")
        const systemData = await response.json()

        const newDataPoint = {
          time: new Date().toLocaleTimeString(),
          cpu: Number(systemData.cpu.usage),
          memory: Number(systemData.memory.usage),
          disk: Number(systemData.disk.usage),
        }

        setData((prev) => {
          const updated = [...prev, newDataPoint]
          return updated.slice(-10)
        })
      } catch (error) {
        console.error("Failed to fetch system data:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 7000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>System Performance Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="time" className="text-xs fill-muted-foreground" />
              <YAxis domain={[0, 100]} className="text-xs fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",   
                  border: "1px solid #e5e7eb", 
                  borderRadius: "0.75rem",     
                }}
              />
                <Line type="monotone" dataKey="cpu" stroke="#3b82f6" dot={true} />
                <Line type="monotone" dataKey="memory" stroke="#ef4444" dot={true} />
                <Line type="monotone" dataKey="disk" stroke="#10b981" dot={true} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
