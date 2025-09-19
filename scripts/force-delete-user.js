// Force delete a user and related links by username or id
// Usage: node scripts/force-delete-user.js --username=<username>
//        node scripts/force-delete-user.js --id=<userId>

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getArg(name) {
  const pref = `--${name}=`;
  const found = process.argv.find(a => a.startsWith(pref));
  return found ? found.slice(pref.length) : null;
}

(async () => {
  const username = getArg('username');
  let userId = getArg('id');

  try {
    if (!userId) {
      if (!username) {
        console.error('Provide --username or --id');
        process.exit(1);
      }
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) {
        console.error('User not found for username:', username);
        process.exit(2);
      }
      userId = user.id;
      console.log('Found user:', username, userId);
    }

    await prisma.$transaction(async (tx) => {
      console.log('Deleting tenant links...');
      await tx.tenantUser.deleteMany({ where: { userId } });
      console.log('Deleting user permissions...');
      await tx.userPermission.deleteMany({ where: { userId } });
      console.log('Nullifying reservations userId...');
      await tx.reservation.updateMany({ where: { userId }, data: { userId: null } });
      console.log('Nullifying tour bookings userId...');
      try { await tx.tourBooking.updateMany({ where: { userId }, data: { userId: null } }); } catch {}
      console.log('Deleting activity logs (if any)...');
      try { await tx.activityLog.deleteMany({ where: { userId } }); } catch {}
      console.log('Deleting user...');
      await tx.user.delete({ where: { id: userId } });
    });

    console.log('User deleted:', userId);
    process.exit(0);
  } catch (err) {
    console.error('Force delete failed:', err);
    process.exit(3);
  } finally {
    await prisma.$disconnect();
  }
})();


