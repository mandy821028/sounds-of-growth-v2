import { prisma } from "@/lib/prisma";
import ToggleEnabled from "./toggle-enabled.client";
import DeleteLink from "./delete-link.client";
import NewLinkForm from "./NewLinkForm.client";

export const dynamic = "force-dynamic";

const providers = ["FACEBOOK","INSTAGRAM","YOUTUBE","TIKTOK","TWITTER","WHATSAPP","LINKEDIN"] as const;

export default async function SocialLinksPage() {
  const links = await prisma.socialLink.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Social media</h1>
      <NewLinkForm providers={providers as unknown as string[]} />
      <div className="space-y-2">
        {links.map((l)=>(
          <div key={l.id} className="flex items-center justify-between border border-default rounded-lg bg-card px-3 py-2">
            <div className="min-w-0">
              <div className="font-medium truncate flex items-center gap-2">
                {l.iconUrl && <img src={l.iconUrl} alt="" className="w-5 h-5 rounded border object-cover" />}
                <span>{l.label}</span> <span className="text-xs text-muted-foreground">({l.provider})</span>
              </div>
              <div className="text-xs text-muted-foreground truncate">{l.url}</div>
              {l.iconUrl && <div className="text-[11px] text-muted-foreground truncate">{l.iconUrl}</div>}
            </div>
            <div className="flex items-center gap-2">
              <ToggleEnabled id={l.id} enabled={l.enabled} />
              <DeleteLink id={l.id} />
            </div>
          </div>
        ))}
        {links.length===0 && <div className="text-sm text-muted-foreground">No links yet.</div>}
      </div>
    </div>
  );
}

