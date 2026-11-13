import React, { useState, useEffect } from 'react';
import { Brain, Sliders, RotateCcw, Check, AlertCircle, Sparkles } from 'lucide-react';
import { PersonalityProfile } from '../types';
import {
  getPersonalityProfile,
  updatePersonalityTrait,
  alignPersonalityToBaseline,
  adoptEmergentAsConfig,
} from '../services/api';
import { Button } from '../components/ui/Button';

export const PersonalityPage: React.FC = () => {
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const p = await getPersonalityProfile();
    setProfile(p);
  };

  const handleSliderChange = async (traitKey: string, newVal: number) => {
    const updated = await updatePersonalityTrait(traitKey, newVal);
    setProfile(updated);
  };

  const handleAlign = async () => {
    const updated = await alignPersonalityToBaseline();
    setProfile(updated);
  };

  const handleAdopt = async () => {
    const updated = await adoptEmergentAsConfig();
    setProfile(updated);
  };

  if (!profile) return null;

  return (
    <div className="p-4 flex flex-col gap-3 h-[calc(100vh-48px)] overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#121416] p-3 border border-[#3b494b] rounded-[4px] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-[4px]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono text-[14px] font-bold text-[#e2e2e5] tracking-widest uppercase">
              BEHAVIORAL & PERSONALITY MATRIX
            </h1>
            <p className="font-mono text-[10px] text-[#849495]">
              CONFIGURED BASELINE VS. EMERGENT BEHAVIORAL DRIFT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleAlign}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Align To Config Baseline
          </Button>
          <Button variant="primary" size="sm" onClick={handleAdopt}>
            <Check className="w-3.5 h-3.5 mr-1" /> Adopt Emergent Traits
          </Button>
        </div>
      </div>

      {/* Main Grid: Trait Sliders + Drift Analysis */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Trait Sliders */}
        <div className="flex-1 bg-[#121416] border border-[#3b494b] p-4 rounded-[4px] overflow-y-auto space-y-4">
          <div className="flex items-center justify-between border-b border-[#3b494b] pb-2 font-mono text-[11px]">
            <span className="text-[#00F0FF] font-bold uppercase tracking-wider">
              BEHAVIORAL TRAIT AXES
            </span>
            <div className="flex gap-4 text-[#849495]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00F0FF]" /> Configured
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Emergent (Live)
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {profile.traits.map((t) => {
              const delta = Math.round((t.emergentValue - t.configuredValue) * 100);

              return (
                <div
                  key={t.key}
                  className="bg-[#1a1c1e] p-3 border border-[#3b494b]/60 rounded-[4px] space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-sans text-[13px] font-semibold text-[#e2e2e5] block">
                        {t.name}
                      </span>
                      <span className="font-sans text-[11px] text-[#849495]">
                        {t.description}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-right">
                      <span className="text-[#00F0FF] font-bold">
                        {Math.round(t.configuredValue * 100)}%
                      </span>
                      {delta !== 0 && (
                        <span
                          className={`ml-2 text-[10px] ${
                            delta > 0 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          ({delta > 0 ? `+${delta}%` : `${delta}%`} drift)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Slider & Visual Meter */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={t.configuredValue}
                      onChange={(e) => handleSliderChange(t.key, parseFloat(e.target.value))}
                      className="w-full accent-[#00F0FF]"
                    />
                    <div className="relative h-2 bg-[#0c0e10] border border-[#3b494b]/50 rounded-[2px] overflow-hidden">
                      {/* Configured Bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-[#00F0FF]/40"
                        style={{ width: `${t.configuredValue * 100}%` }}
                      />
                      {/* Emergent Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_6px_#f59e0b]"
                        style={{ left: `${t.emergentValue * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drift Report Box */}
        <div className="w-[340px] bg-[#121416] border border-[#3b494b] p-4 rounded-[4px] flex flex-col justify-between shrink-0 font-mono text-[11px]">
          <div className="space-y-4">
            <div className="border-b border-[#3b494b] pb-2">
              <span className="text-[#00F0FF] font-bold uppercase tracking-wider block">
                EMERGENT DRIFT REPORT
              </span>
              <p className="text-[10px] text-[#849495] mt-0.5">
                Last calculated: {new Date(profile.driftReport.lastCalculated).toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-[#0c0e10] border border-[#3b494b]/50 rounded-[2px] space-y-1">
                <span className="text-[#849495] text-[10px] block">TOTAL DRIFT INDEX</span>
                <span className="text-[#00F0FF] text-[18px] font-bold block">
                  {Math.round(profile.driftReport.overallDriftIndex * 100)}%
                </span>
                <p className="font-sans text-[11px] text-[#b9cacb] leading-tight">
                  {profile.driftReport.summary}
                </p>
              </div>

              <div className="p-3 bg-[#0c0e10] border border-[#3b494b]/50 rounded-[2px] space-y-1">
                <span className="text-[#849495] text-[10px] block">DRIFT DELTAS</span>
                {profile.driftReport.deltas.map((d) => (
                  <div key={d.traitKey} className="flex justify-between text-[10px]">
                    <span className="text-[#e2e2e5] uppercase">{d.traitKey}</span>
                    <span className={d.delta > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {d.delta > 0 ? `+${Math.round(d.delta * 100)}%` : `${Math.round(d.delta * 100)}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
