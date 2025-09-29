/*
  Import database_export.json into the target DATABASE_URL (Postgres/Neon).
  Usage:
    DATABASE_URL=postgres://... node scripts/import_database_from_json.js [path_to_json]
*/

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
  const prisma = new PrismaClient();
  const jsonPath = process.argv[2] || path.join(__dirname, '..', 'database_export.json');

  if (!fs.existsSync(jsonPath)) {
    console.error('Export JSON not found at:', jsonPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);

  // Helper: createMany with skipDuplicates, tolerate missing tables
  async function safeCreateMany(model, records, pickFields) {
    if (!Array.isArray(records) || records.length === 0) return { count: 0 };
    const payload = pickFields
      ? records.map(r => {
          const obj = {};
          for (const f of pickFields) {
            if (r[f] !== undefined) obj[f] = r[f];
          }
          return obj;
        })
      : records;
    try {
      return await model.createMany({ data: payload, skipDuplicates: true });
    } catch (e) {
      console.warn('createMany warning:', e.message);
      let success = 0;
      for (const rec of payload) {
        try {
          await model.create({ data: rec });
          success += 1;
        } catch (_) {}
      }
      return { count: success };
    }
  }

  try {
    console.log('Starting import into', process.env.DATABASE_URL ? 'DATABASE_URL' : 'database');

    // Order: tenants -> users -> tenantUsers -> drivers -> reservations -> activities
    if (data.tenants) {
      const { count } = await safeCreateMany(prisma.tenant, data.tenants);
      console.log('Tenants imported:', count);
    }

    if (data.users) {
      // Ensure password fields exist; if missing, set a default hashed later by app (leave as-is)
      const { count } = await safeCreateMany(prisma.user, data.users);
      console.log('Users imported:', count);
    }

    if (data.tenantUsers) {
      // Composite unique: tenantId + userId in many schemas
      const { count } = await safeCreateMany(prisma.tenantUser, data.tenantUsers);
      console.log('TenantUsers imported:', count);
    }

    if (data.drivers) {
      const { count } = await safeCreateMany(prisma.driver, data.drivers);
      console.log('Drivers imported:', count);
    }

    if (data.reservations) {
      const { count } = await safeCreateMany(prisma.reservation, data.reservations);
      console.log('Reservations imported:', count);
    }

    if (data.activities) {
      const { count } = await safeCreateMany(prisma.activity, data.activities);
      console.log('Activities imported:', count);
    }

    // Optional website related tables if present
    if (data.tenantWebsites && prisma.tenantWebsite) {
      const { count } = await safeCreateMany(prisma.tenantWebsite, data.tenantWebsites);
      console.log('TenantWebsites imported:', count);
    }
    if (data.websitePages && prisma.websitePage) {
      const { count } = await safeCreateMany(prisma.websitePage, data.websitePages);
      console.log('WebsitePages imported:', count);
    }
    if (data.websiteSettings && prisma.websiteSettings) {
      const { count } = await safeCreateMany(prisma.websiteSettings, data.websiteSettings);
      console.log('WebsiteSettings imported:', count);
    }
    if (data.websiteSections && prisma.websiteSection) {
      const { count } = await safeCreateMany(prisma.websiteSection, data.websiteSections);
      console.log('WebsiteSections imported:', count);
    }

    console.log('✅ Import completed.');
  } catch (e) {
    console.error('❌ Import failed:', e);
    process.exit(1);
  }
}

main().then(() => process.exit(0));


