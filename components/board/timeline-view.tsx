"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Calendar,
  Flag,
  GitBranch,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  differenceInDays,
  parseISO,
  isBefore,
  isAfter,
} from "date-fns";

interface Column {
  id: string;
  name: string;
  type: string;
  settings?: Record<string, any>;
}

interface ColumnValue {
  id: string;
  columnId: string;
  value: any;
  column: Column;
}

interface Item {
  id: string;
  name: string;
  position: number;
  priority?: string;
  isMilestone?: boolean;
  columnValues: ColumnValue[];
  dependencies?: Array<{
    id: string;
    dependsOnId: string;
  }>;
}

interface Group {
  id: string;
  name: string;
  position: number;
  items: Item[];
}

interface TimelineViewProps {
  groups: Group[];
  onItemClick?: (itemId: string) => void;
}

type ZoomLevel = "day" | "week" | "month" | "quarter";

const ZOOM_CONFIGS = {
  day: { unit: "days", count: 30, format: "MMM dd" },
  week: { unit: "weeks", count: 12, format: "MMM dd" },
  month: { unit: "months", count: 12, format: "MMM yyyy" },
  quarter: { unit: "months", count: 12, format: "MMM yyyy" },
};

export function TimelineView({ groups, onItemClick }: TimelineViewProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [showMilestones, setShowMilestones] = useState(true);
  const [showDependencies, setShowDependencies] = useState(true);
  const [conflictingItems, setConflictingItems] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Find date/timeline columns
  const dateColumns = groups[0]?.items[0]?.columnValues.filter(
    (cv) => cv.column.type === "DATE" || cv.column.type === "DUE_DATE" || cv.column.type === "TIMELINE"
  ) || [];

  // Generate time periods based on zoom level
  const getTimePeriods = () => {
    const config = ZOOM_CONFIGS[zoomLevel];
    const startDate = startOfMonth(currentDate);
    let endDate: Date;

    if (zoomLevel === "day") {
      endDate = addDays(startDate, config.count);
      return eachDayOfInterval({ start: startDate, end: endDate });
    } else if (zoomLevel === "week") {
      endDate = addWeeks(startDate, config.count);
      return eachWeekOfInterval({ start: startDate, end: endDate });
    } else {
      endDate = addMonths(startDate, config.count);
      return eachMonthOfInterval({ start: startDate, end: endDate });
    }
  };

  const periods = getTimePeriods();
  const totalWidth = periods.length * (zoomLevel === "day" ? 40 : zoomLevel === "week" ? 80 : 120);

  // Detect scheduling conflicts
  useEffect(() => {
    const conflicts = new Set<string>();
    const allItems = groups.flatMap(g => g.items);
    
    allItems.forEach(item => {
      if (item.dependencies && item.dependencies.length > 0) {
        item.dependencies.forEach(dep => {
          const dependsOn = allItems.find(i => i.id === dep.dependsOnId);
          if (!dependsOn) return;
          
          const itemDates = getItemDates(item);
          const depDates = getItemDates(dependsOn);
          
          if (itemDates && depDates && isBefore(itemDates.start, depDates.end)) {
            conflicts.add(item.id);
          }
        });
      }
    });
    
    setConflictingItems(conflicts);
  }, [groups]);

  // Get start and end dates for an item
  const getItemDates = (item: Item): { start: Date; end: Date } | null => {
    const timelineValue = item.columnValues.find((cv) => cv.column.type === "TIMELINE")?.value;
    const dateValue = item.columnValues.find((cv) => cv.column.type === "DATE" || cv.column.type === "DUE_DATE")?.value;

    if (timelineValue && timelineValue.startDate && timelineValue.endDate) {
      return {
        start: parseISO(timelineValue.startDate),
        end: parseISO(timelineValue.endDate)
      };
    } else if (dateValue) {
      const start = parseISO(dateValue);
      return { start, end: addDays(start, 1) };
    }
    return null;
  };

  // Calculate position and width for timeline bars
  const getBarDimensions = (item: Item) => {
    const dates = getItemDates(item);
    if (!dates) return null;

    const { start: startDate, end: endDate } = dates;
    const viewStart = periods[0];
    const viewEnd = periods[periods.length - 1];

    // Calculate left position
    const daysFromStart = differenceInDays(startDate, viewStart);
    const unitWidth = totalWidth / periods.length;
    const left = Math.max(0, (daysFromStart / (zoomLevel === "day" ? 1 : zoomLevel === "week" ? 7 : 30)) * unitWidth);

    // Calculate width
    const duration = differenceInDays(endDate, startDate);
    const width = Math.max(unitWidth * 0.8, (duration / (zoomLevel === "day" ? 1 : zoomLevel === "week" ? 7 : 30)) * unitWidth);

    // Get status color
    const statusValue = item.columnValues.find((cv) => cv.column.type === "STATUS")?.value;
    let color = statusValue?.color || "#3b82f6";

    // Priority colors override
    if (item.priority === "URGENT") color = "#ef4444";
    else if (item.priority === "HIGH") color = "#f97316";
    else if (item.priority === "MEDIUM") color = "#eab308";
    else if (item.priority === "LOW") color = "#22c55e";

    // Conflict warning
    const hasConflict = conflictingItems.has(item.id);

    return { left, width, color, hasConflict, dates };
  };

  const handleZoomIn = () => {
    const levels: ZoomLevel[] = ["quarter", "month", "week", "day"];
    const currentIndex = levels.indexOf(zoomLevel);
    if (currentIndex < levels.length - 1) {
      setZoomLevel(levels[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const levels: ZoomLevel[] = ["quarter", "month", "week", "day"];
    const currentIndex = levels.indexOf(zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(levels[currentIndex - 1]);
    }
  };

  const navigatePrevious = () => {
    if (zoomLevel === "day") {
      setCurrentDate(addMonths(currentDate, -1));
    } else if (zoomLevel === "week") {
      setCurrentDate(addMonths(currentDate, -3));
    } else {
      setCurrentDate(addMonths(currentDate, -12));
    }
  };

  const navigateNext = () => {
    if (zoomLevel === "day") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (zoomLevel === "week") {
      setCurrentDate(addMonths(currentDate, 3));
    } else {
      setCurrentDate(addMonths(currentDate, 12));
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const todayPosition = totalWidth / 2;
      scrollRef.current.scrollLeft = todayPosition - scrollRef.current.clientWidth / 2;
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={navigateToday}>
            <Calendar className="h-4 w-4 mr-1" />
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant={showDependencies ? "default" : "outline"}
            size="sm"
            onClick={() => setShowDependencies(!showDependencies)}
          >
            <GitBranch className="h-4 w-4 mr-1" />
            Dependencies
          </Button>
          <Button
            variant={showMilestones ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMilestones(!showMilestones)}
          >
            <Flag className="h-4 w-4 mr-1" />
            Milestones
          </Button>
          <Button
            variant={showCriticalPath ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCriticalPath(!showCriticalPath)}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Critical Path
          </Button>
          {conflictingItems.size > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {conflictingItems.size} Conflicts
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {format(periods[0], "MMM yyyy")} - {format(periods[periods.length - 1], "MMM yyyy")}
          </span>
          <div className="flex items-center space-x-2 ml-4">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel === "quarter"}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize w-16 text-center">
              {zoomLevel}
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel === "day"}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Fixed left column - Item names */}
          <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Items</h3>
            </div>
            {groups.map((group) => (
              <div key={group.id}>
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{group.name}</h4>
                </div>
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => onItemClick?.(item.id)}
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{item.name}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Scrollable timeline area */}
          <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-auto">
            <div style={{ width: totalWidth }} className="relative">
              {/* Timeline header */}
              <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 flex">
                {periods.map((period, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700 px-2 py-2"
                    style={{ width: zoomLevel === "day" ? 40 : zoomLevel === "week" ? 80 : 120 }}
                  >
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
                      {format(period, ZOOM_CONFIGS[zoomLevel].format)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Timeline bars */}
              {groups.map((group) => (
                <div key={group.id}>
                  <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700" style={{ height: 33 }}>
                    {/* Group header spacer */}
                  </div>
                  {group.items.map((item) => {
                    const dimensions = getBarDimensions(item);
                    return (
                      <div
                        key={item.id}
                        className="relative border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        style={{ height: 49 }}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        {/* Timeline grid lines */}
                        <div className="absolute inset-0 flex">
                          {periods.map((_, index) => (
                            <div
                              key={index}
                              className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700"
                              style={{ width: zoomLevel === "day" ? 40 : zoomLevel === "week" ? 80 : 120 }}
                            />
                          ))}
                        </div>

                        {/* Timeline bar */}
                        {dimensions && (
                          <>
                            {/* Milestone indicator */}
                            {item.isMilestone && showMilestones ? (
                              <div
                                className="absolute top-1/2 transform -translate-y-1/2 cursor-pointer"
                                style={{ left: dimensions.left }}
                                onClick={() => onItemClick?.(item.id)}
                              >
                                <Flag 
                                  className="h-6 w-6" 
                                  style={{ color: dimensions.color }}
                                  fill={dimensions.color}
                                />
                                <span className="absolute top-7 left-0 text-xs font-medium whitespace-nowrap bg-white dark:bg-gray-800 px-1 rounded shadow">
                                  {item.name}
                                </span>
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  "absolute top-1/2 transform -translate-y-1/2 h-6 rounded cursor-pointer transition-all",
                                  hoveredItem === item.id ? "h-8 shadow-lg z-10" : "h-6",
                                  dimensions.hasConflict && "ring-2 ring-red-500 ring-offset-1"
                                )}
                                style={{
                                  left: dimensions.left,
                                  width: dimensions.width,
                                  backgroundColor: dimensions.color,
                                  opacity: hoveredItem === item.id ? 1 : 0.85,
                                }}
                                onClick={() => onItemClick?.(item.id)}
                              >
                                <div className="flex items-center justify-between h-full px-2">
                                  <span className="text-xs text-white font-medium truncate flex-1">
                                    {item.name}
                                  </span>
                                  {dimensions.hasConflict && (
                                    <AlertTriangle className="h-3 w-3 text-white flex-shrink-0 ml-1" />
                                  )}
                                </div>
                                
                                {/* Progress indicator (if available) */}
                                {hoveredItem === item.id && (
                                  <div className="absolute -bottom-6 left-0 right-0 bg-white dark:bg-gray-800 text-xs p-1 rounded shadow-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between mb-1">
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {format(dimensions.dates.start, "MMM d")}
                                      </span>
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {format(dimensions.dates.end, "MMM d")}
                                      </span>
                                    </div>
                                    {item.priority && (
                                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                                        {item.priority}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Dependency arrows */}
                            {showDependencies && item.dependencies && item.dependencies.map((dep) => {
                              const dependsOn = groups.flatMap(g => g.items).find(i => i.id === dep.dependsOnId);
                              if (!dependsOn) return null;
                              
                              const depDimensions = getBarDimensions(dependsOn);
                              if (!depDimensions) return null;

                              // Calculate SVG path for arrow
                              const startX = depDimensions.left + depDimensions.width;
                              const startY = 0; // Will be adjusted by parent positioning
                              const endX = dimensions.left;
                              const endY = 0;

                              return (
                                <svg
                                  key={dep.id}
                                  className="absolute pointer-events-none"
                                  style={{
                                    left: 0,
                                    top: 0,
                                    width: totalWidth,
                                    height: '100%',
                                    overflow: 'visible'
                                  }}
                                >
                                  <defs>
                                    <marker
                                      id={`arrowhead-${dep.id}`}
                                      markerWidth="10"
                                      markerHeight="10"
                                      refX="9"
                                      refY="3"
                                      orient="auto"
                                    >
                                      <polygon
                                        points="0 0, 10 3, 0 6"
                                        fill="#6b7280"
                                      />
                                    </marker>
                                  </defs>
                                  <line
                                    x1={startX}
                                    y1="50%"
                                    x2={endX}
                                    y2="50%"
                                    stroke="#6b7280"
                                    strokeWidth="2"
                                    markerEnd={`url(#arrowhead-${dep.id})`}
                                    strokeDasharray={dimensions.hasConflict ? "4 4" : "none"}
                                  />
                                </svg>
                              );
                            })}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Today indicator */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                style={{
                  left: (() => {
                    const today = new Date();
                    const daysFromStart = differenceInDays(today, periods[0]);
                    const unitWidth = totalWidth / periods.length;
                    return (daysFromStart / (zoomLevel === "day" ? 1 : zoomLevel === "week" ? 7 : 30)) * unitWidth;
                  })(),
                }}
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                  <div className="bg-red-500 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                    Today
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
