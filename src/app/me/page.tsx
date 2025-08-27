"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MeRedirectPage() {
	const router = useRouter();

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("/api/auth/session", { cache: "no-store" });
				const s = await res.json();
				console.log("[/me] session api", s);
				await fetch("/api/debug/session");
				const role = s?.user?.role as "SUPER_ADMIN" | "TEACHER" | "STUDENT" | undefined;
				if (role === "SUPER_ADMIN") return router.replace("/super-admin");
				if (role === "TEACHER") return router.replace("/teacher");
				if (role === "STUDENT") return router.replace("/student");
				if (s?.user) return router.replace("/");
				return router.replace("/login?callbackUrl=/me");
			} catch {
				router.replace("/login?callbackUrl=/me");
			}
		})();
	}, [router]);

	return <div className="p-8">Redirigiendo…</div>;
}
