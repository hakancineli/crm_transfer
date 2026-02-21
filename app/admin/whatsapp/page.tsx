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
    archived: boolean;
    pinned: boolean;
    avatarUrl?: string | null;
}

interface WAMessage {
    id: string;
    fromMe: boolean;
    body: string;
    timestamp: string;
    msgType?: string;
    mediaUrl?: string | null;
    caption?: string | null;
    senderName?: string | null;
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
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [showArchived, setShowArchived] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    // Always read token fresh to avoid stale closure capturing null token on first render
    const getAuthHeaders = (): Record<string, string> => {
        const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (t) headers['Authorization'] = `Bearer ${t}`;
        return headers;
    };

    // Poll session status
    const pollStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/whatsapp/status', { headers: getAuthHeaders() });
            const data = await res.json();

            if (data.error || !data.status) {
                setSession(prev => ({ ...prev, status: 'SERVICE_UNAVAILABLE' }));
                return;
            }

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
        console.log('🚀 Sending WA connect request...');
        alert('Bağlantı başlatılıyor, lütfen bekleyin...');
        setConnecting(true);
        try {
            console.log('🚀 Primary connect attempt (POST)...');
            let res = await fetch('/api/whatsapp/status', { method: 'POST', headers: getAuthHeaders() });

            if (!res.ok) {
                console.warn('⚠️ Primary POST failed, trying secondary connect (GET)...');
                res = await fetch('/api/whatsapp/status?connect=true', { headers: getAuthHeaders() });
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                console.error('Connect error:', data);
                alert(`Hata: ${data.error || 'Bağlantı başlatılamadı'}`);
                return;
            }
            // Start polling for QR/status
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = setInterval(pollStatus, 2000);
            setTimeout(pollStatus, 500); // Immediate poll
        } catch (e) {
            console.error(e);
            alert('WhatsApp servisi ile iletişim kurulamadı. Lütfen internet bağlantınızı ve servis durumunu kontrol edin.');
        } finally {
            setConnecting(false);
        }
    };

    const disconnect = async () => {
        await fetch('/api/whatsapp/status', { method: 'DELETE', headers: getAuthHeaders() });
        setSession({ status: 'NOT_CONNECTED', qr: null, phone: null });
        if (pollRef.current) clearInterval(pollRef.current);
    };

    const loadChats = useCallback(async (silent = false) => {
        if (!silent) setLoadingChats(true);
        try {
            const res = await fetch('/api/whatsapp/chats', { headers: getAuthHeaders() });
            const data = await res.json();
            const formattedChats = (Array.isArray(data) ? data : []).map((c: any) => ({
                ...c,
                archived: !!c.archived,
                pinned: !!c.pinned
            }));
            setChats(formattedChats);
        } catch (e) {
            console.error(e);
        } finally {
            if (!silent) setLoadingChats(false);
        }
    }, []);

    const loadMessages = useCallback(async (chat: Chat, silent = false) => {
        if (!silent) {
            setLoadingMsgs(true);
            setMessages([]);
            setParsedReservation(null);
            setSelectMode(false);
            setSelectedMessages(new Set());
        }
        setSelectedChat(chat);
        try {
            const res = await fetch(`/api/whatsapp/chats/${chat.id}/messages`, { headers: getAuthHeaders() });
            const data = await res.json();
            const newMsgs = data.messages || [];

            setMessages(prev => {
                // Return same reference if nothing changed to prevent unnecessary re-renders
                if (JSON.stringify(prev) === JSON.stringify(newMsgs)) return prev;
                return newMsgs;
            });

            // Update unread in chat list
            setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
        } catch (e) {
            console.error(e);
        } finally {
            if (!silent) setLoadingMsgs(false);
        }
    }, []);

    // Background polling for new messages/chats
    useEffect(() => {
        if (session.status !== 'CONNECTED') return;

        const chatInterval = setInterval(() => loadChats(true), 10000); // Poll chats every 10s

        let msgInterval: NodeJS.Timeout | null = null;
        if (selectedChat) {
            msgInterval = setInterval(() => loadMessages(selectedChat, true), 3000); // Poll active chat every 3s
        }

        return () => {
            clearInterval(chatInterval);
            if (msgInterval) clearInterval(msgInterval);
        };
    }, [session.status, selectedChat?.id, loadChats, loadMessages]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        const text = newMessage;
        setNewMessage('');

        // Optimistic UI update
        const tempId = 'temp-' + Date.now();
        setMessages(prev => [...prev, {
            id: tempId,
            fromMe: true,
            body: text,
            timestamp: new Date().toISOString()
        }]);

        setSending(true);
        try {
            await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ to: selectedChat.chatId, message: text }),
            });
            await loadMessages(selectedChat, true);
        } catch (e) {
            console.error(e);
            alert('Mesaj gönderilemedi.');
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } finally {
            setSending(false);
        }
    };

    const uploadFile = async (file: File) => {
        if (!selectedChat) return;

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Dosya çok büyük (Maksimum 10MB)');
            return;
        }

        setSending(true);
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = (reader.result as string).split(',')[1];
            try {
                // Optimistic UI for media
                const tempId = 'temp-' + Date.now();
                const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
                const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|ogg|webm|m4a|mp4)$/i.test(file.name) || file.name.startsWith('voice-message');
                const msgType = isImage ? 'image' : (isAudio ? 'audio' : 'document');

                setMessages(prev => [...prev, {
                    id: tempId,
                    fromMe: true,
                    body: msgType === 'audio' ? '[Sesli Mesaj]' : `[Dosya: ${file.name}]`,
                    timestamp: new Date().toISOString(),
                    msgType: msgType,
                    caption: file.name
                }]);

                const res = await fetch('/api/whatsapp/send-media', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        to: selectedChat.chatId,
                        file: base64,
                        fileName: file.name,
                        caption: ''
                    }),
                });

                if (res.ok) {
                    await loadMessages(selectedChat, true);
                } else {
                    alert('Dosya gönderilemedi.');
                }
            } catch (e) {
                console.error(e);
                alert('Dosya gönderim hatası.');
            } finally {
                setSending(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const togglePin = async (chat: Chat) => {
        try {
            // Optimistic UI
            setChats(prev => prev.map(c =>
                c.id === chat.id ? { ...c, pinned: !c.pinned } : c
            ));

            const res = await fetch(`/api/whatsapp/chats/${chat.chatId}/pin`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ pinned: !chat.pinned })
            });

            if (!res.ok) {
                // Rollback
                setChats(prev => prev.map(c =>
                    c.id === chat.id ? { ...c, pinned: chat.pinned } : c
                ));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const toggleArchive = async (chat: Chat) => {
        try {
            // Optimistic UI
            setChats(prev => prev.map(c =>
                c.id === chat.id ? { ...c, archived: !c.archived } : c
            ));

            const res = await fetch(`/api/whatsapp/chats/${chat.chatId}/archive`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ archived: !chat.archived })
            });

            if (!res.ok) {
                // Rollback
                setChats(prev => prev.map(c =>
                    c.id === chat.id ? { ...c, archived: chat.archived } : c
                ));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Check supported formats
            const mimeType = MediaRecorder.isTypeSupported('audio/ogg; codecs=opus')
                ? 'audio/ogg; codecs=opus'
                : (MediaRecorder.isTypeSupported('audio/webm; codecs=opus')
                    ? 'audio/webm; codecs=opus'
                    : 'audio/mp4'); // Fallback to mp4 if webm/ogg not supported

            console.log(`🎤 Starting recording with mimeType: ${mimeType}`);
            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                console.log(`⏹️ Recording stopped. Total chunks: ${audioChunksRef.current.length}, Size: ${audioBlob.size} bytes`);

                if (audioBlob.size < 100) {
                    console.warn('⚠️ Audio blob is too small, likely empty.');
                    return;
                }

                const extension = mimeType.includes('ogg') ? 'ogg' : (mimeType.includes('webm') ? 'webm' : 'mp4');
                const file = new File([audioBlob], `voice-message-${Date.now()}.${extension}`, { type: mimeType });
                uploadFile(file);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start(1000); // Collect data every second
            setIsRecording(true);
            setRecordingDuration(0);
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Microphone access error:', err);
            alert('Mikrofon erişimi engellendi veya bulunamadı.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                headers: getAuthHeaders(),
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

            router.push(`/admin/new-reservation?${params.toString()}`);
        }
    };

    const filteredChats = chats
        .filter(chat => showArchived ? chat.archived : !chat.archived)
        .filter(chat => {
            if (!searchQuery) return true;
            const searchLower = searchQuery.toLowerCase();
            return (
                chat.name?.toLowerCase().includes(searchLower) ||
                chat.phone?.toLowerCase().includes(searchLower) ||
                chat.lastMsg?.toLowerCase().includes(searchLower)
            );
        })
        .sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;

            const timeA = a.lastMsgAt ? new Date(a.lastMsgAt).getTime() : 0;
            const timeB = b.lastMsgAt ? new Date(b.lastMsgAt).getTime() : 0;
            return timeB - timeA;
        });

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
                    <button onClick={() => loadChats()} className="text-sm bg-green-500 hover:bg-green-700 px-3 py-1 rounded-lg transition-colors">
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
                    {/* Search and Toggle */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Sohbet ara..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        <div className="flex items-center justify-between mt-2 px-1">
                            <button
                                onClick={() => setShowArchived(!showArchived)}
                                className={`text-xs font-medium px-2 py-1 rounded transition-colors ${showArchived ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                {showArchived ? '← Aktif Sohbetler' : '📦 Arşivlenmişler'}
                            </button>
                            {showArchived && <span className="text-[10px] text-gray-400">Arşiv modundasınız</span>}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Archived Header (like mobile) */}
                        {!showArchived && chats.some(c => c.archived) && (
                            <div
                                onClick={() => setShowArchived(true)}
                                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 group transition-colors"
                            >
                                <div className="text-gray-400">🗳️</div>
                                <div className="flex-1 font-medium text-sm text-gray-700">Arşivlenmiş</div>
                                <div className="text-xs text-green-600 font-semibold">{chats.filter(c => c.archived).length}</div>
                            </div>
                        )}

                        {loadingChats && (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
                            </div>
                        )}
                        {filteredChats.length === 0 && !loadingChats && (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                <div className="text-3xl mb-2">📭</div>
                                {showArchived ? 'Arşivlenmiş sohbet yok' : 'Henüz mesaj yok'}
                            </div>
                        )}
                        {filteredChats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => loadMessages(chat)}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors group ${selectedChat?.id === chat.id ? 'bg-gray-100' : ''}`}
                            >
                                {/* Avatar */}
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-medium flex-shrink-0 overflow-hidden bg-gray-200 shadow-sm
                      ${selectedChat?.id === chat.id ? '' : ''}`}>
                                    {chat.avatarUrl ? (
                                        <img src={chat.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="bg-blue-400 w-full h-full flex items-center justify-center">
                                            {chat.chatId.includes('@g.us') ? '👥' : (chat.name && isNaN(parseInt(chat.name[0])) ? chat.name[0].toUpperCase() : '👤')}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-sm text-gray-900 truncate">
                                            {chat.name || (chat.phone ? `+${chat.phone}` : 'Bilinmeyen')}
                                        </span>
                                        <div className={`text-[11px] ${chat.unread > 0 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                                            {chat.lastMsgAt ? new Date(chat.lastMsgAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center gap-2 mt-0.5">
                                        <p className="text-xs text-gray-500 truncate flex-1 leading-tight flex items-center gap-1">
                                            {chat.lastMsg?.includes('[Sesli Mesaj]') && <span className="text-blue-500">🎤</span>}
                                            {chat.lastMsg?.includes('[Görsel]') && <span className="text-gray-400">📷</span>}
                                            {chat.lastMsg || '...'}
                                        </p>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {/* Pin Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    togglePin(chat);
                                                }}
                                                className={`hover:scale-125 transition-all text-sm p-1 rounded-full hover:bg-gray-200 ${chat.pinned ? 'opacity-100 text-blue-500 font-bold' : 'opacity-0 group-hover:opacity-100 text-gray-400'}`}
                                                title={chat.pinned ? 'Baştan Kaldır' : 'Başa Tuttur'}
                                            >
                                                📌
                                            </button>

                                            {/* Archive Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleArchive(chat);
                                                }}
                                                className={`hover:scale-125 transition-all text-sm p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 text-gray-400`}
                                                title={showArchived ? 'Arşivden Çıkar' : 'Arşivle'}
                                            >
                                                {showArchived ? '📥' : '📦'}
                                            </button>

                                            {chat.unread > 0 && (
                                                <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                    {chat.unread}
                                                </span>
                                            )}
                                        </div>
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
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden bg-gray-200">
                                    {selectedChat.avatarUrl ? (
                                        <img src={selectedChat.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="bg-blue-400 w-full h-full flex items-center justify-center">
                                            {selectedChat.chatId.includes('@g.us') ? '👥' : (selectedChat.name && isNaN(parseInt(selectedChat.name[0])) ? selectedChat.name[0].toUpperCase() : '👤')}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 leading-tight truncate max-w-[200px] md:max-w-md">
                                        {selectedChat.name || selectedChat.phone}
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                        {selectedChat.phone ? `+${selectedChat.phone}` : ''}
                                    </div>
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
                                        className={`max-w-xs lg:max-w-md xl:max-w-lg px-2 py-2 rounded-2xl shadow-sm cursor-pointer
                      ${msg.fromMe
                                                ? 'bg-green-100 text-gray-800 rounded-tr-none'
                                                : 'bg-white text-gray-800 rounded-tl-none'
                                            }
                      ${selectMode && selectedMessages.has(msg.id) ? 'ring-2 ring-blue-400' : ''}`}
                                    >
                                        <div className="px-2 pt-1">
                                            {!msg.fromMe && selectedChat?.chatId.includes('@g.us') && msg.senderName && (
                                                <div className="text-[11px] font-bold text-orange-600 mb-0.5">{msg.senderName}</div>
                                            )}
                                            {msg.msgType === 'image' && msg.mediaUrl && (
                                                <div className="mb-2 rounded-lg overflow-hidden border border-gray-100">
                                                    <img
                                                        src={`/api/whatsapp/media${msg.mediaUrl.replace('/media', '')}`}
                                                        alt={msg.caption || 'Görsel'}
                                                        className="w-full h-auto max-h-96 object-contain bg-gray-50"
                                                    />
                                                </div>
                                            )}

                                            {msg.msgType === 'audio' && msg.mediaUrl && (
                                                <div className="mb-2 py-2 px-1 flex items-center gap-3 bg-gray-50 rounded-xl">
                                                    <span className="text-xl">🎤</span>
                                                    <audio controls className="h-8 max-w-[200px]">
                                                        <source src={`/api/whatsapp/media${msg.mediaUrl.replace('/media', '')}`} />
                                                        Tarayıcınız ses çalmayı desteklemiyor.
                                                    </audio>
                                                </div>
                                            )}

                                            {msg.msgType === 'document' && msg.mediaUrl && (
                                                <a
                                                    href={`/api/whatsapp/media${msg.mediaUrl.replace('/media', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mb-2 flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100 group"
                                                >
                                                    <span className="text-2xl group-hover:scale-110 transition-transform">📄</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 truncate">{msg.caption || 'Belge.pdf'}</div>
                                                        <div className="text-xs text-blue-500">Görüntüle / İndir</div>
                                                    </div>
                                                </a>
                                            )}

                                            {msg.body && <p className="whitespace-pre-wrap break-words text-sm">{msg.body}</p>}
                                            {msg.caption && msg.msgType !== 'document' && (
                                                <p className="whitespace-pre-wrap break-words text-sm mt-1 italic text-gray-600">{msg.caption}</p>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1 pr-2 text-right">
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
                            {isRecording ? (
                                <div className="flex-1 flex items-center justify-between bg-red-50 px-4 py-2 rounded-full border border-red-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        <span className="text-red-600 text-sm font-medium">{formatDuration(recordingDuration)}</span>
                                        <span className="text-gray-500 text-xs ml-2">Ses kaydediliyor...</span>
                                    </div>
                                    <button
                                        onClick={stopRecording}
                                        className="text-red-500 font-semibold text-sm hover:underline"
                                    >
                                        Gönder
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        id="fileInput"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) uploadFile(file);
                                        }}
                                        accept="image/*,audio/*,application/pdf"
                                    />
                                    <button
                                        onClick={() => document.getElementById('fileInput')?.click()}
                                        className="text-gray-400 hover:text-green-500 transition-colors"
                                        title="Dosya Ekle"
                                    >
                                        <span className="text-2xl">📎</span>
                                    </button>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                        placeholder="Mesaj yaz..."
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                    />
                                    <button
                                        onClick={startRecording}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        title="Ses Kaydet"
                                    >
                                        <span className="text-2xl">🎙️</span>
                                    </button>
                                    <button
                                        onClick={sendMessage}
                                        disabled={(!newMessage.trim() && !sending) || sending}
                                        className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                                    >
                                        {sending ? '⏳' : '➤'}
                                    </button>
                                </>
                            )}
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


// Build trigger: Sat Feb 21 16:25:32 +03 2026
