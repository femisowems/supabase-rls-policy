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
  const { history, restoreHistory } = useStore();

  const formatTime = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(ts);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
          {history.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1 h-4 min-w-[16px] flex items-center justify-center text-[10px]">
              {history.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[350px] sm:w-[450px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Simulation History
          </SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />
        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <div className="space-y-4">
            {history.length === 0 && (
              <div className="py-12 text-center text-muted-foreground italic text-sm">
                No history yet. Run a simulation to save it here.
              </div>
            )}
            {history.map((item, index) => (
              <div 
                key={item.timestamp}
                className="group relative p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-all border-l-4 border-l-primary/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formatTime(item.timestamp)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => restoreHistory(item)}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-primary" />
                    <span className="text-[11px] font-medium truncate max-w-[200px]">
                      {item.userContext.role} ({item.userContext.uid || 'anon'})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Database className="w-3 h-3 text-emerald-500" />
                    <span className="text-[11px] font-mono truncate opacity-70">
                      {Object.keys(item.rowData).join(', ')}
                    </span>
                  </div>

                  <div className="mt-2 p-2 bg-background/50 rounded border text-[10px] font-mono line-clamp-3 opacity-80">
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
