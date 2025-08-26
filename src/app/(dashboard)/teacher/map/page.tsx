import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-config";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import MapClient from "./MapClient";

type SessionUser = { id: string; role: "SUPER_ADMIN" | "TEACHER" | "STUDENT"; locale: string };

export default async function TeacherMapPage() {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as SessionUser | undefined;
  if (!session || sUser?.role !== "TEACHER") {
    return <div className="p-8">Forbidden</div>;
  }
  const me = await prisma.user.findUnique({ where: { id: sUser.id }, include: { teacher: true } });
  if (!me?.teacher) return <div className="p-8">Forbidden</div>;
  const students = await prisma.student.findMany({ where: { teacherId: me.teacher.id }, include: { user: true } });

  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
  const t = {
    title: locale === "es" ? "Mapa de Alumnos" : "Students Map",
  };

  const center = students.find((s) => typeof s.lat === "number" && typeof s.lng === "number");
  const centerLat = center?.lat ?? 0;
  const centerLng = center?.lng ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">{t.title}</h1>
      <MapClient
        apiKey={process.env.GOOGLE_MAPS_API_KEY!}
        center={{ lat: centerLat, lng: centerLng }}
        students={students.map((s) => ({ id: s.id, name: `${s.user.firstName} ${s.user.lastName}`, lat: s.lat, lng: s.lng }))}
      />
    </div>
  );
}


