import Link from "next/link";
import { cookies } from "next/headers";
import SidebarNav from "@/components/sidebar-nav";

export default async function SuperAdminSectionLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
  const t = {
    teachers: locale === "es" ? "Profesores" : "Teachers",
    content: locale === "es" ? "Contenido" : "Content",
    analytics: locale === "es" ? "Analítica" : "Analytics",
    blogs: locale === "es" ? "Blogs" : "Blogs",
    social: locale === "es" ? "Redes sociales" : "Social media",
    media: locale === "es" ? "Biblioteca multimedia" : "Media library",
  };
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
      <aside className="col-span-12 md:col-span-3">
        <SidebarNav
          items={[
            { label: t.teachers, href: "/super-admin" },
            { label: t.content, href: "/super-admin/blocks" },
            { label: t.blogs, href: "/super-admin/blogs" },
            { label: t.social, href: "/super-admin/social" },
            { label: t.media, href: "/super-admin/media" },
            { label: t.analytics, href: "/super-admin/analytics" },
          ]}
        />
      </aside>
      <section className="col-span-12 md:col-span-9">
        {children}
      </section>
    </div>
  );
}


