import React, { useEffect, useState } from 'react';
import {
  History,
  RotateCcw,
  Sparkles,
  Activity,
  Brain,
  GitBranch,
} from 'lucide-react';
import { HistoricalState, Memory } from '../types';
import { getHistoricalState, getMemories } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const periods = [
  {
    key: 'march-2026',
    label: 'MARCH 2026',
    description: 'Initial Core Calibration',
  },
  {
    key: 'may-2026',
    label: 'MAY 2026',
    description: 'Python / FastAPI Phase',
  },
  {
    key: 'august-2026',
    label: 'AUGUST 2026',
    description: 'Current Active State',
  },
];

export const TimeTravelPage: React.FC = () => {
  const [period, setPeriod] = useState('august-2026');
  const [histState, setHistState] = useState<HistoricalState | null>(null);
  const [activeMemories, setActiveMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistoricalState = async () => {
      setLoading(true);

      try {
        const state = await getHistoricalState(period);
        const memories = await getMemories();

        const matchingMemories = memories.filter((memory) =>
          state.activeNodeIds.includes(memory.id)
        );

        setHistState(state);
        setActiveMemories(matchingMemories);
      } catch (error) {
        console.error('Failed to reconstruct historical state:', error);
        setHistState(null);
        setActiveMemories([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistoricalState();
  }, [period]);

  const currentPeriod = periods.find((item) => item.key === period);

  return (
    <div className="p-4 flex flex-col gap-3 h-[calc(100vh-48px)] overflow-hidden font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-[#121416] p-3 border border-[#3b494b] rounded-[4px] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-[4px]">
            <History className="w-5 h-5" />
          </div>

          <div>
            <h1 className="font-mono text-[14px] font-bold text-[#e2e2e5] tracking-widest uppercase">
              TEMPORAL STATE RECONSTRUCTION
            </h1>

            <p className="font-mono text-[10px] text-[#849495]">
              RECONSTRUCT ARIA'S COGNITIVE STATE ACROSS TIME
            </p>
          </div>
        </div>

        <div className="flex bg-[#0c0e10] p-1 border border-[#3b494b] rounded-[4px]">
          {periods.map((item) => (
            <button
              key={item.key}
              onClick={() => setPeriod(item.key)}
              className={`px-3 py-1.5 rounded-[2px] font-mono text-[9px] transition-all ${
                period === item.key
                  ? 'bg-[#00F0FF] text-[#0c0e10] font-bold'
                  : 'text-[#849495] hover:text-[#e2e2e5]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-[#121416] border border-[#3b494b] rounded-[4px]">
          <div className="font-mono text-[11px] text-[#00F0FF] animate-pulse">
            RECONSTRUCTING COGNITIVE STATE...
          </div>
        </div>
      ) : histState ? (
        <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
          {/* HISTORICAL STATE */}
          <div className="flex-1 bg-[#121416] border border-[#3b494b] rounded-[4px] p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between border-b border-[#3b494b] pb-3 shrink-0">
              <div>
                <span className="font-mono text-[10px] text-[#00F0FF] uppercase tracking-wider font-bold block">
                  HISTORICAL STATE
                </span>

                <span className="font-sans text-[16px] font-semibold text-[#e2e2e5]">
                  {histState.monthYearLabel}
                </span>

                <p className="font-mono text-[9px] text-[#849495] mt-1">
                  {currentPeriod?.description}
                </p>
              </div>

              <Badge variant="cyan">
                {period === 'august-2026' ? 'CURRENT' : 'HISTORICAL'}
              </Badge>
            </div>

            {/* STATE METRICS */}
            <div className="grid grid-cols-4 gap-2 py-3 shrink-0">
              <div className="bg-[#0c0e10] border border-[#3b494b] p-2 rounded-[2px]">
                <div className="font-mono text-[8px] text-[#849495]">
                  MEMORY COUNT
                </div>
                <div className="font-mono text-[18px] text-[#00F0FF] font-bold">
                  {histState.memoryCount}
                </div>
              </div>

              <div className="bg-[#0c0e10] border border-[#3b494b] p-2 rounded-[2px]">
                <div className="font-mono text-[8px] text-[#849495]">
                  ACTIVE PREFS
                </div>
                <div className="font-mono text-[18px] text-[#00F0FF] font-bold">
                  {histState.activePreferencesCount}
                </div>
              </div>

              <div className="bg-[#0c0e10] border border-[#3b494b] p-2 rounded-[2px]">
                <div className="font-mono text-[8px] text-[#849495]">
                  COHERENCE
                </div>
                <div className="font-mono text-[18px] text-[#00F0FF] font-bold">
                  {histState.cognitiveCoherencePct}%
                </div>
              </div>

              <div className="bg-[#0c0e10] border border-[#3b494b] p-2 rounded-[2px]">
                <div className="font-mono text-[8px] text-[#849495]">
                  RECON CONFIDENCE
                </div>
                <div className="font-mono text-[18px] text-[#00F0FF] font-bold">
                  {histState.reconstructionConfidencePct}%
                </div>
              </div>
            </div>

            {/* MEMORY TOPOGRAPHY */}
            <div className="flex-1 overflow-y-auto border-t border-[#3b494b] pt-3">
              <div className="flex items-center gap-2 mb-3">
                <GitBranch className="w-4 h-4 text-[#00F0FF]" />

                <span className="font-mono text-[10px] text-[#00F0FF] font-bold uppercase">
                  ACTIVE MEMORY TOPOGRAPHY
                </span>

                <span className="font-mono text-[9px] text-[#849495]">
                  {histState.activeNodeIds.length} reconstructed nodes
                </span>
              </div>

              {activeMemories.length > 0 ? (
                <div className="space-y-2">
                  {activeMemories.map((memory) => (
                    <div
                      key={memory.id}
                      className="bg-[#1a1c1e] border border-[#3b494b]/60 p-3 rounded-[4px] hover:border-[#00F0FF]/40 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] text-[#00F0FF]">
                          #{memory.id}
                        </span>

                        <Badge variant="cyan">
                          {memory.category}
                        </Badge>
                      </div>

                      <h3 className="font-sans text-[12px] font-semibold text-[#e2e2e5] mt-1">
                        {memory.title}
                      </h3>

                      <p className="font-sans text-[11px] text-[#b9cacb] mt-1 leading-relaxed">
                        {memory.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border border-dashed border-[#3b494b] text-center">
                  <span className="font-mono text-[10px] text-[#849495]">
                    NO DIRECT MEMORY NODES AVAILABLE FOR THIS SNAPSHOT
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-[360px] bg-[#121416] border border-[#3b494b] rounded-[4px] p-4 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              <div className="border-b border-[#3b494b] pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#00F0FF]" />

                  <span className="font-mono text-[10px] text-[#00F0FF] font-bold uppercase">
                    COGNITIVE STATE
                  </span>
                </div>
              </div>

              {/* PERSONALITY STATE */}
              <div>
                <span className="font-mono text-[9px] text-[#849495] uppercase">
                  Behavioral Profile
                </span>

                <div className="space-y-2 mt-2">
                  {[
                    ['Warmth', histState.warmthPct],
                    ['Humor', histState.humorPct],
                    ['Verbosity', histState.verbosityPct],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <div className="flex justify-between font-mono text-[9px]">
                        <span className="text-[#b9cacb]">
                          {label}
                        </span>

                        <span className="text-[#00F0FF]">
                          {value}%
                        </span>
                      </div>

                      <div className="h-1.5 bg-[#0c0e10] border border-[#3b494b] mt-1">
                        <div
                          className="h-full bg-[#00F0FF]"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STATE SUMMARY */}
              <div className="p-3 bg-[#0c0e10] border border-[#3b494b] rounded-[2px]">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-3.5 h-3.5 text-[#00F0FF]" />

                  <span className="font-mono text-[9px] text-[#00F0FF] font-bold">
                    HISTORICAL BASELINE
                  </span>
                </div>

                <p className="font-sans text-[11px] text-[#b9cacb] leading-relaxed">
                  {histState.baselineSummary}
                </p>
              </div>

              <div className="p-3 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-[2px]">
                <div className="font-mono text-[9px] text-[#00F0FF] font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  TEMPORAL FORK AVAILABLE
                </div>

                <p className="font-sans text-[10px] text-[#b9cacb] mt-1 leading-relaxed">
                  This historical state can be used as a simulation
                  context without overwriting the current memory system.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#3b494b]">
              <Button
                variant="primary"
                className="w-full"
                size="md"
                onClick={() => {
                  console.log(
                    'Temporal fork requested for:',
                    histState.timestamp
                  );
                }}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                SIMULATE THIS STATE
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#121416] border border-[#3b494b] rounded-[4px]">
          <span className="font-mono text-[11px] text-red-400">
            TEMPORAL RECONSTRUCTION FAILED
          </span>
        </div>
      )}
    </div>
  );
};