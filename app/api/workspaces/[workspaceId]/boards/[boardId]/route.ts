import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string; boardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { boardId } = params;

    // Get board with all related data
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { position: "asc" },
        },
        groups: {
          orderBy: { position: "asc" },
          include: {
            items: {
              where: { isArchived: false },
              orderBy: { position: "asc" },
              include: {
                creator: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
                columnValues: true,
                assignments: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    subitems: true,
                    comments: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error("Error fetching board:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
