'use client';

import React from 'react';
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

export default function Home() {
  const reset = useStore((state) => state.reset);
  const serialize = useStore((state) => state.serialize);

  const copyShareLink = async () => {
    const encoded = serialize();
    await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${encoded}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <UrlStateSync />
      {/* Top Bar */}
      <header className="h-16 border-b flex items-center justify-between px-6 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">RLS Policy Tester</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Supabase Dev Tool</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HistorySidebar />
          <Button variant="outline" size="sm" onClick={() => void copyShareLink()} className="gap-2 text-xs h-9">
            <Link2 className="w-3 h-3" />
            Copy Link
          </Button>
          <Button variant="outline" size="sm" onClick={reset} className="gap-2 text-xs h-9">
            <RefreshCw className="w-3 h-3" />
            Reset All
          </Button>
          <div className="h-6 w-px bg-border mx-2" />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Inputs */}
        <div className="w-full md:w-[45%] lg:w-[40%] border-r bg-muted/20 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6 max-w-2xl mx-auto w-full">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Policy Configuration</h2>
                <p className="text-sm text-muted-foreground">Define your RLS policy and table structure.</p>
              </div>
              
              <PolicyEditor />
              <SchemaInput />
              <UserSimulator />
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Simulation */}
        <div className="flex-1 bg-background flex flex-col relative">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
          
          <ScrollArea className="flex-1">
            <div className="p-6 lg:p-10 space-y-6 max-w-3xl mx-auto w-full relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary fill-primary/20" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Live Simulation</span>
              </div>
              
              <SimulationDashboard />
            </div>
          </ScrollArea>
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
