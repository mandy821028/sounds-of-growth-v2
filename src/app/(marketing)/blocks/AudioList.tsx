"use client";
import React, { useRef, useState } from "react";
import { track } from "@/lib/track";

type Clip = { id: string; title: string; url: string; durationSec?: number };

export default function AudioList({ heading, items }: { heading?: string; items: Clip[] }) {
  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      {heading && <h3 className="text-xl font-semibold mb-4">{heading}</h3>}
      <ul className="space-y-2">
        {items.map((c) => (
          <li key={c.id} className="border border-default rounded p-3 bg-card">
            <AudioRow clip={c} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function AudioRow({ clip }: { clip: Clip }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => {
        setPlaying(true);
        track("PLAY", "AUDIO_LIST", { id: clip.id, title: clip.title });
      }).catch(() => {});
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        className="size-8 rounded-full bg-primary text-black flex items-center justify-center"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? "❚❚" : "▶"}
      </button>
      <div className="flex-1">
        <div className="text-sm font-medium">{clip.title}</div>
        {/* Mini “waveform” placeholder */}
        <div className="mt-1 flex items-end gap-[2px] h-4 opacity-70">
          {Array.from({ length: 32 }).map((_, i) => (
            <span
              key={i}
              className="w-[3px] bg-[color:var(--border)]"
              style={{ height: `${(Math.sin(i) * 0.5 + 0.5) * 12 + 2}px` }}
            />
          ))}
        </div>
      </div>
      <audio ref={audioRef} src={clip.url} onEnded={() => setPlaying(false)} />
    </div>
  );
}

