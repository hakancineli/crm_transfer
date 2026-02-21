import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const chatsRouter = Router();

// Get all chats for a user
chatsRouter.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { limit = '50', cursor } = req.query;

    try {
        const chats = await prisma.whatsAppChat.findMany({
            where: { userId },
            orderBy: { lastMsgAt: 'desc' },
            take: parseInt(limit as string),
            ...(cursor ? { skip: 1, cursor: { id: cursor as string } } : {}),
            select: {
                id: true,
                chatId: true,
                name: true,
                phone: true,
                lastMsg: true,
                lastMsgAt: true,
                unread: true,
            }
        });

        return res.json(chats);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to get chats' });
    }
});

// Mark chat as read
chatsRouter.post('/:userId/:chatId/read', async (req, res) => {
    const { chatId } = req.params;

    try {
        await prisma.whatsAppChat.update({
            where: { id: chatId },
            data: { unread: 0 }
        });
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to mark as read' });
    }
});
