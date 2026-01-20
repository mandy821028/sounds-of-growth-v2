import { prisma } from "@/lib/prisma";
import SlideForm from "../../slide-form.client";
import type { SliderItem } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function EditSlidePage({ params }: { params: { id: string } }) {
  const slide = await prisma.sliderItem.findUnique({ where: { id: params.id } });
  if (!slide) {
    return <div className="text-sm text-muted-foreground">Not found.</div>;
  }
  return <SlideForm mode="edit" slide={slide as SliderItem} />;
}

