"use client";
import { useEffect, useState } from "react";

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<string | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/students/${params.id}`, { cache: "no-store" });
      setLoading(false);
      if (res.ok) {
        const st = await res.json();
        setFirstName(st.user.firstName || "");
        setLastName(st.user.lastName || "");
        setEmail(st.user.email || "");
        setPhone(st.user.phone || "");
        setAddress(st.address || "");
        setDateOfBirth(st.dateOfBirth ? String(st.dateOfBirth).slice(0,10) : "");
      }
    })();
  }, [params.id]);

  async function save() {
    const res = await fetch(`/api/students/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName, lastName, phone, address, dateOfBirth }) });
    if (res.ok) window.history.back();
  }

  if (loading) return <div className="p-6">...</div>;
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-3">
      <h1 className="text-2xl font-semibold mb-4">Editar alumno</h1>
      <input className="w-full border rounded px-3 py-2" placeholder="Nombre" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" placeholder="Apellido" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} readOnly />
      <input className="w-full border rounded px-3 py-2" placeholder="Teléfono (opcional)" value={phone} onChange={(e)=>setPhone(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" placeholder="Dirección" value={address} onChange={(e)=>setAddress(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" type="date" value={dateOfBirth} onChange={(e)=>setDateOfBirth(e.target.value)} />
      <div className="flex gap-2">
        <button className="border px-3 py-2 rounded" onClick={()=>window.history.back()}>Cancelar</button>
        <button className="border px-3 py-2 rounded" onClick={save}>Guardar</button>
      </div>
    </div>
  );
}


