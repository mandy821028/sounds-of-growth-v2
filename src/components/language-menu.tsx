"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";

export default function LanguageMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("common");

  function setLanguage(lang: "en" | "es") {
    // Set cookie on client
    document.cookie = `locale=${lang}; path=/`;
    // Remove ?lang param from URL to prevent middleware overriding the cookie
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (params.has("lang")) params.delete("lang");
    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(newUrl);
    // Notify client components listening for locale changes
    try { window.dispatchEvent(new CustomEvent("locale-change", { detail: lang })); } catch {}
    // Refresh to re-render server components with new cookie
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">{t("language")}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setLanguage("en"); }}>
          {t("english")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setLanguage("es"); }}>
          {t("spanish")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

