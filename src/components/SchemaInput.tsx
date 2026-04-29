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
      <CardHeader className="py-3 px-4 border-b bg-muted/30 flex flex-row items-center gap-2 space-y-0">
        <Database className="w-4 h-4 text-primary" />
        <CardTitle className="text-sm font-medium">Schema & Mock Data</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="table-name" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Table Name
          </Label>
          <div className="relative">
            <Table className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="table-name"
              value={schema.name}
              onChange={(e) => setSchema({ ...schema, name: e.target.value })}
              className="pl-9 bg-background/50"
            />
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-muted/30 -mx-2 px-2 py-1 rounded transition-colors"
            onClick={() => toggleSection('rowData')}
          >
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold cursor-pointer">
              Sample Row Data
            </Label>
            {expandedSections.rowData ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
          {expandedSections.rowData && (
          <RowDataEditor />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
