import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    proto,
    WASocket,
    BaileysEventMap,
} from '@whiskeysockets/baileys';
import * as fs from 'fs';
import * as path from 'path';
import { Boom } from '@hapi/boom';
import { prisma } from './prisma';
import QRCode from 'qrcode';

// Pino logger configured for minimal output
import pino from 'pino';
const logger = pino({ level: 'silent' });

// In-memory store for active sessions
interface SessionStore {
    socket: WASocket | null;
    qr: string | null;  // base64 QR image
    status: 'CONNECTING' | 'QR_PENDING' | 'CONNECTED' | 'DISCONNECTED';
    phone: string | null;
    qrRetries: number;
}

const sessions = new Map<string, SessionStore>();
const AUTH_DIR = process.env.AUTH_DIR || '/tmp/wa-auth';

function getAuthDir(userId: string) {
    return path.join(AUTH_DIR, userId);
}

export function getSession(userId: string): SessionStore | undefined {
    return sessions.get(userId);
}

export function getAllSessions() {
    const result: Record<string, { status: string; phone: string | null }> = {};
    for (const [userId, session] of sessions.entries()) {
        result[userId] = { status: session.status, phone: session.phone };
    }
    return result;
}

async function saveMessageToDB(userId: string, message: proto.IWebMessageInfo, tenantId: string) {
    try {
        const chatId = message.key.remoteJid;
        if (!chatId || chatId.includes('@g.us')) return; // Skip group messages for now

        const fromMe = message.key.fromMe || false;
        const body = message.message?.conversation
            || message.message?.extendedTextMessage?.text
            || message.message?.imageMessage?.caption
            || '';

        if (!body) return; // Skip non-text messages

        const msgId = message.key.id || '';
        const timestamp = new Date((message.messageTimestamp as number) * 1000);

        // Upsert chat
        const phone = chatId.replace('@s.whatsapp.net', '');
        const pushName = (message as any).pushName || '';

        const chat = await prisma.whatsAppChat.upsert({
            where: {
                userId_chatId: { userId, chatId }
            },
            update: {
                lastMsg: body,
                lastMsgAt: timestamp,
                name: fromMe ? undefined : (pushName || undefined),
            },
            create: {
                userId,
                tenantId,
                chatId,
                phone,
                name: pushName || phone,
                lastMsg: body,
                lastMsgAt: timestamp,
                unread: fromMe ? 0 : 1,
            }
        });

        // Upsert message
        await prisma.whatsAppMessage.upsert({
            where: { msgId },
            update: {},
            create: {
                chatId: chat.id,
                msgId,
                fromMe,
                body,
                timestamp,
                msgType: 'text',
            }
        });

        // Increment unread if from contact
        if (!fromMe) {
            await prisma.whatsAppChat.update({
                where: { id: chat.id },
                data: { unread: { increment: 1 } }
            });
        }
    } catch (err) {
        console.error('Error saving message to DB:', err);
    }
}

