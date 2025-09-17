"use client";
import { useEffect, useRef } from "react";

export default function SimpleHtmlEditor({ value, onChange, lang }: { value: string; onChange: (html: string)=>void; lang: 'en'|'es' }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
  }, [value]);

  function cmd(command: string, valueArg?: string) {
    const el = ref.current;
    if (!el) return;
    el.focus();
    document.execCommand(command, false, valueArg);
    onChange(el.innerHTML);
  }

  function makeLink() {
    const url = prompt(lang==='es' ? 'URL del enlace' : 'Link URL');
    if (!url) return;
    cmd('createLink', url);
    // ensure target and rel on created links
    const el = ref.current;
    if (!el) return;
    el.querySelectorAll('a[href]')?.forEach(a => { a.setAttribute('target','_blank'); a.setAttribute('rel','noreferrer'); });
    onChange(el.innerHTML);
  }

  const btn = "border px-2 py-1 rounded";
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 text-sm">
        <button type="button" className={btn} onMouseDown={(e)=>{e.preventDefault(); cmd('bold');}}>B</button>
        <button type="button" className={btn + ' italic'} onMouseDown={(e)=>{e.preventDefault(); cmd('italic');}}>I</button>
        <button type="button" className={btn} onMouseDown={(e)=>{e.preventDefault(); cmd('formatBlock','h2');}}>H2</button>
        <button type="button" className={btn} onMouseDown={(e)=>{e.preventDefault(); cmd('formatBlock','p');}}>{lang==='es'?'Párrafo':'Paragraph'}</button>
        <button type="button" className={btn} onMouseDown={(e)=>{e.preventDefault(); cmd('insertUnorderedList');}}>{lang==='es'?'Lista':'List'}</button>
        <button type="button" className={btn} onMouseDown={(e)=>{e.preventDefault(); cmd('insertOrderedList');}}>{lang==='es'?'Numerada':'Ordered'}</button>
        <button type="button" className={btn} onMouseDown={(e)=>{e.preventDefault(); makeLink();}}>{lang==='es'?'Enlace':'Link'}</button>
      </div>
      <div
        ref={ref}
        className="w-full min-h-[140px] border rounded p-2 prose focus:outline-none"
        contentEditable
        onInput={() => { const el = ref.current; if (el) onChange(el.innerHTML); }}
        suppressContentEditableWarning
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
        spellCheck={false}
      />
    </div>
  );
}


