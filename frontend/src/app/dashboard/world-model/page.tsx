'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType
} from 'reactflow';
import { useDashboard } from '@/components/dashboard-context';
import { api } from '@/lib/api';
import { GitFork, Info, HelpCircle, Activity } from 'lucide-react';

export default function WorldModelPage() {
  const { cityState } = useDashboard();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchGraphData = useCallback(async () => {
    try {
      const data = await api.getWorldModel();
      
      // Map raw API nodes to React Flow nodes with positions
      const rfNodes = data.nodes.map((n: any) => {
        let borderColor = 'border-emerald-500/30';
        let bgGlow = 'rgba(16, 185, 129, 0.05)';
        
        if (n.status === 'Warning' || n.status === 'Overloaded') {
          borderColor = 'border-amber-500/50';
          bgGlow = 'rgba(245, 158, 11, 0.08)';
        } else if (n.status === 'Outage') {
          borderColor = 'border-rose-500/50';
          bgGlow = 'rgba(239, 68, 68, 0.1)';
        }

        return {
          id: n.id,
          position: { x: n.x, y: n.y },
          data: { 
            label: (
              <div 
                className={`px-4 py-2.5 rounded-xl border glass text-left shadow-lg transition-all ${borderColor}`}
                style={{ backgroundColor: bgGlow }}
              >
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">{n.type}</div>
                <div className="font-bold text-white text-xs mt-0.5">{n.label}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    n.status === 'Normal' ? 'bg-emerald-400' : (n.status === 'Warning' || n.status === 'Overloaded' ? 'bg-amber-400' : 'bg-rose-500 animate-pulse')
                  }`} />
                  <span className="text-[9px] font-bold text-neutral-400">{n.status}</span>
                </div>
              </div>
            ),
            raw: n
          },
          style: { background: 'transparent', border: 'none', padding: 0 }
        };
      });

      // Map raw API edges to React Flow edges with smooth step styling
      const rfEdges = data.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        type: 'smoothstep',
        animated: e.relationship === 'supplies' || e.relationship === 'affects',
        style: { stroke: 'rgba(255, 255, 255, 0.15)', strokeWidth: 1.5 },
        labelStyle: { fill: 'rgba(255,255,255,0.4)', fontSize: 8, fontStyle: 'italic', fontWeight: 600 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'rgba(255, 255, 255, 0.15)',
          width: 12,
          height: 12
        }
      }));

      setNodes(rfNodes);
      setEdges(rfEdges);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  // Load and refresh graph data whenever cityState changes (to keep metrics in sync!)
  useEffect(() => {
    fetchGraphData();
  }, [cityState, fetchGraphData]);

  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node.data.raw);
  };

  return (
    <div className="space-y-6">
      {/* Top Description Panel */}
      <div className="p-5 glass border rounded-2xl bg-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GitFork className="w-5 h-5 text-emerald-400" />
            <span>Infrastructure Dependency Graph</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl leading-relaxed">
            The city world model acts as a directed dependency graph. Check how weather patterns impact reservoir gates, traffic bottlenecks divert ambulance routes, and energy loads supply hospital wards.
          </p>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* React Flow Board (3/4 width) */}
        <div className="lg:col-span-3 h-[70vh] border border-white/10 rounded-2xl overflow-hidden glass shadow-xl relative bg-slate-950/45">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 text-sm gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              <span>Constructing World Graph coordinates...</span>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
              attributionPosition="bottom-left"
            >
              <Controls className="bg-slate-900 border border-white/10 rounded-lg text-white" />
              <MiniMap 
                nodeColor={() => 'rgba(16, 185, 129, 0.2)'} 
                maskColor="rgba(0, 0, 0, 0.7)"
                className="bg-slate-950 border border-white/10 rounded-lg"
              />
              <Background gap={16} size={1} color="rgba(255,255,255,0.05)" />
            </ReactFlow>
          )}
        </div>

        {/* Selected Entity Specs (1/4 width) */}
        <div className="space-y-4">
          <div className="glass border rounded-2xl p-5 h-full flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="font-bold text-white text-sm border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-emerald-400" />
                <span>Node inspector</span>
              </h3>
              
              {selectedNode ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold block">Entity Name</span>
                    <h4 className="font-bold text-white text-sm mt-1">{selectedNode.label}</h4>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold block">Status</span>
                    <span className={`inline-flex items-center gap-1.5 mt-1 font-bold ${
                      selectedNode.status === 'Normal' ? 'text-emerald-400' : (selectedNode.status === 'Outage' ? 'text-rose-400' : 'text-amber-400')
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        selectedNode.status === 'Normal' ? 'bg-emerald-400' : (selectedNode.status === 'Outage' ? 'bg-rose-500' : 'bg-amber-400')
                      }`} />
                      {selectedNode.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold block mb-2">Metrics Data</span>
                    <div className="space-y-1.5">
                      {Object.entries(selectedNode.metrics).map(([key, val]: any) => (
                        <div key={key} className="flex justify-between p-2 rounded bg-black/20 border border-white/5">
                          <span className="text-neutral-400 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-white font-bold">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500 text-xs">
                  Select a graph node in the viewport to audit its dependencies.
                </div>
              )}
            </div>

            <div className="p-3 border border-white/5 rounded-xl bg-violet-600/5 flex gap-2 text-xs mt-4">
              <HelpCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Nodes are draggable. Connected animated paths represent active energy/resource flows between nodes.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
