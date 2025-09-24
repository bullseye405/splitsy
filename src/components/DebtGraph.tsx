import ReactFlow, {
  Controls,
  Edge,
  MiniMap,
  Node
} from 'reactflow';
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
  // Circle layout
  const radius = 200;
  const centerX = 300;
  const centerY = 300;

  const circularNodes: Node[] = nodes.map((n, idx) => {
    const angle = (2 * Math.PI * idx) / nodes.length;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    return {
      id: n.id,
      type: 'default',
      data: { label: n.label },
      position: { x, y },
      style: {
        padding: 10,
        borderRadius: 8,
        background: n.isCurrent ? '#e0f2fe' : '#fff',
        border: n.isCurrent ? '2px solid #38bdf8' : '1px solid #ddd',
      },
    };
  });

  const styledEdges: Edge[] = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
  }));

  return (
    <div style={{ width: '100%', height: 600 }}>
      <ReactFlow
        nodes={circularNodes}
        edges={styledEdges}
        fitView
      >
        <MiniMap nodeColor={(n) => String(n.style?.background ?? '#fff')} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
