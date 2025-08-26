import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

async function main() {
  const prisma = new PrismaClient();
  const email = process.env.SEED_SUPER_ADMIN_EMAIL || "admin@example.com";
  const pwd = process.env.SEED_SUPER_ADMIN_PASSWORD || "ChangeMeStrong!123";
  const hashed = await hash(pwd, 10);
  const user = await prisma.user.update({ where: { email }, data: { hashedPassword: hashed } });
  console.log("Admin password reset with bcryptjs for:", user.email);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


