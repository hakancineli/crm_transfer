// app/api/whatsapp/cloud/chats/[chatId]/messages/route.ts
import { NextResponse } from 'next/server';
import { getCloudChatMessages } from '@/app/lib/whatsappCloudStore';

export async function GET(request: Request, { params }: { params: { chatId: string } }) {
  const { chatId } = params;
  const messages = await getCloudChatMessages(chatId);
  return NextResponse.json(messages);
}
