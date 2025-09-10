import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu 10MB sınırını aşıyor' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'tenants');
    await fs.mkdir(uploadsDir, { recursive: true });

    const orig = (file as any).name || 'logo';
    const ext = path.extname(orig) || '.png';
    const safeBase = path.basename(orig, ext).replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 32) || 'logo';
    const filename = `${safeBase}-${Date.now()}${ext}`;
    const fullPath = path.join(uploadsDir, filename);

    await fs.writeFile(fullPath, new Uint8Array(buffer));

    const urlPath = `/uploads/tenants/${filename}`;
    return NextResponse.json({ url: urlPath });
  } catch (error) {
    console.error('Logo yükleme hatası:', error);
    return NextResponse.json({ error: 'Logo yüklenemedi' }, { status: 500 });
  }
}


