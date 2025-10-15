import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

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
  // Istinye
  istinye1: 'istinye1.avif',
  istinye2: 'istinye2.avif',
  istinye3: 'istinye3.avif',
  istinye4: 'istinye4.avif',
  istinye5: 'istinye5.avif',
  istinye6: 'istinye6.avif',
  istinye7: 'istinye7.avif',
  istinye8: 'istinye8.avif',
  istinye9: 'istinye9.avif',
  istinye10: 'istinye10.avif',
  istinye11: 'istinye11.avif',
  istinye12: 'istinye12.avif',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const name = (searchParams.get('name') || '').toLowerCase()
    const file = MAP[name]
    if (!file) {
      return new NextResponse('Not Found', { status: 404 })
    }
    // First try direct FS read (Node.js runtime)
    try {
      const filePath = path.join(process.cwd(), 'public', 'tekneturlari', file)
      const buf = await fs.readFile(filePath)
      const res = new NextResponse(buf, { status: 200 })
      res.headers.set('Content-Type', 'image/avif')
      res.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      return res
    } catch (err) {
      // Fallback to upstream fetch (should rarely be needed)
      try {
        const encodedPath = encodeURI(`/tekneturlari/${file}`)
        const url = `${origin}${encodedPath}`
        const upstream = await fetch(url, { next: { revalidate: 60 } })
        if (!upstream.ok) {
          return new NextResponse('Upstream Not Found', { status: upstream.status })
        }
        const buf = await upstream.arrayBuffer()
        const res = new NextResponse(buf, { status: 200 })
        res.headers.set('Content-Type', upstream.headers.get('content-type') || 'image/avif')
        res.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
        return res
      } catch (e) {
        console.error('tekneturlari proxy error:', e)
        return new NextResponse('Error', { status: 500 })
      }
    }
  } catch (e) {
    console.error('tekneturlari handler error:', e)
    return new NextResponse('Error', { status: 500 })
  }
}
