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
					if (!user || !user.hashedPassword) return null;
					const valid = await compare(pwd, user.hashedPassword);
					if (!valid) return null;
					const u: AppUser = {
						id: user.id,
						email: user.email,
						name: `${user.firstName} ${user.lastName}`,
						role: user.role,
						locale: user.locale,
						mustChangePassword: user.mustChangePassword ?? false,
					};
					return u;
				} catch {
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
			if (user) {
				// First sign-in: embed role, locale, mustChangePassword into the JWT
				const u = user as AppUser;
				token.id = u.id;
				token.role = u.role;
				token.locale = u.locale;
				(token as any).mustChangePassword = u.mustChangePassword ?? false;
			} else if ((token as any).id) {
				// Subsequent requests: refresh mustChangePassword from DB so that
				// after the user changes their password the JWT reflects the new value.
				const dbUser = await prisma.user.findUnique({
					where: { id: (token as any).id as string },
					select: { mustChangePassword: true },
				});
				if (dbUser) {
					(token as any).mustChangePassword = dbUser.mustChangePassword;
				}
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


