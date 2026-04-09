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
        console.log(`📤 Sending message from ${userId} to ${jid}: ${message.substring(0, 20)}...`);
        await session.socket.sendMessage(jid, { text: message });
        return res.json({ success: true, jid });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to send message' });
    }
});

// Send media
sessionsRouter.post('/:userId/send-media', async (req, res) => {
    const { userId } = req.params;
    const { to, file, fileName, caption } = req.body;

    const session = getSession(userId);
    if (!session || session.status !== 'CONNECTED' || !session.socket) {
        return res.status(400).json({ error: 'Session not connected' });
    }

    try {
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        const buffer = Buffer.from(file, 'base64');

        let mediaContent: any = {};
        const mime = fileName.split('.').pop()?.toLowerCase();
        console.log(`📡 Preparing media for ${jid}. Ext: ${mime}, Buffer size: ${buffer.length} bytes`);

        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(mime || '')) {
            mediaContent = { image: buffer, caption };
        } else if (['ogg', 'webm'].includes(mime || '') || fileName.startsWith('voice-message')) {
            mediaContent = {
                audio: buffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            };
            console.log('🎤 Sending as Voice Note (PTT) with mime: audio/ogg; codecs=opus');
        } else if (['mp3', 'm4a', 'wav', 'mp4'].includes(mime || '')) {
            mediaContent = {
                audio: buffer,
                mimetype: mime === 'mp3' ? 'audio/mpeg' : (mime === 'wav' ? 'audio/wav' : 'audio/mp4'),
                ptt: false,
                fileName,
            };
            console.log(`🎵 Sending as regular audio with mime: ${mediaContent.mimetype}`);
        } else {
            mediaContent = { document: buffer, fileName, mimetype: mime === 'pdf' ? 'application/pdf' : 'application/octet-stream', caption };
        }

        await session.socket.sendMessage(jid, mediaContent);
        return res.json({ success: true, jid });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to send media' });
    }
});
