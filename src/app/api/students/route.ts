import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { hash } from "bcrypt";
import { sendEmail } from "@/lib/email";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

const TEMP_STUDENT_PASSWORD = process.env.TEMP_STUDENT_PASSWORD || process.env.TEMP_TEACHER_PASSWORD || "ChangeMe123!";

const createStudentSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	phone: z.string().optional(),
	locale: z.enum(["en", "es"]).default("en"),
	dateOfBirth: z.string(), // ISO date
	address: z.string().optional(),
	lat: z.number().optional(),
	lng: z.number().optional(),
  password: z.string().min(8).optional(),
});

export async function GET() {
	const session = await getServerSession(authOptions);
	const sUser = session?.user as SessionUser | undefined;
	if (!session || sUser?.role !== "TEACHER") {
		return new NextResponse("Forbidden", { status: 403 });
	}
	const me = await prisma.user.findUnique({ where: { id: sUser.id }, include: { teacher: true } });
	if (!me?.teacher) return new NextResponse("Forbidden", { status: 403 });
	const students = await prisma.student.findMany({
		where: { teacherId: me.teacher.id },
		include: { user: true },
		orderBy: { createdAt: "desc" },
	});
	return NextResponse.json(students);
}

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);
	const sUser = session?.user as SessionUser | undefined;
	if (!session || sUser?.role !== "TEACHER") {
		return new NextResponse("Forbidden", { status: 403 });
	}
	const me = await prisma.user.findUnique({ where: { id: sUser.id }, include: { teacher: true } });
	if (!me?.teacher) return new NextResponse("Forbidden", { status: 403 });
	const json = await req.json();
	const parsed = createStudentSchema.safeParse(json);
	if (!parsed.success) {
		return NextResponse.json(parsed.error.format(), { status: 400 });
	}
	const { firstName, lastName, email, phone, locale, dateOfBirth, address, lat, lng } = parsed.data;
	const password = parsed.data.password ?? TEMP_STUDENT_PASSWORD;
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) return new NextResponse("Email already exists", { status: 409 });
	const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
		const hashedPassword = await hash(password, 10);
		const user = await tx.user.create({
			data: {
				email,
				firstName,
				lastName,
				phone,
				locale,
				role: "STUDENT",
				hashedPassword,
				mustChangePassword: true,
			},
		});
		const student = await tx.student.create({
			data: {
				userId: user.id,
				teacherId: me.teacher!.id,
				dateOfBirth: new Date(dateOfBirth),
				address,
				lat,
				lng,
			},
		});
		return { user, student };
	});
	// Send onboarding email best-effort
	const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
	const loginUrl = `${baseUrl}/login`;
	const subject = locale === "es" ? "Tu cuenta de alumno en Sounds of Growth" : "Your Sounds of Growth student account";
	const html = locale === "es"
		? `<p>Hola ${firstName},</p><p>Se ha creado tu cuenta de alumno en <b>Sounds of Growth</b>.</p><p>Ingresa en <a href="${loginUrl}">${loginUrl}</a> con esta contraseña temporal: <code>${password}</code></p><p>Por seguridad, el sistema te pedirá cambiar la contraseña al entrar.</p>`
		: `<p>Hi ${firstName},</p><p>Your <b>Sounds of Growth</b> student account has been created.</p><p>Log in at <a href="${loginUrl}">${loginUrl}</a> using this temporary password: <code>${password}</code></p><p>For security, the system will ask you to change the password on first login.</p>`;
	try { await sendEmail({ to: email, subject, html }); } catch (e) { console.warn("[students] email send failed", e); }
	return NextResponse.json(result, { status: 201 });
}


