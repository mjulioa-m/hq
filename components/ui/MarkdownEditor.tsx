"use client";

import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Escribe…",
}: {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}) {
  const last = useRef(value);
  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content: value || "",
    contentType: "markdown",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap text-sm text-ink",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: current }) => {
      const markdown = current.getMarkdown();
      last.current = markdown;
      onChange(markdown);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== last.current) {
      last.current = value;
      editor.commands.setContent(value || "", { contentType: "markdown" });
    }
  }, [editor, value]);

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <EditorContent editor={editor} />
    </div>
  );
}
