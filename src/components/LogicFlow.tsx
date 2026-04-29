'use client';

import React, { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Handle,
  Node,
  Position,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import type { LogicTreeNode } from '@/store/useStore';

interface LogicFlowProps {
  tree: LogicTreeNode | null | undefined;
}

const outcomeStyles = {
  true: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  false: 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  null: 'border-border bg-background text-foreground',
} as const;

const CustomNode = ({ data }: any) => {
  const outcomeKey = data.outcome === true ? 'true' : data.outcome === false ? 'false' : 'null';

  return (
    <div className={`min-w-44 rounded-lg border-2 px-3 py-2 shadow-sm ${outcomeStyles[outcomeKey]}`}>
      <Handle type="target" position={Position.Top} className="h-2! w-2! border-0! bg-current!" />
      <div className="space-y-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
          {data.kind}
        </div>
        <div className="text-sm font-medium leading-snug">{data.label}</div>
        {data.value !== undefined && data.value !== null && (
          <div className="break-all font-mono text-[11px] opacity-80">{String(data.value)}</div>
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
          stroke: current.outcome === false ? '#f43f5e' : current.outcome === true ? '#10b981' : undefined,
        },
      });
    }

    current.children.forEach((child, index) => {
      const childOffset = xOffset + index - (current.children.length - 1) / 2;
      walk(child, depth + 1, childOffset, id);
    });
  };

  walk(tree, 0, 0);
  return { nodes, edges };
}

export function LogicFlow({ tree }: LogicFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const layout = useMemo(() => {
    if (!tree) return { nodes: [], edges: [] };
    return layoutTree(tree);
  }, [tree]);

  useEffect(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [layout, setNodes, setEdges]);

  if (!tree) return null;

  return (
    <div className="h-90 w-full overflow-hidden rounded-xl border bg-muted/10">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
      >
        <Background color="rgba(148, 163, 184, 0.35)" gap={18} />
        <Controls />
      </ReactFlow>
    </div>
  );
}