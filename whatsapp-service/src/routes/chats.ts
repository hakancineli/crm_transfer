import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getSessionSocket } from '../lib/sessionManager';

export const chatsRouter = Router();

// Get all chats for a user
chatsRouter.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { limit = '50', cursor } = req.query;

    try {
        const chats = await prisma.whatsAppChat.findMany({
            where: { userId },
            orderBy: [
                { pinned: 'desc' },
                { lastMsgAt: 'desc' }
            ],
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
                archived: true,
                pinned: true,
                avatarUrl: true,
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

// Toggle pin
chatsRouter.post('/:userId/:chatId/pin', async (req, res) => {
    const { userId, chatId } = req.params;
    const { pinned } = req.body;

    try {
        const socket = getSessionSocket(userId);
        if (socket) {
            await socket.chatModify({ pin: !!pinned }, chatId);
        }
        await prisma.whatsAppChat.update({
            where: {
                userId_chatId: { userId, chatId }
            },
            data: { pinned: !!pinned }
        });
        return res.json({ success: true, pinned: !!pinned });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to toggle pin' });
    }
});
// Toggle archive
chatsRouter.post('/:userId/:chatId/archive', async (req, res) => {
    const { userId, chatId } = req.params;
    const { archived } = req.body;

    try {
        const socket = getSessionSocket(userId);
        if (socket) {
            await socket.chatModify({ archive: !!archived, lastMessages: [] }, chatId);
        }
        await prisma.whatsAppChat.update({
            where: {
                userId_chatId: { userId, chatId }
            },
            data: { archived: !!archived }
        });
        return res.json({ success: true, archived: !!archived });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to toggle archive' });
    }
});
