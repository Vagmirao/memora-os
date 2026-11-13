import {
  Agent,
  Memory,
  MemoryVersion,
  TimelineEvent,
  Conversation,
  Message,
  PersonalityProfile,
  HistoricalState,
  AnalyticsData,
  MemoryCategory,
} from '../types';
import {
  mockAgent,
  mockMemories,
  mockTimelineEvents,
  mockConversations,
  mockPersonalityProfile,
  mockHistoricalStates,
  mockAnalyticsData,
} from '../data/mockData';

// Local reactive storage state
class MemoraStorageService {
  private agent: Agent;
  private memories: Memory[];
  private timelineEvents: TimelineEvent[];
  private conversations: Conversation[];
  private personality: PersonalityProfile;
  private historicalStates: Record<string, HistoricalState>;
  private analytics: AnalyticsData;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Load from localStorage or fallback to mockData
    const savedMemories = localStorage.getItem('memora_memories');
    this.memories = savedMemories ? JSON.parse(savedMemories) : [...mockMemories];

    const savedTimeline = localStorage.getItem('memora_timeline');
    this.timelineEvents = savedTimeline ? JSON.parse(savedTimeline) : [...mockTimelineEvents];

    const savedConvs = localStorage.getItem('memora_conversations');
    this.conversations = savedConvs ? JSON.parse(savedConvs) : [...mockConversations];

    const savedPersonality = localStorage.getItem('memora_personality');
    this.personality = savedPersonality ? JSON.parse(savedPersonality) : { ...mockPersonalityProfile };

    this.agent = {
      ...mockAgent,
      totalMemories: this.memories.filter((m) => m.status === 'active').length,
    };

