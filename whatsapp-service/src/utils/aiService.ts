import axios from 'axios';

interface AIResponse {
    text: string;
    model: string;
    provider: string;
}

export class AIService {
    private static geminiKeys: string[] = [];
    private static groqKey: string | null = null;

    static init() {
        this.geminiKeys = process.env.GEMINI_API_KEYS
            ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim())
            : [];

        if (process.env.GEMINI_API_KEY && !this.geminiKeys.includes(process.env.GEMINI_API_KEY)) {
            this.geminiKeys.unshift(process.env.GEMINI_API_KEY);
        }

        this.groqKey = process.env.GROQ_API_KEY || null;
    }

    static async generateContent(prompt: string, isJson: boolean = false): Promise<AIResponse> {
        this.init();

        // Try Gemini Keys first
        for (let i = 0; i < this.geminiKeys.length; i++) {
            const key = this.geminiKeys[i];
            try {
                console.log(`🤖 Trying Gemini with Key Index: ${i}`);
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
                    {
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            responseMimeType: isJson ? 'application/json' : 'text/plain',
                            temperature: 0.1,
                        }
                    },
                    { timeout: 15000 }
                );

                const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    return { text, model: 'gemini-1.5-flash', provider: 'google' };
                }
            } catch (error: any) {
                if (error.response?.status === 429) {
                    console.warn(`⚠️ Gemini Key ${i} rate limited.`);
                    continue;
                }
                console.error(`❌ Gemini Key ${i} error:`, error.message);
            }
        }

        // Failover to Groq if available
        if (this.groqKey) {
            try {
                console.log(`🚀 Gemini failed or limited. Falling back to Groq...`);
                const response = await axios.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    {
                        model: 'llama-3.3-70b-versatile',
                        messages: [{ role: 'user', content: prompt }],
                        response_format: isJson ? { type: 'json_object' } : undefined,
                        temperature: 0.1
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.groqKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 15000
                    }
                );

                const text = response.data?.choices?.[0]?.message?.content;
                if (text) {
                    return { text, model: 'llama-3.3-70b-versatile', provider: 'groq' };
                }
            } catch (error: any) {
                console.error(`❌ Groq error:`, error.message);
            }
        }

        throw new Error('All AI providers exhausted or failed.');
    }
}
