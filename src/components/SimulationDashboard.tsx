'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useStore } from '@/store/useStore';
import { evaluatePolicy, generateExplanation } from '@/lib/engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Play, Info, Calculator, MessageSquareText, Users, Database } from 'lucide-react';
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

  const explanation = simulationResult ? generateExplanation(simulationResult, "Policy") : [];

  return (
    <div className="space-y-6">
      <Card className="border-muted shadow-lg overflow-hidden">
        <CardHeader className="py-4 px-6 border-b bg-muted/10 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <CardTitle className="text-base font-semibold">Simulation Results</CardTitle>
          </div>
          <Button size="sm" onClick={() => void runSimulation()} className="gap-2 px-4" disabled={isRunning}>
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? 'Running...' : 'Run Check'}
          </Button>
        </CardHeader>
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
                  <Badge variant={simulationResult.allowed ? 'default' : 'destructive'} className="px-3 py-1">
                    {simulationResult.allowed ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>

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
      </Card>

      <Card className="border-muted shadow-sm overflow-hidden">
        <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center gap-2 space-y-0">
          <MessageSquareText className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-medium">Logic Flow</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <LogicFlow tree={simulationResult?.logicTree} />
        </CardContent>
      </Card>

      <Card className="border-muted shadow-sm overflow-hidden bg-primary/5 dark:bg-primary/10">
        <CardHeader className="py-3 px-4 border-b bg-primary/10 flex flex-row items-center gap-2 space-y-0">
          <MessageSquareText className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-medium">Why is this happening?</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {explanation.length > 0 ? (
              explanation.map((insight, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                    insight.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300' :
                    insight.type === 'failure' ? 'bg-rose-500/5 border-rose-500/20 text-rose-800 dark:text-rose-300' :
                    insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-800 dark:text-amber-300' :
                    'bg-blue-500/5 border-blue-500/20 text-blue-800 dark:text-blue-300'
                  }`}
                >
                  <div className="mt-0.5">
                    {insight.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                    {insight.type === 'failure' && <XCircle className="w-4 h-4" />}
                    {insight.type === 'warning' && <Info className="w-4 h-4" />}
                    {insight.type === 'info' && <MessageSquareText className="w-4 h-4" />}
                  </div>
                  <p className="leading-relaxed font-medium">{insight.message}</p>
                </motion.div>
              ))
            ) : (
              <p className="text-sm italic text-muted-foreground text-center py-4">
                Configure your policy and user state to see a detailed explanation.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
