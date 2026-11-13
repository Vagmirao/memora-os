export type MemoryCategory =
  | 'Identity'
  | 'Preferences'
  | 'Knowledge'
  | 'Experiences'
  | 'Relationships'
  | 'Skills'
  | 'Behavioral Patterns';

export type MemoryStatus = 'active' | 'archived' | 'contradiction' | 'pending';

export interface MemoryVersion {
  versionNumber: number;
  timestamp: string;
  content: string;
  changeSummary: string;
  author: 'system' | 'user' | 'agent';
}

export interface Memory {
  id: string;
  title: string;
  content: string;
  category: MemoryCategory;
  confidence: number; // 0 to 1
  importance: number; // 0 to 1
  weight: number; // 0 to 1
  status: MemoryStatus;
  createdAt: string;
  updatedAt: string;
  version: number;
  sourceConversationId: string;
  relatedMemoryIds: string[];
  tags: string[];
  lastAccessedAt: string;
  accessCount: number;
  history: MemoryVersion[];
}

export type TimelineEventType =
  | 'creation'
  | 'update'
  | 'archive'
  | 'restoration'
  | 'contradiction'
  | 'behavior_change'
  | 'system_gc';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  memoryId?: string;
  type: TimelineEventType;
  summary: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
  rawLogId?: string;
}

export interface RetrievedMemoryRef {
  id: string;
  snippet: string;
  category: MemoryCategory;
  confidence: number;
  src: string;
  age: string;
}

export interface CreatedMemoryRef {
  id: string;
  title: string;
  content: string;
  category: MemoryCategory;
  confidence: number;
  importance: 'LOW' | 'MED' | 'HIGH';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  retrievedMemories?: RetrievedMemoryRef[];
  createdMemory?: CreatedMemoryRef;
  executionTimeMs?: number;
}

export interface Conversation {
  id: string;
  title: string;
  startedAt: string;
  messages: Message[];
}

export interface Agent {
  id: string;
  name: string;
  subtitle: string;
  version: string;
  status: 'ACTIVE' | 'PROCESSING' | 'SYNCHRONIZING' | 'STANDBY';
  avatarUrl: string;
  totalMemories: number;
  activePreferencesCount: number;
  knowledgeNodesCount: number;
  coherenceScore: number; // e.g. 94.2
  avgConfidence: number; // e.g. 94
  retrievalFrequency: number; // e.g. 1.2
}

export interface PersonalityTrait {
  key: string;
  name: string;
  configuredValue: number; // 0 to 1
  emergentValue: number; // 0 to 1
  shortCode: string;
  description: string;
}

export interface PersonalityProfile {
  traits: PersonalityTrait[];
  systemPromptInjection: string;
  personaStabilityPct: number;
  lastDriftAnalysisDate: string;
  driftReport: {
    tMinusDays: number;
    deltas: Array<{
      traitKey: string;
      traitName: string;
      deltaStr: string;
      pctStr: string;
    }>;
    summary: string;
  };
}

export interface HistoricalState {
  timestamp: string;
  dateLabel: string;
  monthYearLabel: string;
  memoryCount: number;
  activePreferencesCount: number;
  cognitiveCoherencePct: number;
  warmthPct: number;
  humorPct: number;
  verbosityPct: number;
  prunedMemoriesCount: number;
  weightShiftPct: number;
  reconstructionConfidencePct: number;
  baselineSummary: string;
  currentPreferencesSummary: string;
  activeNodeIds: string[];
}

export interface AnalyticsData {
  memoryGrowth: Array<{ date: string; count: number }>;
  retrievalFrequencySeries: Array<{ time: string; freq: number }>;
  categoryDistribution: Array<{ category: MemoryCategory; count: number }>;
  confidenceBuckets: Array<{ range: string; count: number; pct: number }>;
  contradictionsDetectedCount: number;
  averageConfidencePct: number;
  totalRetrievalsCount: number;
  systemGarbageCollectionsCount: number;
  behavioralConsistencyScorePct: number;
}
