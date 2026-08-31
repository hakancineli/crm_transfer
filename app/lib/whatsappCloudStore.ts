/**
 * WhatsApp Cloud API Database & Chat Store Management
 * Handles persistent message history, chat threads, and agent live takeover
 */

import { prisma } from '@/lib/prisma';
import { whatsappCloud } from './whatsappCloud';

const META_SESSION_USER_ID = 'META_CLOUD_SESSION';

// In-memory store for paused bot numbers (when human agent takes over)
const pausedBotNumbers = new Set<string>();

export function isBotPaused(phoneNumber: string): boolean {
  const clean = phoneNumber.replace(/[^0-9]/g, '');
  return pausedBotNumbers.has(clean);
}

export function setBotPaused(phoneNumber: string, paused: boolean) {
  const clean = phoneNumber.replace(/[^0-9]/g, '');
  if (paused) {
    pausedBotNumbers.add(clean);
  } else {
    pausedBotNumbers.delete(clean);
  }
}

/**
 * Ensure default Meta Cloud WhatsAppSession exists in database
 */
export async function getOrCreateMetaSession(tenantId?: string) {
  let defaultTenantId = tenantId;
  if (!defaultTenantId) {
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
      select: { id: true }
    });
    defaultTenantId = tenant?.id || 'default-tenant';
  }

  let session = await prisma.whatsappSession.findUnique({
    where: { userId: META_SESSION_USER_ID }
  });

  if (!session) {
    session = await prisma.whatsappSession.create({
      data: {
        userId: META_SESSION_USER_ID,
        tenantId: defaultTenantId,
        status: 'CONNECTED',
        phone: process.env.META_WA_PHONE_NUMBER_ID || 'META_CLOUD',
        connectedAt: new Date()
      }
    });
  }

  return session;
}

/**
 * Record an incoming or outgoing message in the database
 */
export async function recordCloudMessage(params: {
  phoneNumber: string;
  senderName?: string;
  body: string;
  fromMe: boolean;
  msgType?: string;
  mediaUrl?: string;
  caption?: string;
  tenantId?: string;
}) {
  try {
    const cleanPhone = params.phoneNumber.replace(/[^0-9]/g, '');
    const session = await getOrCreateMetaSession(params.tenantId);

    // Find or create chat
    let chat = await prisma.whatsappChat.findUnique({
      where: {
        userId_chatId: {
          userId: session.userId,
          chatId: cleanPhone
        }
      }
    });

    if (!chat) {
      chat = await prisma.whatsappChat.create({
        data: {
          userId: session.userId,
          tenantId: session.tenantId,
          chatId: cleanPhone,
          phone: cleanPhone,
          name: params.senderName || `+${cleanPhone}`,
          lastMsg: params.body.slice(0, 200),
          lastMsgAt: new Date(),
          unread: params.fromMe ? 0 : 1
        }
      });
    } else {
      chat = await prisma.whatsappChat.update({
        where: { id: chat.id },
        data: {
          lastMsg: params.body.slice(0, 200),
          lastMsgAt: new Date(),
          unread: params.fromMe ? 0 : chat.unread + 1,
          name: params.senderName && params.senderName !== `+${cleanPhone}` ? params.senderName : chat.name
        }
      });
    }

    // Generate unique msgId
    const msgId = `wacloud_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const message = await prisma.whatsappMessage.create({
      data: {
        chatId: chat.id,
        msgId: msgId,
        fromMe: params.fromMe,
        body: params.body,
        msgType: params.msgType || 'text',
        timestamp: new Date(),
        mediaUrl: params.mediaUrl,
        caption: params.caption,
        senderName: params.senderName
      }
    });

    return { chat, message };
  } catch (err) {
    console.error('[CloudStore] Error recording message:', err);
    return null;
  }
}

/**
 * Get all Cloud API chats
 */
export async function getCloudChats() {
  const session = await getOrCreateMetaSession();
  const chats = await prisma.whatsappChat.findMany({
    where: { userId: session.userId },
    orderBy: [
      { pinned: 'desc' },
      { lastMsgAt: 'desc' }
    ],
    include: {
      _count: {
        select: { messages: true }
      }
    }
  });

  return chats.map(c => ({
    ...c,
    isBotPaused: isBotPaused(c.chatId)
  }));
}

/**
 * Get message history for a specific chat
 */
export async function getCloudChatMessages(chatId: string) {
  const cleanPhone = chatId.replace(/[^0-9]/g, '');
  const session = await getOrCreateMetaSession();

  const chat = await prisma.whatsappChat.findUnique({
    where: {
      userId_chatId: {
        userId: session.userId,
        chatId: cleanPhone
      }
    }
  });

  if (!chat) return [];

  // Reset unread count when messages are viewed
  await prisma.whatsappChat.update({
    where: { id: chat.id },
    data: { unread: 0 }
  });

  return prisma.whatsappMessage.findMany({
    where: { chatId: chat.id },
    orderBy: { timestamp: 'asc' },
    take: 100
  });
}

/**
 * Send a manual reply from an agent via Meta Cloud API and record in DB
 */
export async function sendAgentReply(phoneNumber: string, messageText: string, senderName: string = 'Agent') {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const sendResult = await whatsappCloud.sendTextMessage(cleanPhone, messageText);

  if (sendResult.success) {
    await recordCloudMessage({
      phoneNumber: cleanPhone,
      body: messageText,
      fromMe: true,
      senderName: senderName,
      msgType: 'text'
    });
  }

  return sendResult;
}
