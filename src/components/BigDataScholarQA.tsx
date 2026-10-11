import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  BookOpen,
  Loader2,
  Copy,
  Check,
  ChevronRight,
  HeartHandshake,
  Database,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentTaskTitle?: string;
  isInsideLockScreen?: boolean;
}

const SUBJECT_PRESETS = [
  { id: 'math', label: '数理与统计' },
  { id: 'cs', label: '计算机与代码' },
  { id: 'language', label: '外语与语法' },
  { id: 'literature', label: '文史哲理' },
  { id: 'exam', label: '考研/公考/资格' },
  { id: 'general', label: '通识与论文' },
];

const BIGDATA_QUICK_QUESTIONS = [
  '请用通俗且严谨的方式解释该知识点的底层逻辑',
  '针对该问题，有哪些高频考点和易混淆陷阱？',
  '请梳理本专题的结构化知识导图与要点清单',
  '推导相关定理/公式的来龙去脉与应用场景',
];

const MENTOR_QUICK_QUESTIONS = [
  '想点开娱乐软件刷手机，怎样快速把心绪定住？',
  '感觉任务好难、有拖延阻抗，如何破除第一步？',
  '已经专注攻坚了很久有点倦怠，该如何调适？',
  '请给我一句当前最能抚平浮躁的学者勉励。',
];

