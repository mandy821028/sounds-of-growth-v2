import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-config";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { cookies } from "next/headers";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

export default async function SuperAdminPage() {
	const session = await getServerSession(authOptions);
	const role = (session?.user as SessionUser | undefined)?.role;
	if (!session || role !== "SUPER_ADMIN") {
		return <div className="p-8">Forbidden</div>;
	}
	const cookieStore = await cookies();
	const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
	const t = {
		title: locale === "es" ? "Profesores" : "Teachers",
		new: locale === "es" ? "Nuevo Profesor" : "New Teacher",
	};
	const teachers = await prisma.teacher.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
	type TeacherWithUser = (typeof teachers)[number];
	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-semibold mb-6">{t.title}</h1>
			<div className="mb-4">
				<Link className="border px-3 py-2 rounded" href="/super-admin/teachers/new">{t.new}</Link>
			</div>
			<ul className="space-y-2">
				{teachers.map((t: TeacherWithUser) => (
					<li key={t.id} className="border rounded p-3">
						<div className="font-medium flex items-center gap-2">
							<img src={t.user.image ?? "/avatar-placeholder.svg"} alt="avatar" className="w-7 h-7 rounded-full border object-cover" />
							<span>{t.user.firstName} {t.user.lastName}</span>
						</div>
						<div className="text-sm text-gray-600">{t.user.email}</div>
					</li>
				))}
			</ul>
		</div>
	);
}


