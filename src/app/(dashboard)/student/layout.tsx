import { getTranslations } from "next-intl/server";
import SidebarNav from "@/components/sidebar-nav";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const tCommon = await getTranslations("common");
  const tStudent = await getTranslations("studentLessons");
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
      <aside className="col-span-12 md:col-span-3">
        <SidebarNav
          items={[
            { label: tCommon("home"), href: "/student" },
            { label: tCommon("calendar"), href: "/calendar" },
            { label: tStudent("title"), href: "/student/lessons" },
            { label: "Summer Camps ☀️", href: "/student/summer-camps" },
          ]}
        />
      </aside>
      <section className="col-span-12 md:col-span-9">
        {children}
      </section>
    </div>
  );
}


