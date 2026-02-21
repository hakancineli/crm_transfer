'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Chat {
    id: string;
    chatId: string;
    name: string | null;
    phone: string | null;
    lastMsg: string | null;
    lastMsgAt: string | null;
    unread: number;
}

interface WAMessage {
    id: string;
    fromMe: boolean;
    body: string;
    timestamp: string;
}

interface SessionStatus {
    status: 'NOT_CONNECTED' | 'QR_PENDING' | 'CONNECTED' | 'DISCONNECTED' | 'SERVICE_UNAVAILABLE';
    qr: string | null;
    phone: string | null;
}

type ParsedReservation = {
    date?: string;
    time?: string;
    from?: string;
    to?: string;
    passengerCount?: number;
    passengerNames?: string[];
    flightCode?: string;
    price?: number;
    currency?: string;
    phoneNumber?: string;
    notes?: string;
    // Tour fields
    tourDate?: string;
    tourTime?: string;
    pickupLocation?: string;
    routeName?: string;
    type?: 'transfer' | 'tour';
};

export default function WhatsAppPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [session, setSession] = useState<SessionStatus>({ status: 'NOT_CONNECTED', qr: null, phone: null });
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<WAMessage[]>([]);
    const [loadingChats, setLoadingChats] = useState(false);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [parsedReservation, setParsedReservation] = useState<ParsedReservation | null>(null);
    const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
    const [selectMode, setSelectMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) authHeaders['Authorization'] = `Bearer ${token}`;

    // Poll session status
    const pollStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/whatsapp/status', { headers: authHeaders });
            const data = await res.json();
            setSession(data);

            if (data.status === 'CONNECTED') {
                if (pollRef.current) clearInterval(pollRef.current);
                loadChats();
            }
        } catch (e) {
            setSession(prev => ({ ...prev, status: 'SERVICE_UNAVAILABLE' }));
        }
    }, []);

    useEffect(() => {
        pollStatus();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startConnection = async () => {
        setConnecting(true);
        try {
            await fetch('/api/whatsapp/status', { method: 'POST', headers: authHeaders });
            // Start polling for QR/status
            pollRef.current = setInterval(pollStatus, 2000);
        } catch (e) {
            console.error(e);
        } finally {
            setConnecting(false);
        }
    };

    const disconnect = async () => {
        await fetch('/api/whatsapp/status', { method: 'DELETE', headers: authHeaders });
        setSession({ status: 'NOT_CONNECTED', qr: null, phone: null });
        setChats([]);
        setSelectedChat(null);
        setMessages([]);
    };

    const loadChats = async () => {
        setLoadingChats(true);
        try {
            const res = await fetch('/api/whatsapp/chats', { headers: authHeaders });
            const data = await res.json();
            setChats(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingChats(false);
        }
    };

    const loadMessages = async (chat: Chat) => {
        setSelectedChat(chat);
        setMessages([]);
        setLoadingMsgs(true);
        setParsedReservation(null);
        setSelectMode(false);
        setSelectedMessages(new Set());
        try {
            const res = await fetch(`/api/whatsapp/chats/${chat.id}/messages`, { headers: authHeaders });
            const data = await res.json();
            setMessages(data.messages || []);
            // Update unread
            setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMsgs(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;
        setSending(true);
        try {
            await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ to: selectedChat.phone, message: newMessage }),
            });
            setNewMessage('');
            await loadMessages(selectedChat);
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    const toggleMessageSelect = (msgId: string) => {
        setSelectedMessages(prev => {
            const next = new Set(prev);
            if (next.has(msgId)) next.delete(msgId);
            else next.add(msgId);
            return next;
        });
    };

    const parseSelectedMessages = async (type: 'transfer' | 'tour' = 'transfer') => {
        const selectedMsgs = messages.filter(m => selectedMessages.has(m.id));
        if (selectedMsgs.length === 0) return;

        const text = selectedMsgs
            .map(m => `${m.fromMe ? 'Biz' : (selectedChat?.name || 'Müşteri')}: ${m.body}`)
            .join('\n');

        setParsing(true);
        try {
            const res = await fetch('/api/whatsapp/parse', {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ messageText: text, type }),
            });
            const data = await res.json();
            setParsedReservation({ ...data, type });
        } catch (e) {
            console.error(e);
        } finally {
            setParsing(false);
        }
    };

    const goToCreateReservation = () => {
        if (!parsedReservation) return;
        const params = new URLSearchParams();

        if (parsedReservation.type === 'tour') {
            if (parsedReservation.tourDate) params.set('tourDate', parsedReservation.tourDate);
            if (parsedReservation.tourTime) params.set('tourTime', parsedReservation.tourTime);
            if (parsedReservation.pickupLocation) params.set('pickupLocation', parsedReservation.pickupLocation);
            if (parsedReservation.routeName) params.set('routeName', parsedReservation.routeName);
            if (parsedReservation.price) params.set('price', String(parsedReservation.price));
            if (parsedReservation.currency) params.set('currency', parsedReservation.currency);
            if (parsedReservation.passengerNames?.length) params.set('passengerNames', parsedReservation.passengerNames.join(','));
            if (parsedReservation.notes) params.set('notes', parsedReservation.notes);
            if (selectedChat?.phone) params.set('phoneNumber', selectedChat.phone);

            router.push(`/admin/tour/reservations/new?${params.toString()}`);
        } else {
            if (parsedReservation.date) params.set('date', parsedReservation.date);
            if (parsedReservation.time) params.set('time', parsedReservation.time);
            if (parsedReservation.from) params.set('from', parsedReservation.from);
            if (parsedReservation.to) params.set('to', parsedReservation.to);
            if (parsedReservation.flightCode) params.set('flightCode', parsedReservation.flightCode);
            if (parsedReservation.price) params.set('price', String(parsedReservation.price));
            if (parsedReservation.currency) params.set('currency', parsedReservation.currency);
            if (parsedReservation.phoneNumber || selectedChat?.phone) {
                params.set('phoneNumber', parsedReservation.phoneNumber || selectedChat?.phone || '');
            }
            if (parsedReservation.passengerNames?.length) params.set('passengerNames', parsedReservation.passengerNames.join(','));
            if (parsedReservation.notes) params.set('notes', parsedReservation.notes);

            router.push(`/admin/reservations/new?${params.toString()}`);
        }
    };

    const filteredChats = chats.filter(c =>
        !searchQuery ||
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phone || '').includes(searchQuery) ||
        (c.lastMsg || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ── Render: Not connected ──────────────────────────────────────────────────
    if (session.status === 'NOT_CONNECTED' || session.status === 'DISCONNECTED' || session.status === 'SERVICE_UNAVAILABLE') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Bağla</h1>
                    <p className="text-gray-500 mb-8">Kişisel WhatsApp hesabını CRM'e bağla. Müşteri mesajlarını buradan yönet ve tek tıkla rezervasyon oluştur.</p>
                    <button
                        onClick={startConnection}
                        disabled={connecting}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {connecting ? '⏳ Bağlanıyor...' : '📱 QR Kod ile Bağlan'}
                    </button>
                    {session.status === 'DISCONNECTED' && (
                        <p className="mt-4 text-sm text-red-500">Bağlantı kesildi. Tekrar bağlan.</p>
                    )}
                    {session.status === 'SERVICE_UNAVAILABLE' && (
                        <p className="mt-4 text-sm text-orange-500">⚠️ WhatsApp servisi şu an ulaşılamıyor.</p>
                    )}
                </div>
            </div>
        );
    }

    // ── Render: QR Pending ─────────────────────────────────────────────────────
    if (session.status === 'QR_PENDING') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Kodu Tara</h1>
                    <p className="text-gray-500 mb-6">WhatsApp'ı aç → Bağlı Cihazlar → Cihaz Bağla → QR'ı tara</p>
                    {session.qr ? (
                        <img src={session.qr} alt="QR Code" className="mx-auto w-64 h-64 border-4 border-green-500 rounded-xl" />
                    ) : (
                        <div className="w-64 h-64 mx-auto bg-gray-100 rounded-xl flex items-center justify-center animate-pulse">
                            <span className="text-gray-400">QR yükleniyor...</span>
                        </div>
                    )}
                    <p className="mt-4 text-sm text-gray-400 animate-pulse">⏳ Taranan QR bekleniyor...</p>
                    <button onClick={disconnect} className="mt-4 text-sm text-red-400 hover:text-red-600">İptal</button>
                </div>
            </div>
        );
    }

    // ── Render: Connected — Inbox ──────────────────────────────────────────────
    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <div className="bg-green-600 text-white px-6 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">💬</span>
                    <div>
                        <h1 className="font-bold text-lg">WhatsApp</h1>
                        <span className="text-xs text-green-200">📱 {session.phone}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={loadChats} className="text-sm bg-green-500 hover:bg-green-700 px-3 py-1 rounded-lg transition-colors">
                        🔄 Yenile
                    </button>
                    <button onClick={disconnect} className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition-colors">
                        Bağlantıyı Kes
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* ── Chat List Sidebar ────────────────────────────────────────── */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-3 border-b">
                        <input
                            type="text"
                            placeholder="🔍 Sohbet ara..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingChats && (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
                            </div>
                        )}
                        {filteredChats.length === 0 && !loadingChats && (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                <div className="text-3xl mb-2">📭</div>
                                Henüz mesaj yok
                            </div>
                        )}
                        {filteredChats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => loadMessages(chat)}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedChat?.id === chat.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                                    {(chat.name || chat.phone || '?')[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-sm text-gray-900 truncate">{chat.name || chat.phone}</span>
                                        <span className="text-xs text-gray-400 shrink-0">
                                            {chat.lastMsgAt ? new Date(chat.lastMsgAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 truncate">{chat.lastMsg}</span>
                                        {chat.unread > 0 && (
                                            <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                                                {chat.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Message Area ─────────────────────────────────────────────── */}
                {selectedChat ? (
                    <div className="flex-1 flex flex-col">
                        {/* Chat header */}
                        <div className="bg-white px-5 py-3 border-b border-gray-200 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                    {(selectedChat.name || selectedChat.phone || '?')[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">{selectedChat.name || selectedChat.phone}</div>
                                    <div className="text-xs text-gray-400">{selectedChat.phone}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectMode ? (
                                    <>
                                        <span className="text-xs text-gray-500">{selectedMessages.size} mesaj seçildi</span>
                                        <button
                                            onClick={() => parseSelectedMessages('transfer')}
                                            disabled={selectedMessages.size === 0 || parsing}
                                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {parsing ? '⏳ Analiz ediliyor...' : '🚌 Transfer Rezervasyonu'}
                                        </button>
                                        <button
                                            onClick={() => parseSelectedMessages('tour')}
                                            disabled={selectedMessages.size === 0 || parsing}
                                            className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {parsing ? '...' : '🗺️ Tur Rezervasyonu'}
                                        </button>
                                        <button onClick={() => { setSelectMode(false); setSelectedMessages(new Set()); }} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5">
                                            İptal
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setSelectMode(true)}
                                        className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        📋 Rezervasyon Oluştur
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Parsed reservation preview */}
                        {parsedReservation && (
                            <div className="bg-blue-50 border-b border-blue-200 px-5 py-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-blue-800 mb-2">🤖 AI Analiz Sonucu:</p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-blue-700">
                                            {parsedReservation.type === 'tour' ? (
                                                <>
                                                    {parsedReservation.tourDate && <span>📅 {parsedReservation.tourDate} {parsedReservation.tourTime}</span>}
                                                    {parsedReservation.pickupLocation && <span>📍 {parsedReservation.pickupLocation}</span>}
                                                    {parsedReservation.routeName && <span>🗺️ {parsedReservation.routeName}</span>}
                                                </>
                                            ) : (
                                                <>
                                                    {parsedReservation.date && <span>📅 {parsedReservation.date} {parsedReservation.time}</span>}
                                                    {parsedReservation.from && <span>📍 {parsedReservation.from} → {parsedReservation.to}</span>}
                                                    {parsedReservation.flightCode && <span>✈️ {parsedReservation.flightCode}</span>}
                                                </>
                                            )}
                                            {parsedReservation.passengerCount && <span>👥 {parsedReservation.passengerCount} kişi</span>}
                                            {parsedReservation.passengerNames?.length ? <span>🙋 {parsedReservation.passengerNames.join(', ')}</span> : null}
                                            {parsedReservation.price && <span>💰 {parsedReservation.price} {parsedReservation.currency}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4 shrink-0">
                                        <button
                                            onClick={goToCreateReservation}
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-semibold transition-colors"
                                        >
                                            ✅ Formu Aç
                                        </button>
                                        <button onClick={() => setParsedReservation(null)} className="text-blue-400 hover:text-blue-600 text-xs">✕</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E")', backgroundColor: '#e5ddd5' }}>
                            {loadingMsgs && (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
                                </div>
                            )}
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                                    onClick={() => selectMode && toggleMessageSelect(msg.id)}
                                >
                                    {selectMode && (
                                        <div className={`self-center mr-2 w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${selectedMessages.has(msg.id) ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
                                            {selectedMessages.has(msg.id) && <span className="text-white text-xs">✓</span>}
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-2xl shadow-sm text-sm cursor-pointer
                      ${msg.fromMe
                                                ? 'bg-green-100 text-gray-800 rounded-tr-none'
                                                : 'bg-white text-gray-800 rounded-tl-none'
                                            }
                      ${selectMode && selectedMessages.has(msg.id) ? 'ring-2 ring-blue-400' : ''}`}
                                    >
                                        <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                                        <p className="text-xs text-gray-400 mt-1 text-right">
                                            {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            {msg.fromMe && ' ✓✓'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message input */}
                        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                placeholder="Mesaj yaz..."
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim() || sending}
                                className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                                {sending ? '⏳' : '➤'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-400">
                            <div className="text-5xl mb-3">💬</div>
                            <p className="text-lg font-medium">Bir sohbet seç</p>
                            <p className="text-sm mt-1">Sol taraftan bir sohbet seçerek mesajları görüntüle</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
