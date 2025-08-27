import { cookies } from "next/headers";

export default async function StudentHomePage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
  const t = {
    title: locale === "es" ? "Inicio" : "Home",
    subtitle: locale === "es" ? "Bienvenido(a) al panel de alumno" : "Welcome to the student dashboard",
  };
  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-semibold mb-2">{t.title}</h1>
      <p className="text-gray-500">{t.subtitle}</p>
    </div>
  );
}


