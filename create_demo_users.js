const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoUsers() {
  try {
    console.log('Demo kullanıcılar oluşturuluyor...');

    // Demo kullanıcılar
    const demoUsers = [
      {
        username: 'admin',
        email: 'admin@protransfer.com',
        password: 'admin123',
        name: 'Süper Admin',
        role: 'SUPERUSER'
      },
      {
        username: 'muhasebe',
        email: 'muhasebe@protransfer.com',
        password: 'muhasebe123',
        name: 'Muhasebe Müdürü',
        role: 'ACCOUNTANT'
      },
      {
        username: 'operasyon',
        email: 'operasyon@protransfer.com',
        password: 'operasyon123',
        name: 'Operasyon Müdürü',
        role: 'OPERATION'
      },
      {
        username: 'satıcı',
        email: 'satıcı@protransfer.com',
        password: 'satıcı123',
        name: 'Satış Temsilcisi',
        role: 'SELLER'
      }
    ];

    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username }
      });

      if (existingUser) {
        console.log(`Kullanıcı zaten mevcut: ${userData.username}`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          isActive: true
        }
      });

      console.log(`✅ Kullanıcı oluşturuldu: ${user.name} (${user.username})`);
    }

    console.log('🎉 Tüm demo kullanıcılar başarıyla oluşturuldu!');
    console.log('\nDemo Hesaplar:');
    console.log('Süperkullanıcı: admin / admin123');
    console.log('Muhasebeci: muhasebe / muhasebe123');
    console.log('Operasyon: operasyon / operasyon123');
    console.log('Satıcı: satıcı / satıcı123');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUsers();
