// app/api/whatsapp/cloud/chats/[chatId]/pause/route.ts
import { NextResponse } from 'next/server';
import { setBotPaused } from '@/app/lib/whatsappCloudStore';

export async function POST(request: Request, { params }: { params: { chatId: string } }) {
  const { chatId } = params;
  const { pause } = await request.json();

  if (typeof pause !== 'boolean') {
    return NextResponse.json({ error: 'pause flag must be boolean' }, { status: 400 });
  }

  // Update in‑memory paused state (and could persist to DB if needed)
  setBotPaused(chatId, pause);

  // Respond with success flag
  return NextResponse.json({ success: true, chatId, paused: pause });
}
