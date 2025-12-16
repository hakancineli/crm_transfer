#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listModules() {
    try {
        console.log('📋 Listing all modules in the database...\n');

        const modules = await prisma.module.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                isActive: true,
                priceMonthly: true,
                priceYearly: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        if (modules.length === 0) {
            console.log('⚠️  No modules found in the database!\n');
            return;
        }

        console.log(`Found ${modules.length} module(s):\n`);
        modules.forEach((module, index) => {
            console.log(`${index + 1}. ${module.name}`);
            console.log(`   ID: ${module.id}`);
            console.log(`   Description: ${module.description || 'N/A'}`);
            console.log(`   Active: ${module.isActive ? '✅' : '❌'}`);
            console.log(`   Price: €${module.priceMonthly}/month, €${module.priceYearly}/year`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listModules();
