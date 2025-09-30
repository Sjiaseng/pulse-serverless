"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface LoadChartProps {
  loadAverage: number[]
  cores: number
}

export function LoadChart({ loadAverage, cores }: LoadChartProps) {
  const loadData = [
    { name: "1 min", value: loadAverage[0] || 0, color: "#3b82f6" },
    { name: "5 min", value: loadAverage[1] || 0, color: "#8b5cf6" },
    { name: "15 min", value: loadAverage[2] || 0, color: "#06b6d4" },
  ]

  const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">CPU Load Average <span className="text-xs text-red-500"> * Window OS Not Supported</span></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={loadData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value?.toFixed(2)}`}
              >
                {loadData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value.toFixed(2), "Load"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground text-center">
          CPU Cores: {cores} • Load relative to core count
        </div>
      </CardContent>
    </Card>
  )
}
