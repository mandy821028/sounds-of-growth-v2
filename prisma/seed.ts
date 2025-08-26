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
		return;
	}

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

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});


