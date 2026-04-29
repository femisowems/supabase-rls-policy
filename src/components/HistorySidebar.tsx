'use client';

import React from 'react';
import { useStore, HistoryItem } from '@/store/useStore';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { History, Clock, RotateCcw, User, Database } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export function HistorySidebar() {
  const { history, restoreHistory, isHistoryOpen, setHistoryOpen } = useStore();

  const formatTime = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(ts);
  };

  return (
    <Sheet open={isHistoryOpen} onOpenChange={setHistoryOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">History</span>
            <kbd className="hidden md:inline-flex h-4 items-center gap-1 rounded border bg-muted/50 px-1 font-mono text-[9px] font-medium opacity-60">
              H
            </kbd>
            {history.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1 h-4 min-w-[16px] flex items-center justify-center text-[10px]">
                {history.length}
              </Badge>
            )}
          </Button>
        }
      />
      <SheetContent side="right" className="w-full sm:w-[350px] md:w-[450px] p-3 sm:p-6">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-primary shrink-0" />
            <span className="text-base sm:text-lg">Simulation History</span>
          </SheetTitle>
        </SheetHeader>
        <Separator className="my-3 sm:my-4" />
        <ScrollArea className="h-[calc(100vh-140px)] pr-3 sm:pr-4">
          <div className="space-y-3 sm:space-y-4">
            {history.length === 0 && (
              <div className="py-8 sm:py-12 text-center text-muted-foreground italic text-xs sm:text-sm">
                No history yet. Run a simulation to save it here.
              </div>
            )}
            {history.map((item, index) => (
              <div 
                key={item.timestamp}
                className="group relative p-3 sm:p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-all border-l-4 border-l-primary/50"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground truncate">
                    {formatTime(item.timestamp)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 sm:h-7 text-[9px] sm:text-[10px] gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => restoreHistory(item)}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">Restore</span>
                  </Button>
                </div>
                
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-medium truncate">
                      {item.userContext.role} ({item.userContext.uid || 'anon'})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 min-w-0">
                    <Database className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-mono truncate opacity-70">
                      {Object.keys(item.rowData).join(', ')}
                    </span>
                  </div>

                  <div className="mt-1.5 sm:mt-2 p-2 bg-background/50 rounded border text-[9px] sm:text-[10px] font-mono line-clamp-2 opacity-80">
                    {item.policy.split('\n')[0]}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
