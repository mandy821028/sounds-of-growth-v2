"use client";
import React, { useEffect, useMemo, useState } from "react";
import { renderBlock } from "./blocks/Renderer";
import { PageBlockType } from "@prisma/client";

type Block = { type: PageBlockType; data: any; audiences?: string[] | null };
const AUDIENCES = ["ALL", "PARENTS", "STUDENTS", "TEACHERS"] as const;

export default function HomeClient({ blocks }: { blocks: Block[] }) {
  const [aud, setAud] = useState<typeof AUDIENCES[number]>(() => {
    if (typeof document === "undefined") return "ALL";
    const m = document.cookie.match(/(?:^|; )aud=([^;]+)/);
    const v = (m?.[1] as any) as typeof AUDIENCES[number];
    return AUDIENCES.includes(v) ? v : "ALL";
  });
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.cookie = `aud=${aud}; path=/`;
    }
  }, [aud]);
  const filtered = useMemo(() => {
    if (aud === "ALL") return blocks;
    // Mostrar sólo bloques específicamente curados para esa audiencia
    return blocks.filter((b) => Array.isArray(b.audiences) && b.audiences.includes(aud));
  }, [blocks, aud]);
  return (
    <div>
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="inline-flex rounded-full border border-default bg-secondary p-1">
          {AUDIENCES.map((a) => (
            <button key={a} className={`px-3 py-1 text-sm rounded-full ${aud===a?'bg-primary text-black':'text-muted'}`} onClick={()=>setAud(a)}>{a}</button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-muted-foreground">
          {aud === "ALL"
            ? "No content yet."
            : `No curated content for ${aud.toLowerCase()} yet.`}
        </div>
      ) : (
        filtered.map((b, i) => (
          <section key={i}>{renderBlock(b)}</section>
        ))
      )}
    </div>
  );
}

