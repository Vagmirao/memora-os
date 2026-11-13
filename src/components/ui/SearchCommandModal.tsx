import React, { useState, useEffect } from 'react';
import { Search, Database, Clock, Terminal, User, Sparkles, X, ChevronRight } from 'lucide-react';
import { Memory } from '../../types';
import { getMemories } from '../../services/api';

interface SearchCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onSelectMemory?: (memory: Memory) => void;
}

export const SearchCommandModal: React.FC<SearchCommandModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectMemory,
}) => {
  const [query, setQuery] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    if (isOpen) {
      getMemories({ search: query }).then(setMemories);
    }
  }, [isOpen, query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered by top bar or global shortcut
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredMemories = memories.slice(0, 5);

  const pages = [
    { name: 'Overview', path: 'overview', icon: Terminal, desc: 'Cognitive pulse, logs, schema' },
    { name: 'Conversation', path: 'conversation', icon: Sparkles, desc: 'Memory-aware AI chat' },
    { name: 'Memories Explorer', path: 'memories', icon: Database, desc: 'List, graph & category filter' },
    { name: 'Timeline', path: 'timeline', icon: Clock, desc: 'Chronological cognitive logs' },
    { name: 'Time Travel', path: 'time-travel', icon: Clock, desc: 'Temporal state reconstruction' },
    { name: 'Personality Matrix', path: 'personality', icon: User, desc: 'Behavioral traits & drift' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#121416] border border-[#00F0FF]/40 rounded-[4px] w-full max-w-2xl shadow-[0_0_30px_rgba(0,240,255,0.15)] overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#3b494b] bg-[#1a1c1e]">
          <Search className="w-4 h-4 text-[#00F0FF] mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cognitive nodes, memories, or navigate... (Cmd + K)"
            className="w-full bg-transparent font-mono text-[13px] text-[#e2e2e5] placeholder-[#849495] outline-none"
          />
          <button onClick={onClose} className="text-[#849495] hover:text-[#e2e2e5] ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-4">
          {/* Quick Nav Options */}
          <div>
            <div className="font-mono text-[10px] text-[#849495] uppercase tracking-wider px-3 py-1">
              System Views
            </div>
            <div className="space-y-0.5 mt-1">
              {pages
                .filter(
                  (p) =>
                    p.name.toLowerCase().includes(query.toLowerCase()) ||
                    p.desc.toLowerCase().includes(query.toLowerCase())
                )
                .map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.path}
                      onClick={() => {
                        onNavigate(page.path);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#1e2022] hover:text-[#00F0FF] group transition-colors rounded-[2px]"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#b9cacb] group-hover:text-[#00F0FF]" />
                        <div>
                          <div className="font-mono text-[12px] font-medium text-[#e2e2e5] group-hover:text-[#00F0FF]">
                            {page.name}
                          </div>
                          <div className="font-sans text-[11px] text-[#849495]">
                            {page.desc}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#849495] group-hover:text-[#00F0FF]" />
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Memory Results */}
          {filteredMemories.length > 0 && (
            <div>
              <div className="font-mono text-[10px] text-[#849495] uppercase tracking-wider px-3 py-1 border-t border-[#3b494b]/40 pt-3">
                Matching Memory Nodes ({filteredMemories.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredMemories.map((mem) => (
                  <button
                    key={mem.id}
                    onClick={() => {
                      if (onSelectMemory) onSelectMemory(mem);
                      onNavigate('memories');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#1e2022] border border-transparent hover:border-[#3b494b] group transition-all rounded-[2px]"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#849495]">
                          #{mem.id}
                        </span>
                        <span className="font-mono text-[10px] text-[#00F0FF] bg-[#00F0FF]/10 px-1 py-0.5 rounded-[2px]">
                          {mem.category}
                        </span>
                      </div>
                      <div className="font-sans text-[12px] text-[#e2e2e5] group-hover:text-[#00F0FF] truncate mt-0.5">
                        {mem.title}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-[#b9cacb] shrink-0">
                      v{mem.version}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#3b494b] bg-[#121416] flex items-center justify-between font-mono text-[10px] text-[#849495]">
          <span>Navigation: Up/Down</span>
          <span>Select: Enter</span>
          <span>Close: Esc</span>
        </div>
      </div>
    </div>
  );
};
