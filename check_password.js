const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { username: 'satıcı' },
      select: { password: true, username: true, name: true }
    });
    
    if (!user) {
      console.log('Kullanıcı bulunamadı');
      return;
    }
    
    console.log('Kullanıcı:', user.name);
    console.log('Hash uzunluğu:', user.password.length);
    console.log('Hash başlangıcı:', user.password.substring(0, 10));
    
    // Test different passwords
    const testPasswords = ['satıcı123', '123456', 'password', 'admin', '123', 'test'];
    
    for (const testPass of testPasswords) {
      const isValid = await bcrypt.compare(testPass, user.password);
      console.log(`Şifre '${testPass}' -> ${isValid ? '✅ GEÇERLİ' : '❌ Geçersiz'}`);
    }
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword();
