"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Column {
  id: string;
  title: string;
  type: string;
  settings?: any;
}

interface Item {
  id: string;
  name: string;
  priority?: "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
  columnValues?: any[];
}

interface ChartWidgetProps {
  items: Item[];
  columns: Column[];
  type: "status" | "priority" | "timeline";
  title: string;
}

export function ChartWidget({ items, columns, type, title }: ChartWidgetProps) {
  const chartData = useMemo(() => {
    if (type === "status") {
      const statusColumn = columns.find((col) => col.type === "STATUS");
      if (!statusColumn || !statusColumn.settings?.labels) return [];

      const labels = statusColumn.settings.labels as Array<{
        id: string;
        label: string;
        color: string;
      }>;

      return labels.map((label) => {
        const count = items.filter((item) => {
          const statusValue = item.columnValues?.find(
            (cv: any) => cv.columnId === statusColumn.id
          );
          return statusValue?.value?.id === label.id;
        }).length;

        return {
          name: label.label,
          value: count,
          color: label.color,
        };
      });
    }

    if (type === "priority") {
      const priorities = ["URGENT", "HIGH", "MEDIUM", "LOW", "NONE"];
      const colors = {
        URGENT: "#EF4444",
        HIGH: "#F97316",
        MEDIUM: "#EAB308",
        LOW: "#22C55E",
        NONE: "#94A3B8",
      };

      return priorities.map((priority) => ({
        name: priority,
        value: items.filter((item) => item.priority === priority).length,
        color: colors[priority as keyof typeof colors],
      }));
    }

    if (type === "timeline") {
      // Group items by month based on due date
      const itemsByMonth = items.reduce((acc, item) => {
        if (!item.columnValues) return acc;

        const dateColumn = columns.find((col) => col.type === "DATE");
        if (!dateColumn) return acc;

        const dateValue = item.columnValues.find((cv: any) => cv.columnId === dateColumn.id);
        if (!dateValue?.value) return acc;

        const date = new Date(dateValue.value);
        const monthKey = date.toLocaleString("default", { month: "short", year: "numeric" });

        if (!acc[monthKey]) {
          acc[monthKey] = 0;
        }
        acc[monthKey]++;

        return acc;
      }, {} as Record<string, number>);

      return Object.entries(itemsByMonth).map(([month, count]) => ({
        name: month,
        value: count,
        color: "#3B82F6",
      }));
    }

    return [];
  }, [items, columns, type]);

  const totalItems = chartData.reduce((sum, item) => sum + item.value, 0);

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#3B82F6">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <Badge variant="secondary">{totalItems} items</Badge>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No data available
        </div>
      ) : type === "timeline" ? (
        renderBarChart()
      ) : (
        renderPieChart()
      )}

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-700 dark:text-gray-300">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
