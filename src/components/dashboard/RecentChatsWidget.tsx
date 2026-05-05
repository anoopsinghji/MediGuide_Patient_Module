import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface Chat {
  _id: string;
  patientName: string;
  patientEmail: string;
  messages: { from: 'doctor' | 'patient'; text: string; time: string }[];
  lastMessage: string;
}

interface RecentChatsWidgetProps {
  recentChats: Chat[];
  onChatSelect?: (chatId: string) => void;
  onViewAll?: () => void;
}

export function RecentChatsWidget({
  recentChats,
  onChatSelect,
  onViewAll,
}: RecentChatsWidgetProps) {
  const getUnreadCount = () => {
    return recentChats.filter(
      (c) => c.messages[c.messages.length - 1]?.from === 'patient'
    ).length;
  };

  if (recentChats.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="h-full rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Recent Chats</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No messages yet</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      <div className="flex items-center gap-2 border-b border-slate-200 p-5">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h2 className="font-semibold text-gray-900">Recent Chats</h2>
        {getUnreadCount() > 0 && (
          <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {getUnreadCount()} unread
          </span>
        )}
      </div>

      <div className="max-h-96 divide-y divide-slate-200 overflow-y-auto">
        {recentChats.slice(0, 5).map((chat, index) => {
          const lastMsg = chat.messages[chat.messages.length - 1];
          const isUnread = lastMsg?.from === 'patient';

          return (
            <motion.button
              key={chat._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + index * 0.05 }}
              onClick={() => onChatSelect?.(chat._id)}
                className={`w-full p-4 text-left transition-colors hover:bg-slate-50 ${
                isUnread ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {chat.patientName.charAt(0)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 truncate">
                      {chat.patientName}
                    </p>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {recentChats.length > 5 && (
        <div className="border-t border-slate-200 p-4 text-center">
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all messages →
          </button>
        </div>
      )}
    </motion.div>
  );
}
