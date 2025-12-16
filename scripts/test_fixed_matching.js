#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFixedModuleMatching() {
    try {
        console.log('🧪 Testing FIXED module matching logic...\n');

        const tenantId = '6dbb5619-7330-4acf-a673-8bd6fdb556d1'; // Drabos Travel
        const moduleName = 'tour';

        console.log(`Testing for tenant: ${tenantId}`);
        console.log(`Module name to match: "${moduleName}"\n`);

        // Get tenant modules
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
            // OLD logic (broken)
            const oldMatches = (tm.module?.name || '').toLowerCase().includes(moduleName);

            // NEW logic (fixed)
            const newMatches = tm.moduleId === moduleName || (tm.module?.id || '').toLowerCase() === moduleName.toLowerCase();

            console.log(`Module: ${tm.module.name}`);
            console.log(`   Module ID: ${tm.module.id}`);
            console.log(`   OLD logic (name.includes): ${oldMatches ? '✅' : '❌'}`);
            console.log(`   NEW logic (id === ): ${newMatches ? '✅ MATCHES' : '❌'}`);
            console.log('');
        });

        // Test OLD logic
        const oldHasAccess = tenantModules.some((tm) =>
            (tm.module?.name || '').toLowerCase().includes(moduleName)
        );

        // Test NEW logic
        const newHasAccess = tenantModules.some((tm) =>
            tm.moduleId === moduleName || (tm.module?.id || '').toLowerCase() === moduleName.toLowerCase()
        );

        console.log(`\n📊 Comparison:`);
        console.log(`   OLD logic result: ${oldHasAccess ? '✅ TRUE' : '❌ FALSE (BROKEN)'}`);
        console.log(`   NEW logic result: ${newHasAccess ? '✅ TRUE (FIXED!)' : '❌ FALSE'}\n`);

        if (newHasAccess && !oldHasAccess) {
            console.log('🎉 SUCCESS! The fix resolves the issue!');
            console.log('   Users will now be able to access the tour module.\n');
        } else if (!newHasAccess) {
            console.log('⚠️  The fix didn\'t work. Further investigation needed.\n');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFixedModuleMatching();
