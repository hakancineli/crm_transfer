const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperuser() {
  try {
    console.log('Superuser oluşturuluyor...');

    // Mevcut superuser'ı kontrol et
    const existingSuperuser = await prisma.user.findFirst({
      where: { role: 'SUPERUSER' }
    });

    if (existingSuperuser) {
      console.log('✅ Superuser zaten mevcut:', existingSuperuser.username);
      console.log('Email:', existingSuperuser.email);
      console.log('Şifre: superuser123');
      return;
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash('superuser123', 10);

    // Superuser oluştur
    const superuser = await prisma.user.create({
      data: {
        username: 'superuser',
        email: 'superuser@protransfer.com',
        password: hashedPassword,
        name: 'Super User',
        role: 'SUPERUSER',
        isActive: true
      }
    });

    console.log('✅ Superuser başarıyla oluşturuldu!');
    console.log('Username: superuser');
    console.log('Email: superuser@protransfer.com');
    console.log('Şifre: superuser123');
    console.log('ID:', superuser.id);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperuser();
