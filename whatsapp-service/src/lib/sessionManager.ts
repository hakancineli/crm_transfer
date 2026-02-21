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

import { downloadMediaMessage } from '@whiskeysockets/baileys';

async function saveMessageToDB(userId: string, message: proto.IWebMessageInfo, tenantId: string) {
    try {
        const chatId = message.key.remoteJid;
        if (!chatId) return;

        const fromMe = message.key.fromMe || false;

        // Detect message type and content
        let msgType = 'text';
        let body = '';
        let mediaUrl = null;
        let caption = null;

        if (message.message?.conversation) {
            body = message.message.conversation;
        } else if (message.message?.extendedTextMessage) {
            body = message.message.extendedTextMessage.text || '';
        } else if (message.message?.imageMessage) {
            msgType = 'image';
            body = '[Görsel]';
            caption = message.message.imageMessage.caption || '';
        } else if (message.message?.audioMessage) {
            msgType = 'audio';
            body = '[Sesli Mesaj]';
        } else if (message.message?.documentMessage) {
            msgType = 'document';
            body = `[Dosya: ${message.message.documentMessage.fileName || 'belge.pdf'}]`;
            caption = message.message.documentMessage.fileName || '';
        } else if (message.message?.videoMessage) {
            msgType = 'video';
            body = '[Video]';
            caption = message.message.videoMessage.caption || '';
        }

        const msgId = message.key.id || '';
        const timestamp = new Date((message.messageTimestamp as number) * 1000);

        // Download media if applicable
        if (['image', 'audio', 'document', 'video'].includes(msgType)) {
            try {
                const session = sessions.get(userId);
                if (session?.socket) {
                    const buffer = await downloadMediaMessage(message, 'buffer', {
                        // @ts-ignore
                        rekey: session.socket.authState.creds.signedPreKey
                    }) as Buffer;

                    if (buffer) {
                        const fileName = `${msgId}_${Date.now()}`;
                        const ext = msgType === 'audio' ? 'ogg' : (msgType === 'image' ? 'jpg' : 'bin');
                        const finalName = `${fileName}.${ext}`;
                        const publicPath = path.join(process.cwd(), 'public', 'media');
                        if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath, { recursive: true });

                        fs.writeFileSync(path.join(publicPath, finalName), buffer);
                        mediaUrl = `/media/${finalName}`;
                    }
                }
            } catch (mediaErr) {
                console.error('Error downloading media:', mediaErr);
            }
        }

        // Upsert chat
        const phone = chatId.replace('@s.whatsapp.net', '').replace('@g.us', '').replace('@lid', '');
        const pushName = (message as any).pushName || '';
        const senderJid = message.key.participant || message.key.remoteJid;
        const senderName = fromMe ? 'Siz' : (pushName || senderJid?.split('@')[0] || '');

        const session = sessions.get(userId);
        let avatarUrl = undefined;
        if (session?.socket) {
            avatarUrl = await session.socket.profilePictureUrl(chatId, 'image').catch(() => undefined);
        }

        const chat = await prisma.whatsAppChat.upsert({
            where: {
                userId_chatId: { userId, chatId }
            },
            update: {
                lastMsg: body,
                lastMsgAt: timestamp,
                // Don't overwrite group names with participant pushnames
                name: chatId.includes('@g.us') ? undefined : (fromMe ? undefined : (pushName || undefined)),
                avatarUrl: avatarUrl || undefined,
            } as any,
            create: {
                userId,
                tenantId,
                chatId,
                phone,
                name: chatId.includes('@g.us') ? 'Grup' : (pushName || phone),
                lastMsg: body,
                lastMsgAt: timestamp,
                unread: fromMe ? 0 : 1,
                avatarUrl,
            } as any
        });

        // Special case: if it's a group and we don't have a good name, try to get group metadata
        if (chatId.includes('@g.us') && (chat.name === 'Grup' || !chat.name) && session?.socket) {
            try {
                const metadata = await session.socket.groupMetadata(chatId);
                if (metadata.subject) {
                    await prisma.whatsAppChat.update({
                        where: { id: chat.id },
                        data: { name: metadata.subject }
                    });
                }
            } catch (e) { }
        }

        // Upsert message
        await prisma.whatsAppMessage.upsert({
            where: { msgId },
            update: {
                mediaUrl,
                caption,
                senderName,
            } as any,
            create: {
                chatId: chat.id,
                msgId,
                fromMe,
                body,
                timestamp,
                msgType,
                mediaUrl,
                caption,
                senderName,
            } as any
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

async function syncChat(userId: string, tenantId: string, chat: any) {
    try {
        const { id: chatId, name, archived, unreadCount, pin } = chat;
        if (!chatId) return;

        const phone = chatId.replace('@s.whatsapp.net', '').replace('@g.us', '').replace('@lid', '');

        const session = sessions.get(userId);
        let avatarUrl = undefined;
        if (session?.socket) {
            avatarUrl = await session.socket.profilePictureUrl(chatId, 'image').catch(() => undefined);
        }

        // If it's a group and name is missing, try to fetch it
        let resolvedName = name || undefined;
        if (chatId.includes('@g.us') && !resolvedName && session?.socket) {
            try {
                const metadata = await session.socket.groupMetadata(chatId);
                resolvedName = metadata.subject;
            } catch (e) { }
        }

        await prisma.whatsAppChat.upsert({
            where: { userId_chatId: { userId, chatId } },
            update: {
                name: resolvedName,
                archived: archived !== undefined ? !!archived : undefined,
                unread: unreadCount !== undefined ? unreadCount : undefined,
                pinned: (pin !== undefined && pin !== null && pin !== 0) ? true : undefined,
                avatarUrl: avatarUrl || undefined,
            } as any,
            create: {
                userId,
                tenantId,
                chatId,
                name: resolvedName || phone,
                phone: phone,
                archived: !!archived,
                pinned: (pin !== undefined && pin !== null && pin !== 0),
                unread: unreadCount || 0,
                avatarUrl,
            } as any
        });
    } catch (err) {
        console.error('Error syncing chat:', err);
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
    if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        printQRInTerminal: false,
        logger,
        browser: ['CRM Transfer', 'Chrome', '1.0.0'],
        syncFullHistory: true,
    });

    const store: SessionStore = {
        socket: sock,
        qr: null,
        status: 'CONNECTING',
        phone: null,
        qrRetries: 0
    };
    sessions.set(userId, store);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            store.qr = await QRCode.toDataURL(qr);
            store.status = 'QR_PENDING';
            await prisma.whatsAppSession.upsert({
                where: { userId },
                update: { status: 'QR_PENDING', qrCode: store.qr },
                create: { userId, tenantId, status: 'QR_PENDING', qrCode: store.qr }
            });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`❌ Connection closed for ${userId}. Reconnecting: ${shouldReconnect}`);
            store.status = 'DISCONNECTED';
            store.socket = null;

            if (shouldReconnect) {
                createSession(userId, tenantId, retryCount + 1);
            } else {
                await disconnectSession(userId);
                if (fs.existsSync(authDir)) fs.rmSync(authDir, { recursive: true, force: true });
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
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Listen to new messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify' && type !== 'append') return;
        for (const msg of messages) {
            await saveMessageToDB(userId, msg, tenantId);
        }
    });

    // Sync history messages
    sock.ev.on('messaging-history.set', async ({ messages, chats }) => {
        console.log(`📜 Syncing ${messages.length} historical messages and ${chats?.length || 0} chats for ${userId}`);
        if (chats) {
            for (const chat of chats) {
                await syncChat(userId, tenantId, chat);
            }
        }
        for (const msg of messages) {
            await saveMessageToDB(userId, msg, tenantId);
        }
    });

    sock.ev.on('chats.upsert', async (chats) => {
        for (const chat of chats) {
            await syncChat(userId, tenantId, chat);
        }
    });

    sock.ev.on('chats.update', async (updates) => {
        for (const update of updates) {
            await syncChat(userId, tenantId, update);
        }
    });

    sock.ev.on('contacts.upsert', async (contacts) => {
        for (const contact of contacts) {
            if (contact.id && (contact.name || contact.verifiedName)) {
                await prisma.whatsAppChat.updateMany({
                    where: { userId, chatId: contact.id },
                    data: { name: contact.name || contact.verifiedName }
                }).catch(() => { });
            }
        }
    });

    sock.ev.on('contacts.update', async (updates) => {
        for (const update of updates) {
            if (update.id && (update.name || update.verifiedName)) {
                await prisma.whatsAppChat.updateMany({
                    where: { userId, chatId: update.id },
                    data: { name: update.name || update.verifiedName }
                }).catch(() => { });
            }
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
        } else {
            console.log(`⚠️ Auth data missing for ${session.userId}, resetting to DISCONNECTED`);
            await prisma.whatsAppSession.update({
                where: { userId: session.userId },
                data: { status: 'DISCONNECTED', qrCode: null }
            });
        }
    }
}

// Call on startup
reconnectAllSessions().catch(console.error);
