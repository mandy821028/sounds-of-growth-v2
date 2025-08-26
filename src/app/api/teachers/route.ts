import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { z } from "zod";
import { hash } from "bcrypt";
import { sendEmail } from "@/lib/email";
import type { Prisma } from "@prisma/client";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

const TEMP_PASSWORD = process.env.TEMP_TEACHER_PASSWORD || "ChangeMe123!";

const createTeacherSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	phone: z.string().optional(),
	locale: z.enum(["en", "es"]).default("en"),
	password: z.string().min(8).optional(),
});

export async function GET() {
	const session = await getServerSession(authOptions);
	const sUser = session?.user as SessionUser | undefined;
	if (!session || sUser?.role !== "SUPER_ADMIN") {
		return new NextResponse("Forbidden", { status: 403 });
	}
	const teachers = await prisma.teacher.findMany({
		include: { user: true },
		orderBy: { createdAt: "desc" },
	});
	return NextResponse.json(teachers);
}

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);
	const sUser = session?.user as SessionUser | undefined;
	if (!session || sUser?.role !== "SUPER_ADMIN") {
		return new NextResponse("Forbidden", { status: 403 });
	}
	const json = await req.json();
	const parsed = createTeacherSchema.safeParse(json);
	if (!parsed.success) {
		return NextResponse.json(parsed.error.format(), { status: 400 });
	}
	const { firstName, lastName, email, phone, locale } = parsed.data;
	const password = parsed.data.password ?? TEMP_PASSWORD;
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) return new NextResponse("Email already exists", { status: 409 });
	const hashedPassword = await hash(password, 10);
	const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
		const user = await tx.user.create({
			data: {
				email,
				firstName,
				lastName,
				phone,
				locale,
				role: "TEACHER",
				hashedPassword,
				mustChangePassword: true,
			},
		});
		const teacher = await tx.teacher.create({ data: { userId: user.id } });
		return { user, teacher };
	});
	// Send onboarding email (best-effort)
	const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
	const loginUrl = `${baseUrl}/login`;
	const subject = locale === "es" ? "Tu cuenta en Sounds of Growth" : "Your Sounds of Growth account";
	const html = locale === "es"
		? `<p>Hola ${firstName},</p>
		   <p>Se ha creado tu cuenta en <b>Sounds of Growth</b>.</p>
		   <p>Ingresa en <a href="${loginUrl}">${loginUrl}</a> con esta contraseña temporal: <code>${password}</code></p>
		   <p>Por seguridad, el sistema te pedirá cambiar la contraseña al entrar.</p>`
		: `<p>Hi ${firstName},</p>
		   <p>Your <b>Sounds of Growth</b> account has been created.</p>
		   <p>Log in at <a href="${loginUrl}">${loginUrl}</a> using this temporary password: <code>${password}</code></p>
		   <p>For security, the system will ask you to change the password on first login.</p>`;
	try {
		await sendEmail({ to: email, subject, html });
	} catch (e) {
		console.warn("[teachers] email send failed", e);
	}
	return NextResponse.json(result, { status: 201 });
}


