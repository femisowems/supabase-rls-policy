'use client';

import React, { useState } from 'react';
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

export function RowDataEditor() {
  const { rowData, setRowData } = useStore();
  const [view, setView] = useState<'visual' | 'json'>('visual');
  const [jsonValue, setJsonValue] = useState(JSON.stringify(rowData, null, 2));

  const handleUpdateKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return;
    const newData = { ...rowData };
    newData[newKey] = newData[oldKey];
    delete newData[oldKey];
    setRowData(newData);
  };

  const handleUpdateValue = (key: string, value: any) => {
    setRowData({ ...rowData, [key]: value });
  };

  const handleDeleteRow = (key: string) => {
    const newData = { ...rowData };
    delete newData[key];
    setRowData(newData);
  };

  const handleAddColumn = () => {
    const newKey = `new_column_${Object.keys(rowData).length + 1}`;
    setRowData({ ...rowData, [newKey]: '' });
  };

  const handleJsonChange = (val: string) => {
    setJsonValue(val);
    try {
      const parsed = JSON.parse(val);
      setRowData(parsed);
    } catch (_e) {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-auto">
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
              {Object.entries(rowData).map(([key, value]) => (
                <TableRow key={key} className="hover:bg-muted/20">
                  <TableCell className="p-2">
                    <Input
                      value={key}
                      onChange={(e) => handleUpdateKey(key, e.target.value)}
                      className="h-8 text-xs font-mono bg-transparent border-transparent hover:border-border focus:bg-background"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={String(value)}
                      onChange={(e) => handleUpdateValue(key, e.target.value)}
                      className="h-8 text-xs font-mono bg-transparent border-transparent hover:border-border focus:bg-background"
                    />
                  </TableCell>
                  <TableCell className="p-2 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteRow(key)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {Object.keys(rowData).length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-xs text-muted-foreground italic">
                    No columns added. Click "Add Column" to start.
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
          className="font-mono text-xs min-h-[200px] bg-muted/20"
          spellCheck={false}
        />
      )}
    </div>
  );
}
