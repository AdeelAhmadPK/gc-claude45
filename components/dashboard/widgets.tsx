"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Widget Types
export type WidgetType =
  | "numbers"
  | "chart"
  | "battery"
  | "timeline"
  | "workload"
  | "table"
  | "calendar"
  | "status"
  | "team"
  | "progress";

interface BaseWidgetProps {
  title: string;
  data: any;
  config?: any;
}

// Numbers Widget - Shows key metrics
export function NumbersWidget({ title, data, config }: BaseWidgetProps) {
  const value = data?.value || 0;
  const previousValue = data?.previousValue || 0;
  const change = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <Card className="p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">{title}</h3>
        {config?.icon && <config.icon className="h-5 w-5 text-gray-400" />}
      </div>
      <div className="space-y-2">
        <p className="text-4xl font-bold">{value.toLocaleString()}</p>
        {previousValue > 0 && (
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {Math.abs(change).toFixed(1)}% {isPositive ? "increase" : "decrease"}
            </span>
          </div>
        )}
        {data?.subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{data.subtitle}</p>
        )}
      </div>
    </Card>
  );
}

// Chart Widget - Line or Bar chart
export function ChartWidget({ title, data, config }: BaseWidgetProps) {
  const chartType = config?.chartType || "line";
  const chartData = data?.data || [];
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <Card className="p-6 h-full">
      <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "line" ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} />
          </LineChart>
        ) : chartType === "bar" ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={colors[0]} />
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => entry.name}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
}

// Battery Widget - Shows capacity/progress
export function BatteryWidget({ title, data, config }: BaseWidgetProps) {
  const percentage = data?.percentage || 0;
  const items = data?.items || [];
  
  const getColor = (pct: number) => {
    if (pct >= 80) return "text-red-600 bg-red-100 dark:bg-red-900";
    if (pct >= 60) return "text-orange-600 bg-orange-100 dark:bg-orange-900";
    if (pct >= 40) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900";
    return "text-green-600 bg-green-100 dark:bg-green-900";
  };

  return (
    <Card className="p-6 h-full">
      <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-4">{title}</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold">{percentage}%</span>
          <Badge className={getColor(percentage)}>{data?.label || "Capacity"}</Badge>
        </div>
        <Progress value={percentage} className="h-3" />
        <div className="space-y-2 mt-4">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// Status Widget - Shows status distribution
export function StatusWidget({ title, data, config }: BaseWidgetProps) {
  const statuses = data?.statuses || [];
  const total = statuses.reduce((sum: number, s: any) => sum + s.count, 0);

  return (
    <Card className="p-6 h-full">
      <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-4">{title}</h3>
      <div className="space-y-3">
        {statuses.map((status: any, idx: number) => {
          const percentage = total > 0 ? (status.count / total) * 100 : 0;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span>{status.label}</span>
                </div>
                <span className="font-medium">
                  {status.count} ({percentage.toFixed(0)}%)
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Team Widget - Shows team workload/capacity
export function TeamWidget({ title, data, config }: BaseWidgetProps) {
  const members = data?.members || [];

  return (
    <Card className="p-6 h-full">
      <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-4">{title}</h3>
      <div className="space-y-3">
        {members.map((member: any, idx: number) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">{member.name}</span>
              </div>
              <span className="text-sm text-gray-500">{member.taskCount} tasks</span>
            </div>
            <Progress value={member.workload} className="h-2" />
            <p className="text-xs text-gray-500">{member.workload}% capacity</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Timeline Widget - Shows upcoming deadlines
export function TimelineWidget({ title, data, config }: BaseWidgetProps) {
  const items = data?.items || [];

  return (
    <Card className="p-6 h-full overflow-y-auto">
      <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item: any, idx: number) => {
          const isOverdue = item.isOverdue;
          const isDueSoon = item.isDueSoon;
          
          return (
            <div
              key={idx}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border",
                isOverdue && "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950",
                isDueSoon && !isOverdue && "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950",
                !isOverdue && !isDueSoon && "border-gray-200 dark:border-gray-700"
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isOverdue ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : isDueSoon ? (
                  <Clock className="h-4 w-4 text-orange-600" />
                ) : (
                  <Calendar className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.dueDate}</p>
              </div>
              {item.assignee && (
                <Badge variant="outline" className="text-xs">
                  {item.assignee}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Progress Widget - Shows overall progress
export function ProgressWidget({ title, data, config }: BaseWidgetProps) {
  const progress = data?.progress || 0;
  const completed = data?.completed || 0;
  const total = data?.total || 0;
  const milestones = data?.milestones || [];

  return (
    <Card className="p-6 h-full">
      <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-4">{title}</h3>
      <div className="space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-blue-500 border-t-transparent animate-[spin_3s_linear_infinite]">
            <div className="text-center">
              <p className="text-3xl font-bold">{progress}%</p>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {completed} of {total} tasks
          </span>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </div>
        {milestones.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Milestones</p>
            {milestones.map((milestone: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span>{milestone.name}</span>
                <Badge variant={milestone.completed ? "default" : "outline"}>
                  {milestone.completed ? "Done" : milestone.dueDate}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// Widget Wrapper Component
interface WidgetProps {
  type: WidgetType;
  title: string;
  data: any;
  config?: any;
}

export function Widget({ type, title, data, config }: WidgetProps) {
  switch (type) {
    case "numbers":
      return <NumbersWidget title={title} data={data} config={config} />;
    case "chart":
      return <ChartWidget title={title} data={data} config={config} />;
    case "battery":
      return <BatteryWidget title={title} data={data} config={config} />;
    case "status":
      return <StatusWidget title={title} data={data} config={config} />;
    case "team":
      return <TeamWidget title={title} data={data} config={config} />;
    case "timeline":
      return <TimelineWidget title={title} data={data} config={config} />;
    case "progress":
      return <ProgressWidget title={title} data={data} config={config} />;
    default:
      return (
        <Card className="p-6 h-full flex items-center justify-center">
          <p className="text-gray-400">Widget type not supported</p>
        </Card>
      );
  }
}
