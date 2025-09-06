const { PrismaClient } = require('@prisma/client');

// DATABASE_URL'i manuel olarak set et
process.env.DATABASE_URL = "postgres://neondb_owner:npg_ELFHaAGVn9b6@ep-fragrant-mountain-a262sya8-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient();

async function addSuperUserPermissions() {
  try {
    // Süperkullanıcıyı bul
    const superUser = await prisma.user.findFirst({
      where: { role: 'SUPERUSER' }
    });

    if (!superUser) {
      console.log('❌ Süperkullanıcı bulunamadı');
      return;
    }

    console.log('✅ Süperkullanıcı bulundu:', superUser.username);

    // Mevcut izinleri kontrol et
    const existingPermissions = await prisma.userPermission.findMany({
      where: { userId: superUser.id }
    });

    console.log('📋 Mevcut izinler:', existingPermissions.map(p => p.permission));

    // Tüm izinleri tanımla
    const allPermissions = [
      'VIEW_OWN_SALES',
      'VIEW_ALL_RESERVATIONS', 
      'VIEW_REPORTS',
      'VIEW_ACCOUNTING',
      'MANAGE_USERS',
      'MANAGE_ACTIVITIES'
    ];

    // Eksik izinleri ekle
    for (const permission of allPermissions) {
      const exists = existingPermissions.some(p => p.permission === permission);
      
      if (!exists) {
        await prisma.userPermission.create({
          data: {
            userId: superUser.id,
            permission: permission,
            isActive: true
          }
        });
        console.log('✅ İzin eklendi:', permission);
      } else {
        console.log('ℹ️ İzin zaten mevcut:', permission);
      }
    }

    console.log('🎉 Süperkullanıcı izinleri güncellendi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSuperUserPermissions();
