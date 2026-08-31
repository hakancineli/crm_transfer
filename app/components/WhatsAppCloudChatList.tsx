import React, { useState, useMemo } from 'react';
import { WhatsAppChat } from '@prisma/client';
import { SearchAndFilter } from '@/components/ui/SearchAndFilter';

interface WhatsAppCloudChatListProps {
  chats: WhatsAppChat[];
  loading: boolean;
  selectedChatId?: string;
  onSelect: (id: string) => void;
}

/**
 * Chat list component for the WhatsApp Cloud inbox.
 * Includes avatar, name/phone, last message preview, timestamp, unread badge,
 * search functionality and responsive layout.
 */
export function WhatsAppCloudChatList({ chats, loading, selectedChatId, onSelect }: WhatsAppCloudChatListProps) {
  const [search, setSearch] = useState('');

  const filteredChats = useMemo(() => {
    if (!search) return chats;
    const q = search.toLowerCase();
    return chats.filter(c => {
      const name = c.name ?? '';
      const phone = c.phone ?? '';
      const last = c.lastMsg ?? '';
      return (
        name.toLowerCase().includes(q) ||
        phone.toLowerCase().includes(q) ||
        last.toLowerCase().includes(q)
      );
    });
  }, [search, chats]);

  const formatTime = (date?: Date | null) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderAvatar = (chat: WhatsAppChat) => {
    if (chat.avatarUrl) {
      return <img src={chat.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />;
    }
    const initials = (chat.name ?? chat.phone ?? '+?')
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200">
        {initials}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full md:w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
      {/* Search bar */}
      <div className="p-2">
        <SearchAndFilter
          onSearch={setSearch}
          onFilter={() => {}}
          pageSizeControl={null}
        />
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredChats.map(chat => (
              <li
                key={chat.id}
                className={`cursor-pointer flex items-center space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${selectedChatId === chat.id ? 'bg-gray-200 dark:bg-slate-700' : ''}`}
                onClick={() => onSelect(chat.id)}
              >
                {renderAvatar(chat)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {chat.name ?? chat.phone}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {chat.lastMsg?.slice(0, 30)}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1 whitespace-nowrap">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{formatTime(chat.lastMsgAt)}</span>
                  {chat.unread > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white dark:bg-red-600 dark:text-white">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default WhatsAppCloudChatList;
