import { NextResponse } from "next/server";

// Mock database
const notifications = [
  {
    id: "1",
    userId: "user-1",
    type: "mention",
    title: "Sarah Chen mentioned you",
    message: "Can you review this design?",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

// POST /api/notifications/[id]/read - Mark notification as read
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const notification = notifications.find((n) => n.id === id);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    notification.isRead = true;

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
