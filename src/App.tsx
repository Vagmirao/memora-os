import React, { useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

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

/**
 * Converts the browser URL into the navigation
 * identifier already used throughout the Memora UI.
 *
 * Example:
 *
 * /overview      -> overview
 * /memories      -> memories
 * /time-travel   -> time-travel
 */
const getCurrentPath = (pathname: string): string => {
  const path = pathname.replace(/^\/+/, '');

  return path || 'overview';
};

/**
 * Main Memora application.
 *
 * React Router now controls navigation instead of
 * manually switching views with local component state.
 */
function MemoraApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedMemory, setSelectedMemory] =
    useState<Memory | null>(null);

  const currentPath = getCurrentPath(location.pathname);

  /**
   * Central navigation function.
 *
   * Existing components can continue calling:
 *
   * onNavigate('memories')
   *
   * while React Router handles the actual URL.
   */
  const handleNavigate = (path: string) => {
    navigate(`/${path}`);
  };

  /**
   * Used when another page wants to open a specific
   * memory inside the Memory Explorer.
   */
  const handleSelectMemoryAndNavigate = (memory: Memory) => {
    setSelectedMemory(memory);
    navigate('/memories');
  };

  /**
   * Shared props for pages that still use the existing
   * navigation callback architecture.
   */
  const renderOverview = () => (
    <OverviewPage
      onNavigate={handleNavigate}
      onSelectMemory={handleSelectMemoryAndNavigate}
    />
  );

  const renderConversation = () => (
    <ConversationPage
      onNavigate={handleNavigate}
      onSelectMemory={handleSelectMemoryAndNavigate}
    />
  );

  const renderMemories = () => (
    <MemoryExplorerPage
      onNavigate={handleNavigate}
      selectedMemoryFromOtherView={selectedMemory}
    />
  );

  const renderTimeline = () => (
    <TimelinePage
      onSelectMemory={handleSelectMemoryAndNavigate}
    />
  );

  return (
    <AppShell
      currentPath={currentPath}
      onNavigate={handleNavigate}
      onSelectMemoryForDetail={handleSelectMemoryAndNavigate}
    >
      <Routes>

        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/overview" replace />}
        />

        {/* Main dashboard */}
        <Route
          path="/overview"
          element={renderOverview()}
        />

        {/* System currently uses the same dashboard */}
        <Route
          path="/system"
          element={renderOverview()}
        />

        {/* Conversation */}
        <Route
          path="/conversation"
          element={renderConversation()}
        />

        {/* Memory Explorer */}
        <Route
          path="/memories"
          element={renderMemories()}
        />

        {/* Timeline */}
        <Route
          path="/timeline"
          element={renderTimeline()}
        />

        {/* Temporal reconstruction */}
        <Route
          path="/time-travel"
          element={<TimeTravelPage />}
        />

        {/* Personality */}
        <Route
          path="/personality"
          element={<PersonalityPage />}
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={<AnalyticsPage />}
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={<SettingsPage />}
        />

        {/* Privacy */}
        <Route
          path="/privacy"
          element={<PrivacyPage />}
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/overview" replace />}
        />

      </Routes>
    </AppShell>
  );
}

/**
 * BrowserRouter is kept at the application boundary.
 *
 * This gives the entire Memora interface access to:
 * - URL routing
 * - Browser history
 * - Back/Forward navigation
 * - Deep links
 */
export default function App() {
  return (
    <BrowserRouter>
      <MemoraApp />
    </BrowserRouter>
  );
}