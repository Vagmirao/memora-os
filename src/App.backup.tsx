import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { ConversationPage } from './pages/ConversationPage';
import { MemoryExplorerPage } from './pages/MemoryExplorerPage';
import { TimelinePage } from './pages/TimelinePage';
import { TimeTravelPage } from './pages/TimeTravelPage';
import { PersonalityPage } from './pages/PersonalityPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { Memory } from './types';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('overview');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const handleSelectMemoryAndNavigate = (mem: Memory) => {
    setSelectedMemory(mem);
    setCurrentPath('memories');
  };

  const renderCurrentView = () => {
    switch (currentPath) {
      case 'overview':
      case 'system':
        return (
          <OverviewPage
            onNavigate={setCurrentPath}
            onSelectMemory={handleSelectMemoryAndNavigate}
          />
        );

      case 'conversation':
        return (
          <ConversationPage
            onNavigate={setCurrentPath}
            onSelectMemory={handleSelectMemoryAndNavigate}
          />
        );

      case 'memories':
        return (
          <MemoryExplorerPage
            onNavigate={setCurrentPath}
            selectedMemoryFromOtherView={selectedMemory}
          />
        );

      case 'timeline':
        return (
    <TimelinePage
      onSelectMemory={handleSelectMemoryAndNavigate}
    />
  );

      case 'time-travel':
        return <TimeTravelPage />;

      case 'personality':
        return <PersonalityPage />;

      case 'analytics':
        return <AnalyticsPage />;

      case 'settings':
        return <SettingsPage />;

      case 'privacy':
        return <PrivacyPage />;

      default:
        return (
          <OverviewPage
            onNavigate={setCurrentPath}
            onSelectMemory={handleSelectMemoryAndNavigate}
          />
        );
    }
  };

  return (
    <AppShell
      currentPath={currentPath}
      onNavigate={setCurrentPath}
      onSelectMemoryForDetail={handleSelectMemoryAndNavigate}
    >
      {renderCurrentView()}
    </AppShell>
  );
}
