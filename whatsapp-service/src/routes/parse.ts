import { Router } from 'express';

export const parseRouter = Router();

const getGeminiKeys = () => {
    const keys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()) : [];
    if (process.env.GEMINI_API_KEY) {
        const primary = process.env.GEMINI_API_KEY.trim();
        if (!keys.includes(primary)) keys.unshift(primary);
    }
    return keys.filter(k => k.length > 0);
};

// Parse WhatsApp message text into reservation fields using Gemini
parseRouter.post('/reservation', async (req, res) => {
    const { messageText, type = 'transfer' } = req.body;

    if (!messageText) {
        return res.status(400).json({ error: 'messageText required' });
    }

    const keys = getGeminiKeys();
    if (keys.length === 0) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const prompt = type === 'tour'
        ? buildTourPrompt(messageText)
        : buildTransferPrompt(messageText);

    try {
        res.setHeader('X-Debug-Start', 'true');
        console.log('🤖 Starting reservation parse with type:', type);

        const MAX_RETRIES = 3;
        const RETRY_DELAYS = [2000, 5000, 10000]; // ms

        let keyIndex = 0;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            const currentKey = keys[keyIndex % keys.length];

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${currentKey}`,
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
            res.setHeader(`X-Debug-Status-${attempt}`, String(response.status));
            res.setHeader(`X-Debug-KeyIndex-${attempt}`, String(keyIndex));

            if (response.status === 429) {
                lastError = data?.error?.message || 'Rate limited';
                console.warn(`⚠️ Key ${keyIndex} rate limited, trying next key...`);
                keyIndex++; // Try next key
                if (keyIndex < keys.length) {
                    attempt--; // Don't count as a retry attempt if we have more keys to try
                } else {
                    // All keys tried, now wait for retry delay
                }
                continue;
            }

            if (!response.ok) {
                return res.status(500).json({ error: `Gemini API error: ${data?.error?.message || 'Unknown'}` });
            }

            const candidate = data?.candidates?.[0];
            const text = candidate?.content?.parts?.[0]?.text;

            res.setHeader(`X-Debug-HasText-${attempt}`, text ? 'true' : 'false');

            if (!text) {
                return res.status(500).json({ error: 'AI returned no response', debug: JSON.stringify(data).substring(0, 200) });
            }

            const parsed = JSON.parse(text.trim());
            return res.json(parsed);
        }

        return res.status(429).json({ error: `AI kota limiti aşıldı. Lütfen birkaç dakika sonra tekrar deneyin.` });
    } catch (err: any) {
        return res.status(500).json({ error: 'Failed to parse message', debug: err.message });
    }
});

// Translate WhatsApp messages using Gemini
parseRouter.post('/translate', async (req, res) => {
    const { text, targetLang = 'tr', context = '' } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'text required' });
    }

    const keys = getGeminiKeys();
    if (keys.length === 0) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    let prompt = '';
    // ... rest of prompt logic ...
    if (targetLang === 'tr') {
        prompt = `Translate the following message to Turkish. Keep the tone natural and professional. If it's already in Turkish, return it as is.
        
        MESSAGE:
        ${text}`;
    } else {
        prompt = `Translate the following Turkish message into the language of the customer in this context. 
        Context (previous messages): ${context}
        If no clear language is detected in context, translate to English.
        Only return the translated text, nothing else.
        
        MESSAGE TO TRANSLATE:
        ${text}`;
    }

    try {
        let lastError = '';
        for (let kIndex = 0; kIndex < keys.length; kIndex++) {
            const currentKey = keys[kIndex];
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${currentKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.1,
                        }
                    })
                }
            );

            const data = await response.json() as any;
            if (response.status === 429) {
                lastError = data?.error?.message || 'Rate limited';
                continue; // Try next key
            }

            if (!response.ok) {
                return res.status(500).json({ error: `Gemini API error: ${data?.error?.message || 'Unknown'}` });
            }

            const translatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!translatedText) {
                return res.status(500).json({ error: 'AI returned no translation' });
            }

            return res.json({ translatedText: translatedText.trim() });
        }
        return res.status(429).json({ error: 'Tüm AI kotaları doldu. Lütfen bekleyin.', detail: lastError });
    } catch (err: any) {
        return res.status(500).json({ error: 'Translation failed', debug: err.message });
    }
});

function buildTransferPrompt(message: string): string {
    const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return `Sen profesyonel bir transfer rezervasyon asistanısın. Aşağıdaki WhatsApp sohbet geçmişini analiz ederek rezervasyon bilgilerini çıkar ve JSON formatında döndür.
Bugünün tarihi: ${today}.

ÖNEMLİ KURALLAR:
1. **FİYAT ANALİZİ:** Sohbet içinde fiyat pazarlığı olabilir. Eğer birden fazla fiyat telaffuz edildiyse, her zaman **en son üzerinde anlaşılan (konfirme edilen)** fiyatı ve para birimini (EUR, USD, TRY) al. 
   Örn: "50 USD olur mu?" -> "Tamam 40 USD olsun" -> "Tamam anlaştık" -> Fiyat: 40, Para Birimi: USD.
2. **YOLCU İSMİ:** Eğer mesajda açıkça isim verilmemişse, "Müşteri:" etiketli kişinin ismini veya sohbet akışındaki kullanıcı adını "passengerNames" listesine ekle.
3. **BAGAJ:** Mesajda valiz, bagaj, büyük/küçük çanta sayısı geçiyorsa "luggageCount" alanına sayı olarak yaz.
4. **LOKASYON:** Havalimanı transferlerinde IST, SAW kodlarını veya otel isimleri geçiyorsa bunları "from" (nereden) ve "to" (nereye) alanlarına tam olarak yaz.
5. **TARİH/SAAT:** "Yarın", "Pazartesi" gibi ifadeleri bugünün tarihine (${today}) göre net tarihe (YYYY-MM-DD) çevir.

MESAJ GEÇMİŞİ:
${message}

Aşağıdaki JSON formatında döndür (değer bulunamazsa null veya []):
{
  "date": "YYYY-MM-DD veya null",
  "time": "HH:MM veya null", 
  "from": "nereden (konum/otel adı) veya null",
  "to": "nereye (konum/otel adı) veya null",
  "passengerCount": sayı veya null,
  "luggageCount": sayı veya null,
  "passengerNames": ["isim1", "isim2"] veya [],
  "flightCode": "uçuş kodu veya null",
  "price": sayı veya null,
  "currency": "EUR/USD/TRY veya null",
  "phoneNumber": "telefon numarası veya null",
  "notes": "ek notlar veya null"
}

Sadece JSON döndür.`;
}

function buildTourPrompt(message: string): string {
    const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return `Sen profesyonel bir tur rezervasyon asistanısın. Aşağıdaki WhatsApp mesajından tur rezervasyon bilgilerini çıkar ve JSON formatında döndür.
Bugünün tarihi: ${today}.

ÖNEMLİ KURALLAR:
1. Eğer mesajda açıkça bir isim yoksa, mesajı yazan kişinin ismini "passengerNames" içine al.
2. "200 Euro", "1500 TL" gibi fiyat ifadelerini "price" ve "currency" olarak ayır.
3. Tur adı veya güzergahı "routeName" kısmına yaz.

MESAJ GEÇMİŞİ:
${message}

Aşağıdaki JSON formatında döndür (değer bulunamazsa null veya []):
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

Sadece JSON döndür.`;
}

