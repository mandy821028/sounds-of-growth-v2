"use client";
import { useEffect, useState } from "react";

export default function NewStudentPage() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [locale, setLocale] = useState("en");
	const [dateOfBirth, setDateOfBirth] = useState("");
	const [address, setAddress] = useState("");
	const [lat, setLat] = useState<number | undefined>();
	const [lng, setLng] = useState<number | undefined>();
	const [query, setQuery] = useState("");
	const [predictions, setPredictions] = useState<Array<{ description: string; place_id: string }>>([]);
	const [students, setStudents] = useState<Array<{ id: string; user: { firstName: string; lastName: string; email: string } }>>([]);
	const [lang, setLang] = useState<"en" | "es">("en");

	// Read language from cookie and react to changes broadcast by LanguageMenu
	useEffect(() => {
		const readCookie = () => {
			const m = document.cookie.match(/(?:^|; )locale=([^;]+)/);
			setLang(m?.[1] === "es" ? "es" : "en");
		};
		readCookie();
		function onLocaleChange() { readCookie(); }
		window.addEventListener("locale-change", onLocaleChange);
		return () => window.removeEventListener("locale-change", onLocaleChange);
	}, []);

	useEffect(() => {
		// Load existing students for context
		(async () => {
			try {
				const res = await fetch("/api/students", { cache: "no-store" });
				if (res.ok) setStudents(await res.json());
			} catch {}
		})();
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		async function run() {
			if (!query) { setPredictions([]); return; }
			try {
				const res = await fetch(`/api/geo/autocomplete?q=${encodeURIComponent(query)}&lang=${lang}`, { signal: controller.signal });
				const data = await res.json();
				setPredictions((data?.predictions ?? []).map((p: any) => ({ description: p.description, place_id: p.place_id })));
			} catch {}
		}
		const id = setTimeout(run, 250);
		return () => { controller.abort(); clearTimeout(id); };
	}, [query, lang]);

	async function pickPlace(placeId: string, description: string) {
		setAddress(description);
		setQuery(description);
		setPredictions([]);
		try {
			const res = await fetch(`/api/geo/details?placeId=${placeId}&lang=${lang}`);
			const data = await res.json();
			const loc = data?.result?.geometry?.location;
			if (loc) { setLat(loc.lat); setLng(loc.lng); }
		} catch {}
	}

	return (
		<div className="max-w-2xl mx-auto py-8">
			<h1 className="text-2xl font-semibold mb-6">{lang === "es" ? "Crear Estudiante" : "Create Student"}</h1>
			<form
				onSubmit={async (e) => {
					e.preventDefault();
					const res = await fetch("/api/students", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ firstName, lastName, email, phone, locale, dateOfBirth, address, lat, lng }),
					});
					if (res.ok) window.location.href = "/teacher";
				}}
				className="space-y-3"
			>
				<input className="w-full border rounded px-3 py-2" placeholder={lang === "es" ? "Nombre" : "First name"} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
				<input className="w-full border rounded px-3 py-2" placeholder={lang === "es" ? "Apellido" : "Last name"} value={lastName} onChange={(e) => setLastName(e.target.value)} />
				<input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
				<input className="w-full border rounded px-3 py-2" placeholder={lang === "es" ? "Teléfono (opcional)" : "Phone (optional)"} value={phone} onChange={(e) => setPhone(e.target.value)} />
				<select className="w-full border rounded px-3 py-2" value={locale} onChange={(e) => setLocale(e.target.value)}>
					<option value="en">EN</option>
					<option value="es">ES</option>
				</select>
				<div className="relative">
					<input
						className="w-full border rounded px-3 py-2"
						placeholder={lang === "es" ? "Dirección" : "Address"}
						value={query}
						onChange={(e) => { setAddress(""); setQuery(e.target.value); }}
					/>
					{predictions.length > 0 && (
						<ul className="absolute z-[60] mt-1 w-full bg-white border rounded shadow">
							{predictions.map((p) => (
								<li key={p.place_id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => pickPlace(p.place_id, p.description)}>
									{p.description}
								</li>
							))}
						</ul>
					)}
				</div>
				<input className="w-full border rounded px-3 py-2" placeholder={lang === "es" ? "Fecha de nacimiento" : "Date of birth"} type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
				<button className="w-full bg-black text-white py-2 rounded" type="submit">{lang === "es" ? "Crear" : "Create"}</button>
			</form>

			{/* Existing students list */}
			<div className="mt-10">
				<h2 className="text-xl font-semibold mb-3">{lang === "es" ? "Alumnos existentes" : "Existing students"}</h2>
				<ul className="space-y-2">
					{students.map((s) => (
						<li key={s.id} className="border rounded p-3">
							<div className="font-medium">{s.user.firstName} {s.user.lastName}</div>
							<div className="text-sm text-gray-600">{s.user.email}</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}


