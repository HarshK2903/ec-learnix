import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles, Bot, User } from 'lucide-react';
import api from '@/lib/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  '📄 How should I structure my resume?',
  '✍️ Give me blog ideas about AI',
  '📝 Tips for writing an abstract',
  '🎨 How to format a report?',
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        message: msg,
        history: messages.slice(-10),
      });
      const assistantMsg: ChatMessage = { role: 'assistant', content: res.data.reply };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I couldn\'t process that. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple markdown-ish rendering for bold and bullet points
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-xs">$1</code>');
      return (
        <p
          key={i}
          className={line.startsWith('- ') || line.startsWith('• ') ? 'pl-3' : ''}
          dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }}
        />
      );
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-shadow"
          >
            <MessageCircle className="h-6 w-6" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping bg-violet-500/20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border/40 bg-background shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-card/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-md">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">DocForge AI</h3>
                    <p className="text-[10px] text-muted-foreground">Writing assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20 mb-4">
                      <Bot className="h-8 w-8 text-violet-400" />
                    </div>
                    <h4 className="font-semibold mb-1">Hi! I'm your writing assistant</h4>
                    <p className="text-xs text-muted-foreground mb-6 max-w-[250px]">
                      Ask me about resumes, blogs, journal papers, formatting, or any writing help.
                    </p>
                    <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s.replace(/^[^\s]+ /, ''))}
                          className="text-left text-xs px-3 py-2.5 rounded-lg border border-border/40 bg-card/30 hover:bg-violet-500/10 hover:border-violet-500/30 text-muted-foreground hover:text-foreground transition-all"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 mt-0.5">
                          <Bot className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed space-y-1 ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-br-md'
                            : 'bg-muted/50 border border-border/30 text-foreground rounded-bl-md'
                        }`}
                      >
                        {renderContent(msg.content)}
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 mt-0.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      )}
                    </motion.div>
                  ))
                )}

                {/* Typing indicator */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2.5"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="bg-muted/50 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-border/40 bg-card/30">
                <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-background px-3 py-1.5 focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-500/50 transition-all">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about writing, resumes, blogs..."
                    disabled={loading}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 disabled:opacity-50 py-1.5"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 text-white disabled:opacity-30 hover:opacity-90 transition-opacity shrink-0"
                  >
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
                  Powered by Groq · Llama 3.1
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
