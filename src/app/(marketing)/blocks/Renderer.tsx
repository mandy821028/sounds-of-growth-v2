import { PageBlockType } from "@prisma/client";
import Hero from "./Hero";
import ChallengeOfWeek from "./ChallengeOfWeek";
import CurvedRow from "./CurvedRow";
import AudioList from "./AudioList";
import LearningPathRow from "./LearningPathRow";
import Spotlight from "./Spotlight";
import Events from "./Events";
import NewsletterCTA from "./NewsletterCTA";
import WhatsAppCTA from "./WhatsAppCTA";
import BlogCards from "./BlogCards";

export function renderBlock(block: any) {
  const data = block.data || {};
  const blockId = (block as any).id as string | undefined;
  switch (block.type) {
    case "HERO":
      return <Hero title={data.title ?? "Sounds of Growth"} subtitle={data.subtitle} />;
    case "CHALLENGE":
      return (
        <ChallengeOfWeek
          title={data.title ?? "Practice of the week"}
          description={data.description}
          ctaHref={data.ctaHref}
          ctaLabel={data.ctaLabel}
        />
      );
    case "CURVED_ROW":
      return <CurvedRow heading={data.heading}>{/* items can be mapped later */}</CurvedRow>;
    case "AUDIO_LIST":
      return <AudioList heading={data.heading} items={Array.isArray(data.items) ? data.items : []} blockId={blockId} />;
    case "GRID_CARDS":
      // Using GRID_CARDS to render a Learning Path row
      return <LearningPathRow heading={data.heading} steps={Array.isArray(data.steps) ? data.steps : []} blockId={blockId} />;
    case "SPOTLIGHT":
      return <Spotlight title={data.title ?? "Instrument"} description={data.description} imageUrl={data.imageUrl} ctaHref={data.ctaHref} ctaLabel={data.ctaLabel} />;
    case "EVENTS":
      return <Events heading={data.heading} items={Array.isArray(data.items) ? data.items : []} blockId={blockId} />;
    case "NEWSLETTER":
      return <NewsletterCTA heading={data.heading} sub={data.sub} placeholder={data.placeholder} button={data.button} whatsappHref={data.whatsappHref} whatsappLabel={data.whatsappLabel} blockId={blockId} />;
    case "WHATSAPP":
      return <WhatsAppCTA heading={data.heading} sub={data.sub} number={data.number} message={data.message} button={data.button} blockId={blockId} />;
    case "BLOG_CARDS":
      return <BlogCards heading={data.heading} items={Array.isArray(data.items) ? data.items : []} />;
    default:
      return null;
  }
}

