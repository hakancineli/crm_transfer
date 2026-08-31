import { NextRequest, NextResponse } from 'next/server';
import { whatsappCloud } from '@/app/lib/whatsappCloud';
import { getRequestUserContext } from '@/app/lib/requestContext';

export const dynamic = 'force-dynamic';

interface BroadcastRecipient {
  phoneNumber: string;
  name?: string;
  customParams?: Record<string, string>;
}

interface BroadcastRequest {
  type: 'template' | 'text' | 'media';
  recipients: BroadcastRecipient[];
  // For template
  templateName?: string;
  languageCode?: string;
  templateComponents?: any[];
  // For text
  messageText?: string;
  // For media
  mediaType?: 'image' | 'video' | 'document';
  mediaUrl?: string;
  caption?: string;
  // Rate limiting delay in ms between sends (default 500ms)
  delayMs?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getRequestUserContext(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: BroadcastRequest = await request.json();
    const { recipients, type, delayMs = 500 } = payload;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'Recipients list cannot be empty' }, { status: 400 });
    }

    const results = {
      total: recipients.length,
      successful: 0,
      failed: 0,
      details: [] as Array<{ phoneNumber: string; status: 'SENT' | 'FAILED'; error?: string }>
    };

    console.log(`[WhatsApp Broadcast] Starting broadcast to ${recipients.length} recipients (Type: ${type})`);

    for (const recipient of recipients) {
      const phone = recipient.phoneNumber;
      let sendResult: any;

      try {
        if (type === 'template') {
          if (!payload.templateName) {
            throw new Error('templateName is required for template broadcast');
          }
          sendResult = await whatsappCloud.sendTemplateMessage(
            phone,
            payload.templateName,
            payload.languageCode || 'en',
            payload.templateComponents || []
          );
        } else if (type === 'media') {
          if (!payload.mediaUrl || !payload.mediaType) {
            throw new Error('mediaUrl and mediaType are required for media broadcast');
          }
          sendResult = await whatsappCloud.sendMediaMessage(
            phone,
            payload.mediaType,
            payload.mediaUrl,
            payload.caption
          );
        } else {
          // Plain text
          if (!payload.messageText) {
            throw new Error('messageText is required for text broadcast');
          }
          sendResult = await whatsappCloud.sendTextMessage(phone, payload.messageText);
        }

        if (sendResult.success) {
          results.successful++;
          results.details.push({ phoneNumber: phone, status: 'SENT' });
        } else {
          results.failed++;
          results.details.push({ phoneNumber: phone, status: 'FAILED', error: sendResult.error });
        }
      } catch (sendErr: any) {
        results.failed++;
        results.details.push({ phoneNumber: phone, status: 'FAILED', error: sendErr.message });
      }

      // Delay between sends to respect pacing
      if (delayMs > 0 && recipients.indexOf(recipient) < recipients.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return NextResponse.json({
      success: true,
      summary: results
    });
  } catch (err: any) {
    console.error('[WhatsApp Broadcast] General Error:', err);
    return NextResponse.json({ error: err.message || 'Broadcast failed' }, { status: 500 });
  }
}
