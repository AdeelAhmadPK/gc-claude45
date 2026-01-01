import { NextResponse } from "next/server";

// Mock database
const notifications = [
  {
    id: "1",
    userId: "user-1",
    type: "mention",
    title: "Sarah Chen mentioned you",
    message: "Can you review this design? @you I think we need your input.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    actorId: "user-2",
    itemId: "item-1",
  },
  {
    id: "2",
    userId: "user-1",
    type: "assignment",
    title: "You were assigned to a task",
    message: "Mike Johnson assigned you to 'API Integration'",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    actorId: "user-3",
    itemId: "item-2",
  },
];

// GET /api/notifications - Get all notifications for current user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // In a real app, get userId from session/auth
    const userId = "user-1";

    let userNotifications = notifications.filter((n) => n.userId === userId);

    if (unreadOnly) {
      userNotifications = userNotifications.filter((n) => !n.isRead);
    }

    // Sort by createdAt desc
    userNotifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount: userNotifications.filter((n) => !n.isRead).length,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, title, message, actorId, itemId } = body;

    const newNotification = {
      id: Date.now().toString(),
      userId,
      type,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
      actorId,
      itemId,
    };

    notifications.push(newNotification);

    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
