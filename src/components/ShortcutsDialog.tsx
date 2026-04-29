'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import { useStore } from '@/store/useStore';
import { Command, Share2, History, Library, Play, RefreshCw, HelpCircle } from 'lucide-react';

export function ShortcutsDialog() {
  const { isShortcutsOpen, setShortcutsOpen } = useStore();

  const shortcuts = [
    { key: 'P', label: 'Policy Presets', icon: Library, description: 'Open the full-screen policy library' },
    { key: 'S', label: 'Share Link', icon: Share2, description: 'Copy a synced state link to clipboard' },
    { key: 'H', label: 'Toggle History', icon: History, description: 'Open/Close the simulation history' },
    { key: '↵', label: 'Run Check', icon: Play, description: 'Force run the RLS simulation' },
    { key: '\\', label: 'Reset All', icon: RefreshCw, description: 'Clear all inputs to defaults' },
    { key: '/', label: 'Shortcuts Help', icon: HelpCircle, description: 'Open this keyboard guide' },
  ];

  return (
    <Dialog open={isShortcutsOpen} onOpenChange={setShortcutsOpen}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-card border-muted-foreground/10 shadow-2xl">
        <DialogHeader className="p-6 bg-muted/20 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Command className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Keyboard Shortcuts</DialogTitle>
              <DialogDescription className="text-xs">
                Professional tools to speed up your RLS workflow.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="p-2">
          {shortcuts.map((s, idx) => (
            <div 
              key={s.key} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-muted rounded border border-muted-foreground/5 text-muted-foreground group-hover:text-primary transition-colors">
                  <s.icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground">{s.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="inline-flex h-6 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[11px] font-medium opacity-100 shadow-sm">
                  <span className="text-xs">⌘</span>
                  {s.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-muted/10 border-t flex justify-center">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 italic">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[8px] not-italic font-bold">!</span>
            Note: On Windows/Linux, use <span className="font-mono font-bold">Ctrl</span> instead of <span className="font-mono font-bold">⌘</span>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
