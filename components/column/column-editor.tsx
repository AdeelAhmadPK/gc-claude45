"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar as CalendarIcon,
  User,
  Tag,
  Link as LinkIcon,
  Phone,
  Mail,
  MapPin,
  Star,
  Check,
  Circle,
  Clock,
  Hash,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ColumnEditorProps {
  columnType: string;
  value: any;
  onChange: (value: any) => void;
  columnSettings?: Record<string, any>;
}

export function ColumnEditor({
  columnType,
  value,
  onChange,
  columnSettings = {},
}: ColumnEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  switch (columnType.toUpperCase()) {
    case "TEXT":
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter text..."
          className="w-full"
        />
      );

    case "LONG_TEXT":
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter description..."
          rows={4}
          className="w-full"
        />
      );

    case "NUMBER":
      return (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-400" />
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(parseFloat(e.target.value) || null)}
            placeholder="0"
            className="w-full"
          />
        </div>
      );

    case "CHECKBOX":
      return (
        <button
          onClick={() => onChange(!value)}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded border-2 transition-colors",
            value
              ? "bg-blue-500 border-blue-500 text-white"
              : "border-gray-300 hover:border-gray-400"
          )}
        >
          {value && <Check className="h-5 w-5" />}
        </button>
      );

    case "STATUS":
      const statusOptions = columnSettings?.labels || [
        { label: "To Do", color: "#94A3B8" },
        { label: "In Progress", color: "#3B82F6" },
        { label: "Done", color: "#10B981" },
        { label: "Stuck", color: "#EF4444" },
      ];
      return (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status">
              {value && (
                <div className="flex items-center gap-2">
                  <Circle
                    className="h-3 w-3"
                    fill={
                      statusOptions.find((s: any) => s.label === value)?.color ||
                      "#94A3B8"
                    }
                    color={
                      statusOptions.find((s: any) => s.label === value)?.color ||
                      "#94A3B8"
                    }
                  />
                  <span>{value}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status: any) => (
              <SelectItem key={status.label} value={status.label}>
                <div className="flex items-center gap-2">
                  <Circle
                    className="h-3 w-3"
                    fill={status.color}
                    color={status.color}
                  />
                  <span>{status.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "DROPDOWN":
      const dropdownOptions = columnSettings?.options || ["Option 1", "Option 2", "Option 3"];
      return (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {dropdownOptions.map((option: string) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "LABELS":
      const selectedLabels = value ? (Array.isArray(value) ? value : [value]) : [];
      const labelOptions = columnSettings?.labels || ["Label 1", "Label 2", "Label 3"];
      return (
        <div className="flex flex-wrap gap-1">
          {selectedLabels.map((label: string) => (
            <Badge
              key={label}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => {
                onChange(selectedLabels.filter((l: string) => l !== label));
              }}
            >
              {label}
              <span className="ml-1">×</span>
            </Badge>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-6">
                <Tag className="h-3 w-3 mr-1" />
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="space-y-1">
                {labelOptions
                  .filter((label: string) => !selectedLabels.includes(label))
                  .map((label: string) => (
                    <button
                      key={label}
                      className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                      onClick={() => {
                        onChange([...selectedLabels, label]);
                      }}
                    >
                      {label}
                    </button>
                  ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      );

    case "PEOPLE":
    case "TEAM":
      // Mock user data - in real app, fetch from API
      const users = [
        { id: "1", name: "Sarah Chen", image: "https://avatar.vercel.sh/sarah" },
        { id: "2", name: "John Doe", image: "https://avatar.vercel.sh/john" },
        { id: "3", name: "Alice Smith", image: "https://avatar.vercel.sh/alice" },
      ];
      const selectedUsers = value ? (Array.isArray(value) ? value : [value]) : [];
      
      return (
        <div className="flex items-center gap-1">
          {selectedUsers.map((userId: string) => {
            const user = users.find((u) => u.id === userId);
            return user ? (
              <Avatar key={userId} className="h-6 w-6">
                <AvatarImage src={user.image} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            ) : null;
          })}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                <User className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <div className="space-y-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
                    onClick={() => {
                      const newValue = selectedUsers.includes(user.id)
                        ? selectedUsers.filter((id: string) => id !== user.id)
                        : [...selectedUsers, user.id];
                      onChange(newValue);
                    }}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.image} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name}</span>
                    {selectedUsers.includes(user.id) && (
                      <Check className="h-4 w-4 ml-auto text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      );

    case "DATE":
    case "DUE_DATE":
      return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(new Date(value), "MMM dd, yyyy") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value ? new Date(value) : undefined}
              onSelect={(date) => {
                onChange(date?.toISOString() || null);
                setIsOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );

    case "TIMELINE":
      const timeline = value || { start: null, end: null };
      return (
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {timeline.start ? format(new Date(timeline.start), "MMM dd") : "Start"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={timeline.start ? new Date(timeline.start) : undefined}
                  onSelect={(date) =>
                    onChange({ ...timeline, start: date?.toISOString() || null })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-xs text-gray-500">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {timeline.end ? format(new Date(timeline.end), "MMM dd") : "End"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={timeline.end ? new Date(timeline.end) : undefined}
                  onSelect={(date) =>
                    onChange({ ...timeline, end: date?.toISOString() || null })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      );

    case "FILES":
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.click();
          }}
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      );

    case "LINK":
      return (
        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-gray-400" />
          <Input
            type="url"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="w-full"
          />
        </div>
      );

    case "EMAIL":
      return (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <Input
            type="email"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="email@example.com"
            className="w-full"
          />
        </div>
      );

    case "PHONE":
      return (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <Input
            type="tel"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full"
          />
        </div>
      );

    case "LOCATION":
      return (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter location..."
            className="w-full"
          />
        </div>
      );

    case "RATING":
      const rating = value || 0;
      return (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onChange(star)}
              className="text-yellow-400 hover:scale-110 transition-transform"
            >
              <Star
                className="h-5 w-5"
                fill={star <= rating ? "currentColor" : "none"}
              />
            </button>
          ))}
        </div>
      );

    case "PROGRESS":
      return (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Progress value={value || 0} className="flex-1" />
            <span className="ml-2 text-sm text-gray-600 w-12 text-right">
              {value || 0}%
            </span>
          </div>
          <Input
            type="range"
            min="0"
            max="100"
            value={value || 0}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      );

    case "HOUR_TRACKING":
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <Input
            type="number"
            step="0.5"
            value={value || ""}
            onChange={(e) => onChange(parseFloat(e.target.value) || null)}
            placeholder="0.0"
            className="w-20"
          />
          <span className="text-sm text-gray-500">hours</span>
        </div>
      );

    case "FORMULA":
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="h-4 w-4" />
          <span>{value || "Calculated value"}</span>
        </div>
      );

    case "CREATED_DATE":
    case "LAST_UPDATED":
      return (
        <div className="text-sm text-gray-600">
          {value ? format(new Date(value), "MMM dd, yyyy HH:mm") : "-"}
        </div>
      );

    case "CREATOR":
    case "LAST_UPDATED_BY":
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={value?.image} />
            <AvatarFallback>{value?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{value?.name || "Unknown"}</span>
        </div>
      );

    default:
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${columnType}...`}
          className="w-full"
        />
      );
  }
}