    this.historicalStates = { ...mockHistoricalStates };
    this.analytics = { ...mockAnalyticsData };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.agent.totalMemories = this.memories.filter((m) => m.status === 'active').length;
    localStorage.setItem('memora_memories', JSON.stringify(this.memories));
    localStorage.setItem('memora_timeline', JSON.stringify(this.timelineEvents));
    localStorage.setItem('memora_conversations', JSON.stringify(this.conversations));
    localStorage.setItem('memora_personality', JSON.stringify(this.personality));
    this.listeners.forEach((fn) => fn());
  }

  // API Methods
  async getAgent(): Promise<Agent> {
    return { ...this.agent };
  }

  async getMemories(filters?: {
    category?: MemoryCategory | 'all';
    status?: string;
    search?: string;
    minConfidence?: number;
  }): Promise<Memory[]> {
    let result = [...this.memories];

    if (filters) {
      if (filters.category && filters.category !== 'all') {
        result = result.filter((m) => m.category === filters.category);
      }
      if (filters.status) {
        result = result.filter((m) => m.status === filters.status);
      }
      if (filters.minConfidence !== undefined) {
        result = result.filter((m) => m.confidence >= filters.minConfidence!);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        result = result.filter(
          (m) =>
            m.title.toLowerCase().includes(query) ||
            m.content.toLowerCase().includes(query) ||
            m.tags.some((t) => t.toLowerCase().includes(query)) ||
            m.id.toLowerCase().includes(query)
        );
      }
    }

    return result;
  }

  async getMemory(id: string): Promise<Memory | null> {
    const mem = this.memories.find((m) => m.id === id);
    if (mem) {
      // Touch last accessed
      mem.lastAccessedAt = new Date().toISOString();
      mem.accessCount += 1;
    }
    return mem ? { ...mem } : null;
  }

  async getMemoryVersions(id: string): Promise<MemoryVersion[]> {
    const mem = this.memories.find((m) => m.id === id);
    return mem ? [...mem.history] : [];
  }

  async updateMemory(
    id: string,
    data: {
      title?: string;
      content?: string;
      category?: MemoryCategory;
      confidence?: number;
      importance?: number;
      status?: 'active' | 'archived' | 'contradiction' | 'pending';
    }
  ): Promise<Memory> {
    const index = this.memories.findIndex((m) => m.id === id);
    if (index === -1) throw new Error(`Memory with ID ${id} not found`);

    const current = this.memories[index];
    const newVersionNum = current.version + 1;
    const now = new Date().toISOString();

    const newVersion: MemoryVersion = {
      versionNumber: newVersionNum,
      timestamp: now,
      content: data.content ?? current.content,
      changeSummary: `Updated from v${current.version} to v${newVersionNum}`,
      author: 'user',
    };

    const updatedMemory: Memory = {
      ...current,
      ...data,
      version: newVersionNum,
      updatedAt: now,
      history: [newVersion, ...current.history],
    };

    this.memories[index] = updatedMemory;

    // Add timeline event
    this.timelineEvents.unshift({
      id: `evt-${Date.now()}`,
      timestamp: now,
      memoryId: id,
      type: 'update',
      summary: `Memory updated: ${updatedMemory.title}`,
      details: `Version advanced to v${newVersionNum}`,
      previousValue: current.content,
      newValue: updatedMemory.content,
      rawLogId: `ID:${id}`,
    });

    this.notify();
    return { ...updatedMemory };
  }

  async createMemoryVersion(
    id: string,
    newContent: string,
    changeSummary: string
  ): Promise<Memory> {
    const index = this.memories.findIndex((m) => m.id === id);
    if (index === -1) throw new Error(`Memory with ID ${id} not found`);

    const current = this.memories[index];
    const newVersionNum = current.version + 1;
    const now = new Date().toISOString();

    const newVersion: MemoryVersion = {
      versionNumber: newVersionNum,
      timestamp: now,
      content: newContent,
      changeSummary: changeSummary || `Manual version creation v${newVersionNum}`,
      author: 'user',
    };

    const updatedMemory: Memory = {
      ...current,
      content: newContent,
      version: newVersionNum,
      updatedAt: now,
      history: [newVersion, ...current.history],
    };

    this.memories[index] = updatedMemory;

    this.timelineEvents.unshift({
      id: `evt-${Date.now()}`,
      timestamp: now,
      memoryId: id,
      type: 'update',
      summary: `Version v${newVersionNum} created for ${current.title}`,
      details: changeSummary,
      previousValue: current.content,
      newValue: newContent,
      rawLogId: `ID:${id}`,
    });

    this.notify();
    return { ...updatedMemory };
  }

  async createMemory(newMem: Partial<Memory>): Promise<Memory> {
    const id = `MEM-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    const now = new Date().toISOString();

    const memory: Memory = {
      id,
      title: newMem.title || 'New Memory Fragment',
      content: newMem.content || '',
      category: newMem.category || 'Knowledge',
      confidence: newMem.confidence ?? 0.95,
      importance: newMem.importance ?? 0.8,
      weight: newMem.weight ?? 0.85,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      version: 1,
      sourceConversationId: newMem.sourceConversationId || 'conv-manual',
      relatedMemoryIds: newMem.relatedMemoryIds || [],
      tags: newMem.tags || ['user-created'],
      lastAccessedAt: now,
      accessCount: 1,
      history: [
        {
          versionNumber: 1,
          timestamp: now,
          content: newMem.content || '',
          changeSummary: 'Initial memory creation.',
          author: 'user',
        },
      ],
    };

    this.memories.unshift(memory);

    this.timelineEvents.unshift({
      id: `evt-${Date.now()}`,
      timestamp: now,
      memoryId: id,
      type: 'creation',
      summary: `New memory created: ${memory.title}`,
      details: `Created in category ${memory.category}`,
      rawLogId: `ID:${id}`,
    });

    this.notify();
    return { ...memory };
  }

  async deleteMemory(id: string): Promise<boolean> {
    const memIndex = this.memories.findIndex((m) => m.id === id);
    if (memIndex !== -1) {
      const title = this.memories[memIndex].title;
      this.memories.splice(memIndex, 1);

      this.timelineEvents.unshift({
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'archive',
        summary: `Memory deleted: ${title}`,
        details: `Permanently removed memory node ${id}`,
        rawLogId: `ID:${id}`,
      });

      this.notify();
      return true;
    }
    return false;
  }

  async archiveMemory(id: string): Promise<Memory> {
    return this.updateMemory(id, { status: 'archived' });
  }

  async restoreMemory(id: string): Promise<Memory> {
    return this.updateMemory(id, { status: 'active' });
  }

  async getTimeline(): Promise<TimelineEvent[]> {
    return [...this.timelineEvents];
  }

  async getPersonalityProfile(): Promise<PersonalityProfile> {
    return { ...this.personality };
  }

  async updatePersonalityTrait(traitKey: string, newValue: number): Promise<PersonalityProfile> {
    const trait = this.personality.traits.find((t) => t.key === traitKey);
    if (trait) {
      trait.configuredValue = newValue;
      this.notify();
    }
    return { ...this.personality };
  }

  async alignPersonalityToBaseline(): Promise<PersonalityProfile> {
    this.personality.traits.forEach((t) => {
      t.emergentValue = t.configuredValue;
    });
    this.personality.driftReport.deltas = [];
    this.notify();
    return { ...this.personality };
  }

  async adoptEmergentAsConfig(): Promise<PersonalityProfile> {
    this.personality.traits.forEach((t) => {
      t.configuredValue = t.emergentValue;
    });
    this.personality.driftReport.deltas = [];
    this.notify();
    return { ...this.personality };
  }

  async getHistoricalState(periodKey: string): Promise<HistoricalState> {
    if (this.historicalStates[periodKey]) {
      return { ...this.historicalStates[periodKey] };
    }
    return { ...this.historicalStates['august-2026'] };
  }

  async getAnalytics(): Promise<AnalyticsData> {
    return { ...this.analytics };
  }

  async getConversations(): Promise<Conversation[]> {
    return [...this.conversations];
  }

  async sendMessage(conversationId: string, userText: string): Promise<Message> {
    let conv = this.conversations.find((c) => c.id === conversationId);
    if (!conv) {
      conv = {
        id: conversationId,
        title: `Session / ${userText.slice(0, 20)}...`,
        startedAt: new Date().toISOString(),
        messages: [],
      };
      this.conversations.unshift(conv);
    }

    const now = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: userText,
      timestamp: timeStr,
    };
    conv.messages.push(userMsg);

    // Simulate memory retrieval or creation based on prompt content
    let retrievedMemories;
    let createdMemory;

    const lower = userText.toLowerCase();

    // Check if relevant memories retrieved
    const matchedMems = this.memories.filter((m) =>
      m.tags.some((t) => lower.includes(t)) ||
      lower.includes(m.category.toLowerCase()) ||
      lower.includes('python') || lower.includes('rust') || lower.includes('code') || lower.includes('example')
    );

    if (matchedMems.length > 0) {
      const topMem = matchedMems[0];
      retrievedMemories = [
        {
          id: topMem.id,
          snippet: topMem.title,
          category: topMem.category,
          confidence: topMem.confidence,
          src: 'Nexus',
          age: '1w',
        },
      ];
    }

    // Auto-create memory if user says "I am learning...", "I prefer...", "I work at..."
    if (lower.includes('learning') || lower.includes('started') || lower.includes('prefer') || lower.includes('always')) {
      const newTitle = `User context: ${userText.slice(0, 45)}`;
      const newCreated = await this.createMemory({
        title: newTitle,
        content: userText,
        category: lower.includes('prefer') ? 'Preferences' : lower.includes('learning') ? 'Skills' : 'Knowledge',
        confidence: 0.94,
        importance: 0.85,
        sourceConversationId: conversationId,
      });

      createdMemory = {
        id: newCreated.id,
        title: newCreated.title,
        content: newCreated.content,
        category: newCreated.category,
        confidence: newCreated.confidence,
        importance: 'MED' as const,
      };
    }

    // AI Response text generation
    let replyText = `I've processed your request in relation to your stored cognitive state. `;
    if (lower.includes('rust')) {
      replyText = `Rust is an excellent choice for concurrent data pipelines. Its static memory safety guarantees eliminate data races at compile time without requiring a garbage collector.\n\nI have logged your interest in Rust. Would you like me to tailor code examples using Tokio or Rayon?`;
    } else if (lower.includes('python')) {
      replyText = `Given your background in Python, FastAPI, and AsyncIO, we can compare asyncio event loops directly with threadpool execution or multi-process workers.`;
    } else {
      replyText += `I've updated the cognitive matrix with your latest context. How would you like to proceed?`;
    }

    const assistantMsg: Message = {
      id: `msg-${Date.now()}-ai`,
      role: 'assistant',
      content: replyText,
      timestamp: timeStr,
      executionTimeMs: Math.floor(280 + Math.random() * 200),
      retrievedMemories,
      createdMemory,
    };

    conv.messages.push(assistantMsg);
    this.notify();
    return assistantMsg;
  }
}

