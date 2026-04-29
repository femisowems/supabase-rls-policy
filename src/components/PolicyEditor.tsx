'use client';

import React from 'react';
import { useStore, PRESET_EXAMPLES } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Code2, Copy, RotateCcw, ChevronDown } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PolicyEditor() {
  const { policy, setPolicy, reset } = useStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(policy);
  };

  return (
    <Card className="border-muted shadow-sm overflow-hidden">
      <CardHeader className="py-3 px-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-medium">Policy Editor</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'h-8 gap-1 px-2 text-xs' })}
            >
              Presets
              <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {PRESET_EXAMPLES.map((ex) => (
                <DropdownMenuItem key={ex.name} onClick={() => setPolicy(ex.policy)}>
                  {ex.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="h-4 w-px bg-border mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={reset}>
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Textarea
          value={policy}
          onChange={(e) => setPolicy(e.target.value)}
          className="min-h-[200px] font-mono text-sm border-0 focus-visible:ring-0 resize-none p-4 bg-background/50"
          placeholder="CREATE POLICY..."
        />
      </CardContent>
    </Card>
  );
}