export const BigDataScholarQA: React.FC<Props> = ({
  isOpen,
  onClose,
  currentTaskTitle,
  isInsideLockScreen = false,
}) => {
  const [activeTab, setActiveTab] = useState<'bigdata' | 'mentor'>('bigdata');
  const [selectedSubject, setSelectedSubject] = useState(SUBJECT_PRESETS[0].label);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [history, setHistory] = useState<
    Array<{
      role: 'user' | 'assistant';
      type: 'bigdata' | 'mentor';
      content: string;
      time: string;
    }>
  >([
    {
      role: 'assistant',
      type: 'bigdata',
      content: `学者你好，我是雪穗自习室接入的**大数据学术知识库与伴读智能体**。
- 【学术大数据智库】：可检索数理公式推导、编程算法解析、各科考点疑难与长难句。
- 【雪穗伴学导师】：若感到心浮气躁、想看娱乐软件或学习遇阻，随时向我倾诉，我将为你提供自律指导与心态疏导。`,
      time: '刚刚',
    },
  ]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = question.trim();
    if (!query || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      role: 'user' as const,
      type: activeTab,
      content: query,
      time: timeStr,
    };
    setHistory((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      if (activeTab === 'bigdata') {
        const res = await fetch('/api/scholar/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: query,
            subject: selectedSubject,
            studyContext: currentTaskTitle || '自主深研',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '检索失败');

        setHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            type: 'bigdata',
            content: data.answer || '未能获取到学术解答，请重试。',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        // Mentor companion chat
        const res = await fetch('/api/agent/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            currentTaskTitle: currentTaskTitle || '自主研读',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '陪伴对话失败');

        setHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            type: 'mentor',
            content: data.reply || '深吸一口气，保持内心的定力。',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          type: activeTab,
          content: `⚠️ 通信异常：${err.message || '网络连接不稳定，请稍后重试'}。`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
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

  const quickQuestions =
    activeTab === 'bigdata' ? BIGDATA_QUICK_QUESTIONS : MENTOR_QUICK_QUESTIONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl h-[90vh] max-h-[820px] rounded-3xl flex flex-col overflow-hidden border shadow-2xl transition-all ${
          isInsideLockScreen
            ? 'bg-stone-900 text-stone-100 border-stone-800'
            : 'bg-white text-stone-800 border-stone-200 shadow-stone-300/40'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-3.5 flex items-center justify-between border-b ${
            isInsideLockScreen
              ? 'bg-stone-950/70 border-stone-800'
              : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base sm:text-lg tracking-wide">
                  雪穗智能体与大数据学术智库
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {currentTaskTitle ? `当前研读：${currentTaskTitle}` : '全天候陪伴研学 · 杜绝娱乐分心'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isInsideLockScreen
                  ? 'bg-stone-950 border-stone-800'
                  : 'bg-stone-200/80 border-stone-300'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTab('bigdata')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'bigdata'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isInsideLockScreen
                    ? 'text-stone-400 hover:text-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>学术大数据</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mentor')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'mentor'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isInsideLockScreen
                    ? 'text-stone-400 hover:text-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>雪穗督学伴读</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isInsideLockScreen
                  ? 'hover:bg-stone-800 text-stone-400 hover:text-stone-200'
                  : 'hover:bg-stone-200 text-stone-500 hover:text-stone-800'
              }`}
              title="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subject selector tags (Only in BigData mode) */}
        {activeTab === 'bigdata' && (
          <div
            className={`px-5 py-2.5 border-b flex items-center gap-2 overflow-x-auto text-xs scrollbar-none ${
              isInsideLockScreen
                ? 'bg-stone-900/80 border-stone-800/80'
                : 'bg-stone-100/50 border-stone-200'
            }`}
          >
            <span className="text-stone-400 font-medium shrink-0 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> 学科领域:
            </span>
            {SUBJECT_PRESETS.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.label)}
                className={`px-3 py-1 rounded-md shrink-0 transition-all font-medium cursor-pointer ${
                  selectedSubject === sub.label
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isInsideLockScreen
                    ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* Mentor banner info (Only in Mentor mode) */}
        {activeTab === 'mentor' && (
          <div
            className={`px-5 py-2.5 border-b flex items-center gap-2 text-xs ${
              isInsideLockScreen
                ? 'bg-indigo-950/30 border-stone-800 text-indigo-300'
                : 'bg-indigo-50/70 border-indigo-100 text-indigo-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              智能体【雪穗】陪伴中：遇到分心想刷手机、厌学拖延、浮躁或困惑，随时倾诉与获得指引。
            </span>
          </div>
        )}

        {/* Message body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {history.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="text-[11px] text-stone-400 mb-1 px-1">
                {msg.role === 'user'
                  ? '学者提问'
                  : msg.type === 'mentor'
                  ? '雪穗伴读导师'
                  : '学术大数据智库'}{' '}
                · {msg.time}
              </div>
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all relative group ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : isInsideLockScreen
                    ? 'bg-stone-800/90 text-stone-200 border border-stone-700/60 rounded-tl-none'
                    : 'bg-stone-100 text-stone-800 border border-stone-200/80 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className={`mt-2 pt-2 border-t flex items-center gap-1 text-xs transition-opacity cursor-pointer ${
                      isInsideLockScreen
                        ? 'border-stone-700 text-stone-400 hover:text-stone-200'
                        : 'border-stone-200 text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">已复制内容</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex flex-col items-start animate-in fade-in">
              <div className="text-[11px] text-stone-400 mb-1 px-1">
                {activeTab === 'mentor' ? '雪穗伴读导师' : '学术大数据智库'} · 正在深思...
              </div>
              <div
                className={`rounded-2xl px-4 py-3 text-sm rounded-tl-none flex items-center gap-2.5 ${
                  isInsideLockScreen
                    ? 'bg-stone-800 text-stone-300 border border-stone-700'
                    : 'bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>
                  {activeTab === 'mentor'
                    ? '雪穗正在为你整理自律建议与心流指引...'
                    : '正在检索学术大数据与推导逻辑，请稍候...'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions */}
        <div
          className={`px-5 py-2 border-t flex items-center gap-2 overflow-x-auto text-xs scrollbar-none ${
            isInsideLockScreen
              ? 'bg-stone-900/60 border-stone-800'
              : 'bg-stone-50 border-stone-200'
          }`}
        >
          <span className="text-stone-400 shrink-0">快捷启发:</span>
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => setQuestion(q)}
              className={`px-2.5 py-1 rounded-md shrink-0 transition-colors flex items-center gap-1 cursor-pointer ${
                isInsideLockScreen
                  ? 'bg-stone-800/80 hover:bg-stone-700 text-stone-300'
                  : 'bg-stone-200/70 hover:bg-stone-300 text-stone-700'
              }`}
            >
              <span>{q}</span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className={`p-4 border-t flex items-center gap-3 ${
            isInsideLockScreen
              ? 'bg-stone-950/70 border-stone-800'
              : 'bg-white border-stone-200'
          }`}
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              activeTab === 'bigdata'
                ? `向大数据提问 [${selectedSubject}] 知识点、公式、解题思路...`
                : '向雪穗倾诉：如“很想刷手机怎么办”、“如何破除拖延”...'
            }
            disabled={loading}
            className={`flex-1 px-4 py-2.5 text-sm rounded-xl focus:outline-none transition-all ${
              isInsideLockScreen
                ? 'bg-stone-900 border border-stone-700/80 text-stone-100 placeholder-stone-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                : 'bg-stone-50 border border-stone-300 text-stone-900 placeholder-stone-400 focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600'
            }`}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{activeTab === 'bigdata' ? '求索' : '倾诉'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
