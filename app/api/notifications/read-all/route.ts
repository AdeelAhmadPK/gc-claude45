import { NextResponse } from "next/server";

// Mock database
const notifications = [
  {
    id: "1",
    userId: "user-1",
    isRead: false,
  },
];

// POST /api/notifications/read-all - Mark all notifications as read
export async function POST(request: Request) {
  try {
    // In a real app, get userId from session/auth
    const userId = "user-1";

    const userNotifications = notifications.filter((n) => n.userId === userId);
    userNotifications.forEach((n) => {
      n.isRead = true;
    });

    return NextResponse.json({
      success: true,
      count: userNotifications.length,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}
