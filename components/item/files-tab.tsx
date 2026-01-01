"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Grid3x3,
  List,
  Download,
  Trash2,
  Eye,
  MoreHorizontal,
  Upload,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  Video,
  Music,
  Archive,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useDropzone } from "react-dropzone";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface FileItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  versions?: FileVersion[];
}

interface FileVersion {
  id: string;
  version: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

interface FilesTabProps {
  itemId: string;
  workspaceId: string;
  boardId: string;
  currentUserId: string;
}

export function FilesTab({
  itemId,
  workspaceId,
  boardId,
  currentUserId,
}: FilesTabProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "design-mockup-v2.fig",
      url: "#",
      type: "application/figma",
      size: 2500000,
      uploadedBy: "Sarah Chen",
      uploadedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      versions: [
        {
          id: "v1",
          version: 1,
          url: "#",
          uploadedBy: "Sarah Chen",
          uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
      ],
    },
    {
      id: "2",
      name: "screenshot-2024.png",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
      type: "image/png",
      size: 450000,
      uploadedBy: "John Doe",
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      name: "project-brief.pdf",
      url: "#",
      type: "application/pdf",
      size: 1200000,
      uploadedBy: "Alice Smith",
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [filterType, setFilterType] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    // TODO: Upload files to server
    const newFiles: FileItem[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
      uploadedBy: "You",
      uploadedAt: new Date(),
    }));

    setFiles([...newFiles, ...files]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/"))
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (type.includes("pdf"))
      return <FileText className="h-5 w-5 text-red-500" />;
    if (type.startsWith("video/"))
      return <Video className="h-5 w-5 text-purple-500" />;
    if (type.startsWith("audio/"))
      return <Music className="h-5 w-5 text-green-500" />;
    if (
      type.includes("zip") ||
      type.includes("rar") ||
      type.includes("compressed")
    )
      return <Archive className="h-5 w-5 text-orange-500" />;
    return <FileIcon className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleDownloadAll = () => {
    // TODO: Implement download all as ZIP
    console.log("Download all files");
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(files.filter((f) => f.id !== fileId));
  };

  const filteredFiles = filterType
    ? files.filter((f) => f.type.startsWith(filterType))
    : files;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {filterType
                  ? filterType.split("/")[0].charAt(0).toUpperCase() +
                    filterType.split("/")[0].slice(1)
                  : "All Files"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterType(null)}>
                All Files
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterType("image")}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Images
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("application")}>
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("video")}>
                <Video className="h-4 w-4 mr-2" />
                Videos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("audio")}>
                <Music className="h-4 w-4 mr-2" />
                Audio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-sm text-gray-500">
            {filteredFiles.length} {filteredFiles.length === 1 ? "file" : "files"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {files.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleDownloadAll}>
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          )}

          <div className="flex border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-r-none",
                viewMode === "grid" && "bg-gray-100"
              )}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-l-none border-l",
                viewMode === "list" && "bg-gray-100"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 bg-gray-50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 font-medium">
          {isDragActive
            ? "Drop files here"
            : "Drag & drop files here, or click to select"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supports all file types, max 50MB per file
        </p>
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <FileIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No files yet</h3>
          <p className="text-gray-500 mt-1">Upload your first file to get started</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
            >
              {/* Preview */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                {file.type.startsWith("image/") ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    {getFileIcon(file.type)}
                    <span className="text-xs text-gray-500 mt-2">
                      {file.type.split("/")[1]?.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button size="sm" variant="secondary">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Download className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="secondary">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      {file.versions && file.versions.length > 0 && (
                        <DropdownMenuItem>
                          View Version History ({file.versions.length})
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* File Info */}
              <div className="p-3">
                <p className="text-sm font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  {file.versions && file.versions.length > 0 && (
                    <span className="text-xs text-blue-600">
                      v{file.versions.length + 1}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {file.uploadedBy} •{" "}
                  {formatDistanceToNow(file.uploadedAt, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Size
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Uploaded By
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Date
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        {file.versions && file.versions.length > 0 && (
                          <p className="text-xs text-blue-600">
                            Version {file.versions.length + 1}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {file.uploadedBy}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDistanceToNow(file.uploadedAt, { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          {file.versions && file.versions.length > 0 && (
                            <DropdownMenuItem>
                              View Version History ({file.versions.length})
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
