#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testModuleNameMatching() {
    try {
        console.log('🧪 Testing module name matching logic...\n');

        // Simulate what the API does
        const tenantId = '6dbb5619-7330-4acf-a673-8bd6fdb556d1'; // Drabos Travel
        const moduleName = 'tour'; // What useModule('tour') passes

        console.log(`Testing for tenant: ${tenantId}`);
        console.log(`Module name to match: "${moduleName}"\n`);

        // Get tenant modules (simulating /api/tenant-modules)
        const tenantModules = await prisma.tenantModule.findMany({
            where: { tenantId, isEnabled: true },
            select: {
                tenantId: true,
                moduleId: true,
                isEnabled: true,
                module: { select: { name: true, id: true } }
            }
        });

        console.log(`Found ${tenantModules.length} enabled modules:\n`);

        tenantModules.forEach(tm => {
            const moduleNameLower = (tm.module?.name || '').toLowerCase();
            const matches = moduleNameLower.includes(moduleName);
            const status = matches ? '✅ MATCHES' : '❌ NO MATCH';

            console.log(`${status} - ${tm.module.name}`);
            console.log(`   Module ID: ${tm.module.id}`);
            console.log(`   Module name (lowercase): "${moduleNameLower}"`);
            console.log(`   Contains "${moduleName}": ${matches}`);
            console.log('');
        });

        // Check the specific logic from useModule hook
        const hasModuleAccess = tenantModules.some((tm) =>
            (tm.module?.name || '').toLowerCase().includes(moduleName)
        );

        console.log(`\n🔍 Result of useModule logic:`);
        console.log(`   hasModuleAccess: ${hasModuleAccess ? '✅ TRUE' : '❌ FALSE'}\n`);

        if (!hasModuleAccess) {
            console.log('🔴 PROBLEM: The module name matching logic is failing!');
            console.log('   The module "Tur Yönetimi" should match "tour" but it doesn\'t.\n');
            console.log('💡 Solution: The matching logic needs to check module.id instead of module.name\n');
        } else {
            console.log('✅ Module matching logic works correctly!\n');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testModuleNameMatching();
