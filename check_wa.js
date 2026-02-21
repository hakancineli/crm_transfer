
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const sessions = await prisma.whatsAppSession.findMany();
    console.log('--- SESSIONS ---');
    sessions.forEach(s => {
        console.log(`User: ${s.userId} | Status: ${s.status} | Phone: ${s.phone}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
