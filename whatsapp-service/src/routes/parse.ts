import { Router } from 'express';
import { AIService } from '../utils/aiService';

export const parseRouter = Router();

// Parse WhatsApp message text into reservation fields using Gemini/Groq
parseRouter.post('/reservation', async (req, res) => {
    const { messageText, type = 'transfer' } = req.body;

    if (!messageText) {
        return res.status(400).json({ error: 'messageText required' });
    }

    const prompt = type === 'tour'
        ? buildTourPrompt(messageText)
        : buildTransferPrompt(messageText);

    try {
        console.log('🤖 Parsing reservation with AI Service. Type:', type);
        const aiResponse = await AIService.generateContent(prompt, true);

        console.log(`✅ AI Response from ${aiResponse.provider} (${aiResponse.model})`);
        const parsed = JSON.parse(aiResponse.text.trim());
        return res.json(parsed);
    } catch (err: any) {
        console.error('❌ Parse error:', err.message);
        const status = err.message.includes('exhausted') ? 429 : 500;
        return res.status(status).json({
            error: err.message.includes('exhausted') ? 'Tüm AI kotaları doldu. Lütfen 1 dakika bekleyin.' : 'AI analizi başarısız oldu.',
            debug: err.message
        });
    }
});

// Translate WhatsApp messages using Gemini/Groq
parseRouter.post('/translate', async (req, res) => {
    const { text, targetLang = 'tr', context = '' } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'text required' });
    }

    let prompt = '';
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
        console.log('🌐 Translating with AI Service...');
        const aiResponse = await AIService.generateContent(prompt, false);
        console.log(`✅ Translation from ${aiResponse.provider} (${aiResponse.model})`);

        return res.json({ translatedText: aiResponse.text.trim() });
    } catch (err: any) {
        console.error('❌ Translation error:', err.message);
        const status = err.message.includes('exhausted') ? 429 : 500;
        return res.status(status).json({
            error: err.message.includes('exhausted') ? 'Çeviri kotası doldu. Lütfen bekleyin.' : 'Çeviri başarısız oldu.',
            debug: err.message
        });
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
