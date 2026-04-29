'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Handle,
  Node,
  Position,
  useEdgesState,
  useNodesState,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import type { LogicTreeNode } from '@/store/useStore';

interface LogicFlowProps {
  tree: LogicTreeNode | null | undefined;
}

const outcomeStyles = {
  true: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  false: 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  null: 'border-border bg-background text-foreground',
} as const;

const CustomNode = ({ data }: NodeProps<LogicTreeNode>) => {
  const outcomeKey = data.outcome === true ? 'true' : data.outcome === false ? 'false' : 'null';

  return (
    <div className={`min-w-44 rounded-lg border-2 px-3 py-2 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer ${outcomeStyles[outcomeKey]}`}>
      <Handle type="target" position={Position.Top} className="h-2! w-2! border-0! bg-current!" />
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
            {data.kind}
          </div>
          {data.outcome !== null && (
            <div className={`h-1.5 w-1.5 rounded-full ${data.outcome ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          )}
        </div>
        <div className="text-sm font-medium leading-snug">{data.label}</div>
        {data.value !== undefined && data.value !== null && (
          <div className="truncate font-mono text-[10px] opacity-80">{String(data.value)}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="h-2! w-2! border-0! bg-current!" />
    </div>
  );
};

const nodeTypes = {
  logic: CustomNode,
};

function layoutTree(tree: LogicTreeNode) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const walk = (current: LogicTreeNode, depth: number, xOffset: number, parentId?: string) => {
    const id = current.id;
    nodes.push({
      id,
      type: 'logic',
      data: current,
      position: { x: xOffset * 220, y: depth * 110 },
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${id}`,
        source: parentId,
        target: id,
        animated: current.outcome === true,
        style: {
          stroke: current.outcome === false ? '#f43f5e' : current.outcome === true ? '#10b981' : '#94a3b8',
          strokeWidth: 2,
        },
      });
    }

    current.children.forEach((child, index) => {
      const childOffset = xOffset + (index - (current.children.length - 1) / 2) * 1.2;
      walk(child, depth + 1, childOffset, id);
    });
  };

  walk(tree, 0, 0);
  return { nodes, edges };
}

export function LogicFlow({ tree }: LogicFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<LogicTreeNode | null>(null);

  const layout = useMemo(() => {
    if (!tree) return { nodes: [], edges: [] };
    return layoutTree(tree);
  }, [tree]);

  useEffect(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [layout, setNodes, setEdges]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data);
  };

  if (!tree) return null;

  return (
    <>
      <div className="h-90 w-full overflow-hidden rounded-xl border bg-muted/10 shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.3}
        >
          <Background color="rgba(148, 163, 184, 0.35)" gap={18} />
          <Controls />
        </ReactFlow>
      </div>

      <Sheet open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
        <SheetContent>
          <SheetHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="uppercase tracking-widest text-[10px]">
                {selectedNode?.kind}
              </Badge>
              {selectedNode?.outcome !== null && (
                <Badge variant={selectedNode?.outcome ? 'default' : 'destructive'} className="text-[10px]">
                  {selectedNode?.outcome ? 'PASSED' : 'FAILED'}
                </Badge>
              )}
            </div>
            <SheetTitle className="text-xl font-bold">{selectedNode?.label}</SheetTitle>
            <SheetDescription>
              Detailed evaluation for this logic node.
            </SheetDescription>
          </SheetHeader>
          
          <Separator className="my-6" />

          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Result Value</h4>
              <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all border">
                {selectedNode?.value !== undefined ? String(selectedNode.value) : 'N/A'}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Context</h4>
              <p className="text-xs text-muted-foreground">
                This node represents a <strong>{selectedNode?.kind}</strong> operation in the SQL expression.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}