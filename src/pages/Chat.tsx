import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTitle } from '../hooks';
import { chatService } from '../services';
import { MessageCircleMore } from 'lucide-react';

type ChatSummary = {
  _id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
};

type ChatMessage = {
  _id?: string;
  sender: 'patient' | 'doctor';
  content: string;
  timestamp: string;
  read?: boolean;
};

type ActiveChat = ChatSummary & { messages: ChatMessage[] };

export default function Chat() {
  useTitle('Patient Chat');
  const [searchParams] = useSearchParams();
  const initialDoctorId = searchParams.get('doctorId') || '';

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeDoctorId, setActiveDoctorId] = useState(initialDoctorId);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  const loadChats = async () => {
    try {
      const response = await chatService.getChats();
      if (response.success) {
        setChats((response.data as unknown as ChatSummary[]) || []);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load chats');
    }
  };

  const openChat = async (doctorId: string) => {
    if (!doctorId) return;

    try {
      setActiveDoctorId(doctorId);
      const response = await chatService.getChatWithDoctor(doctorId);
      if (!response.success) {
        toast.error(response.message || 'Unable to open chat');
        return;
      }

      setActiveChat(response.data as ActiveChat);
      await chatService.markAsRead(doctorId);
      await loadChats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to open chat');
    }
  };

  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      await loadChats();
      if (initialDoctorId) {
        await openChat(initialDoctorId);
      }
      setLoading(false);
    };

    boot();
  }, []);

  useEffect(() => {
    if (!activeDoctorId) return;

    const timer = window.setInterval(() => {
      openChat(activeDoctorId);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [activeDoctorId]);

  const sortedChats = useMemo(
    () => [...chats].sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()),
    [chats]
  );

  const handleSend = async () => {
    const text = message.trim();
    if (!text || !activeDoctorId) return;

    try {
      setSending(true);
      const response = await chatService.sendMessage(activeDoctorId, text);
      if (!response.success) {
        toast.error(response.message || 'Failed to send message');
        return;
      }

      setMessage('');
      await openChat(activeDoctorId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <MessageCircleMore className="w-14 h-14 text-primary-600 mx-auto mb-3" strokeWidth={2.2} />
          <p className="text-gray-700">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageCircleMore className="w-8 h-8 text-primary-600" strokeWidth={2.2} />
          Patient Chat
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 lg:col-span-1 max-h-[70vh] overflow-y-auto">
            {sortedChats.length === 0 ? (
              <p className="text-sm text-gray-600 p-3">No chats yet. Chat becomes available after your appointment is confirmed.</p>
            ) : (
              sortedChats.map((chat) => (
                <button
                  key={chat._id}
                  onClick={() => openChat(chat.doctorId)}
                  className={`w-full text-left p-3 rounded-xl mb-2 border ${activeDoctorId === chat.doctorId ? 'border-primary-400 bg-primary-50' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900">{chat.doctorName}</p>
                    {(chat.unreadCount || 0) > 0 ? <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">{chat.unreadCount}</span> : null}
                  </div>
                  <p className="text-xs text-gray-500">{chat.specialty}</p>
                  <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage || 'No messages yet'}</p>
                </button>
              ))
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 lg:col-span-2 flex flex-col h-[70vh]">
            {!activeChat ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat to start messaging</div>
            ) : (
              <>
                <div className="border-b border-gray-100 pb-3 mb-3">
                  <h2 className="text-xl font-bold text-gray-900">{activeChat.doctorName}</h2>
                  <p className="text-sm text-gray-500">{activeChat.specialty}</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                  {(activeChat.messages || []).length === 0 ? (
                    <p className="text-sm text-gray-500">No messages yet.</p>
                  ) : (
                    activeChat.messages.map((m, idx) => (
                      <div
                        key={m._id || idx}
                        className={`max-w-[80%] px-3 py-2 rounded-xl ${m.sender === 'patient' ? 'ml-auto bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'}`}
                      >
                        <p className="text-sm">{m.content}</p>
                        <p className={`text-[10px] mt-1 ${m.sender === 'patient' ? 'text-primary-100' : 'text-gray-500'}`}>
                          {new Date(m.timestamp).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}