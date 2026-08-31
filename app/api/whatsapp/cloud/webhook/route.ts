import { NextRequest, NextResponse } from 'next/server';
import { handleIncomingCloudMessage } from '@/app/lib/whatsappChatbot';
import { whatsappCloud } from '@/app/lib/whatsappCloud';

export const dynamic = 'force-dynamic';

/**
 * GET /api/whatsapp/cloud/webhook
 * Verification endpoint for Meta Webhook setup
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const expectedVerifyToken = (process.env.META_WA_VERIFY_TOKEN || 'crm_transfer_verify_token_2026').trim();

    console.log(`[Meta Webhook GET] Mode: ${mode}, Token: ${token}, Expected: ${expectedVerifyToken}`);

    if (mode === 'subscribe' && token === expectedVerifyToken) {
      console.log('[Meta Webhook GET] Verification SUCCESS');
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    } else {
      console.warn('[Meta Webhook GET] Verification FAILED (Token mismatch or invalid mode)');
      return NextResponse.json({ error: 'Verification token mismatch' }, { status: 403 });
    }
  } catch (err: any) {
    console.error('[Meta Webhook GET] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/whatsapp/cloud/webhook
 * Incoming events endpoint from Meta WhatsApp Cloud API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify it is a WhatsApp webhook payload
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        const messages = value.messages || [];

        for (const msg of messages) {
          const from = msg.from; // Sender phone number
          const msgType = msg.type;
          const msgId = msg.id;

          // Mark message as read asynchronously
          whatsappCloud.markAsRead(msgId).catch((e) => {
            // Ignore read receipt errors in background
          });

          let textBody: string | undefined;
          let buttonId: string | undefined;
          let listId: string | undefined;

          if (msgType === 'text') {
            textBody = msg.text?.body;
          } else if (msgType === 'interactive') {
            const interactive = msg.interactive;
            if (interactive.type === 'button_reply') {
              buttonId = interactive.button_reply?.id;
              textBody = interactive.button_reply?.title;
            } else if (interactive.type === 'list_reply') {
              listId = interactive.list_reply?.id;
              textBody = interactive.list_reply?.title;
            }
          } else if (msgType === 'button') {
            // Quick reply from template
            buttonId = msg.button?.payload;
            textBody = msg.button?.text;
          }

          // Process via chatbot engine
          await handleIncomingCloudMessage(from, textBody, buttonId, listId);
        }
      }
    }

    // Meta expects immediate 200 OK
    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (err: any) {
    console.error('[Meta Webhook POST] Error processing webhook:', err);
    // Always return 200 to prevent Meta from retrying indefinitely on bad payload
    return NextResponse.json({ status: 'ERROR_HANDLED', error: err.message }, { status: 200 });
  }
}
