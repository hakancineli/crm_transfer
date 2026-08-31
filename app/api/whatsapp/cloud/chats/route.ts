// app/api/whatsapp/cloud/chats/route.ts
import { NextResponse } from 'next/server';
import { getCloudChats } from '@/app/lib/whatsappCloudStore';

export async function GET() {
  const chats = await getCloudChats();
  return NextResponse.json(chats);
}
