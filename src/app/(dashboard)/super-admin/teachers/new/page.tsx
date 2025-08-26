import { cookies } from "next/headers";
import NewTeacherForm from "./NewTeacherForm";

export default async function NewTeacherPage() {
	const cookieStore = await cookies();
	const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
	return <NewTeacherForm locale={locale} />;
}


