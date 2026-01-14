import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { DEFAULT_LOCALE, AppLocale, normalizeLocale } from "@/i18n/config";
import { ToastProvider } from "@/components/ui/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
