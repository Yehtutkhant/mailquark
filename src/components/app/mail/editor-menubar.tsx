import { cn } from "@/lib/utils";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";
import React from "react";

interface Props {
  editor: Editor;
}
const EditorMenuBar = ({ editor }: Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => {
          editor.chain().focus().toggleBold().run();
        }}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          "cursor-pointer",
          editor.isActive("bold") ? "is-active" : "",
        )}
      >
        <Bold className="text-secondary-foreground size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          "cursor-pointer",
          editor.isActive("italic") ? "is-active" : "",
        )}
      >
        <Italic className="text-secondary-foreground size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn(
          "cursor-pointer",
          editor.isActive("strike") ? "is-active" : "",
        )}
      >
        <Strikethrough className="text-secondary-foreground size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={cn(
          "cursor-pointer",
          editor.isActive("code") ? "is-active" : "",
        )}
      >
        <Code className="text-secondary-foreground size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 1 }).run()
        }
        className={cn(
          "cursor-pointer",
          editor.isActive("heading", { level: 1 }) ? "is-active" : "",
        )}
      >
        <Heading1 className="text-secondary-foreground size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={cn(
          "cursor-pointer",
          editor.isActive("heading", { level: 2 }) ? "is-active" : "",
        )}
      >
        <Heading2 className="text-secondary-foreground size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 3 }).run()
        }
        className={cn(
          "cursor-pointer",
          editor.isActive("heading", { level: 3 }) ? "is-active" : "",
        )}
      >
        <Heading3 className="text-secondary-foreground size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 4 }).run()
        }
        className={cn(
          "cursor-pointer",
          editor.isActive("heading", { level: 4 }) ? "is-active" : "",
        )}
      >
        <Heading4 className="text-secondary-foreground size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 5 }).run()
        }
        className={editor.isActive("heading", { level: 5 }) ? "is-active" : ""}
      >
        <Heading5 className="text-secondary-foreground size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 6 }).run()
        }
        className={editor.isActive("heading", { level: 6 }) ? "is-active" : ""}
      >
        <Heading6 className="text-secondary-foreground size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        className={cn(
          "cursor-pointer",
          editor.isActive("bulletList") ? "is-active" : "",
        )}
      >
        <List className="text-secondary-foreground size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        className={cn(
          "cursor-pointer",
          editor.isActive("orderedList") ? "is-active" : "",
        )}
      >
        <ListOrdered className="text-secondary-foreground size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        disabled={!editor.can().chain().focus().toggleBlockquote().run()}
        className={cn(
          "cursor-pointer",
          editor.isActive("blockquote") ? "is-active" : "",
        )}
      >
        <Quote className="text-secondary-foreground size-4" />
      </button>
      <button
        className="cursor-pointer"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <Undo className="text-secondary-foreground size-4" />
      </button>
      <button
        className="cursor-pointer"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <Redo className="text-secondary-foreground size-4" />
      </button>
    </div>
  );
};

export default EditorMenuBar;
