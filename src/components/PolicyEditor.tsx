'use client';

import React from 'react';
import { useStore, PRESET_EXAMPLES } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code2, Copy, RotateCcw, ChevronDown } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PolicyEditor() {
  const { policy, setPolicy, reset } = useStore();
  const { theme } = useTheme();

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
      <CardContent className="p-0 border-t">
        <div className="h-[300px] w-full overflow-hidden">
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
