"use client";
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

export default function TipTapEditor({ value, onChange, lang }: { value: string; onChange: (html: string)=>void; lang: 'en'|'es' }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: true })],
    content: value || "",
    editorProps: {
      attributes: {
        class: "min-h-[140px] border rounded p-2 prose",
        "data-gramm": "false",
        "data-gramm_editor": "false",
        "data-enable-grammarly": "false",
        spellcheck: "false",
      } as any,
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => { if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "", false); }, [value, editor]);

  if (!isMounted || !editor) return null;

  const btn = "border px-2 py-1 rounded";
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 text-sm">
        <button type="button" className={btn} onMouseDown={(e)=>{e.preventDefault(); editor.chain().focus().toggleBold().run();}}>B</button>
        <button type="button" className={btn + " italic"} onMouseDown={(e)=>{e.preventDefault(); editor.chain().focus().toggleItalic().run();}}>I</button>
        <button type="button" className={btn} onMouseDown={(e)=>{e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run();}}>H2</button>
        <button type="button" className={btn} onMouseDown={(e)=>{e.preventDefault(); editor.chain().focus().setParagraph().run();}}>{lang==='es'?'Párrafo':'Paragraph'}</button>
        <button type="button" className={btn} onMouseDown={(e)=>{e.preventDefault(); editor.chain().focus().toggleBulletList().run();}}>{lang==='es'?'Lista':'List'}</button>
        <button type="button" className={btn} onMouseDown={(e)=>{e.preventDefault(); editor.chain().focus().toggleOrderedList().run();}}>{lang==='es'?'Numerada':'Ordered'}</button>
        <button type="button" className={btn} onMouseDown={(e)=>{e.preventDefault(); const url = prompt(lang==='es'?'URL del enlace':'Link URL'); if (url) editor.chain().focus().setLink({ href: url }).run(); }}>{lang==='es'?'Enlace':'Link'}</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}


