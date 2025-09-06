const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateExistingUsers() {
  try {
    console.log('Mevcut kullanıcıların şifreleri güncelleniyor...');

    // Mevcut kullanıcıları al
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true
      }
    });

    // Her kullanıcı için varsayılan şifre oluştur
    const defaultPasswords = {
      'admin': 'admin123',
      'muhasebe': 'muhasebe123',
      'operasyon': 'operasyon123',
      'satıcı': 'satıcı123',
      'Şekip Ahmet Kırk': 'sekip123',
      'Seyfettin Ahmet Kırk': 'seyfettin123',
      'Mehmet Ahmet Kırk': 'mehmet123'
    };

    for (const user of users) {
      // Kullanıcı adına göre şifre belirle
      let password = defaultPasswords[user.username] || defaultPasswords[user.name] || '123456';
      
      // Şifreyi hash'le
      const hashedPassword = await bcrypt.hash(password, 10);

      // Kullanıcıyı güncelle
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      console.log(`✅ ${user.name} (${user.username}) - Şifre: ${password} - Rol: ${user.role}`);
    }

    console.log('\n🎉 Tüm kullanıcıların şifreleri güncellendi!');
    console.log('\nGiriş Bilgileri:');
    console.log('================');
    users.forEach(user => {
      const password = defaultPasswords[user.username] || defaultPasswords[user.name] || '123456';
      console.log(`${user.name} (${user.username}) - Şifre: ${password}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingUsers();
