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
			<h1 className="text-2xl font-semibold mb-6">{t("title")}</h1>
			<div className="space-y-4" onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}>
				<Input
					type="email"
					placeholder={t("email")}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<Input
					type="password"
					placeholder={t("password")}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<Button type="button" onClick={handleSubmit} className="w-full" disabled={isLoading}>
					{isLoading ? (<span className="inline-flex items-center gap-2"><Spinner /> {tCommon("loading")}</span>) : t("submit")}
				</Button>
			</div>
			{error && <p className="mt-3 text-sm text-red-500">{error}</p>}
			<div className="mt-6">
				<Button variant="outline"
					className="w-full"
					onClick={async () => {
						try {
							await signIn("email", { email, callbackUrl: "/me" });
							show(tCommon("success"), "success");
						} catch {
							show(t("genericError"), "error");
						}
					}}
					disabled={!email || isLoading}
				>
					{t("magic")}
				</Button>
			</div>
		</div>
	);
}


