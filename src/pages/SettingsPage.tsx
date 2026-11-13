import React, { useState } from 'react';
import { Settings, Download, Upload, Trash2, Sliders, Check, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const [autoPrune, setAutoPrune] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.4);
  const [autoConsolidate, setAutoConsolidate] = useState(true);

  const handleExportState = () => {
    const data = {
      timestamp: new Date().toISOString(),
      version: 'MEMORA OS v4.2',
      memories: localStorage.getItem('memora_memories'),
      personality: localStorage.getItem('memora_personality'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memora-os-state-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="p-4 flex flex-col gap-3 h-[calc(100vh-48px)] overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#121416] p-3 border border-[#3b494b] rounded-[4px] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-[4px]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono text-[14px] font-bold text-[#e2e2e5] tracking-widest uppercase">
              SYSTEM CONFIGURATION & OS SETTINGS
            </h1>
            <p className="font-mono text-[10px] text-[#849495]">
              MEMORY RETENTION POLICIES, GARBAGE COLLECTION, STATE EXPORT
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0 overflow-y-auto">
        {/* Memory Operating System Maintenance */}
        <div className="bg-[#121416] border border-[#3b494b] p-4 rounded-[4px] space-y-4">
          <div className="border-b border-[#3b494b] pb-2 font-mono text-[12px] font-bold text-[#00F0FF] uppercase">
            Garbage Collection & Pruning
          </div>

          <div className="space-y-3 font-mono text-[11px]">
            <div className="flex items-center justify-between p-3 bg-[#1a1c1e] border border-[#3b494b]/50 rounded-[2px]">
              <div>
                <span className="text-[#e2e2e5] block font-bold">Auto-Prune Decay Nodes</span>
                <span className="text-[#849495] text-[10px]">
                  Automatically archive memories dropping below confidence threshold
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoPrune}
                onChange={(e) => setAutoPrune(e.target.checked)}
                className="w-4 h-4 accent-[#00F0FF]"
              />
            </div>

            <div className="p-3 bg-[#1a1c1e] border border-[#3b494b]/50 rounded-[2px] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#e2e2e5]">Minimum Retention Confidence</span>
                <span className="text-[#00F0FF]">{Math.round(confidenceThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#00F0FF]"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#1a1c1e] border border-[#3b494b]/50 rounded-[2px]">
              <div>
                <span className="text-[#e2e2e5] block font-bold">Automatic Memory Consolidation</span>
                <span className="text-[#849495] text-[10px]">
                  Merge duplicate observations during idle periods
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoConsolidate}
                onChange={(e) => setAutoConsolidate(e.target.checked)}
                className="w-4 h-4 accent-[#00F0FF]"
              />
            </div>
          </div>
        </div>

        {/* Export / Import OS State */}
        <div className="bg-[#121416] border border-[#3b494b] p-4 rounded-[4px] space-y-4">
          <div className="border-b border-[#3b494b] pb-2 font-mono text-[12px] font-bold text-[#00F0FF] uppercase">
            State Backup & Portability
          </div>

          <div className="space-y-3 font-mono text-[11px]">
            <p className="font-sans text-[12px] text-[#b9cacb]">
              Export the entire cognitive state, version tree, and personality traits of ARIA as a portable JSON image for migration or local backup.
            </p>

            <Button
              variant="primary"
              className="w-full"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportState}
            >
              Export Full Cognitive State (JSON)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
