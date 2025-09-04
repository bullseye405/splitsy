import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

export interface DebtGraphNode {
  id: string;
  label: string;
  isCurrent?: boolean;
}

export interface DebtGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

interface DebtGraphProps {
  nodes: DebtGraphNode[];
  edges: DebtGraphEdge[];
}

export function DebtGraph({ nodes, edges }: DebtGraphProps) {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <ReactFlow
        nodes={nodes.map((n, idx) => ({
          id: n.id,
          type: 'default',
          data: { label: n.label },
          position: { x: 100 + idx * 200, y: 100 },
          style: {
            padding: 10,
            borderRadius: 8,
            background: n.isCurrent ? '#e0f2fe' : '#fff',
            border: n.isCurrent ? '2px solid #38bdf8' : '1px solid #ddd',
          },
        }))}
        edges={edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          animated: true,
          style: { stroke: '#f87171', strokeWidth: 2 },
          labelStyle: { fill: '#f87171', fontWeight: 600 },
          type: 'default',
        }))}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        panOnScroll={true}
        minZoom={0.5}
        maxZoom={2}
      >
        <MiniMap nodeColor={(n) => n.style?.background || '#fff'} />
        <Controls />
        <Background color="#f3f4f6" gap={16} />
      </ReactFlow>
    </div>
  );
}
