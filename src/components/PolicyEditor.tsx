'use client';

import React, { useState, useMemo } from 'react';
import { useStore, PRESET_EXAMPLES } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code2, Copy, RotateCcw, ChevronDown, Search, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

type PresetExample = (typeof PRESET_EXAMPLES)[number];

function SqlPreview({ code }: { code: string }) {
  const highlightSql = (text: string) => {
    const keywords = [
      'CREATE', 'POLICY', 'ON', 'FOR', 'TO', 'USING', 'WITH', 'CHECK', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'ALL', 'auth', 'uid', 'role', 'jwt', 'TRUE', 'FALSE', 'NULL'
    ];
    
    return text.split(/(\s+|\.|\(|\)|,|->>)/).map((part, i) => {
      const upperPart = part.toUpperCase();
      if (keywords.includes(upperPart)) {
        return <span key={i} className="text-blue-500 dark:text-blue-400 font-semibold">{part}</span>;
      }
      if (part.startsWith("'") || part.match(/^'.*'$/)) {
        return <span key={i} className="text-emerald-600 dark:text-emerald-400">{part}</span>;
      }
      if (part.match(/^[0-9]+$/)) {
        return <span key={i} className="text-amber-600 dark:text-amber-400">{part}</span>;
      }
      return <span key={part + i}>{part}</span>;
    });
  };

  return (
    <div className="bg-muted/40 p-2.5 rounded-md text-[10px] font-mono leading-normal border border-border/50 group-hover:border-primary/20 transition-colors">
      {code.split('\n').map((line, i) => (
        <div key={i} className="whitespace-pre truncate">
          {highlightSql(line)}
        </div>
      ))}
    </div>
  );
}

export function PolicyEditor() {
  const { policy, setPolicy, reset, isPresetsOpen: presetsOpen, setPresetsOpen } = useStore();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(policy);
  };

  // Group presets by category and filter
  const { categories, filteredPresets, groupedPresets } = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = PRESET_EXAMPLES.filter((ex) => 
      ex.name.toLowerCase().includes(query) ||
      ex.category.toLowerCase().includes(query) ||
      ex.description.toLowerCase().includes(query)
    );
    
    const categories = Array.from(new Set(PRESET_EXAMPLES.map(p => p.category)));
    
    const grouped: Record<string, PresetExample[]> = {};
    filtered.forEach((ex) => {
      if (!grouped[ex.category]) {
        grouped[ex.category] = [];
      }
      grouped[ex.category].push(ex);
    });
    
    return { 
      categories, 
      filteredPresets: filtered,
      groupedPresets: grouped 
    };
  }, [searchQuery]);

  const [activeTab, setActiveTab] = useState<string>('all');

  return (
    <Card className="border-muted shadow-sm overflow-hidden">
      <CardHeader className="py-3 px-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-medium">Policy Editor</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Dialog open={presetsOpen} onOpenChange={setPresetsOpen}>
            <DialogTrigger 
              render={
                <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 text-xs">
                  Presets
                  <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>P
                  </kbd>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              }
            />
            <DialogContent 
              showCloseButton={false}
              className="fixed inset-0 z-50 !max-w-none sm:!max-w-none w-screen h-screen m-0 rounded-none border-none p-0 bg-background/98 backdrop-blur-3xl flex flex-col shadow-none top-0 left-0 translate-x-0 translate-y-0 duration-200"
            >
              <DialogClose 
                render={
                  <Button 
                    variant="ghost" 
                    size="icon-lg" 
                    className="absolute top-8 right-8 z-50 rounded-full bg-muted/20 hover:bg-muted/40 transition-all border border-muted-foreground/10"
                  >
                    <XIcon className="w-8 h-8" />
                  </Button>
                }
              />
              <DialogHeader className="px-16 pt-16 pb-10 border-b bg-muted/20 shrink-0">
                <div className="max-w-7xl mx-auto w-full relative">
                  <div className="absolute -left-12 top-0 h-full w-1 bg-primary rounded-full hidden md:block" />
                  <DialogTitle className="text-5xl font-black tracking-tighter mb-3">Policy Library</DialogTitle>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl font-medium">
                    Master your database security with high-performance RLS patterns. Search by logic, role, or use case to find the perfect starting point.
                  </p>
                </div>
              </DialogHeader>
              
              <div className="px-16 py-10 bg-muted/5 border-b shrink-0">
                <div className="max-w-7xl mx-auto w-full space-y-10">
                  <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7 text-muted-foreground/30 group-focus-within:text-primary transition-all" />
                    <Input
                      placeholder="Search for policies (e.g. 'owner', 'tenant', 'jwt')..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-16 h-20 bg-background border-muted-foreground/10 focus-visible:ring-primary/20 text-2xl font-bold shadow-xl transition-all rounded-2xl"
                      autoFocus
                    />
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-muted/40 p-2 h-16 w-full justify-start overflow-x-auto scrollbar-hide gap-3 border rounded-xl">
                      <TabsTrigger value="all" className="text-sm font-bold px-10 h-12 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg">All Patterns</TabsTrigger>
                      {categories.map(cat => (
                        <TabsTrigger key={cat} value={cat} className="text-sm font-bold px-10 h-12 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg whitespace-nowrap">
                          {cat}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto bg-muted/5 scrollbar-hide">
                <div className="max-w-7xl mx-auto w-full px-16 py-16">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeTab + searchQuery}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-32"
                    >
                      {categories
                        .filter(cat => activeTab === 'all' || activeTab === cat)
                        .map(cat => {
                          const presets = groupedPresets[cat] || [];
                          if (presets.length === 0) return null;

                          return presets.map((ex) => (
                            <motion.button
                              whileHover={{ y: -12, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              key={ex.name}
                              type="button"
                              onClick={() => {
                                setPolicy(ex.policy);
                                setSearchQuery('');
                                setPresetsOpen(false);
                              }}
                              className="group relative flex flex-col w-full rounded-3xl border bg-card p-8 text-left transition-all hover:border-primary/50 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] ring-primary/5 hover:ring-8"
                            >
                              <div className="flex items-start justify-between mb-6">
                                <div className="space-y-3 pr-4">
                                  <div className="font-black text-2xl tracking-tighter group-hover:text-primary transition-colors leading-tight">{ex.name}</div>
                                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 font-medium">
                                    {ex.description}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-[0.2em] h-7 px-3 bg-primary/5 text-primary transition-colors border-none shrink-0 rounded-full">
                                  {ex.category}
                                </Badge>
                              </div>
                              
                              <div className="mt-auto">
                                <div className="rounded-2xl overflow-hidden border border-border/50">
                                  <SqlPreview code={ex.policy} />
                                </div>
                                <div className="mt-6 flex items-center text-sm font-black text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-3 group-hover:translate-y-0">
                                  Deploy Template
                                  <RotateCcw className="ml-2.5 w-4.5 h-4.5" />
                                </div>
                              </div>
                            </motion.button>
                          ));
                        })}

                      {filteredPresets.length === 0 && (
                        <div className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-6">
                          <div className="p-6 rounded-full bg-muted/30">
                            <Search className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">No matches found</p>
                            <p className="text-muted-foreground">Try searching for a different keyword or category.</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                          >
                            Clear All Filters
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
