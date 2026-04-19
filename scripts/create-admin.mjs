import { PrismaClient, AdminRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const username = process.argv[2];
const password = process.argv[3];
const roleArg = process.argv[4] || "SUPER_ADMIN";

if (!username || !password) {
  console.error("Usage: node scripts/create-admin.mjs <username> <password> [SUPER_ADMIN|OPERATOR]");
  process.exit(1);
}

const role = roleArg === "OPERATOR" ? AdminRole.OPERATOR : AdminRole.SUPER_ADMIN;

try {
  const passwordHash = await hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { username },
    update: {
      passwordHash,
      role,
    },
    create: {
      username,
      passwordHash,
      role,
    },
  });

  console.log(`Admin ready: ${admin.username} (${admin.role})`);
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
