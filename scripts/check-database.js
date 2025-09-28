const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking database contents...');
    
    // Check users
    const users = await prisma.user.findMany({
      include: {
        tenantUsers: {
          include: {
            tenant: true
          }
        }
      }
    });
    
    console.log(`\n📊 Users (${users.length}):`);
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - Role: ${user.role} - Active: ${user.isActive}`);
      if (user.tenantUsers.length > 0) {
        user.tenantUsers.forEach(tu => {
          console.log(`    └─ Tenant: ${tu.tenant.name} (${tu.tenant.domain})`);
        });
      }
    });
    
    // Check tenants
    const tenants = await prisma.tenant.findMany();
    console.log(`\n🏢 Tenants (${tenants.length}):`);
    tenants.forEach(tenant => {
      console.log(`  - ${tenant.name} (${tenant.domain}) - Active: ${tenant.isActive}`);
    });
    
    // Check reservations
    const reservations = await prisma.reservation.findMany();
    console.log(`\n📋 Reservations (${reservations.length}):`);
    reservations.forEach(reservation => {
      console.log(`  - ${reservation.id} - ${reservation.pickupLocation} → ${reservation.dropoffLocation}`);
    });
    
    // Check drivers
    const drivers = await prisma.driver.findMany();
    console.log(`\n🚗 Drivers (${drivers.length}):`);
    drivers.forEach(driver => {
      console.log(`  - ${driver.name} (${driver.phone}) - Active: ${driver.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
