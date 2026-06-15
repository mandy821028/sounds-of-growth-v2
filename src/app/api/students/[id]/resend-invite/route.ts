import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, isAuthError } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { hash } from "bcrypt";

function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole("TEACHER");
  if (isAuthError(auth)) return auth;
  const { id } = await params;

  // Verify the student belongs to this teacher
  const teacher = await prisma.teacher.findUnique({ where: { userId: auth.user.id } });
  if (!teacher) return new NextResponse("Forbidden", { status: 403 });

  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!student) return new NextResponse("Not found", { status: 404 });
  if (student.teacherId !== teacher.id) return new NextResponse("Forbidden", { status: 403 });

  // Generate fresh temp password and reset mustChangePassword
  const tempPassword = generateTempPassword();
  const hashedPassword = await hash(tempPassword, 10);

  await prisma.user.update({
    where: { id: student.userId },
    data: { hashedPassword, mustChangePassword: true },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://clients.soundsofgrowth.com";
  const loginUrl = `${baseUrl}/login`;
  const locale = student.user.locale ?? "en";
  const firstName = student.user.firstName;

  const subject = locale === "es"
    ? "Tu cuenta de alumno en Sounds of Growth"
    : "Your Sounds of Growth student account";

  const html = locale === "es"
    ? `<p>Hola ${firstName},</p>
       <p>Tu cuenta de alumno en <b>Sounds of Growth</b> está lista.</p>
       <p>Ingresa en <a href="${loginUrl}">${loginUrl}</a> con esta contraseña temporal:</p>
       <p style="font-size:1.4em;font-weight:bold;letter-spacing:0.1em">${tempPassword}</p>
       <p>El sistema te pedirá cambiar la contraseña al entrar por primera vez.</p>
       <p style="color:#888;font-size:0.85em">Si no solicitaste este correo, puedes ignorarlo.</p>`
    : `<p>Hi ${firstName},</p>
       <p>Your <b>Sounds of Growth</b> student account is ready.</p>
       <p>Log in at <a href="${loginUrl}">${loginUrl}</a> using this temporary password:</p>
       <p style="font-size:1.4em;font-weight:bold;letter-spacing:0.1em">${tempPassword}</p>
       <p>You will be asked to change the password on your first login.</p>
       <p style="color:#888;font-size:0.85em">If you didn't request this, you can safely ignore it.</p>`;

  try {
    await sendEmail({ to: student.user.email, subject, html });
  } catch (e) {
    console.warn("[resend-invite] email send failed", e);
    return NextResponse.json({ error: "Email could not be sent. Check SMTP configuration." }, { status: 500 });
  }

  return NextResponse.json({ sent: true, email: student.user.email });
}
