// app/api/whatsapp/cloud/chats/[chatId]/reply/route.ts
import { NextResponse } from 'next/server';
import { sendAgentReply, getCloudChatMessages } from '@/app/lib/whatsappCloudStore';

export async function POST(request: Request, { params }: { params: { chatId: string } }) {
  const { chatId } = params;
  const { body } = await request.json();

  if (!body || typeof body !== 'string' || !body.trim()) {
    return NextResponse.json({ error: 'Message body is required' }, { status: 400 });
  }

  // Send the message via Meta Cloud API and record it in DB
  const sendResult = await sendAgentReply(chatId, body.trim());

  if (!sendResult.success) {
    return NextResponse.json({ error: 'Failed to send message', details: sendResult }, { status: 500 });
  }

  // Return the refreshed list of messages for this chat
  const messages = await getCloudChatMessages(chatId);
  return NextResponse.json(messages);
}
