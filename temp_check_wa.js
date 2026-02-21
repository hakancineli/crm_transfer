const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_qgsnjhC2t9Uf@ep-raspy-hall-ag58krjg-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
        }
    }
});

async function main() {
    const chats = await prisma.whatsAppChat.findMany({
        orderBy: { lastMsgAt: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(chats, null, 2));
    const messages = await prisma.whatsAppMessage.findMany({
        orderBy: { timestamp: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(messages, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
