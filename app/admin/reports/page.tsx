/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { DateRange } from "react-day-picker";

const chartConfig = {
  userGrowth: { label: "User Growth", color: "#f87171" },
  completed: { label: "Completed Quests", color: "#60a5fa" },
  failed: { label: "Failed Quests", color: "#fbbf24" },
  ongoing: { label: "Ongoing Quests", color: "#a78bfa" },
  forumActivity: { label: "Forum Activity", color: "#a78bfa" },
  practitionerRequests: { label: "Practitioner Requests", color: "#34d399" },
};

export default function Reports() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>({
    from: dateRange.from,
    to: dateRange.to,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [reportData, setReportData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const start = format(dateRange.from, "yyyy-MM-dd");
      const end = format(dateRange.to, "yyyy-MM-dd");

      const [usersRes, questsRes, forumRes, practitionersRes] =
        await Promise.all([
          fetch(`/api/analytics/users?startDate=${start}&endDate=${end}`),
          fetch(`/api/analytics/quests?startDate=${start}&endDate=${end}`),
          fetch(`/api/analytics/forums?startDate=${start}&endDate=${end}`),
          fetch(
            `/api/analytics/practitioners?startDate=${start}&endDate=${end}`
          ),
        ]);

      const users = await usersRes.json();
      const quests = await questsRes.json();
      const forum = await forumRes.json();
      const practitioners = await practitionersRes.json();

      const merged = users.map((u: any) => {
        // normalize both dates to yyyy-MM-dd before comparing
        const uDate = format(new Date(u.date), "yyyy-MM-dd");
        const questDay = quests.find(
          (q: any) =>
            format(new Date(q.date), "yyyy-MM-dd") === uDate
        );

        const questStatuses = questDay
          ? Object.fromEntries(
              questDay.statuses.map((s: any) => [s.status, s.count])
            )
          : {};

        return {
          date: uDate,
          userGrowth: u.userGrowth,
          completed: questStatuses.completed || 0,
          failed: questStatuses.failed || 0,
          ongoing: questStatuses.ongoing || 0,
          forumActivity:
            forum.find(
              (f: any) =>
                format(new Date(f.date), "yyyy-MM-dd") === uDate
            )?.forumActivity || 0,
          practitionerRequests:
            practitioners.find((p: any) => {
              if (!p.date) return false; 
              const pDate = format(new Date(p.date), "yyyy-MM-dd");
              return pDate === uDate;
            })?.count || 0
        };
      });
      setReportData(merged);

      const pie = practitioners.map((p: any, idx: number) => ({
        name: p.status,
        value: Number(p.count),
        color: ["#0088FE", "#00C49F", "#FF8042"][idx % 3],
      }));
      setPieData(pie);
    };

    fetchData();
  }, [dateRange]);

  const filteredData = useMemo(() => {
    return reportData.filter((item) => {
      const itemDate = new Date(item.date);
      return isWithinInterval(itemDate, {
        start: dateRange.from,
        end: dateRange.to,
      });
    });
  }, [dateRange, reportData]);

  return (
    <div className="p-6 max-w-7xl mx-auto pb-25 md:pb-0 mb-0 md:mb-12">
      {/* report header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-gray-900">
            Reports
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {format(dateRange.from, "MMM dd, yyyy")} -{" "}
            {format(dateRange.to, "MMM dd, yyyy")}
          </p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Button
            variant="default"
            className="rounded-xl"
            onClick={() => {
              setTempDateRange({ from: dateRange.from, to: dateRange.to });
              setIsDialogOpen(true);
            }}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      {/* dialog for date range selection */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
          </DialogHeader>
          <div className="-ml-4 overflow-x-auto">
            <Calendar
              mode="range"
              numberOfMonths={2}
              defaultMonth={tempDateRange?.from || dateRange.from}
              selected={tempDateRange}
              onSelect={(range) => setTempDateRange(range)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (tempDateRange?.from && tempDateRange?.to) {
                  setDateRange({
                    from: tempDateRange.from,
                    to: tempDateRange.to,
                  });
                  setIsDialogOpen(false);
                }
              }}
              className="bg-[#F5BE66] hover:bg-[#E5A855] text-white"
              disabled={!tempDateRange?.from || !tempDateRange?.to}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* all charts section */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        format(new Date(value), "MMM dd")
                      }
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="userGrowth"
                      stroke={chartConfig.userGrowth.color}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quest Completion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), "MMM dd")}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completed" stackId="a" fill={chartConfig.completed.color} />
                    <Bar dataKey="failed" stackId="a" fill={chartConfig.failed.color} />
                    <Bar dataKey="ongoing" stackId="a" fill={chartConfig.ongoing.color} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Forum Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        format(new Date(value), "MMM dd")
                      }
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="forumActivity"
                      stroke={chartConfig.forumActivity.color}
                      fill={chartConfig.forumActivity.color}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Practitioner Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
