/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function ensureRoleEnums() {
  // Add missing enum values on Postgres if needed
  try {
    await prisma.$executeRawUnsafe("ALTER TYPE \"UserRole\" ADD VALUE IF NOT EXISTS 'AGENCY_ADMIN'");
  } catch {}
  try {
    await prisma.$executeRawUnsafe("ALTER TYPE \"UserRole\" ADD VALUE IF NOT EXISTS 'AGENCY_USER'");
  } catch {}
}

async function upsertProtransferSuperuser() {
  const username = 'protransfer';
  const email = 'admin@protransfer.com';
  const name = 'ProTransfer Superuser';
  const password = 'protransfer34';
  const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
  const hashed = await bcrypt.hash(password, 12);
  if (existing) {
    return prisma.user.update({ where: { id: existing.id }, data: { role: 'SUPERUSER', isActive: true, name } });
  }
  return prisma.user.create({ data: { username, email, name, password: hashed, role: 'SUPERUSER', isActive: true } });
}

async function demoteFarahToAgencyAdmin() {
  const user = await prisma.user.findUnique({ where: { username: 'farahtourism' } });
  if (!user) return null;
  return prisma.user.update({ where: { id: user.id }, data: { role: 'AGENCY_ADMIN' } });
}

async function deleteMehmetUser() {
  const email = 'mehmetahmet@protransfer.com';
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  // Clean tenant links first due to foreign keys
  await prisma.tenantUser.deleteMany({ where: { userId: user.id } });
  return prisma.user.delete({ where: { id: user.id } });
}

async function main() {
  await ensureRoleEnums();
  const pro = await upsertProtransferSuperuser();
  console.log('ProTransfer SUPERUSER:', { id: pro.id, username: pro.username, role: pro.role });
  const farah = await demoteFarahToAgencyAdmin();
  console.log('Farah demote result:', farah ? { id: farah.id, role: farah.role } : 'user_not_found');
  const deleted = await deleteMehmetUser();
  console.log('Deleted mehmet:', !!deleted);
  const supers = await prisma.user.findMany({ where: { role: 'SUPERUSER' }, select: { id: true, username: true, email: true } });
  console.log('Current SUPERUSERS:', supers);
}

main().catch(async (e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });


