const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const [username, newPassword] = process.argv.slice(2);
  if (!username || !newPassword) {
    console.error('Usage: node scripts/reset_password.js <username> <newPassword>');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      console.error('User not found:', username);
      process.exit(2);
    }
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    console.log(`Password updated for ${username}`);
  } catch (err) {
    console.error('Error:', err?.message || err);
    process.exit(3);
  } finally {
    await prisma.$disconnect();
  }
}

main();


