import React, { useState } from 'react';
import { History, GitCommit, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { MemoryVersion } from '../../types';
import { Button } from '../ui/Button';

interface VersionHistoryProps {
  versions: MemoryVersion[];
  currentVersionNumber: number;
  onRestoreVersion?: (content: string, versionNumber: number) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  currentVersionNumber,
  onRestoreVersion,
}) => {
  const [selectedV1, setSelectedV1] = useState<number>(
    versions.length > 1 ? versions[1].versionNumber : versions[0]?.versionNumber || 1
  );
  const [selectedV2, setSelectedV2] = useState<number>(
    versions[0]?.versionNumber || 1
  );

  const verObj1 = versions.find((v) => v.versionNumber === selectedV1) || versions[0];
  const verObj2 = versions.find((v) => v.versionNumber === selectedV2) || versions[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#3b494b] pb-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#00F0FF]" />
          <span className="font-mono text-[12px] font-bold text-[#e2e2e5] uppercase tracking-wider">
            Version Timeline & Reconstruction
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#849495]">
          TOTAL VERSIONS: {versions.length}
        </span>
      </div>

      {/* Version Selector Tabs */}
      <div className="grid grid-cols-2 gap-3 bg-[#1a1c1e] p-2 rounded-[4px] border border-[#3b494b]/60">
        <div>
          <label className="font-mono text-[9px] text-[#849495] uppercase block mb-1">
            Compare Version A (Older)
          </label>
          <select
            value={selectedV1}
            onChange={(e) => setSelectedV1(Number(e.target.value))}
            className="w-full bg-[#121416] border border-[#3b494b] text-[#e2e2e5] font-mono text-[11px] p-1.5 rounded-[2px] outline-none focus:border-[#00F0FF]"
          >
            {versions.map((v) => (
              <option key={v.versionNumber} value={v.versionNumber}>
                v{v.versionNumber} — {v.changeSummary} ({new Date(v.timestamp).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-mono text-[9px] text-[#849495] uppercase block mb-1">
            Compare Version B (Newer)
          </label>
          <select
            value={selectedV2}
            onChange={(e) => setSelectedV2(Number(e.target.value))}
            className="w-full bg-[#121416] border border-[#3b494b] text-[#e2e2e5] font-mono text-[11px] p-1.5 rounded-[2px] outline-none focus:border-[#00F0FF]"
          >
            {versions.map((v) => (
              <option key={v.versionNumber} value={v.versionNumber}>
                v{v.versionNumber} — {v.changeSummary} ({new Date(v.timestamp).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Version A Panel */}
        <div className="bg-[#121416] border border-[#3b494b] p-3 rounded-[4px] space-y-2">
          <div className="flex justify-between items-center border-b border-[#3b494b]/40 pb-1.5">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#b9cacb]">
              <GitCommit className="w-3.5 h-3.5 text-[#849495]" />
              <span>VERSION {verObj1?.versionNumber}</span>
            </div>
            <span className="font-mono text-[9px] text-[#849495]">
              {verObj1 ? new Date(verObj1.timestamp).toLocaleString() : ''}
            </span>
          </div>
          <div className="font-sans text-[12px] text-[#e2e2e5] bg-[#0c0e10] p-2.5 rounded-[2px] border border-[#3b494b]/30 min-h-[100px] leading-relaxed whitespace-pre-wrap">
            {verObj1?.content}
          </div>
          <div className="font-mono text-[10px] text-[#849495]">
            SUMMARY: {verObj1?.changeSummary}
          </div>
          {onRestoreVersion && verObj1?.versionNumber !== currentVersionNumber && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => onRestoreVersion(verObj1.content, verObj1.versionNumber)}
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Revert to v{verObj1.versionNumber}
            </Button>
          )}
        </div>

        {/* Version B Panel */}
        <div className="bg-[#121416] border border-[#00F0FF]/40 p-3 rounded-[4px] space-y-2">
          <div className="flex justify-between items-center border-b border-[#3b494b]/40 pb-1.5">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#00F0FF]">
              <GitCommit className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>VERSION {verObj2?.versionNumber}</span>
              {verObj2?.versionNumber === currentVersionNumber && (
                <span className="bg-[#00F0FF]/10 text-[#00F0FF] text-[8px] px-1 rounded-[2px] border border-[#00F0FF]/30">
                  CURRENT ACTIVE
                </span>
              )}
            </div>
            <span className="font-mono text-[9px] text-[#849495]">
              {verObj2 ? new Date(verObj2.timestamp).toLocaleString() : ''}
            </span>
          </div>
          <div className="font-sans text-[12px] text-[#e2e2e5] bg-[#0c0e10] p-2.5 rounded-[2px] border border-[#00F0FF]/30 min-h-[100px] leading-relaxed whitespace-pre-wrap">
            {verObj2?.content}
          </div>
          <div className="font-mono text-[10px] text-[#849495]">
            SUMMARY: {verObj2?.changeSummary}
          </div>
        </div>
      </div>
    </div>
  );
};
