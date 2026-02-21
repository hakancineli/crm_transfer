import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const messagesRouter = Router();

// Get messages for a specific chat
messagesRouter.get('/:chatId', async (req, res) => {
    const { chatId } = req.params;
    const { limit = '50', before } = req.query;

    try {
        const messages = await prisma.whatsAppMessage.findMany({
            where: {
                chatId,
                ...(before ? { timestamp: { lt: new Date(before as string) } } : {}),
            },
            orderBy: { timestamp: 'asc' },
            take: parseInt(limit as string),
        });

        return res.json(messages);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to get messages' });
    }
});
