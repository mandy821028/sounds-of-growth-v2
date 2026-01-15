"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { status } = useSession();
	const t = useTranslations("login");
	const tCommon = useTranslations("common");
	const { show } = useToast();

	useEffect(() => {
		if (status === "authenticated") {
			router.replace("/me");
		}
	}, [status, router]);

	const handleSubmit = useCallback(async () => {
		try {
			setError(null);
			if (!email.trim() || !password) {
				setError(t("invalid"));
				show(t("invalid"), "error");
				return;
			}
			setIsLoading(true);
			const res = await signIn("credentials", {
				redirect: false,
				callbackUrl: "/me",
				email: email.trim(),
				password,
			});
			setIsLoading(false);
			if (res?.error) {
				setError(t("invalid"));
				show(t("invalid"), "error");
				return;
			}
			if (res?.url) {
				// Try to route by role after session resolves
				try {
					const s = await fetch("/api/auth/session").then((r) => r.json());
					const role = s?.user?.role as string | undefined;
					const mustChange = Boolean(s?.user?.mustChangePassword);
					if (mustChange) {
						show(t("mustChange"), "info");
						window.location.assign("/account/change-password");
						return;
					}
					if (role === "SUPER_ADMIN") {
						show(tCommon("success"), "success");
						window.location.assign("/super-admin");
						return;
					}
					if (role === "TEACHER") {
						show(tCommon("success"), "success");
						window.location.assign("/teacher");
						return;
					}
				} catch {}
				window.location.assign(res.url);
				return;
			}
			// Fallback
			router.replace("/me");
		} catch (e) {
			setIsLoading(false);
			setError(t("genericError"));
			show(t("genericError"), "error");
		}
	}, [email, password, router]);

	return (
		<div className="max-w-md mx-auto py-16">
			<img
				src="/logo_animated.svg"
				alt="Sounds of Growth"
				className="mx-auto mb-6 h-40 w-auto"
			/>
			<h1 className="text-2xl font-semibold mb-4 text-center">{t("title")}</h1>
			<div className="space-y-4" onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}>
				<Input
					type="email"
					placeholder={t("email")}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="bg-white border-gray-300"
				/>
				<Input
					type="password"
					placeholder={t("password")}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="bg-white border-gray-300"
				/>
				<Button type="button" onClick={handleSubmit} className="w-full text-white bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
					{isLoading ? (<span className="inline-flex items-center gap-2"><Spinner /> {tCommon("loading")}</span>) : t("submit")}
				</Button>
			</div>
			{error && <p className="mt-3 text-sm text-red-500">{error}</p>}
			{/* Magic link (email) flow removed for clarity; can be re-enabled when SMTP is configured */}
		</div>
	);
}


