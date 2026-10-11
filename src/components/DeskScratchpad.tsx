import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  Circle,
  Volume2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { DeskNote, AmbientSoundType } from '../types';
import { soundManager } from '../utils/sound';

interface Props {
  notes: DeskNote[];
  onAddNote: (content: string) => void;
  onDeleteNote: (id: string) => void;
  activeAmbientSound: AmbientSoundType;
  onChangeAmbientSound: (sound: AmbientSoundType) => void;
}

export const DeskScratchpad: React.FC<Props> = ({
  notes,
  onAddNote,
  onDeleteNote,
  activeAmbientSound,
  onChangeAmbientSound,
}) => {
  const [inputText, setInputText] = useState('');
  const [ambientVolume, setAmbientVolume] = useState(0.45);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onAddNote(inputText.trim());
    setInputText('');
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    soundManager.setVolume(vol);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 space-y-5 select-none pb-24">
      {/* Page Header */}
      <div className="px-1">
        <h2 className="text-lg font-semibold text-white tracking-tight">案头备忘与声景</h2>
        <p className="text-xs text-[#8c8c91] mt-0.5">
          记录杂念清空大脑 · 调谐沉浸白噪音
        </p>
      </div>

      {/* Card 1: 杂念暂存便签 (Ant Design Mini Card style) */}
      <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#2c2c2e]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-white" />
            <span className="text-xs font-medium text-white">杂念备忘便签</span>
          </div>
          <span className="text-[11px] text-[#8c8c91] font-mono">
            {notes.length} 条已记录
          </span>
        </div>

        <p className="text-[11px] text-[#8c8c91] leading-relaxed">
          自修时脑中闪现的琐事（如：买文具、发邮件），写在此处即可放心继续专注，避免拿起手机分心。
        </p>

        {/* Note List */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {notes.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#636366]">
              暂无杂念备忘。保持大脑专注空明。
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#242426] border border-[#2f2f32] text-xs text-[#e5e5ea]"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8e8e93] shrink-0" />
                  <span className="truncate">{note.content}</span>
                </div>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="text-[#636366] hover:text-[#ff453a] transition-colors p-1 cursor-pointer shrink-0"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleAdd} className="flex gap-2 pt-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="写下偶发想法（如：下课查资料）..."
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#141416] border border-[#2c2c2e] text-white placeholder-[#636366] focus:outline-none focus:border-[#8e8e93] transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-3.5 py-2 rounded-xl bg-white text-black font-medium text-xs hover:bg-[#e5e5ea] disabled:opacity-40 transition cursor-pointer shrink-0"
          >
            记录
          </button>
        </form>
      </div>

      {/* Card 2: 伴读白噪音声景 (Ant Design Mini Card style) */}
      <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-4 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#2c2c2e]">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-white" />
            <span className="text-xs font-medium text-white">自习室伴读白噪音</span>
          </div>
          <span className="text-[11px] text-[#8c8c91] font-mono">
            {activeAmbientSound === 'none' ? '静音中' : '播放中'}
          </span>
        </div>

        {/* Sound Selection Grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'none' as const, label: '静音', desc: '纯粹思考' },
            { id: 'rain' as const, label: '初雪落雨', desc: '温润遮噪' },
            { id: 'white_noise' as const, label: '深空白噪', desc: '阻隔杂音' },
            { id: 'library_clock' as const, label: '书斋木钟', desc: '沉稳节拍' },
            { id: 'temple_bell' as const, label: '古刹禅钟', desc: '深远定神' },
            { id: 'fireplace' as const, label: '温炉柴火', desc: '安宁笃定' },
          ].map((snd) => {
            const isSelected = activeAmbientSound === snd.id;
            return (
              <button
                key={snd.id}
                onClick={() => {
                  onChangeAmbientSound(snd.id);
                  soundManager.playAmbient(snd.id);
                }}
                className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#2c2c2e] text-white border-[#48484a]'
                    : 'bg-[#141416] text-[#8e8e93] border-[#262628] hover:text-[#d1d1d6] hover:border-[#3a3a3c]'
                }`}
              >
                <div className="text-xs font-medium">{snd.label}</div>
                <div className="text-[10px] text-[#636366] mt-0.5">{snd.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Volume Slider */}
        {activeAmbientSound !== 'none' && (
          <div className="pt-2 border-t border-[#2c2c2e] flex items-center gap-3">
            <span className="text-[11px] text-[#8e8e93] shrink-0">音量</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambientVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-white h-1.5 bg-[#2c2c2e] rounded cursor-pointer"
            />
            <span className="text-[11px] text-[#8e8e93] font-mono shrink-0 w-8 text-right">
              {Math.round(ambientVolume * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Card 3: 防沉迷自律公约 (Ant Design Mini List style) */}
      <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-4 shadow-sm space-y-2">
        <div className="flex items-center gap-2 pb-2 border-b border-[#2c2c2e]">
          <ShieldCheck className="w-4 h-4 text-white" />
          <span className="text-xs font-medium text-white">雪穗自律公约</span>
        </div>
        <div className="text-xs text-[#a1a1a6] leading-relaxed space-y-1.5 pt-1">
          <div className="flex items-start gap-2">
            <span className="text-white font-mono text-[11px]">01</span>
            <span>自习期间视线远离社交与短视频，勿让碎片娱乐吞噬意志。</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-white font-mono text-[11px]">02</span>
            <span>凡遇学术疑问，案头随时查阅，不切出浏览器无端闲逛。</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-white font-mono text-[11px]">03</span>
            <span>心浮气躁时默数三秒深呼吸，专注力在于日积月累的克制。</span>
          </div>
        </div>
      </div>
    </div>
  );
};
