import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-config";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { cookies } from "next/headers";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

export default async function TeacherPage() {
	const session = await getServerSession(authOptions);
	const sUser = session?.user as SessionUser | undefined;
	if (!session || sUser?.role !== "TEACHER") {
		return <div className="p-8">Forbidden</div>;
	}
	const cookieStore = await cookies();
	const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
	const t = {
		title: locale === "es" ? "Mis Alumnos" : "My Students",
		new: locale === "es" ? "Nuevo Alumno" : "New Student",
	};
	const me = await prisma.user.findUnique({ where: { id: sUser.id }, include: { teacher: true } });
	if (!me?.teacher) return <div className="p-8">Forbidden</div>;
	const students = await prisma.student.findMany({ where: { teacherId: me.teacher.id }, include: { user: true }, orderBy: { createdAt: "desc" } });
	type StudentWithUser = (typeof students)[number];
	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-semibold mb-6">{t.title}</h1>
			<div className="mb-4 flex gap-2">
				<Link className="border px-3 py-2 rounded" href="/teacher/students/new">{t.new}</Link>
				<Link className="border px-3 py-2 rounded" href="/teacher/map">{locale === "es" ? "Ver mapa" : "View map"}</Link>
			</div>
			<ul className="space-y-2">
				{students.map((s: StudentWithUser) => (
					<li key={s.id} className="border rounded p-3">
						<div className="font-medium">{s.user.firstName} {s.user.lastName}</div>
						<div className="text-sm text-gray-600">{s.user.email} · {new Date(s.dateOfBirth).toLocaleDateString()}</div>
					</li>
				))}
			</ul>
		</div>
	);
}


