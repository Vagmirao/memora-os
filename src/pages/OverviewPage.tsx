import React, { useState, useEffect } from 'react';
import { Activity, Database, Terminal, ShieldAlert, Cpu } from 'lucide-react';
import { TimelineEvent, Memory } from '../types';
import { getTimeline, getMemories, getAgent } from '../services/api';

interface OverviewPageProps {
  onNavigate: (path: string) => void;
  onSelectMemory: (memory: Memory) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate, onSelectMemory }) => {
  const [logs, setLogs] = useState<TimelineEvent[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState({
    totalMemories: 124,
    activePrefs: 12,
    knowledgeNodes: 86,
    coherence: 94.2,
    avgConf: 94,
    retrievalFreq: 1.2,
  });

  useEffect(() => {
    getTimeline().then(setLogs);
    getMemories().then(setMemories);
    getAgent().then((a) => {
      setStats({
        totalMemories: a.totalMemories,
        activePrefs: a.activePreferencesCount,
        knowledgeNodes: a.knowledgeNodesCount,
        coherence: a.coherenceScore,
        avgConf: a.avgConfidence,
        retrievalFreq: a.retrievalFrequency,
      });
    });
  }, []);

  return (
    <div className="p-4 flex flex-col gap-3 h-[calc(100vh-48px)] overflow-hidden font-sans">
      {/* Hero Stats Row */}
      <div className="flex gap-3 h-[140px] shrink-0">
        {/* Cognitive Pulse Box */}
        <div className="flex-1 bg-[#121416] border border-[#3b494b] flex flex-col p-4 relative overflow-hidden group rounded-[4px]">
          <div className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path
                d="M0,50 L5,45 L15,55 L25,30 L35,70 L45,40 L55,60 L65,20 L75,80 L85,45 L95,55 L100,50"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              >
                <animate
                  attributeName="d"
                  dur="3s"
                  repeatCount="indefinite"
                  values="M0,50 L5,45 L15,55 L25,30 L35,70 L45,40 L55,60 L65,20 L75,80 L85,45 L95,55 L100,50; M0,50 L10,60 L20,40 L30,80 L40,20 L50,60 L60,40 L70,70 L80,30 L90,55 L100,50; M0,50 L5,45 L15,55 L25,30 L35,70 L45,40 L55,60 L65,20 L75,80 L85,45 L95,55 L100,50"
                />
              </path>
              <path
                d="M0,50 L10,60 L20,40 L30,80 L40,20 L50,60 L60,40 L70,70 L80,30 L90,55 L100,50"
                fill="none"
                opacity="0.3"
                stroke="#b9cacb"
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div className="flex items-center gap-2 mb-auto relative z-10">
            <div className="w-1.5 h-1.5 bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] animate-pulse" />
            <span className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-wider font-bold">
              Cognitive Pulse
            </span>
          </div>

          <div className="relative z-10 mt-auto">
            <span className="font-sans text-[28px] font-bold text-[#00F0FF] block leading-none">
              {stats.coherence}%
            </span>
            <span className="font-mono text-[10px] text-[#849495] uppercase tracking-wider mt-1 block">
              System Coherence
            </span>
          </div>
        </div>

        {/* Database Schema Box */}
        <div className="w-[320px] bg-[#121416] border border-[#3b494b] flex flex-col p-4 rounded-[4px] shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-wider font-bold">
              Database Schema
            </span>
            <button
              onClick={() => onNavigate('memories')}
              className="font-mono text-[9px] text-[#00F0FF] hover:underline"
            >
              EXPLORE →
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="flex items-center justify-between group cursor-pointer" onClick={() => onNavigate('memories')}>
              <span className="font-mono text-[10px] text-[#849495] uppercase group-hover:text-[#e2e2e5] transition-colors">
                Total Memories
              </span>
              <span className="font-mono text-[12px] text-[#e2e2e5] font-semibold">
                {stats.totalMemories}
              </span>
            </div>
            <div className="h-[1px] w-full bg-[#3b494b]/40" />

            <div className="flex items-center justify-between group cursor-pointer" onClick={() => onNavigate('memories')}>
              <span className="font-mono text-[10px] text-[#849495] uppercase group-hover:text-[#e2e2e5] transition-colors">
                Active Prefs
              </span>
              <span className="font-mono text-[12px] text-[#00F0FF] font-semibold">
                {stats.activePrefs}
              </span>
            </div>
            <div className="h-[1px] w-full bg-[#3b494b]/40" />

            <div className="flex items-center justify-between group cursor-pointer" onClick={() => onNavigate('memories')}>
              <span className="font-mono text-[10px] text-[#849495] uppercase group-hover:text-[#e2e2e5] transition-colors">
                Knowledge Nodes
              </span>
              <span className="font-mono text-[12px] text-[#e2e2e5] font-semibold">
                {stats.knowledgeNodes}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Split: System Log + Confidence Distribution */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Recent System Log */}
        <div className="flex-1 bg-[#121416] border border-[#3b494b] p-4 flex flex-col overflow-hidden rounded-[4px]">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00F0FF]" />
              <span className="font-mono text-[11px] text-[#b9cacb] uppercase tracking-wider font-bold">
                System Log
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
              <span className="font-mono text-[10px] text-[#00F0FF] font-bold tracking-widest">
                LIVE
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 relative overflow-y-auto pr-2 flex-1">
            <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[1px] bg-[#3b494b]/60" />

            {logs.map((log) => {
              const matchingMem = memories.find((m) => m.id === log.memoryId);

              return (
                <div
                  key={log.id}
                  onClick={() => {
                    if (matchingMem) {
                      onSelectMemory(matchingMem);
                      onNavigate('memories');
                    }
                  }}
                  className="flex gap-3 relative z-10 group cursor-pointer hover:bg-[#1a1c1e] p-1.5 rounded-[2px] transition-colors"
                >
                  <div
                    className={`w-[7px] h-[7px] shrink-0 mt-1.5 rounded-[1px] ${
                      log.type === 'creation'
                        ? 'bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]'
                        : log.type === 'update'
                        ? 'bg-emerald-400'
                        : 'bg-[#849495]'
                    }`}
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[11px] text-[#849495]">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                      <span className="font-mono text-[10px] text-[#b9cacb] bg-[#1e2022] px-1 py-0.5 rounded-[2px] border border-[#3b494b]/40">
                        {log.rawLogId || log.id}
                      </span>
                    </div>
                    <span className="font-sans text-[12px] text-[#e2e2e5] leading-normal">
                      {log.summary}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confidence Distribution Box */}
        <div className="w-[320px] bg-[#121416] border border-[#3b494b] p-4 flex flex-col justify-between rounded-[4px] shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-wider font-bold">
              Confidence Dist
            </span>
            <button
              onClick={() => onNavigate('analytics')}
              className="font-mono text-[9px] text-[#849495] hover:text-[#00F0FF]"
            >
              ANALYTICS →
            </button>
          </div>

          {/* Bar Chart Simulation */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="flex items-end h-32 gap-2 mb-4">
              <div className="flex-1 bg-[#282a2c] h-[10%] relative group rounded-t-[1px]">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#849495] opacity-0 group-hover:opacity-100 transition-opacity">
                  0-20
                </div>
              </div>
              <div className="flex-1 bg-[#282a2c] h-[25%] relative group rounded-t-[1px]">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#849495] opacity-0 group-hover:opacity-100 transition-opacity">
                  21-40
                </div>
              </div>
              <div className="flex-1 bg-[#3b494b] h-[45%] relative group rounded-t-[1px]">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#849495] opacity-0 group-hover:opacity-100 transition-opacity">
                  41-60
                </div>
              </div>
              <div className="flex-1 bg-[#00F0FF]/60 h-[70%] relative group rounded-t-[1px]">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#00F0FF] opacity-0 group-hover:opacity-100 transition-opacity">
                  61-80
                </div>
              </div>
              <div className="flex-1 bg-[#00F0FF] h-[95%] relative group rounded-t-[1px] shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#00F0FF] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  81-100
                </div>
              </div>
            </div>

            <div className="flex justify-between border-t border-[#3b494b] pt-3">
              <div className="flex flex-col">
                <span className="font-mono text-[9px] text-[#849495] uppercase mb-0.5">
                  Avg Conf
                </span>
                <span className="font-mono text-[14px] text-[#00F0FF] font-bold">
                  {stats.avgConf}%
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="font-mono text-[9px] text-[#849495] uppercase mb-0.5">
                  Retrieval Freq
                </span>
                <span className="font-mono text-[14px] text-[#e2e2e5] font-bold">
                  {stats.retrievalFreq}
                  <span className="text-[#849495] text-[10px] ml-0.5">/s</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
