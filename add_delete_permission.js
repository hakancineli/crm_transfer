const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDeletePermission() {
  try {
    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      console.log('Admin kullanıcısı bulunamadı');
      return;
    }

    // DELETE_RESERVATIONS iznini ekle
    const existingPermission = await prisma.userPermission.findFirst({
      where: {
        userId: adminUser.id,
        permission: 'DELETE_RESERVATIONS'
      }
    });

    if (!existingPermission) {
      await prisma.userPermission.create({
        data: {
          userId: adminUser.id,
          permission: 'DELETE_RESERVATIONS',
          isActive: true
        }
      });
      console.log('✅ DELETE_RESERVATIONS izni eklendi');
    } else {
      console.log('⚠️ DELETE_RESERVATIONS izni zaten mevcut');
    }

    console.log('🎉 Silme izni başarıyla eklendi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDeletePermission();
