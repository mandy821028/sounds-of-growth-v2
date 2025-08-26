import Link from "next/link";
import { cookies } from "next/headers";

export default async function SuperAdminSectionLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
  const t = {
    teachers: locale === "es" ? "Profesores" : "Teachers",
  };
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
      <aside className="col-span-12 md:col-span-3">
        <nav className="space-y-2">
          <Link className="block border rounded px-3 py-2" href="/super-admin">{t.teachers}</Link>
        </nav>
      </aside>
      <section className="col-span-12 md:col-span-9">
        {children}
      </section>
    </div>
  );
}


