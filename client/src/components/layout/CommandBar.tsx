import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '@/lib/store';
import { useLocation } from 'wouter';
import {
  Search, Car, Users, Calendar, FileText, Wrench, CheckSquare,
  LayoutDashboard, Settings, Bot, Sparkles, ArrowRight
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export default function CommandBar() {
  const { isCommandBarOpen, setCommandBarOpen, processCommand, toggleChat, mode } = useAppState();
  const [query, setQuery] = useState('');
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen(!isCommandBarOpen);
      }
      if (e.key === 'Escape') setCommandBarOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isCommandBarOpen, setCommandBarOpen]);

  useEffect(() => {
    if (isCommandBarOpen) { inputRef.current?.focus(); setQuery(''); }
  }, [isCommandBarOpen]);

  const commands: CommandItem[] = [
    { id: 'dashboard', label: 'Dashboard', description: 'Go to main dashboard', icon: <LayoutDashboard className="h-4 w-4" />, action: () => { setLocation('/'); setCommandBarOpen(false); }, category: 'Navigation' },
    { id: 'fleet', label: 'Fleet', description: 'Manage vehicles', icon: <Car className="h-4 w-4" />, action: () => { setLocation('/fleet'); setCommandBarOpen(false); }, category: 'Navigation' },
    { id: 'bookings', label: 'Bookings', description: 'View reservations', icon: <Calendar className="h-4 w-4" />, action: () => { setLocation('/bookings'); setCommandBarOpen(false); }, category: 'Navigation' },
    { id: 'customers', label: 'Customers', description: 'Customer records', icon: <Users className="h-4 w-4" />, action: () => { setLocation('/customers'); setCommandBarOpen(false); }, category: 'Navigation' },
    { id: 'tasks', label: 'Tasks', description: 'Task management', icon: <CheckSquare className="h-4 w-4" />, action: () => { setLocation('/tasks'); setCommandBarOpen(false); }, category: 'Navigation' },
    { id: 'notes', label: 'Notes', description: 'Quick notes', icon: <FileText className="h-4 w-4" />, action: () => { setLocation('/notes'); setCommandBarOpen(false); }, category: 'Navigation' },
    { id: 'maintenance', label: 'Maintenance', description: 'Service tracking', icon: <Wrench className="h-4 w-4" />, action: () => { setLocation('/maintenance'); setCommandBarOpen(false); }, category: 'Navigation' },
    { id: 'settings', label: 'Settings', description: 'App & model settings', icon: <Settings className="h-4 w-4" />, action: () => { setLocation('/settings'); setCommandBarOpen(false); }, category: 'Navigation' },
    { id: 'assistant', label: 'Open Assistant', description: 'Chat with Nexus AI', icon: <Bot className="h-4 w-4" />, action: () => { toggleChat(); setCommandBarOpen(false); }, category: 'Actions' },
    { id: 'add-fleet', label: 'Add Fleet Module', icon: <Sparkles className="h-4 w-4" />, action: () => { processCommand('add fleet module'); setCommandBarOpen(false); }, category: 'Quick Actions' },
    { id: 'add-tasks', label: 'Add Tasks Module', icon: <Sparkles className="h-4 w-4" />, action: () => { processCommand('add task module'); setCommandBarOpen(false); }, category: 'Quick Actions' },
    { id: 'add-notes', label: 'Add Notes Module', icon: <Sparkles className="h-4 w-4" />, action: () => { processCommand('add notes module'); setCommandBarOpen(false); }, category: 'Quick Actions' },
  ];

  const filtered = query
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.description?.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, c) => {
    (acc[c.category] = acc[c.category] || []).push(c);
    return acc;
  }, {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      processCommand(query);
      toggleChat();
      setCommandBarOpen(false);
    }
  };

  if (!isCommandBarOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setCommandBarOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl mx-4 glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()} data-testid="command-bar">
        <form onSubmit={handleSubmit} className="flex items-center px-4 border-b border-white/10">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands, navigate, or ask the assistant..."
            className="flex-1 bg-transparent border-none py-4 px-3 text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
            data-testid="input-command-bar"
          />
          <kbd className="hidden sm:inline-flex text-[10px] text-muted-foreground bg-black/30 border border-white/10 px-1.5 py-0.5 rounded">ESC</kbd>
        </form>
        <div className="max-h-80 overflow-y-auto p-2">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-2">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{category}</div>
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/5 text-left transition-colors group"
                  data-testid={`command-${item.id}`}
                >
                  <span className="text-muted-foreground group-hover:text-primary transition-colors">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{item.label}</span>
                    {item.description && <span className="text-muted-foreground text-xs ml-2">{item.description}</span>}
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && query && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              <p>No commands found. Press Enter to ask the assistant.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}