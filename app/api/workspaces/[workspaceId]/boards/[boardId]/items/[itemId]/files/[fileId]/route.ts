import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "gc-claude45-files";

// DELETE - Delete a file
export async function DELETE(
  req: NextRequest,
  { params }: { params: { workspaceId: string; boardId: string; itemId: string; fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check workspace access
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        userId: user.id,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get file
    const file = await prisma.file.findUnique({
      where: { id: params.fileId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check ownership (only uploader or admin can delete)
    if (file.uploadedById !== user.id && member.role !== "ADMIN" && member.role !== "OWNER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Extract S3 key from URL
    const urlParts = file.url.split(".com/");
    const fileKey = urlParts[1];

    // Delete from S3
    if (fileKey) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
      });
      await s3Client.send(deleteCommand);
    }

    // Delete from database
    await prisma.file.delete({
      where: { id: params.fileId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "FILE_DELETE",
        entityType: "ITEM",
        entityId: params.itemId,
        userId: user.id,
        workspaceId: params.workspaceId,
        metadata: {
          fileName: file.name,
          fileId: file.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}

// GET - Download/get file info
export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string; boardId: string; itemId: string; fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check workspace access
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        userId: user.id,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const file = await prisma.file.findUnique({
      where: { id: params.fileId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error("Failed to fetch file:", error);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}