export const memoraStorage = new MemoraStorageService();

// Exported Service abstraction API functions matching prompt requirements
export const getAgent = () => memoraStorage.getAgent();
export const getMemories = (filters?: {
  category?: MemoryCategory | 'all';
  status?: string;
  search?: string;
  minConfidence?: number;
}) => memoraStorage.getMemories(filters);
export const getMemory = (id: string) => memoraStorage.getMemory(id);
export const getMemoryVersions = (id: string) => memoraStorage.getMemoryVersions(id);
export const getTimeline = () => memoraStorage.getTimeline();
export const getPersonalityProfile = () => memoraStorage.getPersonalityProfile();
export const updatePersonalityTrait = (traitKey: string, val: number) =>
  memoraStorage.updatePersonalityTrait(traitKey, val);
export const alignPersonalityToBaseline = () => memoraStorage.alignPersonalityToBaseline();
export const adoptEmergentAsConfig = () => memoraStorage.adoptEmergentAsConfig();
export const sendMessage = (conversationId: string, text: string) =>
  memoraStorage.sendMessage(conversationId, text);
export const updateMemory = (
  id: string,
  data: {
    title?: string;
    content?: string;
    category?: MemoryCategory;
    confidence?: number;
    importance?: number;
    status?: 'active' | 'archived' | 'contradiction' | 'pending';
  }
) => memoraStorage.updateMemory(id, data);
export const createMemoryVersion = (id: string, newContent: string, changeSummary: string) =>
  memoraStorage.createMemoryVersion(id, newContent, changeSummary);
export const createMemory = (newMem: Partial<Memory>) => memoraStorage.createMemory(newMem);
export const archiveMemory = (id: string) => memoraStorage.archiveMemory(id);
export const restoreMemory = (id: string) => memoraStorage.restoreMemory(id);
export const deleteMemory = (id: string) => memoraStorage.deleteMemory(id);
export const getHistoricalState = (timestampOrKey: string) =>
  memoraStorage.getHistoricalState(timestampOrKey);
export const getAnalytics = () => memoraStorage.getAnalytics();
export const getConversations = () => memoraStorage.getConversations();
