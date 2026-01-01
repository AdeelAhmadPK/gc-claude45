"use client";

import { useEffect, useState } from "react";
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
import { Calendar as CalendarIcon, CheckSquare, Hash, Type, User, Tag, X, Check, UserPlus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { InlineProgress } from "@/components/ui/progress-bar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ColumnCellProps {
  type: string;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  workspaceId?: string;
}

// Simulated workspace members - in real app, fetch from API
const WORKSPACE_MEMBERS = [
  { id: "1", name: "John Doe", email: "john@example.com", avatar: null },
  { id: "2", name: "Jane Smith", email: "jane@example.com", avatar: null },
  { id: "3", name: "Bob Wilson", email: "bob@example.com", avatar: null },
  { id: "4", name: "Alice Brown", email: "alice@example.com", avatar: null },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-cyan-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function ColumnCell({ type, value, onChange, onBlur, workspaceId }: ColumnCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [searchQuery, setSearchQuery] = useState("");

  // Keep local editor value in sync with upstream value changes
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
    onBlur?.();
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  // Filter members based on search
  const filteredMembers = WORKSPACE_MEMBERS.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      case "PEOPLE":
      case "PERSON":
        const selectedPeople = Array.isArray(tempValue) ? tempValue : tempValue ? [tempValue] : [];
        return (
          <Popover open onOpenChange={(open) => !open && setIsEditing(false)}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 w-full justify-start">
                {selectedPeople.length > 0 ? (
                  <div className="flex -space-x-2">
                    {selectedPeople.slice(0, 3).map((personId: string, i: number) => {
                      const person = WORKSPACE_MEMBERS.find((m) => m.id === personId);
                      return person ? (
                        <div
                          key={person.id}
                          className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white border-2 border-white dark:border-gray-800",
                            getAvatarColor(person.name)
                          )}
                        >
                          {getInitials(person.name)}
                        </div>
                      ) : null;
                    })}
                    {selectedPeople.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-[10px] font-medium border-2 border-white dark:border-gray-800">
                        +{selectedPeople.length - 3}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">
                    <UserPlus className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <div className="p-2 border-b">
                <Input
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto p-1">
                {filteredMembers.map((member) => {
                  const isSelected = selectedPeople.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800",
                        isSelected && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                      onClick={() => {
                        const newValue = isSelected
                          ? selectedPeople.filter((id: string) => id !== member.id)
                          : [...selectedPeople, member.id];
                        setTempValue(newValue);
                        onChange(newValue);
                      }}
                    >
                      <div
                        className={cn(
                          "h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium text-white",
                          getAvatarColor(member.name)
                        )}
                      >
                        {getInitials(member.name)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-blue-500" />}
                    </button>
                  );
                })}
                {filteredMembers.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No members found</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
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

      case "PEOPLE":
      case "PERSON":
        const selectedPeople = Array.isArray(value) ? value : value ? [value] : [];
        if (selectedPeople.length === 0) {
          return (
            <span className="text-gray-400 flex items-center">
              <User className="h-4 w-4" />
            </span>
          );
        }
        return (
          <div className="flex -space-x-2">
            {selectedPeople.slice(0, 3).map((personId: string) => {
              const person = WORKSPACE_MEMBERS.find((m) => m.id === personId);
              return person ? (
                <div
                  key={person.id}
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white border-2 border-white dark:border-gray-800",
                    getAvatarColor(person.name)
                  )}
                  title={person.name}
                >
                  {getInitials(person.name)}
                </div>
              ) : null;
            })}
            {selectedPeople.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-[10px] font-medium border-2 border-white dark:border-gray-800">
                +{selectedPeople.length - 3}
              </div>
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
