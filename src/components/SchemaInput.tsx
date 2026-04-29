'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database, Table } from 'lucide-react';

export function SchemaInput() {
  const { schema, setSchema, rowData, setRowData } = useStore();

  const handleRowDataChange = (val: string) => {
    try {
      const parsed = JSON.parse(val);
      setRowData(parsed);
    } catch (_e) {
      // Keep typing allowed even if JSON is invalid momentarily
    }
  };

  return (
    <Card className="border-muted shadow-sm overflow-hidden">
      <CardHeader className="py-3 px-4 border-b bg-muted/30 flex flex-row items-center gap-2 space-y-0">
        <Database className="w-4 h-4 text-primary" />
        <CardTitle className="text-sm font-medium">Schema & Mock Data</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
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

        <div className="space-y-2">
          <Label htmlFor="row-data" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Sample Row (JSON)
          </Label>
          <Textarea
            id="row-data"
            value={JSON.stringify(rowData, null, 2)}
            onChange={(e) => handleRowDataChange(e.target.value)}
            className="font-mono text-sm min-h-[150px] bg-background/50"
          />
        </div>
      </CardContent>
    </Card>
  );
}
