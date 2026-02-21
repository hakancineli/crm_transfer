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

// API Key auth middleware
app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.WHATSAPP_SERVICE_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});

// Health check (no auth needed)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
});

export default app;
