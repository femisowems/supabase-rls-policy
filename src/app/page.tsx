'use client';

import React, { useState, useEffect } from 'react';
import { PolicyEditor } from '@/components/PolicyEditor';
import { SchemaInput } from '@/components/SchemaInput';
import { UserSimulator } from '@/components/UserSimulator';
import { SimulationDashboard } from '@/components/SimulationDashboard';
import { UrlStateSync } from '@/components/UrlStateSync';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HistorySidebar } from '@/components/HistorySidebar';
import { ShieldCheck, Zap, RefreshCw, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Database, UserCircle2, Info } from 'lucide-react';

export default function Home() {
  const reset = useStore((state) => state.reset);
  const serialize = useStore((state) => state.serialize);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [shareConfirmed, setShareConfirmed] = useState(false);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (isCtrlOrCmd && e.key === 's') {
        e.preventDefault();
        void copyShareLink();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const copyShareLink = async () => {
    const encoded = serialize();
    await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${encoded}`);
    setShareConfirmed(true);
    setTimeout(() => setShareConfirmed(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
      <UrlStateSync />
      {/* Top Bar */}
      <header className="h-14 border-b flex items-center justify-between px-6 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">RLS Simulator</h1>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Supabase Dev Tool</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HistorySidebar />
          <Button variant="ghost" size="sm" onClick={() => void copyShareLink()} className={`gap-2 text-[11px] h-8 transition-colors ${shareConfirmed ? 'text-green-600 dark:text-green-400' : ''}`}>
            <Link2 className="w-3 h-3" />
            {shareConfirmed ? 'Copied!' : 'Share'}
          </Button>
          <Button variant="ghost" size="sm" onClick={reset} className="gap-2 text-[11px] h-8">
            <RefreshCw className="w-3 h-3" />
            Reset
          </Button>
          <div className="h-4 w-px bg-border mx-2" />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden h-[calc(100vh-56px-32px)]">
        {/* Left Panel - Configuration Tabs (40%) */}
        <div className="w-2/5 flex flex-col bg-background border-r">
          <aside className="h-full flex flex-col bg-background">
              <Tabs defaultValue="policy" className="flex-1 flex flex-col">
                <div className="p-4 bg-muted/30 border-b">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Configuration</span>
                  </div>
                  <TabsList className="w-full h-11 bg-background/50 border p-1 rounded-xl shadow-sm">
                    <TabsTrigger value="policy" className="flex-1 text-[11px] font-semibold gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                      <Settings2 className="w-3.5 h-3.5" />
                      Policy
                    </TabsTrigger>
                    <TabsTrigger value="data" className="flex-1 text-[11px] font-semibold gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                      <Database className="w-3.5 h-3.5" />
                      Data
                    </TabsTrigger>
                    <TabsTrigger value="user" className="flex-1 text-[11px] font-semibold rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                      <UserCircle2 className="w-3.5 h-3.5" />
                      User
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-8">
                    <TabsContent value="policy" className="m-0 outline-none">
                      <div className="space-y-6">
                        <div className="space-y-1.5 px-1">
                          <h2 className="text-lg font-bold tracking-tight">Policy Logic</h2>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Define the SQL expression that determines access. This is the core of your Row Level Security.
                          </p>
                        </div>
                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                          <PolicyEditor />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="data" className="m-0 outline-none">
                      <div className="space-y-6">
                        <div className="space-y-1.5 px-1">
                          <h2 className="text-lg font-bold tracking-tight">Mock Data</h2>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Configure the properties of the table row being evaluated by the policy.
                          </p>
                        </div>
                        <div className="rounded-xl border bg-card shadow-sm p-1">
                          <SchemaInput />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="user" className="m-0 outline-none">
                      <div className="space-y-6">
                        <div className="space-y-1.5 px-1">
                          <h2 className="text-lg font-bold tracking-tight">User Identity</h2>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Simulate the session variables (`auth.uid()`, roles, etc.) for the request.
                          </p>
                        </div>
                        <div className="rounded-xl border bg-card shadow-sm p-1">
                          <UserSimulator />
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
            </aside>
          </div>

        {/* Right Panel - Dashboard (60%) */}
        <div className="w-3/5 flex flex-col bg-background">
          <div className="flex-1 bg-background relative overflow-hidden h-full flex flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[20px_20px] opacity-10 pointer-events-none" />
              
              <ScrollArea className="flex-1">
                <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto w-full relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary fill-primary/20" />
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">Simulation Environment</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono h-6">
                      {currentTime || '--:--:--'}
                    </Badge>
                  </div>
                  
                  <SimulationDashboard />
                </div>
              </ScrollArea>
            </div>
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 border-t bg-muted/50 px-4 flex items-center justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <span>Engine: v0.1-simplified</span>
          <span>Region: Local Simulator</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span>Real-time Sync Active</span>
        </div>
      </footer>
    </div>
  );
}
