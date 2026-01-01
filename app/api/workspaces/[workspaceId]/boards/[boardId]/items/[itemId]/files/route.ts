import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure S3 Client (you'll need to add these env variables)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "gc-claude45-files";

// GET - List files for an item
export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string; boardId: string; itemId: string } }
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

    // Get files
    const files = await prisma.file.findMany({
      where: {
        itemId: params.itemId,
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Failed to fetch files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

// POST - Upload a new file
export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string; boardId: string; itemId: string } }
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

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    // Generate unique file key
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `workspaces/${params.workspaceId}/boards/${params.boardId}/items/${params.itemId}/${timestamp}-${sanitizedName}`;

    // Upload to S3
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(uploadCommand);

    // Generate public URL
    const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;

    // Save to database
    const dbFile = await prisma.file.create({
      data: {
        name: file.name,
        url: fileUrl,
        size: file.size,
        mimeType: file.type,
        itemId: params.itemId,
        uploadedById: user.id,
      },
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

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "FILE_UPLOAD",
        entityType: "ITEM",
        entityId: params.itemId,
        userId: user.id,
        workspaceId: params.workspaceId,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileId: dbFile.id,
        },
      },
    });

    return NextResponse.json(dbFile, { status: 201 });
  } catch (error) {
    console.error("Failed to upload file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
