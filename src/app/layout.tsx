import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { DEFAULT_LOCALE, AppLocale, normalizeLocale } from "@/i18n/config";
import { ToastProvider } from "@/components/ui/toast-provider";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading-var",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body-var",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sounds of Growth",
  description: "Teaching platform for music teachers and students",
  icons: {
    icon: "/logo_animated.svg",
    shortcut: "/logo_animated.svg",
    apple: "/logo_animated.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale: AppLocale = normalizeLocale(cookieStore.get("locale")?.value ?? DEFAULT_LOCALE);
  const messages = locale === "es" ? (await import("@/messages/es.json")).default : (await import("@/messages/en.json")).default;
  const theme = (cookieStore.get("theme")?.value === "light") ? "light" : "dark";
  return (
    <html lang={locale} suppressHydrationWarning className={theme === "light" ? "theme-light" : "theme-dark"}>
      <body suppressHydrationWarning
        className={`${cormorant.variable} ${dmSans.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
