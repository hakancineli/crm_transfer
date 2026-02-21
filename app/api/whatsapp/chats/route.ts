import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserContext } from '@/app/lib/requestContext';
import { prisma } from '@/lib/prisma';

// GET /api/whatsapp/chats → list all chats for logged-in user
export async function GET(request: NextRequest) {
    try {
        const { userId } = await getRequestUserContext(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const chats = await prisma.whatsAppChat.findMany({
            where: { userId },
            orderBy: [
                { pinned: 'desc' },
                { lastMsgAt: 'desc' }
            ],
            take: 500,
            select: {
                id: true,
                chatId: true,
                name: true,
                phone: true,
                lastMsg: true,
                lastMsgAt: true,
                unread: true,
                archived: true,
                pinned: true,
                avatarUrl: true,
            }
        });

        return NextResponse.json(chats);
    } catch (err) {
        console.error('WA chats error:', err);
        return NextResponse.json({ error: 'Failed to get chats' }, { status: 500 });
    }
}
