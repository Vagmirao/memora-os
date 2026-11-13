import React, { useEffect, useState } from 'react';
import {
  BarChart2,
  Activity,
  Database,
  ShieldCheck,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { AnalyticsData } from '../types';
import { getAnalytics } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    getAnalytics()
      .then(setAnalytics)
      .catch((error) => {
        console.error('Failed to load analytics:', error);
      });
  }, []);

  if (!analytics) {
    return (
      <div className="p-4 h-[calc(100vh-48px)] flex items-center justify-center">
        <div className="font-mono text-[11px] text-[#00F0FF] animate-pulse">
          LOADING MEMORY SYSTEM ANALYTICS...
        </div>
      </div>
    );
  }

  const maxCategoryCount = Math.max(
    ...analytics.categoryDistribution.map((item) => item.count)
  );

  const maxConfidenceCount = Math.max(
    ...analytics.confidenceBuckets.map((item) => item.count)
  );

  return (
    <div className="p-4 flex flex-col gap-3 h-[calc(100vh-48px)] overflow-hidden font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-[#121416] p-3 border border-[#3b494b] rounded-[4px] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-[4px]">
            <BarChart2 className="w-5 h-5" />
          </div>

          <div>
            <h1 className="font-mono text-[14px] font-bold text-[#e2e2e5] tracking-widest uppercase">
              MEMORY SYSTEM ANALYTICS & HEALTH
            </h1>

            <p className="font-mono text-[10px] text-[#849495]">
              RETRIEVAL FREQUENCY, CONFIDENCE, GROWTH & COHERENCE METRICS
            </p>
          </div>
        </div>
      </div>

      {/* TOP METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <div className="bg-[#121416] border border-[#3b494b] p-3 rounded-[4px]">
          <div className="flex justify-between">
            <span className="font-mono text-[9px] text-[#849495]">
              AVG CONFIDENCE
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
          </div>

          <div className="font-mono text-[24px] text-[#00F0FF] font-bold mt-2">
            {analytics.averageConfidencePct}%
          </div>
        </div>

        <div className="bg-[#121416] border border-[#3b494b] p-3 rounded-[4px]">
          <div className="flex justify-between">
            <span className="font-mono text-[9px] text-[#849495]">
              BEHAVIORAL CONSISTENCY
            </span>
            <Activity className="w-3.5 h-3.5 text-[#00F0FF]" />
          </div>

          <div className="font-mono text-[24px] text-[#00F0FF] font-bold mt-2">
            {analytics.behavioralConsistencyScorePct}%
          </div>
        </div>

        <div className="bg-[#121416] border border-[#3b494b] p-3 rounded-[4px]">
          <div className="flex justify-between">
            <span className="font-mono text-[9px] text-[#849495]">
              TOTAL RETRIEVALS
            </span>
            <Zap className="w-3.5 h-3.5 text-[#00F0FF]" />
          </div>

          <div className="font-mono text-[24px] text-[#00F0FF] font-bold mt-2">
            {analytics.totalRetrievalsCount.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#121416] border border-[#3b494b] p-3 rounded-[4px]">
          <div className="flex justify-between">
            <span className="font-mono text-[9px] text-[#849495]">
              CONTRADICTIONS
            </span>
            <Database className="w-3.5 h-3.5 text-[#00F0FF]" />
          </div>

          <div className="font-mono text-[24px] text-amber-400 font-bold mt-2">
            {analytics.contradictionsDetectedCount}
          </div>
        </div>
      </div>

      {/* MAIN ANALYTICS AREA */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0 overflow-y-auto">
        {/* MEMORY GROWTH */}
        <div className="bg-[#121416] border border-[#3b494b] rounded-[4px] p-4">
          <div className="flex items-center justify-between border-b border-[#3b494b] pb-2 mb-4">
            <span className="font-mono text-[10px] text-[#00F0FF] font-bold uppercase">
              MEMORY GROWTH
            </span>

            <TrendingUp className="w-4 h-4 text-[#00F0FF]" />
          </div>

          <div className="flex items-end gap-3 h-48">
            {analytics.memoryGrowth.map((item) => {
              const maxCount = Math.max(
                ...analytics.memoryGrowth.map((entry) => entry.count)
              );

              const height = (item.count / maxCount) * 100;

              return (
                <div
                  key={item.date}
                  className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                >
                  <span className="font-mono text-[9px] text-[#b9cacb]">
                    {item.count}
                  </span>

                  <div
                    className="w-full bg-[#00F0FF] transition-all"
                    style={{ height: `${height}%` }}
                  />

                  <span className="font-mono text-[9px] text-[#849495]">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RETRIEVAL FREQUENCY */}
        <div className="bg-[#121416] border border-[#3b494b] rounded-[4px] p-4">
          <div className="flex items-center justify-between border-b border-[#3b494b] pb-2 mb-4">
            <span className="font-mono text-[10px] text-[#00F0FF] font-bold uppercase">
              RETRIEVAL FREQUENCY
            </span>

            <Activity className="w-4 h-4 text-[#00F0FF]" />
          </div>

          <div className="space-y-2">
            {analytics.retrievalFrequencySeries.map((item) => {
              const maxFreq = Math.max(
                ...analytics.retrievalFrequencySeries.map(
                  (entry) => entry.freq
                )
              );

              return (
                <div
                  key={item.time}
                  className="grid grid-cols-[50px_1fr_45px] gap-2 items-center"
                >
                  <span className="font-mono text-[9px] text-[#849495]">
                    {item.time}
                  </span>

                  <div className="h-2 bg-[#0c0e10] border border-[#3b494b]">
                    <div
                      className="h-full bg-[#00F0FF]"
                      style={{
                        width: `${(item.freq / maxFreq) * 100}%`,
                      }}
                    />
                  </div>

                  <span className="font-mono text-[9px] text-[#b9cacb] text-right">
                    {item.freq.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CATEGORY DISTRIBUTION */}
        <div className="bg-[#121416] border border-[#3b494b] rounded-[4px] p-4">
          <div className="flex items-center justify-between border-b border-[#3b494b] pb-2 mb-4">
            <span className="font-mono text-[10px] text-[#00F0FF] font-bold uppercase">
              MEMORY NODES BY CATEGORY
            </span>

            <Database className="w-4 h-4 text-[#00F0FF]" />
          </div>

          <div className="space-y-3">
            {analytics.categoryDistribution.map((item) => (
              <div key={item.category}>
                <div className="flex justify-between font-mono text-[10px] mb-1">
                  <span className="text-[#e2e2e5]">
                    {item.category}
                  </span>

                  <span className="text-[#00F0FF]">
                    {item.count}
                  </span>
                </div>

                <div className="h-2 bg-[#0c0e10] border border-[#3b494b]">
                  <div
                    className="h-full bg-[#00F0FF]"
                    style={{
                      width: `${(item.count / maxCategoryCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONFIDENCE DISTRIBUTION */}
        <div className="bg-[#121416] border border-[#3b494b] rounded-[4px] p-4">
          <div className="flex items-center justify-between border-b border-[#3b494b] pb-2 mb-4">
            <span className="font-mono text-[10px] text-[#00F0FF] font-bold uppercase">
              CONFIDENCE DISTRIBUTION
            </span>

            <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
          </div>

          <div className="space-y-3">
            {analytics.confidenceBuckets.map((bucket) => (
              <div key={bucket.range}>
                <div className="flex justify-between font-mono text-[10px] mb-1">
                  <span className="text-[#e2e2e5]">
                    {bucket.range}
                  </span>

                  <span className="text-[#00F0FF]">
                    {bucket.count} ({bucket.pct}%)
                  </span>
                </div>

                <div className="h-2 bg-[#0c0e10] border border-[#3b494b]">
                  <div
                    className="h-full bg-[#00F0FF]"
                    style={{
                      width: `${(bucket.count / maxConfidenceCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SYSTEM STATISTICS */}
        <div className="lg:col-span-2 bg-[#121416] border border-[#3b494b] rounded-[4px] p-4">
          <div className="font-mono text-[10px] text-[#00F0FF] font-bold uppercase border-b border-[#3b494b] pb-2 mb-3">
            SYSTEM TELEMETRY
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[10px]">
            <div>
              <span className="text-[#849495] block">
                CONTRADICTIONS DETECTED
              </span>

              <span className="text-amber-400 text-[16px] font-bold">
                {analytics.contradictionsDetectedCount}
              </span>
            </div>

            <div>
              <span className="text-[#849495] block">
                AVG CONFIDENCE
              </span>

              <span className="text-[#e2e2e5] text-[16px] font-bold">
                {analytics.averageConfidencePct}%
              </span>
            </div>

            <div>
              <span className="text-[#849495] block">
                GARBAGE COLLECTION
              </span>

              <span className="text-[#e2e2e5] text-[16px] font-bold">
                {analytics.systemGarbageCollectionsCount}
              </span>
            </div>

            <div>
              <span className="text-[#849495] block">
                BEHAVIORAL CONSISTENCY
              </span>

              <span className="text-emerald-400 text-[16px] font-bold">
                {analytics.behavioralConsistencyScorePct}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};