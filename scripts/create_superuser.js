const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperuser() {
  try {
    console.log('Superuser oluşturuluyor...');

    // Prisma client might be stale; use raw SQL to avoid generated type issues
    const existing = await prisma.$queryRaw`SELECT id, username, email FROM "User" WHERE role = 'SUPERUSER' LIMIT 1`;

    if (Array.isArray(existing) && existing.length > 0) {
      const u = existing[0];
      console.log('✅ Superuser zaten mevcut:', u.username);
      console.log('Email:', u.email);
      console.log('Şifre: superuser123');
      return;
    }

    const hashedPassword = await bcrypt.hash('superuser123', 10);

    // Create using raw SQL to avoid schema drift in generated client
    const user = await prisma.$queryRaw`INSERT INTO "User" (id, username, email, password, name, role, "isActive", "createdAt", "updatedAt") VALUES (gen_random_uuid(), 'superuser', 'superuser@protransfer.com', ${hashedPassword}, 'Super User', 'SUPERUSER', true, now(), now()) RETURNING id, username, email`;

    const created = Array.isArray(user) ? user[0] : user;
    console.log('✅ Superuser başarıyla oluşturuldu!');
    console.log('Username:', created.username);
    console.log('Email:', created.email);
    console.log('Şifre: superuser123');
    console.log('ID:', created.id);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperuser();
