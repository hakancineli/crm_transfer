/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findTenantForImport() {
  // Prefer subdomain 'protransfer', else first tenant
  const preferred = await prisma.tenant.findFirst({ where: { subdomain: 'protransfer' } });
  if (preferred) return preferred.id;
  const first = await prisma.tenant.findFirst();
  if (!first) throw new Error('Hiç tenant yok. Önce bir tenant oluşturun.');
  return first.id;
}

async function findUserForTenant(tenantId) {
  const tu = await prisma.tenantUser.findFirst({ where: { tenantId, isActive: true }, select: { userId: true } });
  return tu ? tu.userId : null;
}

function parseBoolean(v) {
  if (v === undefined || v === null) return false;
  if (typeof v === 'boolean') return v;
  const s = String(v).trim();
  return s === '1' || s.toLowerCase() === 'true' || s.toLowerCase() === 'yes';
}

function safeParsePassengers(raw) {
  try {
    const arr = JSON.parse(raw || '[]');
    return Array.isArray(arr) ? JSON.stringify(arr) : '[]';
  } catch {
    return '[]';
  }
}

async function main() {
  const filePath = path.resolve(process.cwd(), 'current_reservations.sql');
  if (!fs.existsSync(filePath)) {
    console.error('Dosya bulunamadı:', filePath);
    process.exit(1);
  }

  const tenantId = await findTenantForImport();
  const defaultUserId = await findUserForTenant(tenantId);

  const text = fs.readFileSync(filePath, 'utf8').trim();
  const lines = text.split(/\r?\n/).filter(Boolean);

  let imported = 0;
  for (const line of lines) {
    const parts = line.split('|');
    // Expecting format as in file: id|tenantId|date|time|from|to|flightCode|passengerNames|luggageCount|price|currency|phone|distanceKm|voucher|driverFee|driverId|userId|paymentStatus|companyCommissionStatus|createdAt|returnTransferId|isReturn
    const [
      ,
      ,
      date,
      time,
      fromLoc,
      toLoc,
      flightCode,
      passengerNamesRaw,
      luggageCount,
      price,
      currency,
      phoneNumber,
      distanceKm,
      voucherNumber,
      ,
      ,
      ,
      ,
      ,
      createdAt,
      ,
      isReturn,
    ] = parts;

    try {
      await prisma.reservation.create({
        data: {
          tenantId,
          date,
          time,
          from: fromLoc,
          to: toLoc,
          flightCode: flightCode || '',
          passengerNames: safeParsePassengers(passengerNamesRaw),
          luggageCount: Number(luggageCount) || 0,
          price: Number(price) || 0,
          currency: currency || 'USD',
          phoneNumber: phoneNumber || null,
          distanceKm: distanceKm ? Number(distanceKm) : null,
          voucherNumber: voucherNumber || undefined,
          driverId: null,
          driverFee: null,
          userId: defaultUserId,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          isReturn: parseBoolean(isReturn),
        },
      });
      imported += 1;
    } catch (e) {
      console.error('Insert başarısız, satır atlandı:', e.message);
    }
  }

  console.log('Import tamamlandı. Eklenen rezervasyon:', imported);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });



