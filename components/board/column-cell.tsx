"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, CheckSquare, Hash, Type, User, Tag } from "lucide-react";

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

      case "STATUS":
        return (
          <select
            value={tempValue || ""}
            onChange={(e) => {
              setTempValue(e.target.value);
              onChange(e.target.value);
              setIsEditing(false);
            }}
            autoFocus
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600"
          >
            <option value="">Select...</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        );

      case "DATE":
      case "DUE_DATE":
        return (
          <Input
            type="date"
            value={tempValue || ""}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            autoFocus
            className="h-8"
          />
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
