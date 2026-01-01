"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Mention from "@tiptap/extension-mention";
import { useCallback, useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  AtSign,
  Smile,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import EmojiPicker from "emoji-picker-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onFileUpload?: (files: File[]) => void;
  className?: string;
  mentions?: { id: string; name: string; image?: string }[];
}

export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Write an update...",
  onSubmit,
  onFileUpload,
  className,
  mentions = [],
}: RichTextEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention bg-blue-100 text-blue-600 px-1 rounded",
        },
        suggestion: {
          items: ({ query }: { query: string }) => {
            return mentions
              .filter((user) =>
                user.name.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5);
          },
          render: () => {
            let component: any;
            return {
              onStart: (props: any) => {
                component = new MentionList(props);
              },
              onUpdate(props: any) {
                component.updateProps(props);
              },
              onKeyDown(props: any) {
                return component.onKeyDown(props);
              },
              onExit() {
                component.destroy();
              },
            };
          },
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[100px] p-3",
      },
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileUpload?.(acceptedFiles);
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkUrl })
      .run();
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(
    (url: string) => {
      if (editor && url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
    [editor]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-lg", className)} {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive && (
        <div className="absolute inset-0 bg-blue-50 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Paperclip className="h-12 w-12 text-blue-400 mx-auto mb-2" />
            <p className="text-blue-600 font-medium">Drop files here</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="border-b p-2 flex items-center gap-1 flex-wrap bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "h-8 px-2",
            editor.isActive("bold") && "bg-gray-200"
          )}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "h-8 px-2",
            editor.isActive("italic") && "bg-gray-200"
          )}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "h-8 px-2",
            editor.isActive("bulletList") && "bg-gray-200"
          )}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "h-8 px-2",
            editor.isActive("orderedList") && "bg-gray-200"
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2",
                editor.isActive("link") && "bg-gray-200"
              )}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <input
                type="url"
                placeholder="Enter URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setLink();
                  }
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={setLink}>
                  Add Link
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    editor.chain().focus().unsetLink().run();
                    setShowLinkInput(false);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt("Image URL:");
            if (url) addImage(url);
          }}
          className="h-8 px-2"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2">
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-0">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                editor.chain().focus().insertContent(emojiData.emoji).run();
                setShowEmojiPicker(false);
              }}
            />
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => {
            // Trigger file input
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.onchange = (e: any) => {
              const files = Array.from(e.target.files);
              onFileUpload?.(files as File[]);
            };
            input.click();
          }}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Action Buttons */}
      {onSubmit && (
        <div className="p-3 border-t flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              editor.commands.clearContent();
            }}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={onSubmit}>
            Post Update
          </Button>
        </div>
      )}
    </div>
  );
}

// Mention List Component
class MentionList {
  items: any[];
  props: any;
  selectedIndex: number;

  constructor(props: any) {
    this.items = props.items;
    this.props = props;
    this.selectedIndex = 0;
  }

  updateProps(props: any) {
    this.items = props.items;
    this.props = props;
  }

  onKeyDown({ event }: { event: KeyboardEvent }) {
    if (event.key === "ArrowUp") {
      this.upHandler();
      return true;
    }

    if (event.key === "ArrowDown") {
      this.downHandler();
      return true;
    }

    if (event.key === "Enter") {
      this.enterHandler();
      return true;
    }

    return false;
  }

  upHandler() {
    this.selectedIndex =
      (this.selectedIndex + this.items.length - 1) % this.items.length;
  }

  downHandler() {
    this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
  }

  enterHandler() {
    this.selectItem(this.selectedIndex);
  }

  selectItem(index: number) {
    const item = this.items[index];
    if (item) {
      this.props.command({ id: item.id, label: item.name });
    }
  }

  destroy() {
    // Cleanup
  }
}
