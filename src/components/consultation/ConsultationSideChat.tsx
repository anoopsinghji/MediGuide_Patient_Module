import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';

type ChatMessage = {
  from: 'doctor' | 'patient';
  text: string;
  time: string;
};

type ChatThread = {
  _id: string;
  patientName: string;
  patientEmail: string;
  messages: ChatMessage[];
};

interface ConsultationSideChatProps {
  apiBase: string;
  authToken: string;
  patientName: string;
  patientEmail?: string;
  onClose?: () => void;
}

export function ConsultationSideChat({
  apiBase,
  authToken,
  patientName,
  patientEmail,
  onClose,
}: ConsultationSideChatProps) {
  const [threadId, setThreadId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const requestHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    }),
    [authToken]
  );

  const findPatientThread = useCallback(
    (threads: ChatThread[]) => {
      const normalizedTargetEmail = (patientEmail || '').trim().toLowerCase();
      if (normalizedTargetEmail) {
        const byEmail = threads.find(
          (thread) => (thread.patientEmail || '').trim().toLowerCase() === normalizedTargetEmail
        );
        if (byEmail) return byEmail;
      }

      return (
        threads.find(
          (thread) => (thread.patientName || '').trim().toLowerCase() === patientName.trim().toLowerCase()
        ) || null
      );
    },
    [patientEmail, patientName]
  );

  const loadThread = useCallback(
    async (silent = false) => {
      if (!authToken) {
        if (!silent) setLoading(false);
        setNotice('Authentication expired. Please refresh this page.');
        return;
      }

      if (!silent) {
        setLoading(true);
      }

      try {
        const response = await fetch(`${apiBase}/chats`, { headers: requestHeaders });
        const payload = (await response.json()) as {
          success?: boolean;
          chats?: ChatThread[];
          message?: string;
        };

        if (!response.ok || !payload.success) {
          setNotice(payload.message || 'Unable to load chat threads.');
          return;
        }

        const threads = payload.chats || [];
        const targetThread = findPatientThread(threads);

        if (!targetThread) {
          setThreadId('');
          setMessages([]);
          setNotice('Chat thread will appear once the patient sends the first consultation message.');
          return;
        }

        setThreadId(targetThread._id);
        setMessages(targetThread.messages || []);
        setNotice('');
      } catch (error) {
        if (!silent) {
          console.error('Failed to load consultation chat thread:', error);
        }
        setNotice('Unable to connect to consultation chat right now.');
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [apiBase, authToken, findPatientThread, requestHeaders]
  );

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadThread(true);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [loadThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!threadId || !text || sending) {
      return;
    }

    try {
      setSending(true);
      const response = await fetch(`${apiBase}/chats/${threadId}/message`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({ text }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        setNotice(payload.message || 'Failed to send message.');
        return;
      }

      setInput('');
      setNotice('');
      await loadThread(true);
    } catch (error) {
      console.error('Failed to send consultation chat message:', error);
      setNotice('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/95 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-cyan-200">
            <MessageCircle className="h-4 w-4" />
            <h3 className="truncate text-sm font-semibold">Consultation Chat</h3>
          </div>
          <p className="truncate text-xs text-slate-400">Patient: {patientName}</p>
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-300 transition hover:bg-slate-800"
            title="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-950/80 p-3">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-300">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading chat...
          </div>
        ) : notice ? (
          <div className="rounded-xl border border-amber-600/30 bg-amber-500/10 p-3 text-xs text-amber-100">
            {notice}
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-400">
            No messages yet in this consultation thread.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={`${message.time}-${index}`}
                className={`flex ${message.from === 'doctor' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    message.from === 'doctor'
                      ? 'rounded-br-sm bg-cyan-600 text-white'
                      : 'rounded-bl-sm border border-slate-700 bg-slate-800 text-slate-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  <span
                    className={`mt-1 block text-[11px] ${
                      message.from === 'doctor' ? 'text-cyan-100' : 'text-slate-400'
                    }`}
                  >
                    {new Date(message.time).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-700 bg-slate-900 p-3">
        <div className="flex items-end gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="min-h-11 flex-1 rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            disabled={sending || loading || !threadId}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || loading || !threadId || !input.trim()}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-600 px-3 text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-600"
            title="Send message"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
