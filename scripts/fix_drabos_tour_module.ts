const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDrabosTourModule() {
    try {
        console.log('🔧 Fixing Drabos Travel tour module...\n');

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

        console.log(`✅ Found tenant: ${tenant.companyName} (${tenant.subdomain})\n`);

        // Find tour module
        const tourModule = await prisma.module.findFirst({
            where: {
                name: { contains: 'tour', mode: 'insensitive' }
            }
        });

        if (!tourModule) {
            console.error('❌ Tour module not found!');
            return;
        }

        console.log(`✅ Found tour module: ${tourModule.name}\n`);

        // Check if TenantModule exists
        const existingTenantModule = await prisma.tenantModule.findUnique({
            where: {
                tenantId_moduleId: {
                    tenantId: tenant.id,
                    moduleId: tourModule.id
                }
            }
        });

        if (existingTenantModule) {
            if (existingTenantModule.isEnabled) {
                console.log('✅ Tour module is already enabled!');
                console.log('   No changes needed.\n');
                return;
            }

            // Update existing record to enable it
            console.log('📝 Updating existing TenantModule record...');
            const updated = await prisma.tenantModule.update({
                where: {
                    tenantId_moduleId: {
                        tenantId: tenant.id,
                        moduleId: tourModule.id
                    }
                },
                data: {
                    isEnabled: true,
                    activatedAt: new Date()
                }
            });

            console.log('✅ Tour module enabled successfully!');
            console.log(`   Updated at: ${updated.updatedAt}\n`);
        } else {
            // Create new TenantModule record
            console.log('📝 Creating new TenantModule record...');
            const created = await prisma.tenantModule.create({
                data: {
                    tenantId: tenant.id,
                    moduleId: tourModule.id,
                    isEnabled: true,
                    activatedAt: new Date()
                }
            });

            console.log('✅ Tour module enabled successfully!');
            console.log(`   Created at: ${created.createdAt}\n`);
        }

        // Grant permissions to AGENCY_ADMIN users
        console.log('🔑 Granting tour module permissions to AGENCY_ADMIN users...');

        const tourPermissions = [
            'VIEW_TOUR_MODULE',
            'MANAGE_TOUR_BOOKINGS',
            'MANAGE_TOUR_ROUTES',
            'MANAGE_TOUR_VEHICLES',
            'VIEW_TOUR_REPORTS',
            'CREATE_TOUR_BOOKINGS',
            'EDIT_TOUR_BOOKINGS',
            'DELETE_TOUR_BOOKINGS',
            'MANAGE_TOUR_GUIDES',
            'VIEW_TOUR_ANALYTICS'
        ];

        const adminLinks = await prisma.tenantUser.findMany({
            where: {
                tenantId: tenant.id,
                role: 'AGENCY_ADMIN',
                isActive: true
            },
            select: { userId: true }
        });

        let permissionsGranted = 0;
        for (const { userId } of adminLinks) {
            for (const permission of tourPermissions) {
                try {
                    await prisma.userPermission.create({
                        data: {
                            userId,
                            permission,
                            isActive: true
                        }
                    });
                    permissionsGranted++;
                } catch (error) {
                    // Permission already exists, skip
                }
            }
        }

        console.log(`✅ Granted ${permissionsGranted} permissions to ${adminLinks.length} admin user(s)\n`);

        console.log('🎉 Fix completed successfully!');
        console.log('   Users should now be able to access the tour module.\n');
        console.log('💡 Next steps:');
        console.log('   1. Ask users to refresh their browser');
        console.log('   2. Clear browser cache/localStorage if needed');
        console.log('   3. Test accessing the tour module\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixDrabosTourModule();