export async function createSession(userId: string, tenantId: string, retryCount = 0): Promise<void> {
    // If already connected, skip
    const existing = sessions.get(userId);
    if (existing?.status === 'CONNECTED') return;

    // Max 3 retries to avoid infinite loop
    if (retryCount >= 3) {
        console.error(`❌ Max retries reached for ${userId}, giving up`);
        await prisma.whatsAppSession.upsert({
            where: { userId },
            update: { status: 'DISCONNECTED', qrCode: null },
            create: { userId, tenantId, status: 'DISCONNECTED' }
        }).catch(() => { });
        return;
    }

    const authDir = getAuthDir(userId);
    fs.mkdirSync(authDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    // Use stable hardcoded version as fallback (fetchLatestBaileysVersion may fail in Railway)
    let version: [number, number, number] = [2, 3000, 1023281120];
    try {
        const result = await Promise.race([
            fetchLatestBaileysVersion(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]) as { version: [number, number, number] };
        version = result.version;
        console.log(`📦 Using Baileys version: ${version.join('.')}`);
    } catch (e) {
        console.warn(`⚠️ Using fallback Baileys version: ${version.join('.')}`);
    }

    const store: SessionStore = {
        socket: null,
        qr: null,
        status: 'CONNECTING',
        phone: null,
        qrRetries: 0,
    };
    sessions.set(userId, store);

    const sock = makeWASocket({
        version,
        logger,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        printQRInTerminal: false,
        browser: ['CRM Transfer', 'Chrome', '120.0.0'],
        syncFullHistory: false,
        connectTimeoutMs: 15000,
        keepAliveIntervalMs: 10000,
        retryRequestDelayMs: 2000,
    });

    store.socket = sock;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            const qrImage = await QRCode.toDataURL(qr);
            store.qr = qrImage;
            store.status = 'QR_PENDING';
            store.qrRetries++;
            console.log(`📱 QR generated for user ${userId} (attempt #${store.qrRetries})`);

            // Save QR to DB for polling
            await prisma.whatsAppSession.upsert({
                where: { userId },
                update: { qrCode: qrImage, status: 'QR_PENDING' },
                create: {
                    userId,
                    tenantId,
                    qrCode: qrImage,
                    status: 'QR_PENDING',
                }
            });

            // Auto-disconnect after too many QR retries
            if (store.qrRetries >= 5) {
                await disconnectSession(userId);
            }
        }

        if (connection === 'close') {
            const errCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
            const shouldReconnect = errCode !== DisconnectReason.loggedOut;
            console.log(`⚠️ Connection closed for ${userId}, code: ${errCode}, reconnect: ${shouldReconnect}`);
            if (!errCode) {
                console.dir(lastDisconnect?.error, { depth: null });
            }

            if (shouldReconnect) {
                store.status = 'DISCONNECTED';
                await prisma.whatsAppSession.upsert({
                    where: { userId },
                    update: { status: 'DISCONNECTED', qrCode: null },
                    create: { userId, tenantId, status: 'DISCONNECTED' }
                }).catch(console.error);
                // Auto-reconnect after delay, with retry count to prevent infinite loops
                const delay = Math.min(5000 * (retryCount + 1), 30000);
                setTimeout(() => createSession(userId, tenantId, retryCount + 1), delay);
            } else {
                // Logged out
                await disconnectSession(userId);
                fs.rmSync(authDir, { recursive: true, force: true });
            }
        }

        if (connection === 'open') {
            const phone = sock.user?.id?.split(':')[0] || '';
            store.status = 'CONNECTED';
            store.qr = null;
            store.phone = phone;
            console.log(`✅ WhatsApp connected for user ${userId} (${phone})`);

            await prisma.whatsAppSession.upsert({
                where: { userId },
                update: { status: 'CONNECTED', phone, qrCode: null, connectedAt: new Date() },
                create: { userId, tenantId, status: 'CONNECTED', phone, connectedAt: new Date() }
            });

            // Historical messages are synced via 'messaging-history.set' event
            // triggered by syncFullHistory: true option
        }
    });

    // Listen to new messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify' && type !== 'append') return;
        for (const msg of messages) {
            await saveMessageToDB(userId, msg, tenantId);
        }
    });

    // Sync history messages
    sock.ev.on('messaging-history.set', async ({ messages }) => {
        console.log(`📜 Syncing ${messages.length} historical messages for ${userId}`);
        for (const msg of messages) {
            await saveMessageToDB(userId, msg, tenantId);
        }
    });
}

export async function disconnectSession(userId: string): Promise<void> {
    const session = sessions.get(userId);
    if (session?.socket) {
        try {
            await session.socket.logout();
        } catch (e) {
            // ignore
        }
        session.socket.end(undefined);
    }
    sessions.delete(userId);

    await prisma.whatsAppSession.updateMany({
        where: { userId },
        data: { status: 'DISCONNECTED', qrCode: null }
    });
}

// On startup, reconnect all previously connected sessions
export async function reconnectAllSessions(): Promise<void> {
    const activeSessions = await prisma.whatsAppSession.findMany({
        where: { status: 'CONNECTED' }
    });

    for (const session of activeSessions) {
        const authDir = getAuthDir(session.userId);
        if (fs.existsSync(authDir)) {
            console.log(`🔄 Reconnecting session for user ${session.userId}`);
            await createSession(session.userId, session.tenantId);
        }
    }
}

// Call on startup
reconnectAllSessions().catch(console.error);
