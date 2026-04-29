'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  Library,
  Lightbulb,
  Share2,
  Users,
  GitBranch,
  Keyboard,
  Rocket,
} from 'lucide-react';

const STORAGE_KEY = 'rls-sim-welcomed';

const features = [
  {
    icon: ShieldCheck,
    title: 'Write & Test RLS Policies',
    description:
      'Define your Postgres USING expression and instantly simulate whether a given user would be granted or denied access to a row.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Library,
    title: 'Policy Library',
    description:
      'Browse a curated collection of production-ready patterns — ownership checks, org isolation, role gates, and more. Press ⌘P to open.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Lightbulb,
    title: 'Smart Troubleshooting',
    description:
      'When a check fails, the engine analyzes your logic and surfaces tailored advice — identity mismatches, missing columns, role restrictions.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Users,
    title: 'Custom Personas',
    description:
      'Switch between Owner, Stranger, Admin, and your own saved personas in one click. Create, edit, and delete them to match your project\'s roles.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: GitBranch,
    title: 'Logic Flow Visualization',
    description:
      'See exactly how Postgres evaluates your expression — every AND, OR, and comparison rendered as an interactive visual logic tree.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
  },
  {
    icon: Share2,
    title: 'Shareable State',
    description:
      'Your entire simulation — policy, schema, row data, and user context — is compressed into a clean URL so you can share it instantly with your team.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
];

export function WelcomeDialog() {
  const [open, setOpen] = useState(true);

  const handleDismiss = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="sm:max-w-[860px] p-0 overflow-hidden border-border/50 shadow-2xl bg-card gap-0">

        {/* Hero Header */}
        <div className="relative px-12 pt-14 pb-12 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-b">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--primary)/0.12),transparent_65%)]" />
          <div className="relative flex items-center gap-5">
            <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/25 shrink-0">
              <ShieldCheck className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-4xl font-bold tracking-tight leading-tight">
                Supabase RLS Simulator
              </DialogTitle>
              <DialogDescription className="text-sm mt-2.5 leading-relaxed text-muted-foreground max-w-[560px]">
                A professional-grade playground for designing, testing, and debugging your
                Row Level Security policies — before they ever hit production.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="px-10 py-8 grid grid-cols-2 gap-5 overflow-y-auto max-h-[480px]">
          {features.map((f) => (
            <div
              key={f.title}
              className={`p-6 rounded-xl border ${f.border} ${f.bg} hover:brightness-105 transition-all`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-background/60 border ${f.border}`}>
                  <f.icon className={`w-4 h-4 ${f.color}`} />
                </div>
                <h3 className="text-sm font-semibold">{f.title}</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <DialogFooter className="px-10 py-6 bg-muted/30 border-t flex-row items-center justify-between sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Keyboard className="w-4 h-4 shrink-0" />
            <span>
              Press{' '}
              <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium mx-0.5">
                ⌘ /
              </kbd>{' '}
              at any time to see all keyboard shortcuts.
            </span>
          </div>
          <Button onClick={handleDismiss} size="lg" className="gap-2 shrink-0">
            <Rocket className="w-4 h-4" />
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
