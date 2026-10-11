import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Copy,
  Check,
  ChevronRight,
  Loader2,
  Send,
  Sparkles,
} from 'lucide-react';

interface Props {
  currentTaskTitle?: string;
}

const PRESET_TOPICS = [
  { id: 'math', label: '数理推导', sample: '请严密推导微积分基本定理的直观物理意义' },
  { id: 'cs', label: '代码算法', sample: '分析快速排序与归并排序的时空复杂度与稳定性差异' },
  { id: 'lang', label: '外语语法', sample: '英语长难句中虚拟语气与倒装句的常见结构拆解' },
  { id: 'exam', label: '考研应试', sample: '考研政治马原核心辩证法考点与易混淆陷阱' },
  { id: 'focus', label: '心流调节', sample: '学习学不进去、很想点开娱乐软件，如何快速定神？' },
];

export const ScholarKnowledgeDesk: React.FC<Props> = ({ currentTaskTitle }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [records, setRecords] = useState<
    Array<{ q: string; a: string; time: string }>
  >([
    {
      q: '自习室学术查疑指南',
      a: `学者你好。本求索台专为自习期间遇到的学术卡点设计：
• **数理与统计**：公式推导、定理证明、几何物理意义。
• **编程与算法**：算法时空复杂度分析、数据结构逻辑。
• **外语与文科**：语法句法剖析、核心考点框架提炼。
• **自律与专注**：注意力涣散时的心理锚定与克服拖延建议。
输入具体学术难点即可获得深度推导与解答。`,
      time: '置顶说明',
    },
  ]);

  const handleQuery = async (queryText?: string) => {
    const textToSearch = (queryText || question).trim();
    if (!textToSearch || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLoading(true);
    if (!queryText) setQuestion('');

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSearch,
          studyContext: currentTaskTitle || '自主深研',
        }),
      });
      const data = await res.json();
      const answer = data.answer || '未能获取到解答，请检查网络后重试。';
      setRecords((prev) => [{ q: textToSearch, a: answer, time: timeStr }, ...prev]);
    } catch (err: any) {
      setRecords((prev) => [
        {
          q: textToSearch,
          a: `⚠️ 检索异常：${err.message || '网络不稳定，请稍后重试'}`,
          time: timeStr,
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 space-y-4 select-none pb-24">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-lg font-semibold text-white tracking-tight">学者求索台</h2>
        <p className="text-xs text-[#8c8c91] mt-0.5">
          学术知识检索 · 公式推导 · 考点梳理
        </p>
      </div>

      {/* Ant Design Mini Search Bar */}
      <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-2.5 shadow-sm flex items-center gap-2">
        <Search className="w-4 h-4 text-[#8e8e93] shrink-0 ml-1" />
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleQuery();
            }
          }}
          placeholder="检索定理、公式、算法或自律困惑..."
          disabled={loading}
          className="flex-1 bg-transparent text-xs text-white placeholder-[#636366] focus:outline-none"
        />
        <button
          onClick={() => handleQuery()}
          disabled={loading || !question.trim()}
          className="px-3 py-1.5 rounded-xl bg-white text-black font-medium text-xs hover:bg-[#e5e5ea] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1 shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>求索</span>}
        </button>
      </div>

      {/* Quick Pills (Ant Design Mini Tag / Capsule) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {PRESET_TOPICS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleQuery(p.sample)}
            disabled={loading}
            className="px-2.5 py-1 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-[#2c2c2e] text-[11px] text-[#8e8e93] hover:text-white transition shrink-0 cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Records & Cards (Ant Design Mini Card & Cell) */}
      <div className="space-y-3">
        {loading && (
          <div className="p-4 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e] text-center text-xs text-[#8e8e93] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>深度推导检索中，请稍候...</span>
          </div>
        )}

        {records.map((rec, idx) => (
          <div
            key={idx}
            className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-4 shadow-sm space-y-2.5"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#2c2c2e]">
              <div className="flex items-center gap-2 truncate pr-2">
                <BookOpen className="w-3.5 h-3.5 text-[#8e8e93] shrink-0" />
                <span className="text-xs font-semibold text-white truncate">{rec.q}</span>
              </div>
              <span className="text-[10px] text-[#636366] font-mono shrink-0">
                {rec.time}
              </span>
            </div>

            <div className="text-xs text-[#d1d1d6] leading-relaxed whitespace-pre-wrap font-sans">
              {rec.a}
            </div>

            <div className="pt-2 border-t border-[#2c2c2e] flex items-center justify-end">
              <button
                onClick={() => handleCopy(rec.a, idx)}
                className="text-[11px] text-[#8e8e93] hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3 h-3 text-white" />
                    <span className="text-white">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>复制解析</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
