import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserContext } from '@/app/lib/requestContext';
import { prisma } from '@/lib/prisma';

// GET /api/whatsapp/chats/[chatId]/messages
export async function GET(
    request: NextRequest,
    { params }: { params: { chatId: string } }
) {
    try {
        const { userId } = await getRequestUserContext(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { chatId } = params;
        const { searchParams } = new URL(request.url);
        const before = searchParams.get('before');

        // Verify the chat belongs to this user
        const chat = await prisma.whatsAppChat.findFirst({
            where: { id: chatId, userId }
        });
        if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });

        const messages = await prisma.whatsAppMessage.findMany({
            where: {
                chatId,
                ...(before ? { timestamp: { lt: new Date(before) } } : {}),
            },
            orderBy: { timestamp: 'desc' },
            take: 500,
        });

        // Reverse to show in chronological order (oldest to newest)
        messages.reverse();

        // Mark as read
        await prisma.whatsAppChat.update({
            where: { id: chatId },
            data: { unread: 0 }
        });

        return NextResponse.json({ chat, messages });
    } catch (err) {
        console.error('WA messages error:', err);
        return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
    }
}
