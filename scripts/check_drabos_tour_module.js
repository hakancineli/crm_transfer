#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDrabosTourModule() {
    try {
        console.log('🔍 Checking Drabos Travel tour module status...\n');

        // Find Drabos Travel tenant
        const tenant = await prisma.tenant.findFirst({
            where: {
                OR: [
                    { subdomain: { contains: 'drabos', mode: 'insensitive' } },
                    { companyName: { contains: 'Drabos', mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                subdomain: true,
                companyName: true,
                subscriptionPlan: true,
                isActive: true
            }
        });

        if (!tenant) {
            console.error('❌ Drabos Travel tenant not found!');
            return;
        }

        console.log('✅ Found tenant:');
        console.log(`   ID: ${tenant.id}`);
        console.log(`   Company: ${tenant.companyName}`);
        console.log(`   Subdomain: ${tenant.subdomain}`);
        console.log(`   Plan: ${tenant.subscriptionPlan}`);
        console.log(`   Active: ${tenant.isActive}\n`);

        // Find tour module by exact ID
        const tourModule = await prisma.module.findUnique({
            where: {
                id: 'tour'
            },
            select: {
                id: true,
                name: true,
                isActive: true
            }
        });

        if (!tourModule) {
            console.error('❌ Tour module not found in Module table!');
            return;
        }

        console.log('✅ Found tour module:');
        console.log(`   ID: ${tourModule.id}`);
        console.log(`   Name: ${tourModule.name}`);
        console.log(`   Active: ${tourModule.isActive}\n`);

        // Check TenantModule assignment
        const tenantModule = await prisma.tenantModule.findUnique({
            where: {
                tenantId_moduleId: {
                    tenantId: tenant.id,
                    moduleId: tourModule.id
                }
            },
            select: {
                id: true,
                isEnabled: true,
                activatedAt: true,
                expiresAt: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!tenantModule) {
            console.log('⚠️  No TenantModule record found!');
            console.log('   This means the tour module has never been assigned to this tenant.\n');
            console.log('💡 Solution: Create a new TenantModule record with isEnabled: true\n');
            return;
        }

        console.log('✅ Found TenantModule record:');
        console.log(`   ID: ${tenantModule.id}`);
        console.log(`   Is Enabled: ${tenantModule.isEnabled ? '✅ TRUE' : '❌ FALSE'}`);
        console.log(`   Activated At: ${tenantModule.activatedAt || 'N/A'}`);
        console.log(`   Expires At: ${tenantModule.expiresAt || 'N/A'}`);
        console.log(`   Created At: ${tenantModule.createdAt}`);
        console.log(`   Updated At: ${tenantModule.updatedAt}\n`);

        if (!tenantModule.isEnabled) {
            console.log('🔴 PROBLEM IDENTIFIED:');
            console.log('   The tour module is DISABLED in the database!');
            console.log('   This is why users see "Modül Kapalı" error.\n');
            console.log('💡 Solution: Run fix_drabos_tour_module.js to enable it.\n');
        } else {
            console.log('✅ Tour module is ENABLED in the database.');
            console.log('   If users still see "Modül Kapalı", check:');
            console.log('   1. Browser cache / localStorage');
            console.log('   2. User permissions');
            console.log('   3. Module name matching logic\n');
        }

        // Check all modules for this tenant
        const allTenantModules = await prisma.tenantModule.findMany({
            where: { tenantId: tenant.id },
            include: { module: { select: { name: true } } }
        });

        console.log(`📋 All modules for ${tenant.companyName}:`);
        allTenantModules.forEach(tm => {
            const status = tm.isEnabled ? '✅' : '❌';
            console.log(`   ${status} ${tm.module.name} (${tm.isEnabled ? 'Enabled' : 'Disabled'})`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDrabosTourModule();
