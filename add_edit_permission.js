const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addEditPermission() {
  try {
    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      console.log('Admin kullanıcısı bulunamadı');
      return;
    }

    // EDIT_RESERVATIONS iznini ekle
    const existingPermission = await prisma.userPermission.findFirst({
      where: {
        userId: adminUser.id,
        permission: 'EDIT_RESERVATIONS'
      }
    });

    if (!existingPermission) {
      await prisma.userPermission.create({
        data: {
          userId: adminUser.id,
          permission: 'EDIT_RESERVATIONS',
          isActive: true
        }
      });
      console.log('✅ EDIT_RESERVATIONS izni eklendi');
    } else {
      console.log('⚠️ EDIT_RESERVATIONS izni zaten mevcut');
    }

    console.log('🎉 Düzenleme izni başarıyla eklendi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addEditPermission();
