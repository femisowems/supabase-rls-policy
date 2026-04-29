'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database, Table, ChevronDown, ChevronUp } from 'lucide-react';
import { RowDataEditor } from './RowDataEditor';

export function SchemaInput() {
  const { schema, setSchema } = useStore();
  const [expandedSections, setExpandedSections] = useState({
    rowData: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Card className="border-muted shadow-sm overflow-hidden">
      <CardHeader className="py-2.5 sm:py-3 px-3 sm:px-4 border-b bg-muted/30 flex flex-row items-center gap-1.5 sm:gap-2 space-y-0">
        <Database className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary shrink-0" />
        <CardTitle className="text-xs sm:text-sm font-medium truncate">Schema & Mock Data</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 space-y-4 sm:space-y-6">
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="table-name" className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Table Name
          </Label>
          <div className="relative">
            <Table className="absolute left-2 sm:left-2.5 top-2 sm:top-2.5 h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground shrink-0" />
            <Input
              id="table-name"
              value={schema.name}
              onChange={(e) => setSchema({ ...schema, name: e.target.value })}
              className="pl-8 sm:pl-9 bg-background/50 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3 border-t pt-3 sm:pt-4">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-muted/30 -mx-1.5 sm:-mx-2 px-1.5 sm:px-2 py-1 rounded transition-colors"
            onClick={() => toggleSection('rowData')}
          >
            <Label className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-semibold cursor-pointer">
              Sample Row Data
            </Label>
            {expandedSections.rowData ? <ChevronUp className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" /> : <ChevronDown className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" />}
          </div>
          {expandedSections.rowData && (
          <RowDataEditor />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
