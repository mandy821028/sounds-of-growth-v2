import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import DeleteBlogButton from "./DeleteBlogButton.client";

export const dynamic = "force-dynamic";

export default async function BlogsListPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
  const posts = await prisma.blogPost.findMany({
    where: { locale },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Blogs</h1>
        <div className="flex items-center gap-2">
          <Link href="/super-admin/blogs/new" className="border border-default rounded px-3 py-1 hover:bg-primary/10">+ New</Link>
        </div>
      </div>
      <div className="space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="flex items-center justify-between border border-default rounded-lg bg-card px-3 py-2">
            <div className="min-w-0">
              <div className="font-medium truncate">{p.title}</div>
              <div className="text-xs text-muted-foreground">/{p.locale}/blog/{p.slug} · {p.published ? "Published" : "Unpublished"}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/super-admin/blogs/${p.id}/edit`} className="text-sm border border-default rounded px-2 py-1 hover:bg-primary/10">Edit</Link>
              <DeleteBlogButton id={p.id} />
            </div>
          </div>
        ))}
        {posts.length === 0 && <div className="text-sm text-muted-foreground">No posts yet.</div>}
      </div>
    </div>
  );
}

