"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface MemoryChartProps {
  total: number
  used: number
  free: number
  usage: number
}

export function MemoryChart({ total, used, free, usage }: MemoryChartProps) {
  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024)
    return gb.toFixed(1)
  }

  const memoryData = [
    { name: "Used", value: used, color: "#ef4444", percentage: usage },
    { name: "Free", value: free, color: "#22c55e", percentage: 100 - usage },
  ]

  const COLORS = ["#ef4444", "#22c55e"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Memory Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={memoryData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
              >
                {memoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatBytes(value) + " GB", "Memory"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span>{formatBytes(total)} GB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Used:</span>
            <span className="text-red-600">{formatBytes(used)} GB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Free:</span>
            <span className="text-green-600">{formatBytes(free)} GB</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
