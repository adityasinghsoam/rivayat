"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg min-h-[360px] max-w-none rounded-[1.5rem] border border-neutral-200 bg-white px-6 py-5 leading-8 text-neutral-700 focus:outline-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" className={cn(editor.isActive("bold") && "border border-neutral-300 bg-neutral-100")} onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </Button>
        <Button variant="ghost" className={cn(editor.isActive("italic") && "border border-neutral-300 bg-neutral-100")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </Button>
        <Button variant="ghost" className={cn(editor.isActive("heading", { level: 1 }) && "border border-neutral-300 bg-neutral-100")} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </Button>
        <Button variant="ghost" className={cn(editor.isActive("heading", { level: 2 }) && "border border-neutral-300 bg-neutral-100")} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Button>
        <Button variant="ghost" className={cn(editor.isActive("bulletList") && "border border-neutral-300 bg-neutral-100")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          Bullets
        </Button>
        <Button variant="ghost" className={cn(editor.isActive("orderedList") && "border border-neutral-300 bg-neutral-100")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          Numbers
        </Button>
        <Button variant="ghost" className={cn(editor.isActive("blockquote") && "border border-neutral-300 bg-neutral-100")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          Quote
        </Button>
      </div>
      <p className="text-xs text-neutral-500">Use Enter for a new paragraph. Lists and quotes are supported in published posts and drafts.</p>
      <EditorContent editor={editor} />
    </div>
  );
}
