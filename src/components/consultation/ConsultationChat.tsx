import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import chatService from '../../services/chatService';

type ChatMessage = {
  id: string;
  sender: 'patient' | 'doctor';
  text: string;
  timestamp: string;
};

interface ConsultationChatProps {
  patientName: string;
  doctorName: string;
  doctorId: string;
  onMinimize?: () => void;
  className?: string;
}

export function ConsultationChat({
  patientName,
  doctorName,
  doctorId,
  onMinimize,
  className,
}: ConsultationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const normalizeMessages = (items: Array<any> = []): ChatMessage[] =>
    items.map((item: any, index: number) => ({
      id: item._id || `${item.timestamp || Date.now()}-${index}`,
      sender: item.sender === 'patient' ? 'patient' : 'doctor',
      text: item.content || item.text || '',
      timestamp: item.timestamp || new Date().toISOString(),
    }));

  const loadChat = useCallback(
    async (silent = false) => {
      if (!doctorId) {
        setLoading(false);
        setChatError('Doctor details are missing for this chat session.');
        return;
      }

      if (!silent) {
        setLoading(true);
      }

      try {
        const response = await chatService.getChatWithDoctor(doctorId);
        if (!response.success) {
          setChatError(response.message || 'Unable to load chat right now.');
          return;
        }

        setMessages(normalizeMessages(response.data?.messages || []));
        setChatError(null);
        await chatService.markAsRead(doctorId);
      } catch (error: any) {
        if (!silent) {
          toast.error(error?.response?.data?.message || 'Unable to load consultation chat');
        }
        setChatError(error?.response?.data?.message || 'Chat will be available after appointment confirmation.');
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [doctorId]
  );

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadChat(true);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [loadChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || sending) return;

    try {
      setSending(true);
      const response = await chatService.sendMessage(doctorId, text);
      if (!response.success) {
        toast.error(response.message || 'Failed to send message');
        return;
      }

      setInputValue('');
      await loadChat(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      layoutId="consultation-chat-panel"
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg ${className || ''}`}
    >
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h3 className="truncate text-base font-semibold">Chat with Dr. {doctorName}</h3>
          </div>
          <p className="mt-0.5 truncate text-xs text-blue-100">Consultation notes for {patientName}</p>
        </div>
        {onMinimize ? (
          <button
            type="button"
            onClick={onMinimize}
            className="rounded-md p-1 transition-colors hover:bg-blue-800"
            title="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading consultation chat...
          </div>
        ) : chatError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {chatError}
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500">
            Start the conversation. Messages here are shared with your doctor in real time.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.25) }}
                className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    message.sender === 'patient'
                      ? 'rounded-br-sm bg-blue-600 text-white'
                      : 'rounded-bl-sm border border-slate-200 bg-white text-slate-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  <span
                    className={`mt-1 block text-[11px] ${
                      message.sender === 'patient' ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex items-end gap-2 border-t border-slate-200 bg-white p-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="min-h-11 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
          disabled={sending || loading}
        />
        <button
          type="submit"
          disabled={sending || loading || !inputValue.trim()}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          title="Send message"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </motion.div>
  );
}
