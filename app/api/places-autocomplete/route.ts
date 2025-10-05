import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const input: string = body?.input || '';
    if (!input || typeof input !== 'string') {
      return NextResponse.json({ suggestions: [] }, { status: 200 });
    }

    const payload = {
      input,
      languageCode: 'tr',
      regionCode: 'TR',
      includedRegionCodes: ['TR']
    };

    const resp = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'suggestions.placePrediction.text.text,suggestions.queryPrediction.text.text'
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: text || 'Autocomplete failed' }, { status: resp.status });
    }

    const data = await resp.json();
    const list = Array.isArray(data?.suggestions) ? data.suggestions : [];
    const mapped: Array<{ description: string }> = list
      .map((s: any) => s?.placePrediction?.text?.text || s?.queryPrediction?.text?.text)
      .filter(Boolean)
      .slice(0, 5)
      .map((description: string) => ({ description }));

    return NextResponse.json({ suggestions: mapped }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}


