import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Map safe keys to actual filenames in public/tekneturlari
const MAP: Record<string, string> = {
  // Eminönü (NFD filenames in repo)
  eminonu1: 'eminönü1.avif',
  eminonu2: 'eminönü2.avif',
  eminonu3: 'eminönü3.avif',
  eminonu4: 'eminönü4.avif',
  eminonu5: 'eminönü5.avif',
  eminonu6: 'eminönü6.avif',
  // Tekne genel
  tekne1: 'tekne1.avif',
  tekne2: 'tekne2.avif',
  tekne3: 'tekne3.avif',
  tekne4: 'tekne4.avif',
  // Arnavutköy (NFD filenames)
  arnavutkoy1: 'Arnavutköy1.avif',
  arnavutkoy2: 'Arnavutköy2.avif',
  arnavutkoy3: 'Arnavutköy3.avif',
  arnavutkoy4: 'Arnavutköy4.avif',
  arnavutkoy5: 'Arnavutköy5.avif',
  arnavutkoy6: 'Arnavutköy6.avif',
  arnavutkoy7: 'Arnavutköy7.avif',
  arnavutkoy8: 'Arnavutköy8.avif',
  arnavutkoy9: 'Arnavutköy9.avif',
  arnavutkoy10: 'Arnavutköy10.avif',
  arnavutkoy11: 'Arnavutköy11.avif',
  arnavutkoy12: 'Arnavutköy12.avif',
  arnavutkoy13: 'Arnavutköy13.avif',
  arnavutkoy14: 'Arnavutköy14.avif',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = (searchParams.get('name') || '').toLowerCase()
    const file = MAP[name]
    if (!file) {
      return new NextResponse('Not Found', { status: 404 })
    }
    const filePath = path.join(process.cwd(), 'public', 'tekneturlari', file)
    const buf = await fs.readFile(filePath)
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'image/avif',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e) {
    return new NextResponse('Error', { status: 500 })
  }
}
