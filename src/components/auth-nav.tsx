"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function AuthNav({ locale = "en" }: { locale?: "en" | "es" }) {
  const { status, data } = useSession();
  const isLoggedIn = status === "authenticated";
  // update image when changed in profile
  const [avatar, setAvatar] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/account/profile', { cache: 'no-store' });
        if (res.ok) {
          const u = await res.json();
          setAvatar(u?.image ?? null);
        }
      } catch {}
    })();
    function onAvatarChange(e: any) { setAvatar(e?.detail ?? null); }
    if (typeof window !== 'undefined') {
      window.addEventListener('avatar-change', onAvatarChange);
      return () => window.removeEventListener('avatar-change', onAvatarChange);
    }
  }, []);
  const labels = {
    dashboard: locale === "es" ? "Panel" : "Dashboard",
    login: locale === "es" ? "Ingresar" : "Login",
    profile: locale === "es" ? "Perfil" : "Profile",
    changePwd: locale === "es" ? "Cambiar contraseña" : "Change password",
    logout: locale === "es" ? "Salir" : "Logout",
  };
  return isLoggedIn ? (
    <div className="flex items-center gap-2">
      <Link href="/me" className="text-sm">{labels.dashboard}</Link>
      <div className="flex items-center gap-2">
        <img src={avatar ?? (data?.user?.image as any) ?? "/avatar-placeholder.svg"} alt="avatar" className="w-7 h-7 rounded-full border object-cover" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">{data?.user?.name ?? "Account"}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/account">{labels.profile}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/change-password">{labels.changePwd}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
            {labels.logout}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </div>
  ) : (
    <Link href="/login" className="text-sm">{labels.login}</Link>
  );
}


