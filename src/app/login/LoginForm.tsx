"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { status } = useSession();

	function getLocale(): "en" | "es" {
		if (typeof document === "undefined") return "en";
		const m = document.cookie.match(/(?:^|; )locale=([^;]+)/);
		return m?.[1] === "es" ? "es" : "en";
	}

	const t = {
		title: getLocale() === "es" ? "Ingresar" : "Login",
		email: "Email",
		password: getLocale() === "es" ? "Contraseña" : "Password",
		signIn: getLocale() === "es" ? "Entrar" : "Sign in",
		loading: getLocale() === "es" ? "Entrando..." : "Signing in...",
		magic: getLocale() === "es" ? "Entrar con enlace mágico" : "Sign in with magic link",
		invalid: getLocale() === "es" ? "Credenciales inválidas" : "Invalid credentials",
		error: getLocale() === "es" ? "Error al iniciar sesión" : "Login error",
	};

	useEffect(() => {
		if (status === "authenticated") {
			router.replace("/me");
		}
	}, [status, router]);

	const handleSubmit = useCallback(async () => {
		try {
			setError(null);
			setIsLoading(true);
			const res = await signIn("credentials", {
				redirect: false,
				callbackUrl: "/me",
				email: email.trim(),
				password,
			});
			setIsLoading(false);
			if (res?.error) {
				setError(t.invalid);
				return;
			}
			if (res?.url) {
				// Try to route by role after session resolves
				try {
					const s = await fetch("/api/auth/session").then((r) => r.json());
					const role = s?.user?.role as string | undefined;
					const mustChange = Boolean(s?.user?.mustChangePassword);
					if (mustChange) {
						window.location.assign("/account/change-password");
						return;
					}
					if (role === "SUPER_ADMIN") {
						window.location.assign("/super-admin");
						return;
					}
					if (role === "TEACHER") {
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
			setError(t.error);
		}
	}, [email, password, router]);

	return (
		<div className="max-w-md mx-auto py-16">
			<h1 className="text-2xl font-semibold mb-6">{t.title}</h1>
			<div className="space-y-4" onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}>
				<input
					type="email"
					placeholder={t.email}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full border rounded px-3 py-2"
				/>
				<input
					type="password"
					placeholder={t.password}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full border rounded px-3 py-2"
				/>
				<button type="button" onClick={handleSubmit} className="w-full bg-black text-white py-2 rounded disabled:opacity-50" disabled={isLoading}>
					{isLoading ? t.loading : t.signIn}
				</button>
			</div>
			{error && <p className="mt-3 text-sm text-red-500">{error}</p>}
			<div className="mt-6">
				<button
					className="w-full border py-2 rounded"
					onClick={() => signIn("email", { email, callbackUrl: "/me" })}
					disabled={!email}
				>
					{t.magic}
				</button>
			</div>
		</div>
	);
}


