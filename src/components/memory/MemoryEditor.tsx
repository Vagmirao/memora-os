import React, { useState } from 'react';
import { Save, AlertCircle, X } from 'lucide-react';
import { Memory, MemoryCategory } from '../../types';
import { Button } from '../ui/Button';

interface MemoryEditorProps {
  memory: Memory;
  onSave: (updatedData: {
    title: string;
    content: string;
    category: MemoryCategory;
    confidence: number;
    importance: number;
  }) => void;
  onCancel: () => void;
}

export const MemoryEditor: React.FC<MemoryEditorProps> = ({ memory, onSave, onCancel }) => {
  const [title, setTitle] = useState(memory.title);
  const [category, setCategory] = useState<MemoryCategory>(memory.category);
  const [content, setContent] = useState(memory.content);
  const [confidence, setConfidence] = useState(memory.confidence);
  const [importance, setImportance] = useState(memory.importance);

  const categories: MemoryCategory[] = [
    'Identity',
    'Preferences',
    'Knowledge',
    'Experiences',
    'Relationships',
    'Skills',
    'Behavioral Patterns',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, content, category, confidence, importance });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[#121416] p-4 border border-[#00F0FF]/40 rounded-[4px]">
      <div className="flex justify-between items-center border-b border-[#3b494b] pb-2">
        <span className="font-mono text-[12px] font-bold text-[#00F0FF] uppercase tracking-wider">
          EDIT MEMORY FRAGMENT #{memory.id} (v{memory.version})
        </span>
        <button type="button" onClick={onCancel} className="text-[#849495] hover:text-[#e2e2e5]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Version creation notice */}
      <div className="flex items-start gap-2 bg-[#00F0FF]/10 border border-[#00F0FF]/30 p-2.5 rounded-[2px] text-[#00F0FF] font-mono text-[10px]">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Saving changes creates a new memory version (v{memory.version + 1}). All previous versions remain immutable and version-controlled.
        </span>
      </div>

      <div className="space-y-3 font-mono text-[11px]">
        <div>
          <label className="text-[#849495] uppercase block mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#0c0e10] border border-[#3b494b] text-[#e2e2e5] p-2 rounded-[2px] outline-none focus:border-[#00F0FF]"
            required
          />
        </div>

        <div>
          <label className="text-[#849495] uppercase block mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as MemoryCategory)}
            className="w-full bg-[#0c0e10] border border-[#3b494b] text-[#e2e2e5] p-2 rounded-[2px] outline-none focus:border-[#00F0FF]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[#849495] uppercase block mb-1">Content / Observation</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full bg-[#0c0e10] border border-[#3b494b] text-[#e2e2e5] font-sans p-2 rounded-[2px] outline-none focus:border-[#00F0FF] leading-relaxed"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[#849495] uppercase block mb-1">
              Confidence Score ({Math.round(confidence * 100)}%)
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-full accent-[#00F0FF]"
            />
          </div>

          <div>
            <label className="text-[#849495] uppercase block mb-1">
              Importance Rating ({Math.round(importance * 100)}%)
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={importance}
              onChange={(e) => setImportance(parseFloat(e.target.value))}
              className="w-full accent-[#00F0FF]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-[#3b494b]/50">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
          Save New Version (v{memory.version + 1})
        </Button>
      </div>
    </form>
  );
};
