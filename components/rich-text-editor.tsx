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
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-stone prose-lg min-h-[360px] max-w-none rounded-[1.5rem] border border-black/10 bg-white/85 px-6 py-5 leading-8 focus:outline-none",
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
        <Button
          variant="ghost"
          className={cn(editor.isActive("bold") && "bg-ink/5")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </Button>
        <Button
          variant="ghost"
          className={cn(editor.isActive("italic") && "bg-ink/5")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </Button>
        <Button
          variant="ghost"
          className={cn(editor.isActive("heading", { level: 1 }) && "bg-ink/5")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </Button>
        <Button
          variant="ghost"
          className={cn(editor.isActive("heading", { level: 2 }) && "bg-ink/5")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Button>
        <Button
          variant="ghost"
          className={cn(editor.isActive("paragraph") && "bg-ink/5")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          Paragraph
        </Button>
        <Button
          variant="ghost"
          className={cn(editor.isActive("blockquote") && "bg-ink/5")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </Button>
        <Button variant="ghost" onClick={() => editor.chain().focus().setHardBreak().run()}>
          Line break
        </Button>
      </div>
      <p className="text-xs text-ink/55">Use Enter for a new paragraph and Line break for poetry-style line spacing.</p>
      <EditorContent editor={editor} />
    </div>
  );
}
