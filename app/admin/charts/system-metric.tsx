"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface SystemMetricCardProps {
  title: string
  value: number
  unit: string
  usage?: number
  icon: React.ReactNode
  color?: "default" | "warning" | "danger"
}

export function SystemMetricCard({ title, value, unit, usage, icon, color = "default" }: SystemMetricCardProps) {
  const getColor = () => {
    switch (color) {
      case "warning":
        return "#eab308" // yellow-500
      case "danger":
        return "#ef4444" // red-500
      default:
        return "#3b82f6" // blue-500
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case "warning":
        return "text-yellow-600 dark:text-yellow-400"
      case "danger":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-blue-600 dark:text-blue-400"
    }
  }

  const chartData =
    usage !== undefined
      ? [
          { name: "used", value: usage },
          { name: "free", value: 100 - usage },
        ]
      : []

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={getColorClasses()}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {value.toLocaleString()} {unit}
            </div>
            {usage !== undefined && <p className="text-xs text-muted-foreground mt-1">{usage.toFixed(1)}% used</p>}
          </div>
          {usage !== undefined && (
            <div className="w-16 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={30}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                  >
                    <Cell fill={getColor()} />
                    <Cell fill="hsl(var(--muted))" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
