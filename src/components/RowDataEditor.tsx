'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Code, Table as TableIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// Stable row entry with a permanent id that never changes on rename
interface RowEntry {
  id: string;
  key: string;
  value: string;
}

let counter = 0;
const stableId = () => `row_${++counter}`;

// Convert store rowData → stable local entries
function toEntries(rowData: Record<string, unknown>): RowEntry[] {
  return Object.entries(rowData).map(([key, value]) => ({
    id: stableId(),
    key,
    value: String(value),
  }));
}

// Convert local entries → store rowData
function toRowData(entries: RowEntry[]): Record<string, unknown> {
  return Object.fromEntries(entries.map(({ key, value }) => [key, value]));
}

export function RowDataEditor() {
  const { rowData, setRowData } = useStore();
  const [view, setView] = useState<'visual' | 'json'>('visual');
  const [entries, setEntries] = useState<RowEntry[]>(() => toEntries(rowData));
  const [jsonValue, setJsonValue] = useState(JSON.stringify(rowData, null, 2));

  // Track whether the user is actively editing so we don't clobber local state
  const isEditingVisual = useRef(false);
  const isEditingJson = useRef(false);

  // Sync entries & JSON from store when rowData changes externally
  // (preset loads, persona switches, reset, etc.) — but not during local edits
  const prevRowDataRef = useRef(rowData);
  useEffect(() => {
    if (prevRowDataRef.current === rowData) return;
    prevRowDataRef.current = rowData;

    if (!isEditingVisual.current) {
      setEntries(toEntries(rowData));
    }
    if (!isEditingJson.current) {
      setJsonValue(JSON.stringify(rowData, null, 2));
    }
  }, [rowData]);

  // --- Visual table handlers ---

  const handleKeyChange = (id: string, newKey: string) => {
    // Only update local display — don't touch the store yet
    setEntries(prev => prev.map(e => e.id === id ? { ...e, key: newKey } : e));
  };

  const handleKeyBlur = useCallback(() => {
    isEditingVisual.current = false;
    // Commit the full entry list to the store on blur
    setRowData(toRowData(entries));
  }, [entries, setRowData]);

  const handleValueChange = (id: string, value: string) => {
    const next = entries.map(e => e.id === id ? { ...e, value } : e);
    setEntries(next);
    setRowData(toRowData(next));
  };

  const handleDeleteRow = (id: string) => {
    const next = entries.filter(e => e.id !== id);
    setEntries(next);
    setRowData(toRowData(next));
  };

  const handleAddColumn = () => {
    const existingKeys = new Set(entries.map(e => e.key));
    let i = entries.length + 1;
    let newKey = `column_${i}`;
    while (existingKeys.has(newKey)) {
      i++;
      newKey = `column_${i}`;
    }
    const newEntry: RowEntry = { id: stableId(), key: newKey, value: '' };
    const next = [...entries, newEntry];
    setEntries(next);
    setRowData(toRowData(next));
    // Mark the new entry for autofocus
    setFocusId(newEntry.id);
  };

  const [focusId, setFocusId] = useState<string | null>(null);

  // --- JSON tab handlers ---

  const handleViewChange = (v: string) => {
    if (view === 'json') {
      isEditingJson.current = false;
      try {
        const parsed = JSON.parse(jsonValue);
        setRowData(parsed);
        setEntries(toEntries(parsed));
      } catch {
        setJsonValue(JSON.stringify(rowData, null, 2));
      }
    }
    setView(v as 'visual' | 'json');
  };

  const handleJsonChange = (val: string) => {
    isEditingJson.current = true;
    setJsonValue(val);
    try {
      const parsed = JSON.parse(val);
      setRowData(parsed);
    } catch {
      // Don't update store for invalid JSON mid-edit
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={view} onValueChange={handleViewChange} className="w-auto">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="visual" className="text-[10px] px-3">
              <TableIcon className="w-3 h-3 mr-1.5" />
              Table
            </TabsTrigger>
            <TabsTrigger value="json" className="text-[10px] px-3">
              <Code className="w-3 h-3 mr-1.5" />
              JSON
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {view === 'visual' && (
          <Button variant="outline" size="sm" onClick={handleAddColumn} className="h-8 text-[10px] gap-1.5">
            <Plus className="w-3 h-3" />
            Add Column
          </Button>
        )}
      </div>

      {view === 'visual' ? (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-[10px] uppercase font-bold w-[40%]">Column</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">Value</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                // Stable id as key — never changes on rename, so React never unmounts
                <TableRow key={entry.id} className="hover:bg-muted/20">
                  <TableCell className="p-2">
                    <Input
                      autoFocus={entry.id === focusId}
                      value={entry.key}
                      onChange={(e) => handleKeyChange(entry.id, e.target.value)}
                      onFocus={() => {
                        isEditingVisual.current = true;
                        setFocusId(null);
                      }}
                      onBlur={handleKeyBlur}
                      className="h-8 text-xs font-mono bg-transparent border-transparent hover:border-border focus:bg-background"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={entry.value}
                      onChange={(e) => handleValueChange(entry.id, e.target.value)}
                      onFocus={() => { isEditingVisual.current = true; }}
                      onBlur={() => { isEditingVisual.current = false; }}
                      className="h-8 text-xs font-mono bg-transparent border-transparent hover:border-border focus:bg-background"
                    />
                  </TableCell>
                  <TableCell className="p-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteRow(entry.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-xs text-muted-foreground italic">
                    No columns added. Click &quot;Add Column&quot; to start.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Textarea
          value={jsonValue}
          onChange={(e) => handleJsonChange(e.target.value)}
          onBlur={() => { isEditingJson.current = false; }}
          className="font-mono text-xs min-h-[200px] bg-muted/20"
          spellCheck={false}
        />
      )}
    </div>
  );
}
