// app/components/WhatsAppCloudInbox.tsx
import { useEffect, useState } from 'react';
import ChatList from '@/components/WhatsAppCloudChatList';
import ChatWindow from '@/components/WhatsAppCloudChatWindow';
import { WhatsAppChat } from '@/types/whatsapp';
import { WhatsAppMessage } from '@/types/whatsapp';

/**
 * Top‑level component that glues the chat list and the active chat view.
 * It lives under /admin/whatsapp-cloud and is rendered when the META_CLOUD tab is active.
 */
export default function WhatsAppCloudInbox() {
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load chat list once
  useEffect(() => {
    async function fetchChats() {
      setLoadingChats(true);
      const res = await fetch('/api/whatsapp/cloud/chats');
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
      setLoadingChats(false);
    }
    fetchChats();
  }, []);

  // Load messages when a chat is selected
  useEffect(() => {
    if (!selectedChatId) return;
    async function fetchMessages() {
      setLoadingMessages(true);
      const res = await fetch(`/api/whatsapp/cloud/chats/${selectedChatId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
      setLoadingMessages(false);
    }
    fetchMessages();
  }, [selectedChatId]);

  // Refresh chat list after sending a reply (unread count changes)
  async function refreshChats() {
    const res = await fetch('/api/whatsapp/cloud/chats');
    if (res.ok) setChats(await res.json());
  }

  // Handle sending a manual reply from the agent UI
  async function handleSendReply(text: string) {
    if (!selectedChatId) return;
    const payload = { body: text };
    const res = await fetch(`/api/whatsapp/cloud/chats/${selectedChatId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      // re‑fetch messages to show the new outbound line
      const newMsgs = await res.json();
      setMessages(newMsgs);
      await refreshChats();
    }
  };

  // Pause / unpause bot for this chat
  async function toggleBotPause(pause: boolean) {
    if (!selectedChatId) return;
    await fetch(`/api/whatsapp/cloud/chats/${selectedChatId}/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pause }),
    });
    // Update local chat state
    setChats(prev =>
      prev.map(c => (c.id === selectedChatId ? { ...c, isBotPaused: pause } : c))
    );
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-slate-950">
      {/* Left‑hand chat list */}
      <ChatList
        chats={chats}
        loading={loadingChats}
        selectedChatId={selectedChatId}
        onSelect={setSelectedChatId}
      />

      {/* Right‑hand message window */}
      <ChatWindow
        chatId={selectedChatId}
        messages={messages}
        loading={loadingMessages}
        onSend={handleSendReply}
        onTogglePause={toggleBotPause}
        chats={chats}
      />
    </div>
  );
}
