const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDriverAssignPermission() {
  try {
    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      console.log('Admin kullanıcısı bulunamadı');
      return;
    }

    // ASSIGN_DRIVERS iznini ekle
    const existingPermission = await prisma.userPermission.findFirst({
      where: {
        userId: adminUser.id,
        permission: 'ASSIGN_DRIVERS'
      }
    });

    if (!existingPermission) {
      await prisma.userPermission.create({
        data: {
          userId: adminUser.id,
          permission: 'ASSIGN_DRIVERS',
          isActive: true
        }
      });
      console.log('✅ ASSIGN_DRIVERS izni eklendi');
    } else {
      console.log('⚠️ ASSIGN_DRIVERS izni zaten mevcut');
    }

    console.log('🎉 Şoför atama izni başarıyla eklendi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDriverAssignPermission();
