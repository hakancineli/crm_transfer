const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSuperUserPermissions() {
  try {
    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      console.log('Admin kullanıcısı bulunamadı');
      return;
    }

    console.log('Admin kullanıcısı bulundu:', adminUser.username, adminUser.role);

    // Tüm izinleri ver
    const permissions = [
      'VIEW_OWN_SALES',
      'VIEW_ALL_RESERVATIONS', 
      'VIEW_REPORTS',
      'VIEW_ACCOUNTING',
      'MANAGE_USERS',
      'MANAGE_ACTIVITIES'
    ];

    for (const permission of permissions) {
      // Mevcut izni kontrol et
      const existingPermission = await prisma.userPermission.findFirst({
        where: {
          userId: adminUser.id,
          permission: permission
        }
      });

      if (!existingPermission) {
        await prisma.userPermission.create({
          data: {
            userId: adminUser.id,
            permission: permission,
            isActive: true
          }
        });
        console.log('✅ İzin eklendi:', permission);
      } else {
        console.log('⚠️ İzin zaten mevcut:', permission);
      }
    }

    console.log('🎉 Tüm izinler başarıyla eklendi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSuperUserPermissions();
