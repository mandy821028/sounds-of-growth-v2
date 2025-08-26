import { cookies } from "next/headers";

export default async function MarketingHome() {
	const cookieStore = await cookies();
	const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
	return (
		<section className="max-w-5xl mx-auto px-4 py-16">
			<h1 className="text-4xl font-bold mb-4">Sounds of Growth</h1>
			<p className="text-lg text-gray-700">
				{locale === "es"
					? "Plataforma para docentes de música y sus alumnos."
					: "Platform for music teachers and their students."}
			</p>

			{/* News Section */}
			<section className="mt-12">
				<h2 className="text-2xl font-semibold mb-4">
					{locale === "es" ? "Noticias" : "News"}
				</h2>
				<div className="grid gap-4 sm:grid-cols-2">
					<article className="rounded-lg border p-4">
						<h3 className="font-medium">{locale === "es" ? "Lanzamiento de la plataforma" : "Platform launch"}</h3>
						<p className="text-sm text-gray-600 mt-2">
							{locale === "es"
								? "Estamos preparando el lanzamiento público. Más detalles pronto."
								: "We are preparing the public launch. More details soon."}
						</p>
					</article>
					<article className="rounded-lg border p-4">
						<h3 className="font-medium">{locale === "es" ? "Actualización de características" : "Feature update"}</h3>
						<p className="text-sm text-gray-600 mt-2">
							{locale === "es"
								? "Agenda, clases y pagos integrados en desarrollo."
								: "Schedule, classes and payments integrations in progress."}
						</p>
					</article>
				</div>
			</section>

			{/* Blog Section */}
			<section className="mt-12">
				<h2 className="text-2xl font-semibold mb-4">Blog</h2>
				<div className="grid gap-4 sm:grid-cols-3">
					<article className="rounded-lg border p-4">
						<h3 className="font-medium">{locale === "es" ? "Mejores prácticas para clases en línea" : "Best practices for online lessons"}</h3>
						<p className="text-sm text-gray-600 mt-2">
							{locale === "es"
								? "Consejos para docentes al impartir clases remotas."
								: "Tips for teachers delivering remote lessons."}
						</p>
					</article>
					<article className="rounded-lg border p-4">
						<h3 className="font-medium">{locale === "es" ? "Cómo organizar tu agenda" : "How to organize your schedule"}</h3>
						<p className="text-sm text-gray-600 mt-2">
							{locale === "es"
								? "Estrategias para administrar clases y estudiantes."
								: "Strategies to manage classes and students."}
						</p>
					</article>
					<article className="rounded-lg border p-4">
						<h3 className="font-medium">{locale === "es" ? "Herramientas para evaluación musical" : "Tools for music assessment"}</h3>
						<p className="text-sm text-gray-600 mt-2">
							{locale === "es"
								? "Recursos para medir el progreso de tus alumnos."
								: "Resources to track student progress."}
						</p>
					</article>
				</div>
			</section>

			<p className="mt-12 text-sm text-gray-500">
				{locale === "es"
					? "Usa el menú superior para Login o cambiar el idioma."
					: "Use the top menu to Login or switch language."}
			</p>
		</section>
	);
}


