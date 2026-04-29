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
    <div className="bg-muted/40 p-1.5 sm:p-2.5 rounded-md text-[8px] sm:text-[10px] font-mono leading-normal border border-border/50 group-hover:border-primary/20 transition-colors overflow-x-auto">
      {code.split('\n').map((line, i) => (
        <div key={i} className="whitespace-pre">
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
      <CardHeader className="py-2.5 sm:py-3 px-3 sm:px-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Code2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary shrink-0" />
          <CardTitle className="text-xs sm:text-sm font-medium truncate">Policy Editor</CardTitle>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Dialog open={presetsOpen} onOpenChange={setPresetsOpen}>
            <DialogTrigger 
              render={
                <Button variant="ghost" size="sm" className="h-8 gap-1 px-1.5 sm:px-2 text-[10px] sm:text-xs">
                  <span className="hidden sm:inline">Presets</span>
                  <span className="sm:hidden">Pre</span>
                  <kbd className="hidden sm:inline-flex h-4 items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[8px] font-medium text-muted-foreground opacity-100">
                    <span className="text-[7px]">⌘</span>P
                  </kbd>
                  <ChevronDown className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                </Button>
              }
            />
            <DialogContent 
              showCloseButton={false}
              className="fixed inset-0 z-50 !max-w-none w-screen h-screen m-0 rounded-none border-none p-0 bg-background/98 backdrop-blur-3xl flex flex-col shadow-none top-0 left-0 translate-x-0 translate-y-0 duration-200"
            >
              <DialogClose 
                render={
                  <Button 
                    variant="ghost" 
                    size="icon-lg" 
                    className="absolute top-3 sm:top-8 right-3 sm:right-8 z-50 rounded-full bg-muted/20 hover:bg-muted/40 transition-all border border-muted-foreground/10 w-8 h-8 sm:w-12 sm:h-12"
                  >
                    <XIcon className="w-4 sm:w-8 h-4 sm:h-8" />
                  </Button>
                }
              />
              <DialogHeader className="px-4 sm:px-8 md:px-16 pt-4 sm:pt-8 md:pt-16 pb-4 sm:pb-6 md:pb-10 border-b bg-muted/20 shrink-0">
                <div className="max-w-7xl mx-auto w-full relative">
                  <div className="absolute -left-3 sm:-left-12 top-0 h-full w-1 bg-primary rounded-full hidden md:block" />
                  <DialogTitle className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter mb-2 sm:mb-3">Policy Library</DialogTitle>
                  <p className="text-xs sm:text-sm md:text-lg text-muted-foreground leading-relaxed max-w-3xl font-medium">
                    Master your database security with high-performance RLS patterns. Search by logic, role, or use case to find the perfect starting point.
                  </p>
                </div>
              </DialogHeader>
              
              <div className="px-4 sm:px-8 md:px-16 py-4 sm:py-6 md:py-10 bg-muted/5 border-b shrink-0">
                <div className="max-w-7xl mx-auto w-full space-y-4 sm:space-y-6 md:space-y-10">
                  <div className="relative group">
                    <Search className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-4 sm:w-5 md:w-7 h-4 sm:h-5 md:h-7 text-muted-foreground/30 group-focus-within:text-primary transition-all" />
                    <Input
                      placeholder="Search policies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 sm:pl-12 md:pl-16 h-10 sm:h-14 md:h-20 bg-background border-muted-foreground/10 focus-visible:ring-primary/20 text-sm sm:text-lg md:text-2xl font-bold shadow-xl transition-all rounded-xl sm:rounded-2xl"
                      autoFocus
                    />
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-muted/40 p-1 sm:p-2 h-10 sm:h-14 md:h-16 w-full justify-start overflow-x-auto scrollbar-hide gap-1 sm:gap-2 md:gap-3 border rounded-lg sm:rounded-xl">
                      <TabsTrigger value="all" className="text-[10px] sm:text-xs md:text-sm font-bold px-3 sm:px-6 md:px-10 h-8 sm:h-10 md:h-12 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg whitespace-nowrap">All Patterns</TabsTrigger>
                      {categories.map(cat => (
                        <TabsTrigger key={cat} value={cat} className="text-[10px] sm:text-xs md:text-sm font-bold px-3 sm:px-6 md:px-10 h-8 sm:h-10 md:h-12 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg whitespace-nowrap">
                          {cat}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto bg-muted/5 scrollbar-hide">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 md:px-16 py-4 sm:py-8 md:py-16">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeTab + searchQuery}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-10 pb-8 sm:pb-16 md:pb-32"
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
                              className="group relative flex flex-col w-full rounded-2xl sm:rounded-3xl border bg-card p-3 sm:p-5 md:p-8 text-left transition-all hover:border-primary/50 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] ring-primary/5 hover:ring-8"
                            >
                              <div className="flex items-start justify-between mb-3 sm:mb-4 md:mb-6 gap-2">
                                <div className="space-y-2 sm:space-y-2.5 md:space-y-3 pr-2">
                                  <div className="font-black text-base sm:text-xl md:text-2xl tracking-tighter group-hover:text-primary transition-colors leading-tight">{ex.name}</div>
                                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3 font-medium">
                                    {ex.description}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] h-6 sm:h-6.5 md:h-7 px-2 md:px-3 bg-primary/5 text-primary transition-colors border-none shrink-0 rounded-full">
                                  {ex.category}
                                </Badge>
                              </div>
                              
                              <div className="mt-auto">
                                <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-border/50">
                                  <SqlPreview code={ex.policy} />
                                </div>
                                <div className="mt-3 sm:mt-4 md:mt-6 flex items-center text-xs sm:text-xs md:text-sm font-black text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-3 group-hover:translate-y-0">
                                  Deploy Template
                                  <RotateCcw className="ml-1.5 sm:ml-2 md:ml-2.5 w-3 sm:w-3.5 md:w-4.5 h-3 sm:h-3.5 md:h-4.5" />
                                </div>
                              </div>
                            </motion.button>
                          ));
                        })}

                      {filteredPresets.length === 0 && (
                        <div className="col-span-full py-16 sm:py-24 md:py-40 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6">
                          <div className="p-3 sm:p-4 md:p-6 rounded-full bg-muted/30">
                            <Search className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 text-muted-foreground/30" />
                          </div>
                          <div>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">No matches found</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Try searching for a different keyword or category.</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs sm:text-sm"
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
          <div className="h-3.5 w-px bg-border mx-0.5 hidden sm:block" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
            <Copy className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={reset}>
            <RotateCcw className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 border-t">
        <div className="h-64 sm:h-75 w-full overflow-hidden">
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
