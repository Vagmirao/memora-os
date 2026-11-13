import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SearchCommandModal } from '../ui/SearchCommandModal';
import { Agent, Memory } from '../../types';
import { getAgent, memoraStorage } from '../../services/api';

interface AppShellProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onSelectMemoryForDetail?: (memory: Memory) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentPath,
  onNavigate,
  onSelectMemoryForDetail,
  children,
}) => {
  const [agent, setAgent] = useState<Agent>({
    id: 'aria-core',
    name: 'ARIA',
    subtitle: 'Personal AI',
    version: 'NEURAL INTERFACE v4.0',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    totalMemories: 124,
    activePreferencesCount: 12,
    knowledgeNodesCount: 86,
    coherenceScore: 94.2,
    avgConfidence: 94,
    retrievalFrequency: 1.2,
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    getAgent().then(setAgent);
    const unsubscribe = memoraStorage.subscribe(() => {
      getAgent().then(setAgent);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0e10] text-[#e2e2e5] font-sans antialiased flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} agent={agent} />

      {/* Top Header Bar */}
      <TopBar agent={agent} onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Workspace Content Area */}
      <main className="pl-[260px] pt-12 min-h-screen flex flex-col flex-1 bg-[#0c0e10]">
        {children}
      </main>

      {/* Global CMD+K Search Command Palette */}
      <SearchCommandModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
        onSelectMemory={onSelectMemoryForDetail}
      />
    </div>
  );
};
