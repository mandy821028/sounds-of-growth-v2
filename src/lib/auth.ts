import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { NextResponse } from "next/server";

export type AppRole = "SUPER_ADMIN" | "TEACHER" | "STUDENT";
export type SessionUser = { id: string; role: AppRole; locale: string; mustChangePassword?: boolean };

/** Returns the authenticated user or a NextResponse error to return early. */
export async function requireSession(): Promise<{ user: SessionUser } | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  return { user: session.user as SessionUser };
}

/** Returns the authenticated user if they have one of the allowed roles, or a NextResponse error. */
export async function requireRole(role: AppRole | AppRole[]): Promise<{ user: SessionUser } | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const user = session.user as SessionUser;
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(user.role)) return new NextResponse("Forbidden", { status: 403 });
  return { user };
}

/** Type guard to check if requireSession/requireRole returned a NextResponse. */
export function isAuthError(result: { user: SessionUser } | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}


