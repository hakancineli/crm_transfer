'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function WhatsAppCloudPage() {
    const { user } = useAuth();
    const [broadcastRecipients, setBroadcastRecipients] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastType, setBroadcastType] = useState<'text' | 'template'>('text');
    const [broadcastTemplateName, setBroadcastTemplateName] = useState('welcome_vip_transfer');
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [broadcastStatus, setBroadcastStatus] = useState<{ total: number; successful: number; failed: number } | null>(null);

    const getAuthHeaders = () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    };

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        const rawPhones = broadcastRecipients.split(/[\n,;]+/).map(p => p.trim()).filter(Boolean);
        if (rawPhones.length === 0) {
            alert('Lütfen en az bir telefon numarası girin.');
            return;
        }

        if (broadcastType === 'text' && !broadcastMessage.trim()) {
            alert('Lütfen gönderilecek mesaj metnini yazın.');
            return;
        }

        if (broadcastType === 'template' && !broadcastTemplateName.trim()) {
            alert('Lütfen şablon adını girin.');
            return;
        }

        setIsBroadcasting(true);
        setBroadcastStatus(null);
        try {
            const recipients = rawPhones.map(phone => ({ phoneNumber: phone }));
            const res = await fetch('/api/whatsapp/cloud/broadcast', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    type: broadcastType,
                    recipients,
                    messageText: broadcastType === 'text' ? broadcastMessage : undefined,
                    templateName: broadcastType === 'template' ? broadcastTemplateName : undefined,
                    languageCode: 'en',
                    delayMs: 400
                })
            });

            const data = await res.json();
            if (!res.ok || data.error) {
                alert(`Toplu gönderim hatası: ${data.error || 'Bilinmeyen hata'}`);
            } else {
                setBroadcastStatus(data.summary);
                alert(`Toplu gönderim tamamlandı! Başarılı: ${data.summary.successful}, Başarısız: ${data.summary.failed}`);
            }
        } catch (err: any) {
            console.error('Broadcast error:', err);
            alert('Gönderim sırasında bağlantı hatası oluştu.');
        } finally {
            setIsBroadcasting(false);
        }
    };

    return (
        <div className="flex-1 bg-gray-50 dark:bg-slate-950 p-4 md:p-8 overflow-y-auto min-h-screen text-gray-900 dark:text-slate-100 transition-colors duration-200">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Card */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
                                ⚡
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">Resmi Meta WhatsApp Cloud API & Chatbot</h1>
                                <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">Doğrudan Meta Graph API, Otonom Rezervasyon Chatbot&apos;u & Toplu Mesaj Yönetimi</p>
                            </div>
                        </div>
                        <span className="px-3.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Servis Aktif
                        </span>
                    </div>
                </div>

                {/* Webhook Configuration Guide */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                        🔗 Meta Developer Webhook Ayarları
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-slate-300">
                        Meta Developer Panelinizde (<code>developers.facebook.com</code>) WhatsApp &gt; Configuration &gt; Webhook bölümüne aşağıdaki bilgileri tanımlayın:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/60">
                            <span className="text-xs text-gray-400 block mb-1">Callback URL (Webhook Adresiniz):</span>
                            <code className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 break-all select-all">
                                {typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/cloud/webhook` : 'https://www.proacente.com/api/whatsapp/cloud/webhook'}
                            </code>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/60">
                            <span className="text-xs text-gray-400 block mb-1">Verify Token (Doğrulama Parolası):</span>
                            <code className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 select-all">
                                crm_transfer_verify_token_2026
                            </code>
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                        💡 <strong>Webhook İzinleri:</strong> Meta panelinde <code>messages</code> alanını &quot;Subscribe&quot; (Abone ol) yapmanız yeterlidir. Müşteri yazdığında chatbot otomatik olarak konuşmayı başlatır.
                    </div>
                </div>

                {/* Chatbot Features & Automated Flow */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                        🤖 Akıllı Transfer Chatbot Akışı (Jasper&apos;s Market Mimarisi)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="p-3.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/60">
                            <strong className="block text-gray-900 dark:text-slate-100 mb-1 text-sm">1. Karşılama & Menü</strong>
                            <p className="text-gray-500 dark:text-slate-400 leading-relaxed">Müşteri yazdığında otomatik interaktif butonlar sunulur (Havalimanı, Şehirlerarası VIP, Canlı Destek).</p>
                        </div>
                        <div className="p-3.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/60">
                            <strong className="block text-gray-900 dark:text-slate-100 mb-1 text-sm">2. Güzergah & Fiyat</strong>
                            <p className="text-gray-500 dark:text-slate-400 leading-relaxed">Açılır listeden rota seçilir, tarih/saat ve yolcu sayısı alınarak anlık fiyat teklifi hesaplanır.</p>
                        </div>
                        <div className="p-3.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/60">
                            <strong className="block text-gray-900 dark:text-slate-100 mb-1 text-sm">3. Otomatik CRM Kaydı</strong>
                            <p className="text-gray-500 dark:text-slate-400 leading-relaxed">Müşteri onayladığı an Rezervasyonlar tablosuna Voucher kodu ile eklenir ve Telegram bildirimi atılır.</p>
                        </div>
                    </div>
                </div>

                {/* Broadcast / Toplu Gönderim Formu */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                        📢 Toplu Mesaj / Şablon Gönderici (Broadcast)
                    </h2>
                    <form onSubmit={handleSendBroadcast} className="space-y-4">
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200 cursor-pointer">
                                <input
                                    type="radio"
                                    name="btype"
                                    checked={broadcastType === 'text'}
                                    onChange={() => setBroadcastType('text')}
                                />
                                Düz Metin Mesajı
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200 cursor-pointer">
                                <input
                                    type="radio"
                                    name="btype"
                                    checked={broadcastType === 'template'}
                                    onChange={() => setBroadcastType('template')}
                                />
                                Meta Onaylı Şablon (Template)
                            </label>
                        </div>

                        {broadcastType === 'template' ? (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
                                    Şablon Adı (Template Name):
                                </label>
                                <input
                                    type="text"
                                    value={broadcastTemplateName}
                                    onChange={e => setBroadcastTemplateName(e.target.value)}
                                    placeholder="welcome_vip_transfer"
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
                                    Mesaj İçeriği:
                                </label>
                                <textarea
                                    value={broadcastMessage}
                                    onChange={e => setBroadcastMessage(e.target.value)}
                                    placeholder="Hello! Enjoy special offers for your trip to Türkiye with VIP transfers..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
                                Alıcı Numaralar (Her satıra bir numara veya virgülle ayrılmış):
                            </label>
                            <textarea
                                value={broadcastRecipients}
                                onChange={e => setBroadcastRecipients(e.target.value)}
                                placeholder="+905545812034&#10;+905432695442&#10;966501234567"
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                                Gönderimler otomatik olarak 400ms aralıklarla kontrollü iletilir.
                            </span>
                            <button
                                type="submit"
                                disabled={isBroadcasting}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {isBroadcasting ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    '🚀 Toplu Gönderimi Başlat'
                                )}
                            </button>
                        </div>
                    </form>

                    {broadcastStatus && (
                        <div className="p-4 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700 text-sm space-y-1">
                            <div className="font-semibold text-gray-900 dark:text-slate-100">Son Gönderim Özeti:</div>
                            <div className="text-xs text-gray-600 dark:text-slate-300">
                                Toplam: <strong>{broadcastStatus.total}</strong> | Başarılı: <strong className="text-emerald-600">{broadcastStatus.successful}</strong> | Başarısız: <strong className="text-red-500">{broadcastStatus.failed}</strong>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
