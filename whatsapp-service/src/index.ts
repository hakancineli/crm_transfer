// WhatsApp Service - Main Entry Point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sessionsRouter } from './routes/sessions';
import { chatsRouter } from './routes/chats';
import { messagesRouter } from './routes/messages';
import { parseRouter } from './routes/parse';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check (no auth needed) - must be before auth middleware
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Key auth middleware
app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const serviceKey = (process.env.WHATSAPP_SERVICE_API_KEY || '').trim();

    console.log(`[AUTH] Incoming request: ${req.method} ${req.path}`);

    if (!apiKey || (apiKey as string).trim() !== serviceKey) {
        console.warn(`[AUTH] Unauthorized access attempt: ${apiKey ? 'Invalid Key' : 'Missing Key'}`);
        return res.status(401).json({ error: 'WA_API_KEY_MISMATCH' });
    }
    next();
});

// Routes
app.use('/sessions', sessionsRouter);
app.use('/chats', chatsRouter);
app.use('/messages', messagesRouter);
app.use('/parse', parseRouter);

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
    console.log(`✅ WhatsApp Service running on port ${PORT}`);

    // Self-ping every 4 minutes to prevent Railway from sleeping the service.
    // Railway free plan sleeps inactive services, which causes Prisma to restart
    // on every single request — breaking the WS session and QR code generation.
    const serviceUrl = process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/health`
        : `http://localhost:${PORT}/health`;

    setInterval(async () => {
        try {
            const res = await fetch(serviceUrl);
            console.log(`[KEEPALIVE] Ping OK: ${res.status}`);
        } catch (e) {
            console.warn(`[KEEPALIVE] Ping failed:`, e);
        }
    }, 4 * 60 * 1000); // every 4 minutes
});

export default app;
