import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Plus,
  Filter,
  LayoutList,
  GitBranch,
  Clock,
  MoreVertical,
  ChevronRight,
  Eye,
  Trash2,
} from 'lucide-react';
import { Memory, MemoryCategory } from '../types';
import { getMemories, updateMemory, deleteMemory, archiveMemory, restoreMemory, createMemory } from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MemoryGraph } from '../components/memory/MemoryGraph';
import { MemoryDetailDrawer } from '../components/memory/MemoryDetailDrawer';
import { ConfirmModal } from '../components/ui/ConfirmModal';

interface MemoryExplorerPageProps {
  onNavigate: (path: string) => void;
  selectedMemoryFromOtherView?: Memory | null;
}

export const MemoryExplorerPage: React.FC<MemoryExplorerPageProps> = ({
  onNavigate,
  selectedMemoryFromOtherView,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'graph' | 'timeline'>('list');
  const [categoryFilter, setCategoryFilter] = useState<MemoryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [activeMemory, setActiveMemory] = useState<Memory | null>(selectedMemoryFromOtherView || null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Memory Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('Knowledge');

  useEffect(() => {
    fetchMemories();
  }, [categoryFilter, searchQuery]);

  useEffect(() => {
    if (selectedMemoryFromOtherView) {
      setActiveMemory(selectedMemoryFromOtherView);
    }
  }, [selectedMemoryFromOtherView]);

  const fetchMemories = async () => {
    const list = await getMemories({
      category: categoryFilter,
      search: searchQuery,
    });
    setMemories(list);
  };

  const handleUpdate = async (
    id: string,
    data: { title: string; content: string; category: MemoryCategory; confidence: number; importance: number }
  ) => {
    const updated = await updateMemory(id, data);
    setActiveMemory(updated);
    fetchMemories();
  };

  const handleDelete = async () => {
    if (deleteTargetId) {
      await deleteMemory(deleteTargetId);
      if (activeMemory?.id === deleteTargetId) setActiveMemory(null);
      setDeleteTargetId(null);
      fetchMemories();
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    const created = await createMemory({
      title: newTitle,
      content: newContent,
      category: newCategory,
    });
    setNewTitle('');
    setNewContent('');
    setIsCreateOpen(false);
    setActiveMemory(created);
    fetchMemories();
  };

  const categories: (MemoryCategory | 'all')[] = [
    'all',
    'Identity',
    'Preferences',
    'Knowledge',
    'Experiences',
    'Relationships',
    'Skills',
    'Behavioral Patterns',
  ];

  return (
    <div className="p-4 flex flex-col gap-3 h-[calc(100vh-48px)] overflow-hidden font-sans">
      {/* Top Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121416] p-3 border border-[#3b494b] rounded-[4px] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-[4px]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono text-[14px] font-bold text-[#e2e2e5] tracking-widest uppercase">
              COGNITIVE MEMORY EXPLORER
            </h1>
            <p className="font-mono text-[10px] text-[#849495]">
              ACTIVE NODES: {memories.length} | SYSTEM TOPOGRAPHY v4.2
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex bg-[#0c0e10] p-0.5 border border-[#3b494b] rounded-[4px] font-mono text-[10px]">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#00F0FF]/10 text-[#00F0FF] font-bold border border-[#00F0FF]/40'
                  : 'text-[#849495] hover:text-[#e2e2e5]'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" /> LIST
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] transition-colors ${
                viewMode === 'graph'
                  ? 'bg-[#00F0FF]/10 text-[#00F0FF] font-bold border border-[#00F0FF]/40'
                  : 'text-[#849495] hover:text-[#e2e2e5]'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" /> TOPOGRAPHY GRAPH
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-[#00F0FF]/10 text-[#00F0FF] font-bold border border-[#00F0FF]/40'
                  : 'text-[#849495] hover:text-[#e2e2e5]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> TIMELINE
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Create Memory Node
          </Button>
        </div>
      </div>

      {/* Category Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className="font-mono text-[10px] text-[#849495] uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Filter className="w-3 h-3 text-[#00F0FF]" /> Categories:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-[2px] border transition-all shrink-0 ${
              categoryFilter === cat
                ? 'bg-[#00F0FF] text-[#0c0e10] font-bold border-[#00F0FF]'
                : 'bg-[#121416] text-[#b9cacb] border-[#3b494b] hover:border-[#00F0FF]/40 hover:text-[#e2e2e5]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-[#121416] p-2.5 border border-[#3b494b] rounded-[4px] flex items-center gap-2 shrink-0">
        <Search className="w-4 h-4 text-[#00F0FF] shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter memories by title, tag, or content string..."
          className="w-full bg-transparent border-none outline-none font-mono text-[12px] text-[#e2e2e5] placeholder-[#849495]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="font-mono text-[10px] text-[#849495] hover:text-[#e2e2e5]"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Main View Display */}
      <div className="flex-1 overflow-hidden min-h-0 relative">
        {viewMode === 'graph' ? (
          <MemoryGraph memories={memories} onSelectMemory={setActiveMemory} />
        ) : viewMode === 'timeline' ? (
          /* Timeline View Mode */
          <div className="h-full overflow-y-auto bg-[#121416] border border-[#3b494b] p-4 rounded-[4px] space-y-4">
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2.5 top-0 bottom-0 w-[1px] bg-[#00F0FF]/40" />

              {memories.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setActiveMemory(m)}
                  className="relative z-10 bg-[#1a1c1e] border border-[#3b494b]/60 hover:border-[#00F0FF] p-3 rounded-[4px] transition-all cursor-pointer group"
                >
                  <div className="absolute -left-6 top-3 w-2.5 h-2.5 rounded-full bg-[#00F0FF] border-2 border-[#121416] shadow-[0_0_8px_#00F0FF]" />

                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#00F0FF] font-bold">
                        #{m.id}
                      </span>
                      <Badge variant="cyan">{m.category}</Badge>
                    </div>
                    <span className="font-mono text-[10px] text-[#849495]">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-sans text-[13px] font-medium text-[#e2e2e5] group-hover:text-[#00F0FF]">
                    {m.title}
                  </h3>
                  <p className="font-sans text-[12px] text-[#b9cacb] line-clamp-2 mt-1">
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* High-Density List View Table Mode */
          <div className="h-full overflow-y-auto bg-[#121416] border border-[#3b494b] rounded-[4px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#1e2022] font-mono text-[10px] text-[#849495] uppercase tracking-wider border-b border-[#3b494b] z-10">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Title & Summary</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-sans text-[12px] divide-y divide-[#3b494b]/40">
                {memories.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setActiveMemory(m)}
                    className="hover:bg-[#1a1c1e] transition-colors cursor-pointer group"
                  >
                    <td className="p-3 font-mono text-[11px] text-[#00F0FF] font-semibold">
                      #{m.id}
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="font-medium text-[#e2e2e5] group-hover:text-[#00F0FF] transition-colors truncate">
                        {m.title}
                      </div>
                      <div className="font-mono text-[10px] text-[#849495] truncate mt-0.5">
                        {m.content}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="cyan">{m.category}</Badge>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#e2e2e5]">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-[#0c0e10] border border-[#3b494b] rounded-[1px] overflow-hidden">
                          <div
                            className="h-full bg-[#00F0FF]"
                            style={{ width: `${m.confidence * 100}%` }}
                          />
                        </div>
                        <span>{Math.round(m.confidence * 100)}%</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#849495]">
                      v{m.version}
                    </td>
                    <td className="p-3">
                      <Badge variant={m.status === 'active' ? 'green' : 'amber'}>
                        {m.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setActiveMemory(m)}
                          className="p-1 text-[#849495] hover:text-[#00F0FF] transition-colors"
                          title="Inspect Memory"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(m.id)}
                          className="p-1 text-[#849495] hover:text-red-400 transition-colors"
                          title="Delete Node"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <MemoryDetailDrawer
        memory={activeMemory}
        onClose={() => setActiveMemory(null)}
        onUpdateMemory={handleUpdate}
        onDeleteMemory={(id) => setDeleteTargetId(id)}
        onArchiveMemory={async (id) => {
          await archiveMemory(id);
          fetchMemories();
        }}
        onRestoreMemory={async (id) => {
          await restoreMemory(id);
          fetchMemories();
        }}
        onNavigateToConversation={() => onNavigate('conversation')}
      />

      {/* Create Memory Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-[#121416] border border-[#00F0FF]/40 rounded-[4px] w-full max-w-lg p-5 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-[#3b494b] pb-2">
              <span className="font-mono text-[13px] font-bold text-[#00F0FF] uppercase tracking-wider">
                Create Memory Fragment Node
              </span>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-[#849495] hover:text-[#e2e2e5]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-[11px]">
              <div>
                <label className="text-[#849495] uppercase block mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. User specified preference for Async IO"
                  className="w-full bg-[#0c0e10] border border-[#3b494b] text-[#e2e2e5] p-2 rounded-[2px] outline-none focus:border-[#00F0FF]"
                  required
                />
              </div>

              <div>
                <label className="text-[#849495] uppercase block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                  className="w-full bg-[#0c0e10] border border-[#3b494b] text-[#e2e2e5] p-2 rounded-[2px] outline-none focus:border-[#00F0FF]"
                >
                  {categories.filter((c) => c !== 'all').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#849495] uppercase block mb-1">Content / Observation</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Detailed observation or memory content..."
                  className="w-full bg-[#0c0e10] border border-[#3b494b] text-[#e2e2e5] font-sans p-2 rounded-[2px] outline-none focus:border-[#00F0FF]"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#3b494b]/50">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Initialize Memory Node
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Memory Node?"
        description="Are you sure you want to permanently delete this memory node? This action is irreversible across the neural matrix."
        confirmLabel="Delete Node"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
