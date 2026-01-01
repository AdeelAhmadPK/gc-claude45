"use client";

import { useState, useCallback } from "react";
import { Upload, X, File, Image, FileText, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface FileData {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface FileUploaderProps {
  workspaceId: string;
  boardId: string;
  itemId: string;
}

export function FileUploader({ workspaceId, boardId, itemId }: FileUploaderProps) {
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch files on mount
  useState(() => {
    fetchFiles();
  });

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/files`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const uploadedFile = await response.json();
          setFiles((prev) => [uploadedFile, ...prev]);
        } else {
          const error = await response.json();
          alert(`Failed to upload ${file.name}: ${error.error}`);
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/files/${fileId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert("Failed to delete file");
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5 text-blue-500" />;
    if (mimeType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getUserInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-gray-500 mb-4">Maximum file size: 50MB</p>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          disabled={uploading}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Choose Files"}
        </Button>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Uploaded Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(file.mimeType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <div
                            className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold"
                            title={file.uploadedBy.email}
                          >
                            {getUserInitials(file.uploadedBy.name, file.uploadedBy.email)}
                          </div>
                          <span>{file.uploadedBy.name || file.uploadedBy.email}</span>
                        </div>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(file.url, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Image Preview */}
                {file.mimeType.startsWith("image/") && (
                  <div className="mt-2">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="max-h-48 rounded border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {files.length === 0 && !uploading && (
        <p className="text-sm text-gray-500 text-center py-4">No files uploaded yet</p>
      )}
    </div>
  );
}
