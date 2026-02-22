import { Router } from 'express';

export const parseRouter = Router();

// Parse WhatsApp message text into reservation fields using Gemini
parseRouter.post('/reservation', async (req, res) => {
    const { messageText, type = 'transfer' } = req.body;

    if (!messageText) {
        return res.status(400).json({ error: 'messageText required' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const prompt = type === 'tour'
        ? buildTourPrompt(messageText)
        : buildTransferPrompt(messageText);

    try {
        console.log('🤖 Starting reservation parse with type:', type);
        console.log('📝 Message text length:', messageText.length);

        const MAX_RETRIES = 3;
        const RETRY_DELAYS = [2000, 5000, 10000]; // ms

        let lastError: any = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            if (attempt > 0) {
                const delay = RETRY_DELAYS[attempt - 1] || 10000;
                console.log(`⏳ Gemini rate limited, retrying in ${delay / 1000}s (attempt ${attempt}/${MAX_RETRIES})...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            console.log(`📡 Sending request to Gemini (attempt ${attempt + 1})...`);

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            responseMimeType: 'application/json',
                            temperature: 0.1,
                        }
                    })
                }
            );

            console.log(`📥 Gemini response status: ${response.status} ${response.statusText}`);
            const data = await response.json() as any;

            if (response.status === 429) {
                lastError = data?.error?.message || 'Rate limited';
                console.warn(`⚠️ Gemini 429 rate limit (attempt ${attempt + 1}):`, lastError);
                continue; // Retry
            }

            if (!response.ok) {
                console.error('❌ Gemini API error:', JSON.stringify(data));
                return res.status(500).json({ error: `Gemini API error: ${data?.error?.message || 'Unknown'}` });
            }

            const candidate = data?.candidates?.[0];
            const text = candidate?.content?.parts?.[0]?.text;

            if (!text) {
                console.error('❌ AI returned no text. FinishReason:', candidate?.finishReason);
                console.error('❌ Full response snapshot:', JSON.stringify(data).substring(0, 500));
                return res.status(500).json({ error: 'AI returned no response' });
            }

            console.log('✅ AI text received, length:', text.length);

            try {
                const parsed = JSON.parse(text.trim());
                console.log('✅ Successfully parsed AI response to JSON');
                return res.json(parsed);
            } catch (jsonErr) {
                console.error('❌ JSON parse error for text:', text);
                return res.status(500).json({ error: 'AI returned invalid JSON' });
            }
        }

        // All retries exhausted
        console.error('❌ All Gemini retries exhausted:', lastError);
        return res.status(429).json({ error: `AI kota limiti aşıldı. Lütfen birkaç dakika sonra tekrar deneyin.` });
    } catch (err) {
        console.error('❌ Critical parse engine error:', err);
        return res.status(500).json({ error: 'Failed to parse message' });
    }
});

function buildTransferPrompt(message: string): string {
    const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return `Sen bir transfer rezervasyon asistanısın. Aşağıdaki WhatsApp mesajından rezervasyon bilgilerini çıkar ve JSON formatında döndür.
Bugünün tarihi: ${today} (Mesajdaki "yarın", "pazartesi" gibi ifadeleri buna göre çöz).

MESAJ:
${message}

Aşağıdaki JSON formatında döndür (değeri bilinmiyorsa null):
{
  "date": "YYYY-MM-DD veya null",
  "time": "HH:MM veya null", 
  "from": "nereden (konum adı) veya null",
  "to": "nereye (konum adı) veya null",
  "passengerCount": sayı veya null,
  "passengerNames": ["isim1", "isim2"] veya [],
  "flightCode": "uçuş kodu veya null",
  "price": sayı veya null,
  "currency": "EUR/USD/TRY veya null",
  "phoneNumber": "telefon numarası veya null",
  "notes": "ek notlar veya null"
}

Sadece JSON döndür, başka bir şey yazma.`;
}

function buildTourPrompt(message: string): string {
    const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return `Sen bir tur rezervasyon asistanısın. Aşağıdaki WhatsApp mesajından tur rezervasyon bilgilerini çıkar ve JSON formatında döndür.
Bugünün tarihi: ${today} (Mesajdaki "yarın", "pazartesi" gibi ifadeleri buna göre çöz).

MESAJ:
${message}

Aşağıdaki JSON formatında döndür (değeri bilinmiyorsa null):
{
  "tourDate": "YYYY-MM-DD veya null",
  "tourTime": "HH:MM veya null",
  "routeName": "tur adı/güzergah veya null",
  "passengerCount": sayı veya null,
  "passengerNames": ["isim1", "isim2"] veya [],
  "pickupLocation": "karşılama yeri veya null",
  "price": sayı veya null,
  "currency": "EUR/USD/TRY veya null",
  "phoneNumber": "telefon numarası veya null",
  "notes": "ek notlar veya null"
}

Sadece JSON döndür, başka bir şey yazma.`;
}
