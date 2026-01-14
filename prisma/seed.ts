import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	const email = process.env.SEED_SUPER_ADMIN_EMAIL;
	const password = process.env.SEED_SUPER_ADMIN_PASSWORD;
	const firstName = process.env.SEED_SUPER_ADMIN_FIRST_NAME ?? "Super";
	const lastName = process.env.SEED_SUPER_ADMIN_LAST_NAME ?? "Admin";
	const locale = process.env.SEED_SUPER_ADMIN_LOCALE ?? "en";

	if (!email || !password) {
		console.log("Seed skipped: missing SEED_SUPER_ADMIN_* envs");
		return;
	}

	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		console.log("Super admin already exists");
	} else {
		const hashedPassword = await hash(password, 10);
		const user = await prisma.user.create({
			data: {
				email,
				firstName,
				lastName,
				locale,
				role: "SUPER_ADMIN",
				hashedPassword,
			},
		});
		console.log("Created SUPER_ADMIN:", user.email);
	}

	// seed default class types
	const defaults = ["Music", "Piano", "Violin"];
	for (const name of defaults) {
		await prisma.classType.upsert({ where: { name }, update: {}, create: { name } });
	}
	console.log("Seeded ClassType defaults");

	// Seed homepage blocks por cada locale si no hay datos previos
	const locales = ["en", "es"];
	for (const loc of locales) {
		const count = await prisma.pageBlock.count({ where: { path: "/", locale: loc } });
		if (count > 0) continue;
		await prisma.pageBlock.createMany({
			data: [
				{
					type: "HERO",
					path: "/",
					locale: loc,
					position: 0,
					data: { title: "Sounds of Growth", subtitle: loc === "es" ? "Plataforma para docentes de música y sus alumnos." : "Platform for music teachers and their students." } as any,
				},
				{
					type: "CHALLENGE",
					path: "/",
					locale: loc,
					position: 1,
					data: {
						title: loc === "es" ? "Reto de la semana" : "Challenge of the Week",
						description:
							loc === "es"
								? "Practica esta célula rítmica y mejora tu tiempo interno."
								: "Practice this rhythm cell to improve your inner time.",
						ctaLabel: loc === "es" ? "Ver" : "View",
						ctaHref: "#",
					} as any,
				},
				{
					type: "AUDIO_LIST",
					path: "/",
					locale: loc,
					position: 2,
					data: {
						heading: "Sound Bites",
						items: [
							{ id: "a1", title: loc === "es" ? "Respiración antes de tocar" : "Breath before playing", url: "https://cdn.pixabay.com/download/audio/2021/09/17/audio_c7f7c69f7a.mp3?filename=soft-piano-ambient-110582.mp3" },
							{ id: "a2", title: loc === "es" ? "Pulso interno" : "Inner pulse", url: "https://cdn.pixabay.com/download/audio/2022/03/09/audio_5fcae4d1eb.mp3?filename=ambient-piano-loop-112199.mp3" },
							{ id: "a3", title: loc === "es" ? "Tono de referencia" : "Reference tone", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_9b9ea96de2.mp3?filename=lofi-study-112191.mp3" },
						],
					} as any,
				},
				{
					type: "GRID_CARDS",
					path: "/",
					locale: loc,
					position: 3,
					data: {
						heading: loc === "es" ? "Ruta: Lectura rítmica" : "Path: Rhythm reading",
						steps: [
							{ id: "s1", title: "Clap · 2/4" },
							{ id: "s2", title: "Clap · 3/4" },
							{ id: "s3", title: "Clap · 4/4" },
							{ id: "s4", title: "Syncopation" },
						],
					} as any,
				},
				{
					type: "GRID_CARDS",
					path: "/",
					locale: loc,
					position: 4,
					data: {
						heading: loc === "es" ? "Ruta: Técnica · Escalas" : "Path: Technique · Scales",
						steps: [
							{ id: "t1", title: "C major" },
							{ id: "t2", title: "G major" },
							{ id: "t3", title: "D major" },
							{ id: "t4", title: "A minor" },
						],
					} as any,
					audiences: ["STUDENTS"] as any,
				},
				{
					type: "SPOTLIGHT",
					path: "/",
					locale: loc,
					position: 5,
					data: {
						title: loc === "es" ? "Instrumento del Mes: Piano" : "Instrument of the Month: Piano",
						description: loc === "es" ? "Guía rápida de compra/mantenimiento para padres." : "Quick buying/maintenance guide for parents.",
						imageUrl: "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?q=80&w=1740&auto=format&fit=crop",
						ctaLabel: loc === "es" ? "Ver guía" : "Read guide",
						ctaHref: "#"
					} as any,
					audiences: ["PARENTS"] as any,
				},
				{
					type: "EVENTS",
					path: "/",
					locale: loc,
					position: 6,
					data: {
						heading: loc === "es" ? "Próximos eventos" : "Upcoming events",
						items: [
							{ id: "e1", title: loc === "es" ? "Recital trimestral" : "Term recital", dateIso: new Date().toISOString(), location: "Auditorio local" },
							{ id: "e2", title: loc === "es" ? "Concierto pedagógico" : "Pedagogical concert", dateIso: new Date(Date.now()+1000*60*60*24*30).toISOString(), location: "Sala B" },
						],
					} as any
				},
				{
					type: "NEWSLETTER",
					path: "/",
					locale: loc,
					position: 7,
					data: {
						heading: loc === "es" ? "Recibe el reto semanal" : "Get the weekly challenge",
						sub: loc === "es" ? "En tu correo o por WhatsApp" : "In your inbox or via WhatsApp",
						placeholder: "you@email.com",
						button: loc === "es" ? "Suscribirme" : "Subscribe",
						whatsappLabel: "WhatsApp",
						whatsappHref: "https://wa.me/"
					} as any
				},
				{
					type: "WHATSAPP",
					path: "/",
					locale: loc,
					position: 8,
					data: {
						heading: loc === "es" ? "¿Prefieres WhatsApp?" : "Prefer WhatsApp?",
						sub: loc === "es" ? "Escríbenos para dudas rápidas." : "Write us for quick questions.",
						button: "WhatsApp"
					} as any
				},
				{
					type: "BLOG_CARDS",
					path: "/",
					locale: loc,
					position: 9,
					data: {
						heading: loc === "es" ? "Blog" : "Blog",
						source: "auto",
						limit: 6
					} as any
				}
			],
		});
		console.log(`Seeded default PageBlocks for homepage (${loc})`);
	}
	// Seed blog posts metadata for current static MDX slugs if missing
	const blogSeed = [
		{
			locale: "en",
			title: "Tips for Your First Lessons",
			slug: "first-lessons",
			excerpt: "How to start strong in your first weeks.",
			tag: "Parents",
			imageUrl: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop",
			published: true,
		},
		{
			locale: "en",
			title: "15‑Minute Practice Routines",
			slug: "15-minute-practice",
			excerpt: "Tiny habits for big progress.",
			tag: "Students",
			imageUrl: "https://images.unsplash.com/photo-1513882230532-c8b27a97a8ea?q=80&w=1200&auto=format&fit=crop",
			published: true,
		},
		{
			locale: "en",
			title: "Stress‑Free Music Assessment",
			slug: "stress-free-assessment",
			excerpt: "Tools and mindsets focused on growth.",
			tag: "Teachers",
			imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
			published: true,
		},
		{
			locale: "es",
			title: "Consejos para tus primeras clases",
			slug: "first-lessons",
			excerpt: "Cómo empezar con buen pie las primeras semanas.",
			tag: "Padres",
			imageUrl: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop",
			published: true,
		},
		{
			locale: "es",
			title: "Rutinas de práctica de 15 minutos",
			slug: "15-minute-practice",
			excerpt: "Pequeños hábitos para grandes avances.",
			tag: "Alumnos",
			imageUrl: "https://images.unsplash.com/photo-1513882230532-c8b27a97a8ea?q=80&w=1200&auto=format&fit=crop",
			published: true,
		},
		{
			locale: "es",
			title: "Evaluación musical sin estrés",
			slug: "stress-free-assessment",
			excerpt: "Herramientas y enfoques centrados en el progreso.",
			tag: "Docentes",
			imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
			published: true,
		},
	] as const;
	for (const bp of blogSeed) {
		const exists = await prisma.blogPost.findFirst({ where: { locale: bp.locale, slug: bp.slug } });
		if (!exists) {
			await prisma.blogPost.create({ data: { ...bp } as any });
		}
	}
	console.log("Seeded BlogPost metadata");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});


