import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '@/lib/store';
import { X, Send, Bot, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AssistantChat() {
  const { chatHistory, toggleChat, processCommand, suggestions } = useAppState();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try { await processCommand(input); } finally { setInput(''); setSending(false); }
  };

  const handleAction = async (action: string) => {
    if (action.startsWith('command:')) {
      setSending(true);
      try { await processCommand(action.replace('command:', '')); } finally { setSending(false); }
    } else {
      setSending(true);
      try { await processCommand(action); } finally { setSending(false); }
    }
  };

  return (
    <div className="w-80 md:w-[360px] border-l border-white/5 bg-background/95 backdrop-blur-xl flex flex-col z-30 fixed right-0 top-0 bottom-0 animate-in slide-in-from-right duration-200">
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center border border-primary/20">
            <Bot className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm">Assistant</h3>
            <p className="text-[10px] text-muted-foreground leading-none">Adaptive workspace AI</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleChat} className="h-7 w-7 rounded-full" data-testid="button-close-chat">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="px-3 py-2 border-b border-white/5 bg-primary/[0.03]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Suggestions</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.slice(0, 3).map((s: any, i: number) => (
              <button key={i} onClick={() => handleAction(s.action)} className="text-[11px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md border border-white/5 transition-colors text-foreground/80" data-testid={`suggestion-${i}`}>
                {s.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] rounded-2xl p-3 text-[13px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                : 'bg-muted/30 border border-white/5 rounded-tl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {msg.actions.map(action => (
                    <button key={action} onClick={() => handleAction(action)} className="text-[11px] bg-primary/15 hover:bg-primary/25 text-primary px-2 py-1 rounded-md border border-primary/15 transition-colors flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" />{action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start"><div className="bg-muted/30 rounded-2xl rounded-tl-sm p-3 border border-white/5"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div></div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-white/5">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything..." className="w-full bg-muted/20 border border-white/5 rounded-xl py-2.5 pl-3.5 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all" data-testid="input-chat" />
          <Button type="submit" size="icon" variant="ghost" disabled={sending} className={`absolute right-1 w-7 h-7 rounded-lg ${input.trim() ? 'text-primary' : 'text-muted-foreground'}`} data-testid="button-send-chat">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}