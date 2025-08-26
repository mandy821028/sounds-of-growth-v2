"use client";
import { useState } from "react";

export default function NewTeacherForm({ locale }: { locale: "en" | "es" }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [userLocale, setUserLocale] = useState(locale);

    const t = {
        title: locale === "es" ? "Crear Profesor" : "Create Teacher",
        firstName: locale === "es" ? "Nombre" : "First name",
        lastName: locale === "es" ? "Apellido" : "Last name",
        email: "Email",
        phone: locale === "es" ? "Teléfono (opcional)" : "Phone (optional)",
        create: locale === "es" ? "Crear" : "Create",
    };

    return (
        <div className="max-w-md mx-auto py-8">
            <h1 className="text-2xl font-semibold mb-6">{t.title}</h1>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch("/api/teachers", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ firstName, lastName, email, phone, locale: userLocale }),
                    });
                    if (res.ok) window.location.href = "/super-admin";
                }}
                className="space-y-3"
            >
                <input className="w-full border rounded px-3 py-2" placeholder={t.firstName} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <input className="w-full border rounded px-3 py-2" placeholder={t.lastName} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                <input className="w-full border rounded px-3 py-2" placeholder={t.email} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className="w-full border rounded px-3 py-2" placeholder={t.phone} value={phone} onChange={(e) => setPhone(e.target.value)} />
                <select className="w-full border rounded px-3 py-2" value={userLocale} onChange={(e) => setUserLocale(e.target.value)}>
                    <option value="en">EN</option>
                    <option value="es">ES</option>
                </select>
                <button className="w-full bg-black text-white py-2 rounded" type="submit">{t.create}</button>
            </form>
        </div>
    );
}


