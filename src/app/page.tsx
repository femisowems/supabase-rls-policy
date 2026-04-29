'use client';

import React, { useState, useEffect } from 'react';
import { PolicyEditor } from '@/components/PolicyEditor';
import { SchemaInput } from '@/components/SchemaInput';
import { UserSimulator } from '@/components/UserSimulator';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { SimulationDashboard } from '@/components/SimulationDashboard';
import { UrlStateSync } from '@/components/UrlStateSync';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HistorySidebar } from '@/components/HistorySidebar';
import { ShortcutsDialog } from '@/components/ShortcutsDialog';
import { WelcomeDialog } from '@/components/WelcomeDialog';
import { ShieldCheck, Zap, RefreshCw, Link2, Check, HelpCircle, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Database, UserCircle2, Info } from 'lucide-react';

export default function Home() {
  const { reset, serialize, isHistoryOpen, setHistoryOpen, setPresetsOpen, isShortcutsOpen, setShortcutsOpen } = useStore();
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
      
      if (isCtrlOrCmd && e.key === 'p') {
        e.preventDefault();
        setPresetsOpen(true);
      }

      if (isCtrlOrCmd && e.key === 'h') {
        e.preventDefault();
        setHistoryOpen(!isHistoryOpen);
      }

      if (isCtrlOrCmd && e.key === '\\') {
        e.preventDefault();
        reset();
      }

      if (isCtrlOrCmd && e.key === 'Enter') {
        e.preventDefault();
        const runBtn = document.getElementById('run-simulation-btn');
        if (runBtn) runBtn.click();
      }

      if (isCtrlOrCmd && (e.key === '/' || e.key === '?')) {
        e.preventDefault();
        setShortcutsOpen(!isShortcutsOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHistoryOpen, isShortcutsOpen, reset, serialize, setHistoryOpen, setPresetsOpen, setShortcutsOpen]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareConfirmed(true);
      setTimeout(() => setShareConfirmed(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
      {/* Mobile gate — visible only below md breakpoint */}
      <div className="md:hidden fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center text-center px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,hsl(var(--primary)/0.12),transparent_65%)] pointer-events-none" />
        <div className="relative flex flex-col items-center gap-6 max-w-xs">
          <div className="p-5 bg-primary/10 border border-primary/20 rounded-3xl">
            <Monitor className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">Desktop Required</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Supabase RLS Simulator is a professional developer tool designed for
              desktop use. Please open it on a larger screen to get the full experience.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border text-xs text-muted-foreground font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Optimised for screens ≥ 768 px
          </div>
        </div>
      </div>
      <UrlStateSync />
      {/* Top Bar */}
      <header className="h-12 sm:h-14 border-b flex items-center justify-between px-3 sm:px-6 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-6 sm:w-7 h-6 sm:h-7 bg-primary rounded flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold tracking-tight truncate">RLS Simulator</h1>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-widest font-semibold hidden sm:block">Supabase Dev Tool</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
          <HistorySidebar />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShortcutsOpen(true)} 
            className="w-8 h-8 p-0 rounded-full hover:bg-muted"
            title="Shortcuts Help"
          >
            <HelpCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-muted-foreground" />
          </Button>
          <Button 
            variant={shareConfirmed ? "default" : "ghost"} 
            size="sm" 
            onClick={() => void copyShareLink()} 
            className={`gap-1 sm:gap-2 text-[10px] sm:text-[11px] h-8 px-2 sm:px-3 transition-all duration-300 ${shareConfirmed ? 'bg-green-600 hover:bg-green-700 text-white border-none scale-105' : ''}`}
          >
            {shareConfirmed ? <Check className="w-3 h-3 animate-in zoom-in duration-300" /> : <Link2 className="w-3 h-3" />}
            <span className="hidden sm:inline">{shareConfirmed ? 'Copied!' : 'Share'}</span>
            <span className="sm:hidden">{shareConfirmed ? 'Done' : 'Share'}</span>
            <kbd className="hidden lg:inline-flex h-4 items-center gap-1 rounded border bg-muted/50 px-1 font-mono text-[9px] font-medium opacity-60">
              S
            </kbd>
          </Button>
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1 sm:gap-2 text-[10px] sm:text-[11px] h-8 px-2 sm:px-3">
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
            <kbd className="hidden lg:inline-flex h-4 items-center gap-1 rounded border bg-muted/50 px-1 font-mono text-[9px] font-medium opacity-60">
              \
            </kbd>
          </Button>
          <div className="h-4 w-px bg-border mx-1 sm:mx-2 hidden sm:block" />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden flex-col md:flex-row h-[calc(100vh-48px-32px)] sm:h-[calc(100vh-56px-32px)]">
        {/* Left Panel - Configuration Tabs (100% on mobile, 40% on md+) */}
        <div className="w-full md:w-2/5 flex flex-col bg-background md:border-r max-h-[50vh] md:max-h-full order-2 md:order-1">
          <aside className="h-full flex flex-col bg-background">
              <Tabs defaultValue="policy" className="flex-1 flex flex-col">
                <div className="p-3 sm:p-4 bg-muted/30 border-b">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 px-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Configuration</span>
                  </div>
                  <TabsList className="w-full h-9 sm:h-11 bg-background/50 border p-1 rounded-xl shadow-sm">
                    <TabsTrigger value="policy" className="flex-1 text-[10px] sm:text-[11px] font-semibold gap-1 sm:gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                      <Settings2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      <span className="hidden sm:inline">Policy</span>
                      <span className="sm:hidden">Pol</span>
                    </TabsTrigger>
                    <TabsTrigger value="data" className="flex-1 text-[10px] sm:text-[11px] font-semibold gap-1 sm:gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                      <Database className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      <span className="hidden sm:inline">Data</span>
                      <span className="sm:hidden">Data</span>
                    </TabsTrigger>
                    <TabsTrigger value="user" className="flex-1 text-[10px] sm:text-[11px] font-semibold rounded-lg gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                      <UserCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      <span className="hidden sm:inline">User</span>
                      <span className="sm:hidden">User</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                    <TabsContent value="policy" className="m-0 outline-none">
                      <div className="space-y-4 sm:space-y-6">
                        <div className="space-y-1 sm:space-y-1.5 px-1">
                          <h2 className="text-base sm:text-lg font-bold tracking-tight">Policy Logic</h2>
                          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                            Define the SQL expression that determines access. This is the core of your Row Level Security.
                          </p>
                        </div>
                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                          <PolicyEditor />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="data" className="m-0 outline-none">
                      <div className="space-y-4 sm:space-y-6">
                        <div className="space-y-1 sm:space-y-1.5 px-1">
                          <h2 className="text-base sm:text-lg font-bold tracking-tight">Mock Data</h2>
                          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                            Configure the properties of the table row being evaluated by the policy.
                          </p>
                        </div>
                        <div className="rounded-xl border bg-card shadow-sm p-1">
                          <SchemaInput />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="user" className="m-0 outline-none">
                      <div className="space-y-4 sm:space-y-6">
                        <div className="space-y-1 sm:space-y-1.5 px-1">
                          <h2 className="text-base sm:text-lg font-bold tracking-tight">User Identity</h2>
                          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                            Simulate the session variables (`auth.uid()`, roles, etc.) for the request.
                          </p>
                        </div>
                        <div className="rounded-xl border bg-card shadow-sm p-1">
                          <UserSimulator />
                        </div>
                      </div>
                    </TabsContent>

                    <div className="pt-2">
                      <ExplanationPanel />
                    </div>
                  </div>
                </ScrollArea>
              </Tabs>
            </aside>
          </div>

        {/* Right Panel - Dashboard (100% on mobile, 60% on md+) */}
        <div className="w-full md:w-3/5 flex flex-col bg-background max-h-[50vh] md:max-h-full order-1 md:order-2 border-t md:border-t-0">
          <div className="flex-1 bg-background relative overflow-hidden h-full flex flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[20px_20px] opacity-10 pointer-events-none" />
              
              <ScrollArea className="flex-1">
                <div className="p-3 sm:p-4 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-5xl mx-auto w-full relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary fill-primary/20 shrink-0" />
                      <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-primary truncate">Simulation Environment</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] sm:text-[10px] font-mono h-6 shrink-0">
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
      <footer className="h-8 border-t bg-muted/50 px-2 sm:px-4 flex items-center justify-between text-[8px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wider gap-1 sm:gap-2 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <span className="truncate hidden sm:inline">Engine: v0.1-simplified</span>
          <span className="sm:hidden truncate">Engine: v0.1</span>
          <span className="hidden md:inline">Region: Local Simulator</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="hidden sm:inline">Real-time Sync Active</span>
          <span className="sm:hidden">Syncing</span>
        </div>
      </footer>
      <ShortcutsDialog />
      <WelcomeDialog />
    </div>
  );
}
