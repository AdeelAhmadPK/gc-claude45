"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, CheckSquare, Hash, Type, User, Tag } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { InlineProgress } from "@/components/ui/progress-bar";
import { format } from "date-fns";

interface ColumnCellProps {
  type: string;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
}

export function ColumnCell({ type, value, onChange, onBlur }: ColumnCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
    onBlur?.();
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const renderEditor = () => {
    switch (type) {
      case "TEXT":
      case "LONG_TEXT":
        return (
          <Input
            value={tempValue || ""}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            autoFocus
            className="h-8"
          />
        );

      case "NUMBER":
        return (
          <Input
            type="number"
            value={tempValue || ""}
            onChange={(e) => setTempValue(Number(e.target.value))}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            autoFocus
            className="h-8"
          />
        );

      case "PROGRESS":
      case "PERCENTAGE":
        return (
          <Input
            type="number"
            min="0"
            max="100"
            value={tempValue || ""}
            onChange={(e) => setTempValue(Math.min(100, Math.max(0, Number(e.target.value))))}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            autoFocus
            className="h-8"
          />
        );

      case "CHECKBOX":
        return (
          <button
            onClick={() => {
              onChange(!value);
              setIsEditing(false);
            }}
            className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {value ? (
              <CheckSquare className="h-4 w-4 text-blue-600" />
            ) : (
              <div className="h-4 w-4 border-2 border-gray-400 rounded" />
            )}
          </button>
        );

      case "PRIORITY":
        return (
          <Select
            value={tempValue || ""}
            onValueChange={(val) => {
              setTempValue(val);
              onChange(val);
              setIsEditing(false);
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select priority..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Critical">🔴 Critical</SelectItem>
              <SelectItem value="High">🟠 High</SelectItem>
              <SelectItem value="Medium">🟡 Medium</SelectItem>
              <SelectItem value="Low">🟢 Low</SelectItem>
            </SelectContent>
          </Select>
        );

      case "STATUS":
        return (
          <Select
            value={tempValue || ""}
            onValueChange={(val) => {
              setTempValue(val);
              onChange(val);
              setIsEditing(false);
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
              <SelectItem value="Stuck">Stuck</SelectItem>
              <SelectItem value="Working on it">Working on it</SelectItem>
            </SelectContent>
          </Select>
        );

      case "DATE":
      case "DUE_DATE":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-8 w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {tempValue ? format(new Date(tempValue), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={tempValue ? new Date(tempValue) : undefined}
                onSelect={(date) => {
                  const isoDate = date ? date.toISOString() : "";
                  setTempValue(isoDate);
                  onChange(isoDate);
                  setIsEditing(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return (
          <Input
            value={tempValue || ""}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            autoFocus
            className="h-8"
          />
        );
    }
  };

  const renderDisplay = () => {
    switch (type) {
      case "CHECKBOX":
        return (
          <div className="flex items-center">
            {value ? (
              <CheckSquare className="h-4 w-4 text-blue-600" />
            ) : (
              <div className="h-4 w-4 border-2 border-gray-400 rounded" />
            )}
          </div>
        );

      case "PRIORITY":
        if (!value) return <span className="text-gray-400">-</span>;
        const priorityColors: Record<string, string> = {
          "Critical": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
          "High": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
          "Medium": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
          "Low": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        };
        const priorityEmojis: Record<string, string> = {
          "Critical": "🔴",
          "High": "🟠",
          "Medium": "🟡",
          "Low": "🟢",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 ${
              priorityColors[value] || "bg-gray-200 text-gray-800"
            }`}
          >
            <span>{priorityEmojis[value]}</span>
            <span>{value}</span>
          </span>
        );

      case "STATUS":
        if (!value) return <span className="text-gray-400">-</span>;
        const statusColors: Record<string, string> = {
          "Not Started": "bg-gray-200 text-gray-800",
          "In Progress": "bg-blue-200 text-blue-800",
          "Done": "bg-green-200 text-green-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              statusColors[value] || "bg-gray-200 text-gray-800"
            }`}
          >
            {value}
          </span>
        );

      case "DATE":
      case "DUE_DATE":
        return value ? (
          <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );

      case "NUMBER":
        return value !== null && value !== undefined ? (
          <span className="text-sm">{value}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );

      case "PROGRESS":
      case "PERCENTAGE":
        return value !== null && value !== undefined ? (
          <InlineProgress value={value} />
        ) : (
          <span className="text-gray-400">-</span>
        );

      default:
        return value ? (
          <span className="text-sm">{value}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
    }
  };

  return (
    <div
      onClick={() => !isEditing && setIsEditing(true)}
      className="px-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded min-h-[32px] flex items-center"
    >
      {isEditing ? renderEditor() : renderDisplay()}
    </div>
  );
}
