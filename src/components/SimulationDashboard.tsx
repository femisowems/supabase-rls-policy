'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useStore } from '@/store/useStore';
import { evaluatePolicy, generateExplanation } from '@/lib/engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Play, Info, Calculator, MessageSquareText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { LogicFlow } from '@/components/LogicFlow';

export function SimulationDashboard() {
  const { 
    policy, 
    userContext, 
    rowData, 
    simulationResult, 
    setSimulationResult 
  } = useStore();
  const [isRunning, setIsRunning] = useState(false);

  const runSimulation = useCallback(async () => {
    setIsRunning(true);
    try {
      const result = await evaluatePolicy(policy, userContext, rowData);
      setSimulationResult(result);
    } finally {
      setIsRunning(false);
    }
  }, [policy, userContext, rowData, setSimulationResult]);

  // Run automatically on change for "instant feedback" feel
  useEffect(() => {
    void runSimulation();
  }, [runSimulation]);

  const explanation = simulationResult ? generateExplanation(simulationResult, "Policy") : "";

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
                  <div className="p-4 bg-muted/40 rounded-lg font-mono text-sm border border-muted/50 break-all leading-relaxed">
                    {simulationResult.evaluatedExpression}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Variables Used
                    </h4>
                    <div className="space-y-1">
                      {Object.entries(simulationResult.evaluatedValues).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-muted/30 transition-colors">
                          <code className="text-primary">{key}</code>
                          <code className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{String(val)}</code>
                        </div>
                      ))}
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
          <p className="text-sm leading-relaxed text-foreground/90">
            {explanation || "Configure your policy and user state to see a natural language explanation."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
