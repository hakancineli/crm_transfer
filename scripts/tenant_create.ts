#!/usr/bin/env ts-node
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const args = process.argv.slice(2);
  const params: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (key && value && key.startsWith('--')) params[key.substring(2)] = value;
  }

  const name = params.name || params.company || params.companyName;
  const subdomain = params.subdomain || (name ? name.toLowerCase().replace(/\s+/g, '-') : undefined);
  const adminEmail = params.adminEmail;
  const adminUsername = params.adminUsername || (name ? `${subdomain}-admin` : undefined);
  const adminPassword = params.adminPassword || 'ChangeMe!123';

  if (!name || !subdomain || !adminEmail) {
    console.error('Usage: npm run tenant:create -- --name "Company" --adminEmail a@b.com [--subdomain company] [--adminUsername user] [--adminPassword pass]');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(adminPassword, 10);

  const tenant = await prisma.tenant.create({
    data: { companyName: name, subdomain, isActive: true }
  });

  const user = await prisma.user.create({
    data: {
      name: `${name} Admin`,
      email: adminEmail,
      username: adminUsername!,
      password: hashed,
      role: 'AGENCY_ADMIN'
    }
  });

  await prisma.tenantUser.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      role: 'AGENCY_ADMIN',
      isActive: true
    }
  });

  console.log('Tenant created:', tenant.companyName, tenant.id);
  console.log('Admin user:', user.username, user.email);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


