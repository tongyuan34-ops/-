import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentTaskTitle?: string;
}

const QUICK_PROMPTS = [
  '请用通俗严谨的方式解释该知识点的底层逻辑',
  '针对该问题，有哪些高频考点和易错陷阱？',
  '推导公式原理与适用条件',
  '心浮气躁想看娱乐软件，如何快速定住心绪？',
];

export const AIAskModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentTaskTitle,
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [history, setHistory] = useState<
    Array<{
      role: 'user' | 'assistant';
      content: string;
      time: string;
    }>
  >([
    {
      role: 'assistant',
      content: `学者你好，我是雪穗内置的**大模型伴学导师（Gemini 3.8 Flash）**。
在自习过程中遇到**数理公式推导、编程算法阻塞、知识点盲区**，或**感到浮躁想看手机**，皆可直接向我提问。`,
      time: '刚刚',
    },
  ]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = question.trim();
    if (!query || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory((prev) => [...prev, { role: 'user', content: query, time: timeStr }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          studyContext: currentTaskTitle || '专注自修',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '请求失败');

      setHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || '未能获取到解答，请重试。',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ 请求异常：${err.message || '网络连接不稳定，请稍后重试'}。`,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-[85vh] max-h-[720px] bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-neutral-300" />
            <h3 className="text-sm font-medium text-neutral-100">大模型伴学答疑</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
              Gemini 3.8 Flash
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs">
          {history.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="text-[10px] text-neutral-500 mb-1 px-1 font-mono">
                {msg.role === 'user' ? '学者提问' : '大模型解答'} · {msg.time}
              </div>
              <div
                className={`max-w-[88%] rounded-xl px-4 py-3 leading-relaxed whitespace-pre-wrap transition ${
                  msg.role === 'user'
                    ? 'bg-neutral-800 text-white'
                    : 'bg-neutral-900 border border-neutral-850 text-neutral-200'
                }`}
              >
                <div>{msg.content}</div>

                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="mt-2 pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-white" />
                        <span className="text-white">已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 pt-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
              <span>大模型思考推导中...</span>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-5 py-2 border-t border-neutral-900 flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-neutral-600 shrink-0 font-mono">快捷:</span>
          {QUICK_PROMPTS.map((q, i) => (
            <button
              key={i}
              onClick={() => setQuestion(q)}
              className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 shrink-0 transition border border-neutral-850 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-3.5 border-t border-neutral-900 flex items-center gap-2 bg-neutral-950"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="输入学术问题、公式推导、或自律求助..."
            disabled={loading}
            className="flex-1 px-3.5 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-4 py-2 rounded-lg bg-white text-black font-medium text-xs hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            <span>提问</span>
          </button>
        </form>
      </div>
    </div>
  );
};
