import type { NextAuthOptions, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

type AppUser = User & { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string; mustChangePassword?: boolean };

function hasSmtpConfig() {
	return Boolean(
		process.env.EMAIL_SERVER_HOST &&
		process.env.EMAIL_SERVER_USER &&
		process.env.EMAIL_SERVER_PASSWORD &&
		process.env.EMAIL_FROM
	);
}

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	session: { strategy: "jwt" },
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				try {
					if (!credentials?.email || !credentials?.password) return null;
					const email = credentials.email.trim();
					const pwd = credentials.password.trim();
					const user = await prisma.user.findUnique({ where: { email } });
					console.log("[auth] credentials", { email });
					console.log("[auth] user found?", Boolean(user));
					if (!user || !user.hashedPassword) {
						console.log("[auth] missing user or password hash");
						return null;
					}
					const valid = await compare(pwd, user.hashedPassword);
					console.log("[auth] password valid?", valid);
					if (!valid) return null;
					const u: AppUser = {
						id: user.id,
						email: user.email,
						name: `${user.firstName} ${user.lastName}`,
						role: user.role,
						locale: user.locale,
						mustChangePassword: (user as any).mustChangePassword ?? false,
					};
					return u;
				} catch (err) {
					console.error("Credentials authorize error", err);
					return null;
				}
			},
		}),
		...(hasSmtpConfig()
			? [
				EmailProvider({
					server: {
						host: process.env.EMAIL_SERVER_HOST,
						port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
						auth: {
							user: process.env.EMAIL_SERVER_USER!,
							pass: process.env.EMAIL_SERVER_PASSWORD!,
						},
					},
					from: process.env.EMAIL_FROM!,
				}),
			]
			: []),
	],
	callbacks: {
		async jwt({ token, user }) {
			// On first sign in, persist fields into token
			if (user) {
				const u = user as AppUser;
				token.id = u.id;
				token.role = u.role;
				token.locale = u.locale;
				(token as any).mustChangePassword = u.mustChangePassword ?? false;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				(session.user as any).id = (token as any).id;
				(session.user as any).role = (token as any).role;
				(session.user as any).locale = (token as any).locale;
				(session.user as any).mustChangePassword = (token as any).mustChangePassword ?? false;
			}
			return session;
		},
		async signIn() {
			return true;
		},
		async redirect({ url, baseUrl }) {
			try {
				const u = new URL(url, baseUrl);
				if (u.pathname === "/" || u.pathname === "/login") {
					return `${baseUrl}/me`;
				}
				return url.startsWith(baseUrl) ? url : baseUrl;
			} catch {
				return baseUrl;
			}
		},
	},
	pages: {
		signIn: "/login",
	},
	secret: process.env.NEXTAUTH_SECRET,
};


