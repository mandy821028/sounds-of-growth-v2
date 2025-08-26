import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const temp = process.env.TEMP_STUDENT_PASSWORD || process.env.TEMP_TEACHER_PASSWORD || "ChangeMe123!";
  const users = await prisma.user.findMany({ where: { role: "STUDENT", hashedPassword: null } });
  if (users.length === 0) {
    console.log("No student users without password found.");
    return;
  }
  const hashed = await hash(temp, 10);
  for (const u of users) {
    await prisma.user.update({ where: { id: u.id }, data: { hashedPassword: hashed, mustChangePassword: true } });
    console.log(`Updated student ${u.email}`);
  }
  console.log(`Done. Backfilled ${users.length} student(s).`);
}

main().finally(async () => {
  await prisma.$disconnect();
});


