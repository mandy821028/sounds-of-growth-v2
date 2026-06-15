import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-config";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { cookies } from "next/headers";
import ResendInviteButton from "@/components/ResendInviteButton";

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
				<Link className="border border-default px-3 py-2 rounded bg-card hover:bg-primary/10" href="/teacher/students/new">{t.new}</Link>
				<Link className="border border-default px-3 py-2 rounded bg-card hover:bg-primary/10" href="/teacher/map">{locale === "es" ? "Ver mapa" : "View map"}</Link>
			</div>
		<ul className="space-y-2">
			{students.map((s: StudentWithUser) => (
				<li key={s.id} className="border border-default rounded p-3 bg-card">
					<div className="font-medium flex items-center gap-2 flex-wrap">
						<img src={s.user.image ?? "/avatar-placeholder.svg"} alt="avatar" className="w-7 h-7 rounded-full border object-cover" />
						<span>{s.user.firstName} {s.user.lastName}</span>
						<a className="ml-2 text-sm underline" href={`/teacher/students/${s.id}/edit`}>{locale === 'es' ? 'Editar' : 'Edit'}</a>
					</div>
					<div className="text-sm text-gray-600 mt-1">{s.user.email} · {new Date(s.dateOfBirth).toLocaleDateString()}</div>
					<div className="mt-2">
						<ResendInviteButton studentId={s.id} email={s.user.email} />
					</div>
				</li>
			))}
		</ul>
		</div>
	);
}


