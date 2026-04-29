'use client';

import React, { useState, useMemo } from 'react';
import { useStore, PRESET_EXAMPLES } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code2, Copy, RotateCcw, ChevronDown, Search } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

type PresetExample = (typeof PRESET_EXAMPLES)[number];

export function PolicyEditor() {
  const { policy, setPolicy, reset } = useStore();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(policy);
  };

  // Group presets by category and filter
  const groupedPresets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = PRESET_EXAMPLES.filter((ex) => 
      ex.name.toLowerCase().includes(query) ||
      ex.category.toLowerCase().includes(query)
    );
    
    const grouped: Record<string, PresetExample[]> = {};
    filtered.forEach((ex) => {
      if (!grouped[ex.category]) {
        grouped[ex.category] = [];
      }
      grouped[ex.category].push(ex);
    });
    return grouped;
  }, [searchQuery]);

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
            <DropdownMenuContent align="end" className="w-60">
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search presets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-7 text-xs"
                    autoFocus
                  />
                </div>
              </div>
              {Object.entries(groupedPresets).map(([category, presets], idx) => (
                <DropdownMenuGroup key={category}>
                  {idx > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground px-2 py-1.5">
                    {category}
                  </DropdownMenuLabel>
                  {presets.map((ex) => (
                    <DropdownMenuItem 
                      key={ex.name} 
                      onClick={() => {
                        setPolicy(ex.policy);
                        setSearchQuery('');
                      }}
                      className="text-xs cursor-pointer"
                    >
                      {ex.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              ))}
              {Object.keys(groupedPresets).length === 0 && (
                <div className="px-2 py-4 text-xs text-muted-foreground text-center">
                  No presets found
                </div>
              )}
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
      <CardContent className="p-0 border-t">
        <div className="h-75 w-full overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="sql"
            value={policy}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            onChange={(value) => setPolicy(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'var(--font-geist-mono)',
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
