"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type StudentMarker = { id: string; name: string; lat?: number | null; lng?: number | null };

declare global {
  interface Window {
    google?: any;
    markerClusterer?: any;
  }
}

async function loadScript(src: string): Promise<void> {
  if (document.querySelector(`script[src=\"${src}\"]`)) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export default function MapClient({ students, center, apiKey }: { students: StudentMarker[]; center: { lat: number; lng: number }; apiKey: string }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [filter, setFilter] = useState("");

  const validStudents = useMemo(() => students.filter(s => typeof s.lat === "number" && typeof s.lng === "number") as Required<StudentMarker>[], [students]);
  const filtered = useMemo(() => validStudents.filter(s => s.name.toLowerCase().includes(filter.toLowerCase())), [validStudents, filter]);

  useEffect(() => {
    (async () => {
      await loadScript(`https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`);
      await loadScript("https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js");
      if (!window.google || !mapRef.current) return;
      mapObj.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: validStudents.length ? 12 : 2,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      // Initial markers
      const ms = validStudents.map(s => new window.google.maps.Marker({ position: { lat: s.lat, lng: s.lng }, title: s.name }));
      markersRef.current = ms;
      clustererRef.current = new (window as any).markerClusterer.MarkerClusterer({ map: mapObj.current, markers: ms });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when filter changes
  useEffect(() => {
    if (!mapObj.current || !clustererRef.current) return;
    clustererRef.current.clearMarkers();
    const ms = filtered.map(s => new window.google.maps.Marker({ position: { lat: s.lat, lng: s.lng }, title: s.name }));
    markersRef.current = ms;
    clustererRef.current.addMarkers(ms);
  }, [filtered]);

  function flyTo(studentId: string) {
    const s = validStudents.find(v => v.id === studentId);
    if (!s || !mapObj.current) return;
    mapObj.current.setZoom(14);
    mapObj.current.panTo({ lat: s.lat, lng: s.lng });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 border rounded overflow-hidden" style={{ height: 480 }}>
        <div ref={mapRef} className="w-full h-full" />
      </div>
      <div className="border rounded p-3 overflow-auto" style={{ maxHeight: 480 }}>
        <input
          className="w-full border rounded px-2 py-1 mb-2"
          placeholder="Search student"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <ul className="space-y-2">
          {students.map((s) => (
            <li key={s.id}>
              <button
                className={`text-left w-full px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50`}
                onClick={() => flyTo(s.id)}
                disabled={!(typeof s.lat === "number" && typeof s.lng === "number")}
                title={typeof s.lat === "number" ? `${s.lat?.toFixed(4)}, ${s.lng?.toFixed(4)}` : "No location"}
              >
                {s.name} {!(typeof s.lat === "number" && typeof s.lng === "number") && <span className="text-xs text-gray-500">(no location)</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


