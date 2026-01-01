// Board column type utilities and renderers

import { ColumnType } from "@prisma/client";

export interface ColumnTypeDefinition {
  type: ColumnType;
  label: string;
  icon: string;
  description: string;
  defaultWidth: number;
  supportsMultiple?: boolean;
  requiresSettings?: boolean;
}

export const COLUMN_TYPES: ColumnTypeDefinition[] = [
  {
    type: "TEXT",
    label: "Text",
    icon: "Type",
    description: "Single line of text",
    defaultWidth: 150,
  },
  {
    type: "LONG_TEXT",
    label: "Long Text",
    icon: "AlignLeft",
    description: "Multiple lines of text with formatting",
    defaultWidth: 250,
  },
  {
    type: "NUMBER",
    label: "Number",
    icon: "Hash",
    description: "Numeric values",
    defaultWidth: 100,
  },
  {
    type: "CHECKBOX",
    label: "Checkbox",
    icon: "CheckSquare",
    description: "Yes/No toggle",
    defaultWidth: 80,
  },
  {
    type: "STATUS",
    label: "Status",
    icon: "Tag",
    description: "Predefined status labels with colors",
    defaultWidth: 130,
    requiresSettings: true,
  },
  {
    type: "DROPDOWN",
    label: "Dropdown",
    icon: "ChevronDown",
    description: "Select from predefined options",
    defaultWidth: 130,
    requiresSettings: true,
  },
  {
    type: "LABELS",
    label: "Labels",
    icon: "Tags",
    description: "Multiple tags/labels",
    defaultWidth: 150,
    supportsMultiple: true,
  },
  {
    type: "PEOPLE",
    label: "People",
    icon: "User",
    description: "Assign team members",
    defaultWidth: 120,
    supportsMultiple: true,
  },
  {
    type: "DATE",
    label: "Date",
    icon: "Calendar",
    description: "Single date picker",
    defaultWidth: 120,
  },
  {
    type: "TIMELINE",
    label: "Timeline",
    icon: "GanttChart",
    description: "Date range (start and end)",
    defaultWidth: 200,
  },
  {
    type: "DUE_DATE",
    label: "Due Date",
    icon: "CalendarClock",
    description: "Deadline with status indicators",
    defaultWidth: 120,
  },
  {
    type: "FILES",
    label: "Files",
    icon: "Paperclip",
    description: "File attachments",
    defaultWidth: 100,
    supportsMultiple: true,
  },
  {
    type: "LINK",
    label: "Link",
    icon: "Link",
    description: "URL with preview",
    defaultWidth: 150,
  },
  {
    type: "EMAIL",
    label: "Email",
    icon: "Mail",
    description: "Email address",
    defaultWidth: 150,
  },
  {
    type: "PHONE",
    label: "Phone",
    icon: "Phone",
    description: "Phone number",
    defaultWidth: 130,
  },
  {
    type: "LOCATION",
    label: "Location",
    icon: "MapPin",
    description: "Address or location",
    defaultWidth: 150,
  },
  {
    type: "RATING",
    label: "Rating",
    icon: "Star",
    description: "Star rating (1-5)",
    defaultWidth: 120,
  },
  {
    type: "PROGRESS",
    label: "Progress",
    icon: "TrendingUp",
    description: "Progress percentage (0-100%)",
    defaultWidth: 120,
  },
  {
    type: "FORMULA",
    label: "Formula",
    icon: "Calculator",
    description: "Calculate based on other columns",
    defaultWidth: 120,
    requiresSettings: true,
  },
  {
    type: "DEPENDENCY",
    label: "Dependency",
    icon: "GitBranch",
    description: "Link to dependent items",
    defaultWidth: 150,
    supportsMultiple: true,
  },
  {
    type: "CONNECT_BOARDS",
    label: "Connect Boards",
    icon: "Link2",
    description: "Link to items in other boards",
    defaultWidth: 150,
    supportsMultiple: true,
  },
  {
    type: "CREATED_DATE",
    label: "Created Date",
    icon: "CalendarPlus",
    description: "Automatically set creation date",
    defaultWidth: 130,
  },
  {
    type: "LAST_UPDATED",
    label: "Last Updated",
    icon: "Clock",
    description: "Automatically track last update time",
    defaultWidth: 150,
  },
  {
    type: "CREATOR",
    label: "Creator",
    icon: "UserPlus",
    description: "Person who created the item",
    defaultWidth: 120,
  },
];

export function getColumnType(type: ColumnType): ColumnTypeDefinition | undefined {
  return COLUMN_TYPES.find((ct) => ct.type === type);
}

export function formatColumnValue(type: ColumnType, value: any): string {
  if (!value) return "";
  
  switch (type) {
    case "TEXT":
    case "LONG_TEXT":
    case "LINK":
    case "EMAIL":
    case "PHONE":
      return String(value);
    
    case "NUMBER":
      return typeof value === "number" ? value.toString() : String(value);
    
    case "CHECKBOX":
      return value ? "✓" : "";
    
    case "DATE":
    case "DUE_DATE":
    case "CREATED_DATE":
    case "LAST_UPDATED":
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      return new Date(value).toLocaleDateString();
    
    case "PEOPLE":
      if (Array.isArray(value)) {
        return value.map((p: any) => p.name || p.email).join(", ");
      }
      return value.name || value.email || "";
    
    case "STATUS":
    case "DROPDOWN":
      return value.label || value.value || String(value);
    
    case "PROGRESS":
      return `${value}%`;
    
    case "RATING":
      return "★".repeat(value) + "☆".repeat(5 - value);
    
    default:
      return String(value);
  }
}
