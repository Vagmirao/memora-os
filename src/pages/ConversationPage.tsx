import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, MoreHorizontal, Network, Sparkles, History, ArrowRight } from 'lucide-react';
import { MemoryIndicator } from '../components/conversation/MemoryIndicator';
import { Conversation, Message, Memory } from '../types';
import { getConversations, sendMessage, getMemories } from '../services/api';

interface ConversationPageProps {
  onNavigate: (path: string) => void;
  onSelectMemory: (memory: Memory) => void;
}

export const ConversationPage: React.FC<ConversationPageProps> = ({
  onNavigate,
  onSelectMemory,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('conv-alpha-09');
  const [input, setInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const convs = await getConversations();
    setConversations(convs);
    const mems = await getMemories();
    setRecentMemories(mems.slice(0, 5));
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, isProcessing]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userText = input;
    setInput('');
    setIsProcessing(true);

    try {
      await sendMessage(activeConvId, userText);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden font-sans bg-[#0c0e10] relative">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col z-10 overflow-hidden m-3 bg-[#121416]/80 border border-[#3b494b]/60 rounded-[4px] relative">
        {/* Chat Header */}
        <div className="h-11 flex items-center justify-between px-4 bg-[#1e2022]/90 border-b border-[#3b494b] shrink-0">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-[#00F0FF]" />
            <span className="font-mono text-[11px] text-[#e2e2e5] tracking-widest uppercase font-bold">
              {activeConv?.title || 'Session / Alpha-9'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-[#b9cacb] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
              Processing Context
            </span>
            <button className="text-[#849495] hover:text-[#00F0FF] transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-center my-2">
            <span className="font-mono text-[10px] text-[#849495] bg-[#1e2022] px-3 py-1 border border-[#3b494b]/40 rounded-[2px]">
              INITIALIZING COGNITIVE LOOP // [10:24 AM]
            </span>
          </div>

          {activeConv?.messages.map((msg) => (
            <div key={msg.id} className="flex flex-col space-y-2">
              {/* User Message */}
              {msg.role === 'user' && (
                <div className="flex w-full bg-[#1a1c1e]/70 border border-[#3b494b]/40 p-3 rounded-[4px]">
                  <p className="font-sans text-[13px] text-[#e2e2e5] leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              )}

              {/* Assistant Message with Memory Tags */}
              {msg.role === 'assistant' && (
                <div className="flex w-full bg-[#121416] border-l-2 border-[#00F0FF] p-3.5 rounded-[4px] flex-col gap-2">
                  <MemoryIndicator
                    retrieved={msg.retrievedMemories}
                    created={msg.createdMemory}
                  />

                  <p className="font-sans text-[13px] text-[#e2e2e5] leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </p>

                  {msg.executionTimeMs && (
                    <div className="font-mono text-[9px] text-[#849495] pt-1">
                      EXECUTION TIME: {msg.executionTimeMs}ms
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 bg-[#121416] border-l-2 border-[#00F0FF] p-3 rounded-[4px]">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping" />
              <span className="font-mono text-[10px] text-[#00F0FF] uppercase tracking-widest">
                Searching cognitive nodes & generating memory response...
              </span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Console Bar */}
        <div className="p-3 bg-[#1e2022] border-t border-[#3b494b] shrink-0">
          <div className="relative bg-[#0c0e10] border border-[#3b494b] flex items-center px-3 py-2 focus-within:border-[#00F0FF] transition-colors rounded-[2px]">
            <span className="font-mono text-[12px] text-[#00F0FF] mr-2">&gt;</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Transmit instruction to ARIA... (e.g. Actually, I'm learning Rust now)"
              className="flex-1 bg-transparent border-none outline-none font-mono text-[12px] text-[#e2e2e5] placeholder-[#849495]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className="ml-3 px-3 py-1 bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 font-mono text-[10px] uppercase tracking-widest transition-all rounded-[2px] disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <div className="flex justify-between items-center mt-1.5 px-1 font-mono text-[9px] text-[#849495]">
            <span>Model: GEMINI-2.5-PRO-COGNITIVE</span>
            <span>Enter to transmit / Shift+Enter for newline</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Cognitive Matrix */}
      <div className="w-80 flex flex-col my-3 mr-3 bg-[#121416] border border-[#3b494b]/60 rounded-[4px] shrink-0">
        <div className="p-3 border-b border-[#3b494b] bg-[#1a1c1e]">
          <h2 className="font-mono text-[11px] text-[#e2e2e5] uppercase tracking-widest font-bold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            Cognitive Matrix
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Active Context Nodes */}
          <div>
            <h3 className="font-mono text-[10px] text-[#849495] uppercase tracking-widest mb-1.5 border-b border-[#3b494b]/30 pb-1">
              Active Context Nodes
            </h3>
            <div className="h-20 bg-[#0c0e10] border border-[#3b494b]/50 rounded-[2px] relative overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full opacity-80" viewBox="0 0 100 100">
                <line x1="20" y1="50" x2="50" y2="30" stroke="#3b494b" strokeWidth="1" />
                <line x1="50" y1="30" x2="80" y2="50" stroke="#3b494b" strokeWidth="1" />
                <line
                  x1="50"
                  y1="30"
                  x2="50"
                  y2="70"
                  stroke="#00F0FF"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <rect x="18" y="48" width="4" height="4" fill="#849495" />
                <rect x="78" y="48" width="4" height="4" fill="#849495" />
                <rect x="47" y="27" width="6" height="6" fill="#c6c6c9" />
                <rect x="47" y="67" width="6" height="6" fill="#00F0FF" />
              </svg>
              <div className="absolute bottom-1 left-1 font-mono text-[8px] text-[#00F0FF] bg-[#121416] px-1 rounded-[2px]">
                Topography: Stable
              </div>
            </div>
          </div>

          {/* Memory Stream */}
          <div>
            <h3 className="font-mono text-[10px] text-[#849495] uppercase tracking-widest mb-1.5 flex justify-between items-center border-b border-[#3b494b]/30 pb-1">
              <span>Memory Stream</span>
              <button
                onClick={() => onNavigate('memories')}
                className="text-[9px] text-[#00F0FF] hover:underline"
              >
                VIEW ALL
              </button>
            </h3>

            <div className="space-y-2">
              {recentMemories.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMemory(m)}
                  className="p-2 bg-[#1a1c1e] border border-[#3b494b]/40 rounded-[2px] hover:border-[#00F0FF]/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[9px] text-[#00F0FF]">
                      #{m.id}
                    </span>
                    <span className="font-mono text-[8px] text-[#849495]">
                      v{m.version}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-[#b9cacb] line-clamp-2 leading-tight">
                    {m.title}
                  </p>
                  <div className="flex gap-2 mt-1 font-mono text-[8px] text-[#849495]">
                    <span>CONF: {Math.round(m.confidence * 100)}%</span>
                    <span>TYPE: {m.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cognitive Bias */}
          <div className="pt-2">
            <div className="flex justify-between items-end mb-2 border-b border-[#3b494b]/30 pb-1">
              <h3 className="font-mono text-[10px] text-[#849495] uppercase tracking-widest">
                Cognitive Bias
              </h3>
              <span className="font-mono text-[9px] text-[#00F0FF]">AUTO-TUNING</span>
            </div>
            <div className="space-y-2 font-mono text-[10px]">
              <div className="flex items-center gap-2">
                <span className="text-[#e2e2e5] w-16">Technical</span>
                <div className="flex-1 h-1.5 bg-[#0c0e10] border border-[#3b494b]/30 flex gap-0.5">
                  <div className="h-full w-1/5 bg-[#849495]" />
                  <div className="h-full w-1/5 bg-[#849495]" />
                  <div className="h-full w-1/5 bg-[#849495]" />
                  <div className="h-full w-1/5 bg-[#00F0FF]" />
                  <div className="h-full w-1/5 bg-[#282a2c]" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#e2e2e5] w-16">Direct</span>
                <div className="flex-1 h-1.5 bg-[#0c0e10] border border-[#3b494b]/30 flex gap-0.5">
                  <div className="h-full w-1/5 bg-[#849495]" />
                  <div className="h-full w-1/5 bg-[#849495]" />
                  <div className="h-full w-1/5 bg-[#849495]" />
                  <div className="h-full w-1/5 bg-[#282a2c]" />
                  <div className="h-full w-1/5 bg-[#282a2c]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
