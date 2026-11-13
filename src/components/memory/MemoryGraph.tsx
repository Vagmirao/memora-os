import React, { useState } from 'react';
import { Memory, MemoryCategory } from '../../types';

interface MemoryGraphProps {
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
}

export const MemoryGraph: React.FC<MemoryGraphProps> = ({ memories, onSelectMemory }) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const categories: MemoryCategory[] = [
    'Preferences',
    'Knowledge',
    'Experiences',
    'Skills',
    'Identity',
    'Relationships',
    'Behavioral Patterns',
  ];

  // Cluster positions in % relative to center (50%, 50%)
  const clusterPositions: Record<MemoryCategory, { x: number; y: number; color: string }> = {
    Preferences: { x: 30, y: 30, color: '#00F0FF' },
    Knowledge: { x: 70, y: 32, color: '#c6c6c9' },
    Experiences: { x: 45, y: 75, color: '#e0e3e8' },
    Skills: { x: 75, y: 70, color: '#7df4ff' },
    Identity: { x: 25, y: 65, color: '#f3f5fb' },
    Relationships: { x: 50, y: 20, color: '#b9cacb' },
    'Behavioral Patterns': { x: 80, y: 48, color: '#849495' },
  };

  const getHoverState = (nodeId: string, relatedIds: string[] = []) => {
    if (!hoveredNodeId) return 'normal';
    if (hoveredNodeId === nodeId || hoveredNodeId === 'aria') return 'active';
    if (relatedIds.includes(hoveredNodeId)) return 'active';
    return 'dimmed';
  };

  return (
    <div className="w-full h-full bg-[#0c0e10] border border-[#3b494b] rounded-[4px] relative overflow-hidden flex items-center justify-center min-h-[550px] select-none">
      {/* Background SVG Grid & Edges */}
      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        {/* Background radar rings */}
        <circle cx="50%" cy="50%" r="120" fill="none" stroke="#3b494b" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />
        <circle cx="50%" cy="50%" r="220" fill="none" stroke="#3b494b" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.2" />

        {/* Lines from ARIA center to Category Clusters */}
        {categories.map((cat) => {
          const pos = clusterPositions[cat];
          const hoverState = getHoverState(cat);

          return (
            <line
              key={`edge-center-${cat}`}
              x1="50%"
              y1="50%"
              x2={`${pos.x}%`}
              y2={`${pos.y}%`}
              stroke={hoverState === 'dimmed' ? '#1a1c1e' : pos.color}
              strokeWidth={hoverState === 'active' ? '2' : '1'}
              strokeDasharray="3,3"
              opacity={hoverState === 'dimmed' ? 0.15 : 0.4}
              className="transition-all duration-300"
            />
          );
        })}

        {/* Lines from Category Clusters to Individual Memory Nodes */}
        {memories.map((m, idx) => {
          const catPos = clusterPositions[m.category] || { x: 50, y: 50 };
          // Offset calculation based on index
          const angle = (idx * 0.8) % (Math.PI * 2);
          const dist = 6 + (idx % 3) * 4;
          const nodeX = catPos.x + Math.cos(angle) * dist;
          const nodeY = catPos.y + Math.sin(angle) * dist;

          const isHovered = hoveredNodeId === m.id || hoveredNodeId === m.category;

          return (
            <line
              key={`edge-mem-${m.id}`}
              x1={`${catPos.x}%`}
              y1={`${catPos.y}%`}
              x2={`${nodeX}%`}
              y2={`${nodeY}%`}
              stroke={isHovered ? '#00F0FF' : '#3b494b'}
              strokeWidth={isHovered ? '1.5' : '0.8'}
              opacity={hoveredNodeId && !isHovered ? 0.1 : 0.5}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>

      {/* Nodes Container */}
      <div className="relative w-full h-full z-20">
        {/* Central Core Node: ARIA */}
        <div
          onMouseEnter={() => setHoveredNodeId('aria')}
          onMouseLeave={() => setHoveredNodeId(null)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer group z-30"
        >
          <div className="w-20 h-20 rounded-full border border-[#00F0FF]/60 bg-[#121416] flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.2)] group-hover:scale-105 group-hover:border-[#00F0FF]">
            <div className="w-16 h-16 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 flex items-center justify-center">
              <span className="font-mono text-[14px] font-bold text-[#00F0FF] tracking-wider">
                ARIA
              </span>
            </div>
          </div>
          <div className="mt-1 bg-[#1e2022] px-2 py-0.5 rounded-[2px] border border-[#3b494b] font-mono text-[9px] text-[#00F0FF] tracking-wider">
            CORE COGNITIVE MATRIX
          </div>
        </div>

        {/* Category Cluster Nodes */}
        {categories.map((cat) => {
          const pos = clusterPositions[cat];
          const count = memories.filter((m) => m.category === cat).length;
          const state = getHoverState(cat);

          return (
            <div
              key={cat}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onMouseEnter={() => setHoveredNodeId(cat)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer group transition-all duration-300 z-20 ${
                state === 'dimmed' ? 'opacity-20 grayscale' : 'opacity-100'
              }`}
            >
              <div
                className="w-12 h-12 rounded-full bg-[#121416] border flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                style={{ borderColor: pos.color }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-[10px] font-bold"
                  style={{ backgroundColor: `${pos.color}20`, color: pos.color }}
                >
                  {count}
                </div>
              </div>
              <span className="mt-1 font-mono text-[10px] text-[#e2e2e5] bg-[#121416]/90 px-1.5 py-0.5 rounded-[2px] border border-[#3b494b]/50 whitespace-nowrap">
                {cat}
              </span>
            </div>
          );
        })}

        {/* Memory Item Sub-Nodes */}
        {memories.map((m, idx) => {
          const catPos = clusterPositions[m.category] || { x: 50, y: 50 };
          const angle = (idx * 0.8) % (Math.PI * 2);
          const dist = 6 + (idx % 3) * 4;
          const nodeX = catPos.x + Math.cos(angle) * dist;
          const nodeY = catPos.y + Math.sin(angle) * dist;

          const isHovered = hoveredNodeId === m.id;
          const isDimmed = hoveredNodeId && hoveredNodeId !== m.id && hoveredNodeId !== m.category;

          return (
            <div
              key={m.id}
              style={{ left: `${nodeX}%`, top: `${nodeY}%` }}
              onClick={() => onSelectMemory(m)}
              onMouseEnter={() => setHoveredNodeId(m.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-20 ${
                isDimmed ? 'opacity-20' : 'opacity-100'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  isHovered
                    ? 'bg-[#00F0FF] border-[#00F0FF] scale-150 shadow-[0_0_10px_#00F0FF]'
                    : 'bg-[#1e2022] border-[#3b494b] hover:border-[#00F0FF]'
                }`}
              />

              {/* Tooltip on Hover */}
              {isHovered && (
                <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 bg-[#121416] border border-[#00F0FF] p-2 rounded-[4px] shadow-2xl w-56 z-50 pointer-events-none">
                  <div className="font-mono text-[9px] text-[#00F0FF] flex justify-between">
                    <span>#{m.id}</span>
                    <span>v{m.version}</span>
                  </div>
                  <div className="font-sans text-[11px] font-medium text-[#e2e2e5] mt-0.5 line-clamp-2">
                    {m.title}
                  </div>
                  <div className="font-mono text-[9px] text-[#849495] mt-1 flex justify-between border-t border-[#3b494b]/40 pt-1">
                    <span>CONF: {Math.round(m.confidence * 100)}%</span>
                    <span>WEIGHT: {Math.round(m.weight * 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Graph Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-[#121416]/90 border border-[#3b494b] p-2.5 rounded-[4px] z-30 font-mono text-[10px] space-y-1">
        <div className="text-[#849495] uppercase tracking-wider font-bold mb-1">
          Topology Legend
        </div>
        <div className="flex items-center gap-2 text-[#b9cacb]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] inline-block" />
          <span>Core Matrix Node (ARIA)</span>
        </div>
        <div className="flex items-center gap-2 text-[#b9cacb]">
          <span className="w-2 h-2 rounded-full border border-[#00F0FF] bg-[#1e2022] inline-block" />
          <span>Cognitive Category Cluster</span>
        </div>
        <div className="flex items-center gap-2 text-[#b9cacb]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3b494b] inline-block" />
          <span>Living Memory Node (Click to inspect)</span>
        </div>
      </div>
    </div>
  );
};
