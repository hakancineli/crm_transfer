#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestTourBooking() {
    try {
        console.log('🔍 Checking latest tour booking for Drabos Travel...\n');

        // Find Drabos Travel tenant
        const tenant = await prisma.tenant.findFirst({
            where: {
                OR: [
                    { subdomain: { contains: 'drabos', mode: 'insensitive' } },
                    { companyName: { contains: 'Drabos', mode: 'insensitive' } }
                ]
            }
        });

        if (!tenant) {
            console.error('❌ Drabos Travel tenant not found!');
            return;
        }

        console.log(`✅ Tenant: ${tenant.companyName} (${tenant.id})\n`);

        // Get latest tour booking
        const latestBooking = await prisma.tourBooking.findFirst({
            where: {
                tenantId: tenant.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                User: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        if (!latestBooking) {
            console.log('⚠️  No tour bookings found for this tenant.\n');
            return;
        }

        console.log('📋 Latest Tour Booking:');
        console.log(`   ID: ${latestBooking.id}`);
        console.log(`   Voucher: ${latestBooking.voucherNumber}`);
        console.log(`   Route: ${latestBooking.routeName}`);
        console.log(`   Tenant ID: ${latestBooking.tenantId}`);
        console.log(`   User ID: ${latestBooking.userId || 'NULL'}`);
        console.log(`   Created: ${latestBooking.createdAt}`);
        console.log('');

        if (latestBooking.User) {
            console.log('👤 Created by User:');
            console.log(`   Username: ${latestBooking.User.username}`);
            console.log(`   Email: ${latestBooking.User.email}`);
            console.log(`   Role: ${latestBooking.User.role}`);
            console.log('');

            // Check tenant links for this user
            const tenantLinks = await prisma.tenantUser.findMany({
                where: {
                    userId: latestBooking.userId,
                    isActive: true
                },
                include: {
                    tenant: {
                        select: {
                            id: true,
                            companyName: true
                        }
                    }
                }
            });

            console.log(`🔗 User's Tenant Links (${tenantLinks.length}):`);
            tenantLinks.forEach(link => {
                const isMatch = link.tenantId === tenant.id;
                const status = isMatch ? '✅ MATCHES' : '❌';
                console.log(`   ${status} ${link.tenant.companyName} (${link.tenantId})`);
                console.log(`      Role: ${link.role}`);
            });
            console.log('');

            // Check if user has access to this booking
            const hasAccess = tenantLinks.some(link => link.tenantId === latestBooking.tenantId);

            if (hasAccess) {
                console.log('✅ User HAS access to this booking (tenant match found)');
            } else {
                console.log('🔴 PROBLEM: User DOES NOT have access to this booking!');
                console.log('   The booking tenantId does not match any of the user\'s tenant links.');
                console.log('   This is why "Rezervasyon Bulunamadı" error occurs.\n');
            }
        } else {
            console.log('⚠️  No user associated with this booking (userId is NULL)\n');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLatestTourBooking();
