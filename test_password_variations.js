const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAllVariations() {
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
    console.log('Username:', user.username);
    console.log('Hash uzunluğu:', user.password.length);
    console.log('');
    
    // Test different variations
    const testPasswords = [
      'satıcı123',    // Türkçe i
      'satici123',    // İngilizce i
      'SATICI123',    // Büyük harf
      'Satıcı123',    // Karışık
      'satıcı 123',   // Boşluklu
      'satıcı-123',   // Tire ile
      'satıcı_123',   // Alt çizgi ile
      '123satıcı',    // Sayı başta
      'satıcı',       // Sadece kullanıcı adı
      '123456',       // Varsayılan
      'password',     // Varsayılan
      'admin123'      // Admin şifresi
    ];
    
    console.log('Şifre testleri:');
    console.log('================');
    
    for (const testPass of testPasswords) {
      const isValid = await bcrypt.compare(testPass, user.password);
      console.log(`'${testPass}' -> ${isValid ? '✅ GEÇERLİ' : '❌ Geçersiz'}`);
    }
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllVariations();
