const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperUser() {
  try {
    // Mevcut süperkullanıcı var mı kontrol et
    const existingSuperUser = await prisma.user.findFirst({
      where: { role: 'SUPERUSER' }
    });

    if (existingSuperUser) {
      console.log('Süperkullanıcı zaten mevcut:', existingSuperUser.username);
      return;
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Süperkullanıcı oluştur
    const superUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@protransfer.com',
        password: hashedPassword,
        name: 'Süperkullanıcı',
        role: 'SUPERUSER',
        isActive: true
      }
    });

    console.log('✅ Süperkullanıcı oluşturuldu:');
    console.log('Kullanıcı adı: admin');
    console.log('Şifre: admin123');
    console.log('Email: admin@protransfer.com');
  } catch (error) {
    console.error('❌ Süperkullanıcı oluşturulamadı:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperUser();
