import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export type AppRole = "SUPER_ADMIN" | "TEACHER" | "STUDENT";

export async function requireSession() {
	const session = await getServerSession(authOptions);
	if (!session) return null;
	return session;
}

export async function requireRole(role: AppRole) {
	const session = await getServerSession(authOptions);
	if (!session) return null;
	const sessionRole = (session.user as { role?: AppRole }).role;
	if (sessionRole !== role) return null;
	return session;
}


