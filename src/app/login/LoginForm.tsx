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
		<div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
			<div className="w-full max-w-sm">
				{/* Logo + brand */}
				<div className="text-center mb-8">
					<img
						src="/logo_animated.svg"
						alt="Sounds of Growth"
						className="mx-auto mb-4 h-28 w-auto"
					/>
					<h1 className="font-heading text-3xl font-light text-foreground tracking-tight">
						{t("title")}
					</h1>
					<p className="mt-1 font-body text-sm text-muted-foreground">
						Sounds of Growth
					</p>
				</div>

				{/* Card */}
				<div className="playful-card px-7 py-8">
					<div
						className="space-y-4"
						onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
					>
						<div className="space-y-1.5">
							<label className="font-body text-sm font-medium text-foreground">
								{t("email")}
							</label>
							<Input
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								autoComplete="email"
							/>
						</div>

						<div className="space-y-1.5">
							<label className="font-body text-sm font-medium text-foreground">
								{t("password")}
							</label>
							<Input
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="current-password"
							/>
						</div>

						{error && (
							<p className="font-body text-sm text-destructive">{error}</p>
						)}

						<Button
							type="button"
							onClick={handleSubmit}
							className="w-full mt-2"
							disabled={isLoading}
						>
							{isLoading
								? (<span className="inline-flex items-center gap-2"><Spinner /> {tCommon("loading")}</span>)
								: t("submit")}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}


