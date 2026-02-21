import { Router } from 'express';
import { createSession, disconnectSession, getSession } from '../lib/sessionManager';
import { prisma } from '../lib/prisma';

export const sessionsRouter = Router();

// Start/create session → returns QR code via polling
sessionsRouter.post('/:userId/connect', async (req, res) => {
    const { userId } = req.params;
    let { tenantId } = req.body;

    if (!tenantId) {
        // Find any existing tenant as fallback or use a placeholder
        const firstTenant = await prisma.tenant.findFirst({ select: { id: true } });
        tenantId = firstTenant?.id || 'default_tenant';
        console.log(`ℹ️ No tenantId provided for user ${userId}, using fallback: ${tenantId}`);
    }

    try {
        // Start session in background (don't await)
        createSession(userId, tenantId).catch(console.error);

        return res.json({ message: 'Session starting, poll /sessions/:userId/status for QR code' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create session' });
    }
});

// Get session status + QR code
sessionsRouter.get('/:userId/status', async (req, res) => {
    const { userId } = req.params;

    try {
        const dbSession = await prisma.whatsAppSession.findUnique({
            where: { userId }
        });

        if (!dbSession) {
            return res.json({ status: 'NOT_CONNECTED', qr: null, phone: null });
        }

        return res.json({
            status: dbSession.status,
            qr: dbSession.qrCode,
            phone: dbSession.phone,
            connectedAt: dbSession.connectedAt,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to get status' });
    }
});

// Disconnect / logout session
sessionsRouter.delete('/:userId/disconnect', async (req, res) => {
    const { userId } = req.params;

    try {
        await disconnectSession(userId);
        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to disconnect' });
    }
});

// Send a message
sessionsRouter.post('/:userId/send', async (req, res) => {
    const { userId } = req.params;
    const { to, message } = req.body;

    const session = getSession(userId);
    if (!session || session.status !== 'CONNECTED' || !session.socket) {
        return res.status(400).json({ error: 'Session not connected' });
    }

    try {
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        await session.socket.sendMessage(jid, { text: message });
        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to send message' });
    }
});
