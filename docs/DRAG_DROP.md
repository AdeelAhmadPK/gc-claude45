# Drag & Drop Implementation

## Overview
Implemented full drag & drop functionality using @dnd-kit library for reordering items within and across groups, as well as reordering groups themselves.

## Components Created

### 1. `/hooks/useDragDrop.ts`
Custom hook for managing drag & drop state:
- Handles drag start and end events
- Uses PointerSensor with activation constraint (8px distance)
- Provides reorder callback for position updates

### 2. `/components/board/draggable-item.tsx`
Individual draggable item component:
- Uses `useSortable` hook for drag behavior
- Displays drag handle (GripVertical icon) on hover
- Renders ColumnCell components for each column value
- Applies visual feedback (opacity change) during drag

### 3. `/components/board/draggable-group.tsx`
Draggable group container:
- Supports dragging entire groups to reorder
- Contains sortable context for nested items
- Manages group expansion/collapse
- Handles inline item addition

### 4. `/app/api/workspaces/[workspaceId]/boards/[boardId]/reorder/route.ts`
API endpoint for persisting drag & drop changes:
- Accepts `type`: "items" or "groups"
- Updates positions in database via Prisma transaction
- Logs reorder actions in ActivityLog

## Features

### Item Drag & Drop
- **Within Same Group**: Reorder items by dragging
- **Across Groups**: Move items between different groups
- **Position Calculation**: Automatically recalculates positions after drop
- **Visual Feedback**: Opacity changes during drag, hover effects for drag handles

### Group Drag & Drop
- Reorder entire groups including all their items
- Maintains group structure during drag
- Updates positions in database

### Backend Persistence
- All drag & drop changes are immediately persisted to database
- Uses Prisma transactions for atomic updates
- Activity logging for audit trail

## Usage

The board page automatically wraps all groups in DndContext:

```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
    {groups.map(group => (
      <DraggableGroup key={group.id} group={group} />
    ))}
  </SortableContext>
</DndContext>
```

## Database Schema
- `Item.position` (Int): Determines display order within a group
- `Group.position` (Int): Determines group display order on board

## Future Enhancements
- Add drag preview overlay
- Implement multi-select for bulk dragging
- Add keyboard shortcuts for reordering
- Support drag to duplicate (Ctrl+drag)
