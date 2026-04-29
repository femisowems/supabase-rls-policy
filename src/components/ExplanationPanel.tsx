'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { generateExplanation } from '@/lib/engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Info, MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';

export function ExplanationPanel() {
  const { simulationResult } = useStore();
  const explanation = simulationResult ? generateExplanation(simulationResult, 'Policy') : [];

  const formatInsight = (message: string) => {
    const separatorIndex = message.indexOf(': ');

    if (separatorIndex > 0) {
      return {
        title: message.slice(0, separatorIndex),
        body: message.slice(separatorIndex + 2),
      };
    }

    return {
      title: null,
      body: message,
    };
  };

  return (
    <Card className="border-0 shadow-sm overflow-hidden bg-transparent">
      <CardHeader className="py-3 px-1 bg-transparent flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-medium">Explanation</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-1 pb-1 pt-0">
        <div className="space-y-4">
          {explanation.length > 0 ? (
            explanation.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-xl border px-4 py-3 shadow-sm ${
                  insight.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300' :
                  insight.type === 'failure' ? 'bg-rose-500/5 border-rose-500/20 text-rose-800 dark:text-rose-300' :
                  insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-800 dark:text-amber-300' :
                  'bg-blue-500/5 border-blue-500/20 text-blue-800 dark:text-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {insight.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                    {insight.type === 'failure' && <XCircle className="w-4 h-4" />}
                    {insight.type === 'warning' && <Info className="w-4 h-4" />}
                    {insight.type === 'info' && <MessageSquareText className="w-4 h-4" />}
                  </div>
                  <div className="space-y-1">
                    {(() => {
                      const { title, body } = formatInsight(insight.message);

                      return title ? (
                        <p className="text-sm leading-7 text-pretty">
                          <span className="font-semibold uppercase tracking-wide text-[0.72rem]">
                            {title}:
                          </span>{' '}
                          <span className="font-normal normal-case tracking-normal">
                            {body}
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm leading-7 text-pretty">{body}</p>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm leading-7 italic text-muted-foreground text-center py-4 text-pretty max-w-prose mx-auto">
              Configure your policy and user state to see a detailed explanation.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}