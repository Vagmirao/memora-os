import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Agent } from '../../types';

interface TopBarProps {
  agent: Agent;
  onOpenSearch: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ agent, onOpenSearch }) => {
  return (
    <header className="fixed top-0 left-[260px] right-0 h-12 bg-[#121416]/95 backdrop-blur-md z-40 border-b border-[#3b494b] flex items-center justify-between px-4 select-none">
      {/* Agent Status Bar */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
        <span className="font-mono text-[11px] tracking-wider text-[#b9cacb]">
          <span className="font-semibold text-[#e2e2e5]">{agent.name}</span>
          <span className="mx-2 text-[#3b494b]">|</span>
          <span className="text-[#00F0FF]">Memory system operational</span>
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 bg-[#1a1c1e] hover:bg-[#1e2022] hover:border-[#00F0FF]/40 border border-[#3b494b] px-2.5 py-1 rounded-[4px] transition-all cursor-pointer group"
        >
          <Search className="w-3.5 h-3.5 text-[#849495] group-hover:text-[#00F0FF] transition-colors" />
          <span className="font-mono text-[10px] text-[#849495] group-hover:text-[#e2e2e5]">
            CMD + K
          </span>
        </button>

        {/* Notifications */}
        <button
          title="System Notifications"
          className="relative p-1.5 text-[#b9cacb] hover:text-[#00F0FF] hover:bg-[#1e2022] rounded-[4px] transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#3b494b]">
          <img
            src={agent.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
            alt="User profile"
            className="w-6 h-6 rounded-[2px] object-cover border border-[#3b494b]"
          />
          <span className="font-mono text-[10px] text-[#b9cacb] hidden sm:inline">
            GUEST_01
          </span>
        </div>
      </div>
    </header>
  );
};
