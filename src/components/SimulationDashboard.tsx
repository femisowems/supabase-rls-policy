'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useStore } from '@/store/useStore';
import { evaluatePolicy, generateTroubleshooting } from '@/lib/engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Play, Info, Calculator, MessageSquareText, Users, Database, ChevronDown, ChevronUp, Lightbulb, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { LogicFlow } from '@/components/LogicFlow';

export function SimulationDashboard() {
  const { 
    policy, 
    userContext, 
    rowData, 
    simulationResult, 
    setSimulationResult,
    saveToHistory
  } = useStore();
  const [isRunning, setIsRunning] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    results: true,
    logic: true,
    explanation: true,
    troubleshoot: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const runSimulation = useCallback(async () => {
    setIsRunning(true);
    try {
      const result = await evaluatePolicy(policy, userContext, rowData);
      setSimulationResult(result);
      saveToHistory();
    } finally {
      setIsRunning(false);
    }
  }, [policy, userContext, rowData, setSimulationResult, saveToHistory]);

  // Run automatically on change for "instant feedback" feel
  useEffect(() => {
    void runSimulation();
  }, [runSimulation]);

  return (
    <div className="space-y-6">
      <Card className="border-muted shadow-lg overflow-hidden">
        <CardHeader className="py-4 px-6 border-b bg-muted/10 flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => toggleSection('results')}>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <CardTitle className="text-base font-semibold">Simulation Results</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {!simulationResult?.allowed && simulationResult && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5 h-8 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive transition-colors hidden sm:flex"
                onClick={(e) => { e.stopPropagation(); toggleSection('troubleshoot'); }}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                How to fix?
              </Button>
            )}
            <Button 
              id="run-simulation-btn"
              size="sm" 
              onClick={(e) => { e.stopPropagation(); void runSimulation(); }} 
              className="gap-2 px-4" 
              disabled={isRunning}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isRunning ? 'Running...' : 'Run Check'}
              <kbd className="hidden lg:inline-flex h-4 items-center gap-1 rounded border bg-primary-foreground/20 px-1 font-mono text-[9px] font-medium opacity-80">
                ↵
              </kbd>
            </Button>
            {expandedSections.results ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedSections.results && (
        <CardContent className="p-6">
          {simulationResult?.parseError && (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              {simulationResult.parseError}
            </div>
          )}
          <AnimatePresence mode="wait">
            {!simulationResult ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-muted-foreground"
              >
                <Info className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm">Run a simulation to see results</p>
              </motion.div>
            ) : (
              <motion.div 
                key={simulationResult.allowed ? 'allowed' : 'denied'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {simulationResult.allowed ? (
                      <div className="p-2 bg-green-500/10 rounded-full">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      </div>
                    ) : (
                      <div className="p-2 bg-destructive/10 rounded-full">
                        <XCircle className="w-8 h-8 text-destructive" />
                      </div>
                    )}
                    <div>
                      <h3 className={`text-xl font-bold ${simulationResult.allowed ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                        {simulationResult.allowed ? 'Access Allowed' : 'Access Denied'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {simulationResult.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Badge variant={simulationResult.allowed ? 'default' : 'destructive'} className="px-3 py-1 w-fit">
                      {simulationResult.allowed ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections.troubleshoot && !simulationResult.allowed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-5 space-y-4 mb-2">
                        <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-wider">
                          <AlertCircle className="w-4 h-4" />
                          Troubleshooting Checklist
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {generateTroubleshooting(simulationResult).map((step, idx) => {
                            const [title, description] = step.split(': ');
                            return (
                              <div key={idx} className="space-y-2">
                                <h5 className="text-[11px] font-bold text-foreground/80 flex items-center gap-1.5">
                                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-destructive/10 text-[9px]">{idx + 1}</span>
                                  {title.replace(/\*\*/g, '')}
                                </h5>
                                <p className="text-[10px] text-muted-foreground leading-relaxed pl-5">
                                  {description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                    Evaluated Expression
                  </h4>
                  <div className="group relative">
                    <div className="p-4 bg-muted/40 rounded-lg font-mono text-sm border border-muted/50 break-all leading-relaxed transition-colors group-hover:border-primary/30">
                      {simulationResult.evaluatedExpression}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      Session Variables
                    </h4>
                    <div className="space-y-1 bg-muted/20 rounded-md p-2 border border-dashed">
                      {Object.entries(simulationResult.evaluatedValues)
                        .filter(([key]) => key.startsWith('auth.'))
                        .map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-muted/50 transition-colors group">
                          <code className="text-primary font-bold">{key}</code>
                          <Badge variant="outline" className="font-mono text-[10px] bg-background">
                            {JSON.stringify(val)}
                          </Badge>
                        </div>
                      ))}
                      {Object.keys(simulationResult.evaluatedValues).filter(k => k.startsWith('auth.')).length === 0 && (
                        <div className="text-[10px] text-muted-foreground italic p-1.5">No auth variables used.</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                      <Database className="w-3 h-3" />
                      Row Columns
                    </h4>
                    <div className="space-y-1 bg-muted/20 rounded-md p-2 border border-dashed">
                      {Object.entries(simulationResult.evaluatedValues)
                        .filter(([key]) => !key.startsWith('auth.'))
                        .map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-muted/50 transition-colors group">
                          <code className="text-emerald-600 dark:text-emerald-400 font-bold">{key}</code>
                          <Badge variant="outline" className="font-mono text-[10px] bg-background">
                            {JSON.stringify(val)}
                          </Badge>
                        </div>
                      ))}
                      {Object.keys(simulationResult.evaluatedValues).filter(k => !k.startsWith('auth.')).length === 0 && (
                        <div className="text-[10px] text-muted-foreground italic p-1.5">No row columns accessed.</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        )}
      </Card>

      <Card className="border-muted shadow-sm overflow-hidden">
        <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => toggleSection('logic')}>
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-medium">Logic Flow</CardTitle>
          </div>
          {expandedSections.logic ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CardHeader>
        {expandedSections.logic && (
        <CardContent className="p-4">
          <LogicFlow tree={simulationResult?.logicTree} />
        </CardContent>
        )}
      </Card>

    </div>
  );
}
