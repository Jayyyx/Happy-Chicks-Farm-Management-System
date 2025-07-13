"use client"

import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"

const chartData = [
  { date: "2024-01", value: 86 },
  { date: "2024-02", value: 78 },
  { date: "2024-03", value: 82 },
  { date: "2024-04", value: 75 },
  { date: "2024-05", value: 88 },
  { date: "2024-06", value: 90 },
]

const chartConfig = {
  value: {
    label: "Rate (%)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface SampleLineChartProps {
  title: string;
  description: string;
  data?: any[];
  config?: ChartConfig;
  dataKeys?: { x: string; y: string };
  yAxisFormatter?: (value: any) => string;
  yAxisDomain?: [number | string, number | string];
}

export function SampleLineChart({
  title,
  description,
  data = chartData,
  config = chartConfig,
  dataKeys = { x: "date", y: "value" },
  yAxisFormatter = (value) => `${value}%`,
  yAxisDomain = ['dataMin - 5', 'dataMax + 5'],
}: SampleLineChartProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey={dataKeys.x}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="hsl(var(--foreground))"
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--foreground))"
              fontSize={12}
              domain={yAxisDomain}
              tickFormatter={yAxisFormatter}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', fill: "hsl(var(--muted))" }}
              contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)"}}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              content={({ payload }) => (
                <ul className="flex justify-center gap-4 mt-4">
                  {payload?.map((entry: any, index: number) => (
                    <li key={`item-${index}`} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.value}
                    </li>
                  ))}
                </ul>
              )}
            />
            <Line
              type="monotone"
              dataKey={dataKeys.y}
              stroke={config.value.color}
              strokeWidth={2}
              dot={{
                fill: config.value.color,
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
              name={config.value.label}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
