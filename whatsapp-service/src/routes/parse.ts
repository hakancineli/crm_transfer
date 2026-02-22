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
        const MAX_RETRIES = 3;
        const RETRY_DELAYS = [2000, 5000, 10000]; // ms

        let lastError: any = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            if (attempt > 0) {
                const delay = RETRY_DELAYS[attempt - 1] || 10000;
                console.log(`⏳ Gemini rate limited, retrying in ${delay / 1000}s (attempt ${attempt}/${MAX_RETRIES})...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
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

            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                console.error('❌ AI returned no text. Full response:', JSON.stringify(data).substring(0, 500));
                return res.status(500).json({ error: 'AI returned no response' });
            }

            console.log('✅ AI parsed reservation successfully');
            const parsed = JSON.parse(text);
            return res.json(parsed);
        }

        // All retries exhausted
        console.error('❌ All Gemini retries exhausted:', lastError);
        return res.status(429).json({ error: `AI kota limiti aşıldı. Lütfen birkaç dakika sonra tekrar deneyin.` });
    } catch (err) {
        console.error('Parse error:', err);
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
