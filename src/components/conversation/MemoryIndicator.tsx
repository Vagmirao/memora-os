import React, { useState } from 'react';
import { Database, PlusCircle, ChevronDown, ChevronUp, Sparkles, Brain } from 'lucide-react';
import { RetrievedMemoryRef, CreatedMemoryRef } from '../../types';

interface MemoryIndicatorProps {
  retrieved?: RetrievedMemoryRef[];
  created?: CreatedMemoryRef;
  onSelectMemoryId?: (id: string) => void;
}

export const MemoryIndicator: React.FC<MemoryIndicatorProps> = ({
  retrieved,
  created,
  onSelectMemoryId,
}) => {
  const [isCreatedExpanded, setIsCreatedExpanded] = useState(true);

  if (!retrieved?.length && !created) return null;

  return (
    <div className="flex flex-col gap-2 my-1">
      {/* Retrieved Memories Indicator */}
      {retrieved?.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelectMemoryId && onSelectMemoryId(item.id)}
          className="bg-[#121416] border border-[#00F0FF]/30 p-2.5 rounded-[4px] max-w-lg self-start flex flex-col gap-1 hover:border-[#00F0FF] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="font-mono text-[10px] text-[#00F0FF] uppercase tracking-wider font-semibold">
                MEMORY RETRIEVED: {item.category}
              </span>
            </div>
            <span className="font-mono text-[9px] text-[#849495]">ID: {item.id}</span>
          </div>
          <p className="font-mono text-[11px] text-[#e2e2e5] border-t border-[#3b494b]/40 pt-1 mt-0.5">
            "{item.snippet}"
          </p>
          <div className="flex gap-3 text-[9px] font-mono text-[#849495] mt-0.5">
            <span>CONF: {Math.round(item.confidence * 100)}%</span>
            <span>SRC: {item.src}</span>
            <span>AGE: {item.age}</span>
          </div>
        </div>
      ))}

      {/* Created Memory Indicator */}
      {created && (
        <div className="bg-[#121416] border border-emerald-500/50 p-2.5 rounded-[4px] max-w-lg self-start flex flex-col gap-1 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
          <div
            className="flex justify-between items-center cursor-pointer select-none"
            onClick={() => setIsCreatedExpanded(!isCreatedExpanded)}
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
                + MEMORY CREATED: {created.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-[#849495]">{created.id}</span>
              {isCreatedExpanded ? (
                <ChevronUp className="w-3 h-3 text-[#849495]" />
              ) : (
                <ChevronDown className="w-3 h-3 text-[#849495]" />
              )}
            </div>
          </div>

          {isCreatedExpanded && (
            <div className="border-t border-[#3b494b]/40 pt-1.5 mt-1 space-y-1">
              <p className="font-sans text-[12px] font-medium text-[#e2e2e5]">
                {created.title}
              </p>
              <p className="font-mono text-[11px] text-[#b9cacb] bg-[#1a1c1e] p-1.5 rounded-[2px] border border-[#3b494b]/40">
                "{created.content}"
              </p>
              <div className="flex gap-4 pt-1 font-mono text-[9px] text-[#849495]">
                <span>CONFIDENCE: {Math.round(created.confidence * 100)}%</span>
                <span>
                  IMPORTANCE:{' '}
                  <span className="text-amber-400">{created.importance}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
