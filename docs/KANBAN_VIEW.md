# Kanban View Implementation

## Overview
Kanban view displays items organized by their STATUS column value, allowing users to drag items between status columns to update their status.

## Components Created

### 1. `/components/board/kanban-view.tsx`
Main Kanban view component:
- **Dynamic Columns**: Automatically generates columns from STATUS column labels
- **Drag & Drop**: Supports dragging cards between status columns
- **Item Creation**: Add new items directly to any status column
- **No Status Column**: Special column for items without a status value

### 2. `/components/board/view-switcher.tsx`
View mode switcher component:
- Buttons for Table, Kanban, Calendar, Timeline views
- Active view highlighting
- Icons from lucide-react

## Features

### Dynamic Column Generation
- Reads STATUS column settings from board configuration
- Creates a vertical swimlane for each status label
- Displays status color and item count per column
- Includes "No Status" column for unassigned items

### Drag & Drop Between Statuses
- Drag cards between columns to change item status
- Uses @dnd-kit's closestCorners collision detection
- Automatically updates ColumnValue in database
- Refreshes board data after status change

### Inline Item Creation
- Click "Add Item" in any column
- Item is created with that column's status automatically set
- Uses first group in board for new items
- Updates status via API call

### Card Display
- Shows item name
- Minimalist card design with hover effects
- Smooth animations during drag
- Visual feedback (opacity change) while dragging

## API Integration

### GET `/api/workspaces/[workspaceId]/boards/[boardId]`
Fetches board data including:
- All items with their column values
- Column definitions (including STATUS column settings)
- Groups

### POST `/api/workspaces/[workspaceId]/boards/[boardId]/items`
Creates new item in specified group

### PATCH `/api/workspaces/[workspaceId]/boards/[boardId]/items/[itemId]/values`
Updates item's column values (used for status changes)

## Usage

Switch to Kanban view using the ViewSwitcher:

```tsx
<ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />

{currentView === "kanban" && (
  <KanbanView
    boardId={boardId}
    workspaceId={workspaceId}
    items={allItems}
    columns={board.columns}
    onUpdateItem={updateItemStatus}
    onCreateItem={createKanbanItem}
  />
)}
```

## STATUS Column Configuration

The STATUS column must have settings structured as:

```json
{
  "labels": [
    { "id": "todo", "label": "To Do", "color": "#EF4444" },
    { "id": "inprogress", "label": "In Progress", "color": "#F59E0B" },
    { "id": "done", "label": "Done", "color": "#10B981" }
  ]
}
```

## Future Enhancements
- Swimlane grouping (by person, team, priority)
- WIP limits per column
- Column customization (add/edit/delete statuses)
- Collapse/expand columns
- Card details preview on hover
- Batch operations (multi-select cards)
