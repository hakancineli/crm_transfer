const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    // satici kullanıcısını bul (İngilizce i ile)
    const user = await prisma.user.findUnique({
      where: { username: 'satici' },
      select: { id: true, username: true, name: true }
    });
    
    if (!user) {
      console.log('satici kullanıcısı bulunamadı');
      return;
    }
    
    console.log('Kullanıcı bulundu:', user.name);
    
    // Şifreyi güncelle
    const hashedPassword = await bcrypt.hash('satici123', 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Şifre güncellendi: satici123');
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
