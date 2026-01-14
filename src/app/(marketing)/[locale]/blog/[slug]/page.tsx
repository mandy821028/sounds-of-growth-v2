import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: { params: { locale: string; slug: string } }) {
  const locale = params.locale === "es" ? "es" : "en";
  const slug = params.slug;

  const post = await prisma.blogPost.findFirst({
    where: { locale, slug, published: true },
  });

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold mb-2">404</h1>
        <p className="text-muted-foreground mb-6">This page could not be found.</p>
        <Link href={`/${locale}`} className="border border-default rounded px-3 py-2 hover:bg-primary/10">
          {locale === "es" ? "Volver al inicio" : "Back to home"}
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <div className="text-sm text-muted-foreground mt-1">/{post.locale}/blog/{post.slug}</div>
      </header>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="" className="w-full rounded border mb-6 object-cover max-h-96" />
      )}
      {post.excerpt && (
        <p className="text-lg leading-relaxed">{post.excerpt}</p>
      )}
      <div className="mt-10">
        <Link href={`/${locale}`} className="text-sm border border-default rounded px-3 py-2 hover:bg-primary/10">
          {locale === "es" ? "Volver" : "Back"}
        </Link>
      </div>
    </article>
  );
}

