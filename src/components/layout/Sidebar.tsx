import React from 'react';
import {
  Cpu,
  LayoutDashboard,
  MessageSquare,
  Database,
  ListOrdered,
  History,
  Brain,
  BarChart2,
  Terminal,
  Settings,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { Agent } from '../../types';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  agent: Agent;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, agent }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'conversation', label: 'Conversation', icon: MessageSquare },
    { id: 'memories', label: 'Memories', icon: Database },
    { id: 'timeline', label: 'Timeline', icon: ListOrdered },
    { id: 'time-travel', label: 'Time Travel', icon: History },
    { id: 'personality', label: 'Personality', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  const bottomNavItems = [
    { id: 'system', label: 'System', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-[#0c0e10] z-50 flex flex-col border-r border-[#3b494b] select-none">
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-[#3b494b]">
        <div className="w-8 h-8 bg-[#121416] border border-[#00F0FF]/40 rounded-[4px] flex items-center justify-center text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.15)] shrink-0">
          <Cpu className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[14px] font-bold text-[#00F0FF] tracking-widest uppercase">
            MEMORA
          </span>
          <span className="font-mono text-[10px] text-[#849495] tracking-wider">
            {agent.version || 'NEURAL INTERFACE v4.0'}
          </span>
        </div>
      </div>

      {/* Agent Selector Card */}
      <div className="p-4">
        <div className="bg-[#121416] flex items-center gap-3 p-3 rounded-[4px] border border-[#3b494b] hover:border-[#00F0FF]/40 transition-all cursor-pointer group">
          <div className="w-8 h-8 rounded-[4px] bg-[#1e2022] border border-[#3b494b] flex items-center justify-center text-[#00F0FF] group-hover:shadow-[0_0_8px_rgba(0,240,255,0.3)] transition-all shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-sans text-[12px] font-medium text-[#e2e2e5] truncate">
              {agent.name} Agent
            </span>
            <span className="font-mono text-[10px] text-[#00F0FF] font-semibold tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
              {agent.status}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-[#849495] group-hover:text-[#e2e2e5] transition-colors" />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center px-3 py-2 rounded-[4px] text-left transition-all duration-150 group cursor-pointer ${
                isActive
                  ? 'bg-[#00F0FF]/10 text-[#00F0FF] font-semibold border-l-2 border-[#00F0FF] shadow-[inset_2px_0_0_0_#00F0FF]'
                  : 'text-[#b9cacb] hover:bg-[#1a1c1e] hover:text-[#e2e2e5] border-l-2 border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 mr-3 shrink-0 transition-colors ${
                  isActive ? 'text-[#00F0FF]' : 'text-[#849495] group-hover:text-[#00F0FF]'
                }`}
              />
              <span className="font-mono text-[11px] tracking-wider uppercase">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Utility Navigation */}
      <div className="p-3 border-t border-[#3b494b] space-y-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center px-3 py-1.5 rounded-[4px] text-left transition-all group cursor-pointer ${
                isActive
                  ? 'bg-[#1e2022] text-[#00F0FF] font-semibold'
                  : 'text-[#849495] hover:text-[#e2e2e5] hover:bg-[#121416]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 mr-3 shrink-0 text-[#849495] group-hover:text-[#e2e2e5]" />
              <span className="font-mono text-[10px] tracking-widest uppercase">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
