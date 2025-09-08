const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const [username, email, name, password, role] = process.argv.slice(2);
  if (!username || !email || !name || !password || !role) {
    console.error('Usage: node scripts/create_user.js <username> <email> <name> <password> <role>');
    process.exit(1);
  }

  const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
  if (existing) {
    console.log('User already exists:', { id: existing.id, username: existing.username, email: existing.email });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashed,
      name,
      role
    },
    select: {
      id: true, username: true, email: true, name: true, role: true, createdAt: true
    }
  });

  console.log('Created user:', user);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });



