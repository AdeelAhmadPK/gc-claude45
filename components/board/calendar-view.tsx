"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isToday,
  startOfWeek,
  endOfWeek,
  addDays,
  startOfDay,
  isBefore,
  isAfter
} from "date-fns";
import { cn } from "@/lib/utils";

interface Column {
  id: string;
  title: string;
  type: string;
  settings?: any;
}

interface Item {
  id: string;
  name: string;
  position: number;
  priority?: "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
  dueDate?: string | null;
  columnValues?: any[];
  assignments?: Array<{
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }>;
}

type ViewMode = "month" | "week" | "day";

interface CalendarViewProps {
  boardId: string;
  workspaceId: string;
  items: Item[];
  columns: Column[];
  onItemClick: (itemId: string) => void;
}

export function CalendarView({
  boardId,
  workspaceId,
  items,
  columns,
  onItemClick,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [dateColumn, setDateColumn] = useState<Column | null>(null);
  const [itemsByDate, setItemsByDate] = useState<Map<string, Item[]>>(new Map());

  useEffect(() => {
    // Find the first DATE or DUE_DATE column
    const dateCol = columns.find(col => 
      col.type === "DATE" || col.type === "DUE_DATE" || col.type === "TIMELINE"
    );
    setDateColumn(dateCol || null);
  }, [columns]);

  useEffect(() => {
    if (!dateColumn) return;

    // Group items by their date value
    const grouped = new Map<string, Item[]>();
    
    items.forEach(item => {
      const dateValue = item.columnValues?.find(cv => cv.columnId === dateColumn.id);
      if (dateValue && dateValue.value) {
        let dateStr: string;
        
        if (dateColumn.type === "TIMELINE") {
          // For timeline, use start date
          dateStr = dateValue.value.startDate;
        } else {
          dateStr = dateValue.value;
        }
        
        if (dateStr) {
          const key = format(new Date(dateStr), "yyyy-MM-dd");
          const existing = grouped.get(key) || [];
          grouped.set(key, [...existing, item]);
        }
      }
    });

    setItemsByDate(grouped);
  }, [items, dateColumn]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700";
      case "HIGH":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700";
      case "MEDIUM":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700";
      case "LOW":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700";
      default:
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700";
    }
  };

  const getDaysToShow = () => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      return [currentDate];
    }
  };

  const days = getDaysToShow();
  const startDay = viewMode === "month" ? startOfMonth(currentDate).getDay() : 0;
  const paddingDays = viewMode === "month" ? Array(startDay).fill(null) : [];

  const nextPeriod = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prevPeriod = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const today = () => setCurrentDate(new Date());

  const getViewTitle = () => {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy");
    if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  };

  if (!dateColumn) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Date Column</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add a Date, Due Date, or Timeline column to use Calendar view
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Calendar Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">{getViewTitle()}</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={prevPeriod}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={today}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={nextPeriod}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={viewMode} onValueChange={(val) => setViewMode(val as ViewMode)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {dateColumn.title}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-6 overflow-auto">
        <div className={cn(
          "grid gap-2",
          viewMode === "month" && "grid-cols-7",
          viewMode === "week" && "grid-cols-7",
          viewMode === "day" && "grid-cols-1"
        )}>
          {/* Day Headers */}
          {(viewMode === "month" || viewMode === "week") && 
            ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div
                key={day}
                className="text-center font-semibold text-sm text-gray-600 dark:text-gray-400 pb-2"
              >
                {day}
              </div>
            ))}

          {/* Padding for days before month starts */}
          {paddingDays.map((_, idx) => (
            <div key={`pad-${idx}`} className="min-h-[120px]" />
          ))}

          {/* Calendar Days */}
          {days.map(day => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayItems = itemsByDate.get(dateKey) || [];
            const isCurrentDay = isToday(day);
            const maxItemsToShow = viewMode === "day" ? 10 : viewMode === "week" ? 5 : 3;

            return (
              <Card
                key={dateKey}
                className={cn(
                  viewMode === "day" ? "min-h-[500px]" : viewMode === "week" ? "min-h-[200px]" : "min-h-[120px]",
                  "p-2",
                  isCurrentDay && "border-2 border-blue-500 bg-blue-50 dark:bg-blue-950",
                  !isCurrentDay && "bg-white dark:bg-gray-800",
                  !isSameMonth(day, currentDate) && viewMode === "month" && "opacity-40"
                )}
              >
                <div className="flex flex-col h-full">
                  {/* Day Number */}
                  <div className={cn(
                    "text-sm font-semibold mb-1",
                    isCurrentDay 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-900 dark:text-gray-100"
                  )}>
                    {viewMode === "day" ? format(day, "EEEE, MMMM d") : format(day, "d")}
                  </div>

                  {/* Items for this day */}
                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {dayItems.slice(0, maxItemsToShow).map(item => (
                      <div
                        key={item.id}
                        onClick={() => onItemClick(item.id)}
                        className={cn(
                          "text-xs p-2 rounded border cursor-pointer hover:shadow-md transition-shadow",
                          getPriorityColor(item.priority)
                        )}
                      >
                        <div className="font-medium truncate mb-1" title={item.name}>
                          {item.name}
                        </div>
                        {viewMode !== "month" && item.assignments && item.assignments.length > 0 && (
                          <div className="flex -space-x-1 mt-1">
                            {item.assignments.slice(0, 3).map((assignment) => (
                              <Avatar key={assignment.user.id} className="w-4 h-4 border border-white dark:border-gray-800">
                                <AvatarImage src={assignment.user.image || undefined} />
                                <AvatarFallback className="text-[8px]">
                                  {assignment.user.name?.[0] || assignment.user.email[0]}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {dayItems.length > maxItemsToShow && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                        +{dayItems.length - maxItemsToShow} more
                      </div>
                    )}
                  </div>

                  {/* Add button for day/week view */}
                  {viewMode !== "month" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add item
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
