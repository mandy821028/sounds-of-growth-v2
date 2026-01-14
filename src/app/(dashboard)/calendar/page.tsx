"use client";
import { useEffect, useMemo, useState } from "react";

type EventItem = { id: string; occurrence: string; title: string; startsAtUtc: string; durationMin: number; published: boolean; status: string; cancelStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null; personName?: string; personImage?: string | null };

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function startOfMonth(d: Date) { const x = new Date(d.getFullYear(), d.getMonth(), 1); return x; }
function endOfMonth(d: Date) { const x = new Date(d.getFullYear(), d.getMonth()+1, 0); x.setHours(23,59,59,999); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function fmtLocalYMD(d: Date) { const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const da=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${da}`; }
function startOfWeek(d: Date) { const x = startOfDay(new Date(d)); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day); return x; }

export default function CalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [view, setView] = useState<'month'|'week'|'day'>('month');
  const [cursor, setCursor] = useState<Date>(startOfDay(new Date()));
  const [lang, setLang] = useState<'es'|'en'>(typeof document !== 'undefined' && document.cookie.includes('locale=es') ? 'es' : 'en');
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  const [role, setRole] = useState<'SUPER_ADMIN'|'TEACHER'|'STUDENT'|null>(null);
  useEffect(() => {
    function updateLang(){ if (typeof document !== 'undefined') setLang(document.cookie.includes('locale=es') ? 'es' : 'en'); }
    if (typeof window !== 'undefined') {
      window.addEventListener('locale-change', updateLang);
      return () => window.removeEventListener('locale-change', updateLang);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetch('/api/auth/session', { cache: 'no-store' }).then(r=>r.json());
        const r = s?.user?.role as 'SUPER_ADMIN'|'TEACHER'|'STUDENT'|undefined;
        if (r) setRole(r);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      let rangeStart: Date, rangeEnd: Date;
      if (view === 'month') {
        const start = new Date(cursor);
        rangeStart = new Date(start.getFullYear(), start.getMonth(), 1);
        rangeEnd = new Date(start.getFullYear(), start.getMonth()+1, 0);
        // Fetch an even wider buffer so biweekly events across boundaries are guaranteed to load
        rangeStart.setDate(rangeStart.getDate() - 28);
        rangeEnd.setDate(rangeEnd.getDate() + 28);
      } else if (view === 'week') {
        rangeStart = startOfWeek(cursor);
        rangeEnd = addDays(rangeStart, 6);
      } else {
        rangeStart = startOfDay(cursor);
        rangeEnd = addDays(rangeStart, 1);
      }
      const res = await fetch(`/api/calendar?start=${encodeURIComponent(rangeStart.toISOString())}&end=${encodeURIComponent(rangeEnd.toISOString())}`);
      if (res.ok) setEvents(await res.json());
    })();
  }, [cursor, view]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    for (const e of events) {
      const key = fmtLocalYMD(new Date(e.startsAtUtc));
      (map[key] ||= []).push(e);
    }
    return map;
  }, [events]);

  function MonthGrid() {
    const first = startOfMonth(cursor);
    const last = endOfMonth(cursor);
    const start = addDays(first, -((first.getDay()+6)%7)); // Monday-based grid
    const days: Date[] = [];
    for (let i=0;i<42;i++) days.push(addDays(start,i));
    const isSameMonth = (d: Date) => d.getMonth() === cursor.getMonth();
    const weekLabels = Array.from({length:7}).map((_,i)=> new Intl.DateTimeFormat(locale,{ weekday:'short'}).format(addDays(startOfWeek(cursor),i)));
    return (
      <div className="grid grid-cols-7 gap-2">
        {weekLabels.map((w,i)=>(<div key={i} className="text-xs text-gray-500 px-2">{w}</div>))}
        {days.map((d) => {
          const k = fmtLocalYMD(d);
          const list = eventsByDate[k] || [];
          return (
            <div key={k} className={`border border-default rounded min-h-[100px] p-2 ${isSameMonth(d)?'bg-card':'bg-secondary'}`}>
              <div className="text-xs font-medium flex items-center justify-between">
                <span>{d.getDate()}</span>
                <button className="text-[10px] underline" onClick={()=>{ setView('day'); setCursor(d); }}>{lang==='es'? 'Día': 'Day'}</button>
              </div>
              <div className="mt-1 space-y-1">
                {list.slice(0,3).map((e)=>{
                  const borderCls = e.cancelStatus==='APPROVED'?'border-red-300': e.cancelStatus==='PENDING'?'border-amber-300': e.cancelStatus==='REJECTED'?'border-green-300':'border-default';
                  return (
                    <a
                      key={`${e.id}-${e.occurrence}`}
                      href={role === 'STUDENT' ? `/student/lessons/${e.id}?occ=${encodeURIComponent(e.occurrence)}` : `/teacher/lessons/${e.id}?occ=${encodeURIComponent(e.occurrence)}`}
                      className={`block border ${borderCls} rounded px-1 py-0.5 text-[11px] truncate ${e.cancelStatus?'opacity-60':''}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <img src={e.personImage || '/avatar-placeholder.svg'} alt="avatar" className="w-3.5 h-3.5 rounded-full border object-cover" />
                        <span>{e.title}</span>
                      </span>
                    </a>
                  );
                })}
                {list.length===0 && <div className="text-[11px] text-gray-400">{lang==='es'? 'Sin eventos': 'No events'}</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function WeekView(){
    const start = startOfWeek(cursor);
    const days = Array.from({length:7}).map((_,i)=>addDays(start,i));
    return (
      <div>
        <div className="mb-3 text-sm text-gray-600">{new Intl.DateTimeFormat(locale,{dateStyle:'medium'}).format(days[0])} - {new Intl.DateTimeFormat(locale,{dateStyle:'medium'}).format(days[6])}</div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d)=>{
            const k = fmtLocalYMD(d);
            const list = eventsByDate[k]||[];
            return (
          <div key={k} className="border border-default rounded p-2 min-h-[120px]">
                <div className="text-xs font-medium mb-1">{d.getDate()}</div>
                {list.length===0 && <div className="text-[11px] text-gray-400">{lang==='es'? 'Sin eventos': 'No events'}</div>}
                <ul className="space-y-1">
                  {list.map((e)=>{
                    const borderCls = e.cancelStatus==='APPROVED'?'border-red-300': e.cancelStatus==='PENDING'?'border-amber-300': e.cancelStatus==='REJECTED'?'border-green-300':'border-default';
                    return (
                      <li key={`${e.id}-${e.occurrence}`} className={`border ${borderCls} rounded px-1 py-0.5 text-[11px] ${e.cancelStatus?'opacity-60':''}`}>
                        <a href={role === 'STUDENT' ? `/student/lessons/${e.id}?occ=${encodeURIComponent(e.occurrence)}` : `/teacher/lessons/${e.id}?occ=${encodeURIComponent(e.occurrence)}`} className="inline-flex items-center gap-1">
                          <img src={e.personImage || '/avatar-placeholder.svg'} alt="avatar" className="w-3.5 h-3.5 rounded-full border object-cover" />
                          <span>{e.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function DayView() {
    const key = fmtLocalYMD(cursor);
    const list = eventsByDate[key]||[];
    // Build 24-hour slots
    const slots = Array.from({length:24}).map((_,h)=>({ h, items: [] as EventItem[] }));
    for (const e of list) {
      const dt = new Date(e.startsAtUtc);
      const hour = dt.getHours();
      if (slots[hour]) slots[hour].items.push(e);
    }
    return (
      <div>
        <div className="mb-3 text-sm text-gray-600">{new Intl.DateTimeFormat(locale,{dateStyle:'full'}).format(cursor)}</div>
        <div className="border border-default rounded divide-y">
          {slots.map((s)=> (
            <div key={s.h} className="p-2">
              <div className="text-xs text-gray-500 mb-1">{String(s.h).padStart(2,'0')}:00</div>
              {s.items.length === 0 ? (
                <div className="text-[11px] text-gray-400">{lang==='es'? 'Sin eventos': 'No events'}</div>
              ) : (
                <ul className="space-y-1">
                  {s.items.map((e)=>{
                    const borderCls = e.cancelStatus==='APPROVED'?'border-red-300': e.cancelStatus==='PENDING'?'border-amber-300': e.cancelStatus==='REJECTED'?'border-green-300':'border-default';
                    return (
                      <li key={`${e.id}-${e.occurrence}`} className={`border ${borderCls} rounded px-2 py-1 text-[12px] ${e.cancelStatus?'opacity-60':''}`}>
                        <a href={role === 'STUDENT' ? `/student/lessons/${e.id}?occ=${encodeURIComponent(e.occurrence)}` : `/teacher/lessons/${e.id}?occ=${encodeURIComponent(e.occurrence)}`} className="inline-flex items-center gap-1">
                          <img src={e.personImage || '/avatar-placeholder.svg'} alt="avatar" className="w-3.5 h-3.5 rounded-full border object-cover" />
                          <span>{e.title}</span>
                        </a>
                        <span className="ml-2 text-gray-500">· {e.durationMin}m</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{lang==='es'?'Calendario':'Calendar'}</h1>
          {view==='month' && (
            <div className="text-sm text-gray-600">{new Intl.DateTimeFormat(locale,{month:'long', year:'numeric'}).format(cursor)}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="border border-default px-2 py-1 rounded hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring/50" onClick={()=>setCursor(addDays(cursor, - (view==='day'?1: view==='week'?7:30)))}>◀</button>
          <button className="border border-default px-2 py-1 rounded hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring/50" onClick={()=>setCursor(startOfDay(new Date()))}>{lang==='es'?'Hoy':'Today'}</button>
          <button className="border border-default px-2 py-1 rounded hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring/50" onClick={()=>setCursor(addDays(cursor, (view==='day'?1: view==='week'?7:30)))}>▶</button>
          <select className="border border-default rounded px-2 py-1 focus-visible:ring-2 focus-visible:ring-ring/50 bg-card" value={view} onChange={(e)=>setView(e.target.value as any)}>
            <option value="month">{lang==='es'?'Mes':'Month'}</option>
            <option value="week">{lang==='es'?'Semana':'Week'}</option>
            <option value="day">{lang==='es'?'Día':'Day'}</option>
          </select>
        </div>
      </div>
      {view==='month' ? <MonthGrid/> : view==='week' ? <WeekView/> : <DayView/>}
    </div>
  );
}
