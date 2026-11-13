import React, { useState } from 'react';
import { X, Edit3, Trash2, Archive, RotateCcw, Clock, Database, Tag, GitBranch, Terminal } from 'lucide-react';
import { Memory } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MemoryEditor } from './MemoryEditor';
import { VersionHistory } from './VersionHistory';

interface MemoryDetailDrawerProps {
  memory: Memory | null;
  onClose: () => void;
  onUpdateMemory: (
    id: string,
    data: { title: string; content: string; category: any; confidence: number; importance: number }
  ) => void;
  onDeleteMemory: (id: string) => void;
  onArchiveMemory: (id: string) => void;
  onRestoreMemory: (id: string) => void;
  onNavigateToConversation?: (conversationId: string) => void;
}

export const MemoryDetailDrawer: React.FC<MemoryDetailDrawerProps> = ({
  memory,
  onClose,
  onUpdateMemory,
  onDeleteMemory,
  onArchiveMemory,
  onRestoreMemory,
  onNavigateToConversation,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'edit'>('details');

  if (!memory) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0c0e10] border-l border-[#3b494b] h-full flex flex-col shadow-2xl relative">
        {/* Drawer Header */}
        <div className="p-4 bg-[#121416] border-b border-[#3b494b] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#00F0FF]" />
            <span className="font-mono text-[12px] font-bold text-[#e2e2e5] tracking-widest uppercase">
              MEMORY NODE #{memory.id}
            </span>
            <Badge variant={memory.status === 'active' ? 'cyan' : 'amber'}>
              {memory.status}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="text-[#849495] hover:text-[#e2e2e5] p-1 rounded-[2px] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#3b494b] bg-[#1a1c1e] px-4 font-mono text-[11px] shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-3 border-b-2 uppercase tracking-wider transition-colors ${
              activeTab === 'details'
                ? 'border-[#00F0FF] text-[#00F0FF] font-bold'
                : 'border-transparent text-[#849495] hover:text-[#e2e2e5]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-3 border-b-2 uppercase tracking-wider transition-colors ${
              activeTab === 'history'
                ? 'border-[#00F0FF] text-[#00F0FF] font-bold'
                : 'border-transparent text-[#849495] hover:text-[#e2e2e5]'
            }`}
          >
            History (v{memory.version})
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-2 px-3 border-b-2 uppercase tracking-wider transition-colors ${
              activeTab === 'edit'
                ? 'border-[#00F0FF] text-[#00F0FF] font-bold'
                : 'border-transparent text-[#849495] hover:text-[#e2e2e5]'
            }`}
          >
            Edit / Reconstruct
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'edit' ? (
            <MemoryEditor
              memory={memory}
              onSave={(data) => {
                onUpdateMemory(memory.id, data);
                setActiveTab('details');
              }}
              onCancel={() => setActiveTab('details')}
            />
          ) : activeTab === 'history' ? (
            <VersionHistory
              versions={memory.history}
              currentVersionNumber={memory.version}
              onRestoreVersion={(content, vNum) => {
                onUpdateMemory(memory.id, {
                  title: memory.title,
                  content,
                  category: memory.category,
                  confidence: memory.confidence,
                  importance: memory.importance,
                });
                setActiveTab('details');
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Title & Content Box */}
              <div className="bg-[#121416] p-4 border border-[#3b494b] rounded-[4px] space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="cyan">{memory.category}</Badge>
                  <span className="font-mono text-[10px] text-[#849495]">
                    VERSION {memory.version}
                  </span>
                </div>

                <h3 className="font-sans text-[15px] font-semibold text-[#e2e2e5] leading-snug">
                  {memory.title}
                </h3>

                <p className="font-sans text-[13px] text-[#b9cacb] bg-[#0c0e10] p-3 rounded-[2px] border border-[#3b494b]/40 leading-relaxed whitespace-pre-line">
                  {memory.content}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#3b494b]/40 font-mono text-[10px]">
                  <div>
                    <span className="text-[#849495] block">CONFIDENCE</span>
                    <span className="text-[#00F0FF] font-bold">
                      {Math.round(memory.confidence * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[#849495] block">IMPORTANCE</span>
                    <span className="text-[#e2e2e5] font-bold">
                      {Math.round(memory.importance * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[#849495] block">RETRIEVAL WEIGHT</span>
                    <span className="text-[#e2e2e5] font-bold">
                      {Math.round(memory.weight * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags & Metadata */}
              <div className="bg-[#121416] p-4 border border-[#3b494b] rounded-[4px] space-y-3 font-mono text-[11px]">
                <div>
                  <span className="text-[#849495] uppercase block mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#00F0FF]" /> Semantic Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {memory.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#1a1c1e] text-[#b9cacb] border border-[#3b494b]/60 px-2 py-0.5 rounded-[2px] text-[10px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#3b494b]/40 grid grid-cols-2 gap-2 text-[10px] text-[#849495]">
                  <div>
                    <span className="block text-[#849495]">CREATED</span>
                    <span className="text-[#e2e2e5]">
                      {new Date(memory.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[#849495]">LAST UPDATED</span>
                    <span className="text-[#e2e2e5]">
                      {new Date(memory.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Source Conversation Link */}
                {memory.sourceConversationId && (
                  <div className="pt-2 border-t border-[#3b494b]/40 flex items-center justify-between">
                    <span className="text-[#849495] flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-[#00F0FF]" /> SOURCE DIALOGUE
                    </span>
                    <button
                      onClick={() =>
                        onNavigateToConversation &&
                        onNavigateToConversation(memory.sourceConversationId!)
                      }
                      className="text-[#00F0FF] hover:underline"
                    >
                      {memory.sourceConversationId} →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Action Bar */}
        <div className="p-4 bg-[#121416] border-t border-[#3b494b] flex items-center justify-between gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit3 className="w-3.5 h-3.5" />}
            onClick={() => setActiveTab('edit')}
          >
            Edit Node
          </Button>

          <div className="flex items-center gap-2">
            {memory.status === 'active' ? (
              <Button
                variant="ghost"
                size="sm"
                icon={<Archive className="w-3.5 h-3.5" />}
                onClick={() => onArchiveMemory(memory.id)}
              >
                Archive
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() => onRestoreMemory(memory.id)}
              >
                Restore
              </Button>
            )}

            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => onDeleteMemory(memory.id)}
            >
              Delete Node
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
