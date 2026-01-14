import { prisma } from "@/lib/prisma";
import EditBlogForm from "./EditBlogForm.client";

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) {
    return <div>Not found</div>;
  }
  return <EditBlogForm post={post} />;
}

