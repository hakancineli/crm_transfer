import React, { useEffect, useRef, useState } from 'react';
import { WhatsAppChat, WhatsAppMessage } from '@prisma/client';
import { SearchAndFilter } from '@/components/ui/SearchAndFilter';

interface WhatsAppCloudChatWindowProps {
  chatId?: string;
  messages: WhatsAppMessage[];
  loading: boolean;
  onSend: (text: string) => Promise<void>;
  onTogglePause: (pause: boolean) => Promise<void>;
  chats: any[]; // list of chats to retrieve name/phone
}

/**
 * Chat window for a selected WhatsApp Cloud conversation.
 * Shows header with contact info and pause/resume button,
 * scrollable message list with bubbles, and an input area.
 */
export function WhatsAppCloudChatWindow({ chatId, messages, loading, onSend, onTogglePause, chats }: WhatsAppCloudChatWindowProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Find selected chat details
  const selectedChat = chats.find(c => c.id === chatId) as WhatsAppChat | undefined;

  useEffect(() => {
    // Auto‑scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // Update pause state from chat data
    if (selectedChat) {
      setIsPaused(selectedChat.isBotPaused ?? false);
    }
  }, [messages, selectedChat]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    await onSend(input.trim());
    setInput('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sending) handleSend();
    }
  };

  const togglePause = async () => {
    const newState = !isPaused;
    setIsPaused(newState);
    await onTogglePause(newState);
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        sohbet seçiniz
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full flex-1">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {selectedChat?.name ?? selectedChat?.phone ?? 'Sohbet'}
          </span>
        </div>
        <button
          onClick={togglePause}
          className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {isPaused ? 'Botu Devam Ettir' : 'Botu Durdur'}
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-800">
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-lg p-2 text-sm ${msg.fromMe ? 'bg-[#16A34A] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}
              >
                {msg.body}
                {msg.mediaUrl && (
                  <img src={msg.mediaUrl} alt="media" className="mt-2 max-w-full h-auto rounded" />
                )}
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900">
        <textarea
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mesajınızı yazın..."
          className="w-full resize-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 p-2 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="mt-2 w-full py-2 bg-[#16A34A] text-white rounded-md hover:bg-[#15803D] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </div>
    </div>
  );
}

export default WhatsAppCloudChatWindow;
