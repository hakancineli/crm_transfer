#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserTenantLinks() {
    try {
        const userId = '40677a84-c18a-4a2a-9927-9089e584271e';

        console.log('🔍 Checking user tenant links...\n');
        console.log(`User ID: ${userId}\n`);

        // Get user info
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            console.error('❌ User not found!');
            return;
        }

        console.log('👤 User Info:');
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}\n`);

        // Get tenant links
        const tenantLinks = await prisma.tenantUser.findMany({
            where: { userId },
            include: {
                tenant: {
                    select: {
                        id: true,
                        companyName: true,
                        subdomain: true
                    }
                }
            }
        });

        console.log(`🔗 Tenant Links (${tenantLinks.length}):`);
        if (tenantLinks.length === 0) {
            console.log('   ⚠️  NO TENANT LINKS FOUND!');
            console.log('   This is why "Tenant ID bulunamadı" error occurs.\n');
            console.log('💡 Solution: Link this user to a tenant in TenantUser table\n');
        } else {
            tenantLinks.forEach(link => {
                const status = link.isActive ? '✅ Active' : '❌ Inactive';
                console.log(`\n   ${status}`);
                console.log(`   Tenant: ${link.tenant.companyName}`);
                console.log(`   Subdomain: ${link.tenant.subdomain}`);
                console.log(`   Tenant ID: ${link.tenantId}`);
                console.log(`   Role: ${link.role}`);
            });
        }

        // Check if there are any active links
        const activeLinks = tenantLinks.filter(l => l.isActive);
        console.log(`\n📊 Summary:`);
        console.log(`   Total links: ${tenantLinks.length}`);
        console.log(`   Active links: ${activeLinks.length}`);

        if (activeLinks.length === 0) {
            console.log('\n🔴 PROBLEM: No active tenant links!');
            console.log('   User cannot create routes without an active tenant link.\n');
        } else {
            console.log('\n✅ User has active tenant links - should work!\n');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserTenantLinks();
