/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.user.findMany({
    where: { role: "SUPERUSER" },
    select: { id: true, username: true, email: true, name: true, isActive: true }
  });
  console.log(JSON.stringify(users, null, 2));
  await prisma.();
})().catch(async (e) => { console.error(e); await prisma.(); process.exit(1); });
