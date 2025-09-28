const { PrismaClient } = require('@prisma/client');

async function exportDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Starting database export...');
    
    // Export all tables
    const users = await prisma.user.findMany();
    const tenants = await prisma.tenant.findMany();
    const tenantUsers = await prisma.tenantUser.findMany();
    const reservations = await prisma.reservation.findMany();
    const drivers = await prisma.driver.findMany();
    const activities = await prisma.activity.findMany();
    const tenantWebsites = await prisma.tenantWebsite.findMany();
    const websitePages = await prisma.websitePage.findMany();
    const websiteSettings = await prisma.websiteSettings.findMany();
    const websiteSections = await prisma.websiteSection.findMany();
    
    const exportData = {
      users,
      tenants,
      tenantUsers,
      reservations,
      drivers,
      activities,
      tenantWebsites,
      websitePages,
      websiteSettings,
      websiteSections,
      exportedAt: new Date().toISOString()
    };
    
    const fs = require('fs');
    const path = require('path');
    
    // Create backups directory if it doesn't exist
    const backupDir = './backups';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `database_export_${timestamp}.json`);
    
    fs.writeFileSync(backupFile, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Database exported successfully!`);
    console.log(`📄 Backup file: ${backupFile}`);
    console.log(`📊 Records exported:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Tenants: ${tenants.length}`);
    console.log(`   - Tenant Users: ${tenantUsers.length}`);
    console.log(`   - Reservations: ${reservations.length}`);
    console.log(`   - Drivers: ${drivers.length}`);
    console.log(`   - Activities: ${activities.length}`);
    console.log(`   - Tenant Websites: ${tenantWebsites.length}`);
    console.log(`   - Website Pages: ${websitePages.length}`);
    console.log(`   - Website Settings: ${websiteSettings.length}`);
    console.log(`   - Website Sections: ${websiteSections.length}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportDatabase();
