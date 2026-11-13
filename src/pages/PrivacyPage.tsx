import React, { useState } from 'react';
import { Shield, Lock, EyeOff, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export const PrivacyPage: React.FC = () => {
  const [zeroKnowledge, setZeroKnowledge] = useState(true);
  const [autoRedactPII, setAutoRedactPII] = useState(true);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurged, setIsPurged] = useState(false);

  const handlePurgeAll = () => {
    localStorage.clear();
    setIsPurgeModalOpen(false);
    setIsPurged(true);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="p-4 flex flex-col gap-3 h-[calc(100vh-48px)] overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#121416] p-3 border border-[#3b494b] rounded-[4px] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-[4px]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono text-[14px] font-bold text-[#e2e2e5] tracking-widest uppercase">
              PRIVACY & ZERO-KNOWLEDGE ENCRYPTION VAULT
            </h1>
            <p className="font-mono text-[10px] text-[#849495]">
              MEMORY ENCRYPTION, AUTO-REDACTION, PURGE PROTOCOLS
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0 overflow-y-auto">
        {/* Encryption Controls */}
        <div className="bg-[#121416] border border-[#3b494b] p-4 rounded-[4px] space-y-4">
          <div className="border-b border-[#3b494b] pb-2 font-mono text-[12px] font-bold text-[#00F0FF] uppercase flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#00F0FF]" /> Cryptographic Memory Vault
          </div>

          <div className="space-y-3 font-mono text-[11px]">
            <div className="flex items-center justify-between p-3 bg-[#1a1c1e] border border-[#3b494b]/50 rounded-[2px]">
              <div>
                <span className="text-[#e2e2e5] block font-bold">Zero-Knowledge Local Storage</span>
                <span className="text-[#849495] text-[10px]">
                  Client-side AES-256-GCM memory encryption prior to persistence
                </span>
              </div>
              <input
                type="checkbox"
                checked={zeroKnowledge}
                onChange={(e) => setZeroKnowledge(e.target.checked)}
                className="w-4 h-4 accent-[#00F0FF]"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#1a1c1e] border border-[#3b494b]/50 rounded-[2px]">
              <div>
                <span className="text-[#e2e2e5] block font-bold">Automatic PII & Secret Redaction</span>
                <span className="text-[#849495] text-[10px]">
                  Strip API keys, passwords, and sensitive strings before node creation
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoRedactPII}
                onChange={(e) => setAutoRedactPII(e.target.checked)}
                className="w-4 h-4 accent-[#00F0FF]"
              />
            </div>
          </div>
        </div>

        {/* Complete Memory Purge */}
        <div className="bg-[#121416] border border-red-500/30 p-4 rounded-[4px] space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-red-500/30 pb-2 font-mono text-[12px] font-bold text-red-400 uppercase flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Irreversible System Purge
            </div>

            <p className="font-sans text-[12px] text-[#b9cacb] mt-3 leading-relaxed">
              Purging wipes all memory nodes, version histories, timeline logs, and custom personality calibrations from local storage. ARIA will revert to initial factory baseline state.
            </p>
          </div>

          <Button
            variant="danger"
            size="md"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setIsPurgeModalOpen(true)}
          >
            Purge All Memory State
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isPurgeModalOpen}
        title="PERMANENTLY PURGE ALL MEMORA DATA?"
        description="This will destroy all stored memories, version trees, timeline logs, and custom traits. This action cannot be undone."
        confirmLabel="PURGE EVERYTHING"
        onConfirm={handlePurgeAll}
        onCancel={() => setIsPurgeModalOpen(false)}
      />

      {isPurged && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 font-mono text-[#00F0FF]">
          <div className="flex items-center gap-3 bg-[#121416] p-6 border border-[#00F0FF] rounded-[4px]">
            <CheckCircle2 className="w-6 h-6 animate-bounce text-[#00F0FF]" />
            <span>MEMORY STATE PURGED. REBOOTING SYSTEM...</span>
          </div>
        </div>
      )}
    </div>
  );
};
