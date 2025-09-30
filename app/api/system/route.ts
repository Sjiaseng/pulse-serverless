import { NextResponse } from "next/server"
import os from "os"
import si from "systeminformation" // npm install systeminformation

export async function GET() {
  try {
    // CPU
    const cpuLoad = await si.currentLoad()
    const cpuUsage = cpuLoad.currentLoad

    // Memory
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    const memoryUsage = (usedMemory / totalMemory) * 100

    // Disk
    const fsData = await si.fsSize()
    const disk = fsData[0]
    const diskUsage = (disk.used / disk.size) * 100

    // Load averages
    const loadAverage = os.loadavg()

    // Uptime
    const uptime = os.uptime()

    return NextResponse.json({
      cpu: {
        usage: Math.round(cpuUsage * 100) / 100,
        cores: os.cpus().length,
        loadAverage: loadAverage.map((n) => Math.round(n * 100) / 100),
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usage: Math.round(memoryUsage * 100) / 100,
      },
      disk: {
        usage: Math.round(diskUsage * 100) / 100,
      },
      system: {
        uptime,
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error("System API error:", err)
    return NextResponse.json({ error: "Failed to fetch system data" }, { status: 500 })
  }
}
