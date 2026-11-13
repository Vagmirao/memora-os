import React, { useState, useEffect } from 'react';
import { Clock, Filter, Search, Terminal, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { TimelineEvent, Memory } from '../types';
import { getTimeline, getMemory } from '../services/api';
import { Badge } from '../components/ui/Badge';

interface TimelinePageProps {
  onSelectMemory: (memory: Memory) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({
  onSelectMemory,
}) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    getTimeline().then(setEvents);
  }, []);

  const filteredEvents = events.filter((evt) => {
    if (filterType !== 'all' && evt.type !== filterType) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        evt.summary.toLowerCase().includes(q) ||
        evt.details.toLowerCase().includes(q) ||
        evt.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleEventClick = async (event: TimelineEvent) => {
  if (!event.memoryId) return;

  try {
    const memory = await getMemory(event.memoryId);

    if (memory) {
      onSelectMemory(memory);
    }
  } catch (error) {
    console.error('Failed to load memory from timeline event:', error);
  }
};
  return (
    <div className="p-4 flex flex-col gap-3 h-[calc(100vh-48px)] overflow-hidden font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-[#121416] p-3 border border-[#3b494b] rounded-[4px] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-[4px]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono text-[14px] font-bold text-[#e2e2e5] tracking-widest uppercase">
              CHRONOLOGICAL COGNITIVE LOGS
            </h1>
            <p className="font-mono text-[10px] text-[#849495]">
              RECORDED EVENTS: {events.length} | IMMUTABLE AUDIT TRAIL
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#0c0e10] p-0.5 border border-[#3b494b] rounded-[4px] font-mono text-[10px]">
            {['all', 'creation', 'update', 'archive'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 uppercase rounded-[2px] transition-colors ${
                  filterType === t
                    ? 'bg-[#00F0FF] text-[#0c0e10] font-bold'
                    : 'text-[#849495] hover:text-[#e2e2e5]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split View: Formatted Event Stream + Raw System Log */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Event Stream */}
        <div className="flex-1 bg-[#121416] border border-[#3b494b] p-4 rounded-[4px] overflow-y-auto space-y-4">
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2.5 top-0 bottom-0 w-[1px] bg-[#3b494b]/60" />

            {filteredEvents.map((evt) => (
              <div
  key={evt.id}
  onClick={() => handleEventClick(evt)}
  className="relative z-10 bg-[#1a1c1e] border border-[#3b494b]/60 p-3 rounded-[4px] space-y-2 hover:border-[#00F0FF]/40 hover:bg-[#202326] transition-all cursor-pointer"
  title={evt.memoryId ? 'Open associated memory' : 'System event'}
>
                <div className="absolute -left-6 top-3.5 w-2.5 h-2.5 rounded-full bg-[#00F0FF] border-2 border-[#121416]" />

                <div className="flex items-center justify-between font-mono text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#00F0FF] font-bold">{evt.rawLogId || evt.id}</span>
                    <Badge
                      variant={
                        evt.type === 'creation'
                          ? 'cyan'
                          : evt.type === 'update'
                          ? 'green'
                          : 'amber'
                      }
                    >
                      {evt.type}
                    </Badge>
                  </div>
                  <span className="text-[#849495]">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>

                <h3 className="font-sans text-[13px] font-semibold text-[#e2e2e5]">
                  {evt.summary}
                </h3>

                <p className="font-sans text-[12px] text-[#b9cacb] leading-relaxed">
                  {evt.details}
                </p>

                {/* Diff box if update */}
                {evt.previousValue && evt.newValue && (
                  <div className="bg-[#0c0e10] p-2.5 rounded-[2px] border border-[#3b494b]/40 font-mono text-[10px] space-y-1 mt-2">
                    <div className="text-red-400 line-through truncate">
                      - {evt.previousValue}
                    </div>
                    <div className="text-emerald-400 truncate">+ {evt.newValue}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Raw Terminal Log */}
        <div className="w-[340px] bg-[#0c0e10] border border-[#3b494b] p-3 rounded-[4px] flex flex-col font-mono text-[11px] shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-[#3b494b] text-[#00F0FF] mb-2 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> RAW AUDIT TELEMETRY
            </span>
            <span className="text-[9px] text-[#849495]">TTY / 01</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 text-[#849495] leading-snug">
            {filteredEvents.map((e) => (
              <div key={`raw-${e.id}`} className="border-b border-[#1e2022] pb-1.5">
                <div className="text-[#00F0FF] text-[9px]">
                  [{new Date(e.timestamp).toISOString()}]
                </div>
                <div className="text-[#e2e2e5] text-[10px]">{e.rawLogId}: {e.summary}</div>
                <div className="text-[9px] text-[#849495] truncate">{e.details}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
