const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function listModules() {
    const modules = await prisma.module.findMany();
    console.log('All modules:');
    modules.forEach(m => console.log(`- ${m.id}: ${m.name}`));
}
listModules().finally(() => prisma.$disconnect());
