import { useEffect, useRef, useState } from 'react';
import { Send, AlertTriangle, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { API_BASE_URL } from '@/lib/apiConfig';
import { detectContactInfo } from '@/lib/contactFilter';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  is_read: boolean;
}

interface MessageThreadProps {
  jobId: string;
  housegirlId: string;
  housegirlName: string;
  myId: string;
}

export const MessageThread = ({ jobId, housegirlId, housegirlName, myId }: MessageThreadProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const contactCheck = detectContactInfo(input);

  const authHeaders = async () => {
    const token = await FirebaseAuthService.getIdToken().catch(() => null);
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchThread = async () => {
    try {
      const headers = await authHeaders();
      const res = await fetch(
        `${API_BASE_URL}/api/messages/thread/${housegirlId}/${jobId}`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // silent — thread just stays empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();
    const interval = setInterval(fetchThread, 10000); // poll every 10 s
    return () => clearInterval(interval);
  }, [jobId, housegirlId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    if (contactCheck.flagged) {
      toast({
        title: 'Message blocked',
        description: `Your message contains a ${contactCheck.reason}. Contact sharing is not allowed through the platform.`,
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ receiver_id: housegirlId, job_id: jobId, content: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Could not send', description: data.error || 'Please try again.', variant: 'destructive' });
        return;
      }
      setInput('');
      setMessages(prev => [...prev, data.message]);
    } catch {
      toast({ title: 'Network error', description: 'Please check your connection.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-[400px] border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-gray-50">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs bg-[#111] text-white">
            {housegirlName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-gray-900">{housegirlName}</p>
          <p className="text-xs text-gray-400">Messages are monitored — no contact sharing allowed</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-2">
            <MessageCircle className="w-8 h-8 text-gray-200" />
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === myId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                    isMe
                      ? 'bg-[#111] text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                    {fmt(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Contact warning */}
      {contactCheck.flagged && input.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-t border-red-100">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600">
            Contact info detected ({contactCheck.reason}). Remove it to send.
          </p>
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 px-3 py-3 border-t bg-gray-50">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          className={`flex-1 resize-none text-sm min-h-[40px] max-h-[100px] ${
            contactCheck.flagged && input.length > 0 ? 'border-red-400 focus-visible:ring-red-300' : ''
          }`}
          rows={1}
          disabled={sending}
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={sending || !input.trim() || contactCheck.flagged}
          className="bg-[#111] hover:bg-[#333] text-white rounded-lg px-3 h-10 flex-shrink-0"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};
