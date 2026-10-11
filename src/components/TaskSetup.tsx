import React, { useState } from 'react';
import {
  Lock,
  Plus,
  Minus,
  CheckCircle2,
  Circle,
  Shield,
  ShieldAlert,
  Flame,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { StrictnessLevel, StudyCycleMode, AmbientSoundType, StudyPlanItem } from '../types';

interface Props {
  onStartLock: (params: {
    taskTitle: string;
    plannedMinutes: number;
    strictness: StrictnessLevel;
    cycleMode: StudyCycleMode;
    ambientSound: AmbientSoundType;
  }) => void;
  planItems: StudyPlanItem[];
  onTogglePlanItem: (id: string) => void;
  onAddPlanItem: (title: string, minutes: number) => void;
  activeAmbientSound: AmbientSoundType;
}

const PRESET_MINUTES = [15, 25, 45, 60, 90];
const TASK_SUGGESTIONS = ['考研高数真题', '英语真题精读', '数据结构算法', '专业文献攻坚', '深度阅读写作'];

export const TaskSetup: React.FC<Props> = ({
  onStartLock,
  planItems,
  onTogglePlanItem,
  onAddPlanItem,
  activeAmbientSound,
}) => {
  const [cycleMode, setCycleMode] = useState<StudyCycleMode>('single');
  const [taskTitle, setTaskTitle] = useState('');
  const [plannedMinutes, setPlannedMinutes] = useState(45);
  const [strictness, setStrictness] = useState<StrictnessLevel>('standard');
  const [newPlanText, setNewPlanText] = useState('');

  const handleStepMinutes = (delta: number) => {
    setPlannedMinutes((prev) => Math.max(5, Math.min(180, prev + delta)));
  };

  const handleAddPlan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPlanText.trim()) return;
    onAddPlanItem(newPlanText.trim(), plannedMinutes);
    setNewPlanText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartLock({
      taskTitle: taskTitle.trim() || '专注自修',
      plannedMinutes,
      strictness,
      cycleMode,
      ambientSound: activeAmbientSound,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-5 space-y-4 select-none pb-24">
      {/* Header Branding (Ant Design Mini Card style) */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>雪穗自习室</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#2c2c2e] text-[#aeaeb2] font-normal">
              v2.0 沉浸端
            </span>
          </h1>
          <p className="text-xs text-[#8e8e93] mt-0.5">
            防沉迷锁屏 · 戒断娱乐软件 · 沉潜心流
          </p>
        </div>
      </div>

      {/* Segmented Control (Ant Design Mini Segmented) */}
      <div className="bg-[#1c1c1e] p-1 rounded-2xl border border-[#2c2c2e] flex items-center">
        <button
          type="button"
          onClick={() => {
            setCycleMode('single');
            setPlannedMinutes(45);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            cycleMode === 'single'
              ? 'bg-[#2c2c2e] text-white shadow-sm'
              : 'text-[#8e8e93] hover:text-white'
          }`}
        >
          单次深度攻坚
        </button>
        <button
          type="button"
          onClick={() => {
            setCycleMode('pomodoro');
            setPlannedMinutes(25);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            cycleMode === 'pomodoro'
              ? 'bg-[#2c2c2e] text-white shadow-sm'
              : 'text-[#8e8e93] hover:text-white'
          }`}
        >
          番茄钟循环 (25m专注+5m休息)
        </button>
      </div>

      {/* Main Form Card (Ant Design Mini Card) */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card 1: 任务输入 */}
        <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">当前学习任务</span>
            <span className="text-[11px] text-[#8e8e93]">选填或直接开始</span>
          </div>

          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="输入攻坚目标，如：考研高数极限与微分..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-[#2c2c2e] text-xs text-white placeholder-[#636366] focus:outline-none focus:border-[#8e8e93] transition"
          />

          {/* Quick Tag suggestions (Ant Design Mini Tag) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {TASK_SUGGESTIONS.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => setTaskTitle(tag)}
                className="px-2.5 py-1 rounded-full bg-[#141416] hover:bg-[#242426] border border-[#2c2c2e] text-[11px] text-[#8e8e93] hover:text-white transition shrink-0 cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Card 2: 时长设定 (Ant Design Mini Stepper & Tag Grid) */}
        <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">专注目标时长</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-medium text-white">
                {plannedMinutes}
              </span>
              <span className="text-xs text-[#8e8e93]">分钟</span>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#141416] border border-[#2c2c2e]">
            <button
              type="button"
              onClick={() => handleStepMinutes(-5)}
              className="p-1.5 rounded-lg bg-[#242426] text-[#aeaeb2] hover:text-white transition cursor-pointer"
              title="减少 5 分钟"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="text-xs font-mono font-medium text-white tracking-wider">
              {plannedMinutes} 分钟 ·{' '}
              {cycleMode === 'pomodoro' ? '第 1 轮番茄钟' : '单次深度沉浸'}
            </div>
            <button
              type="button"
              onClick={() => handleStepMinutes(5)}
              className="p-1.5 rounded-lg bg-[#242426] text-[#aeaeb2] hover:text-white transition cursor-pointer"
              title="增加 5 分钟"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_MINUTES.map((m) => {
              const isSelected = plannedMinutes === m;
              return (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPlannedMinutes(m)}
                  className={`py-2 rounded-xl text-xs font-mono transition cursor-pointer border ${
                    isSelected
                      ? 'bg-white text-black font-semibold border-white'
                      : 'bg-[#141416] text-[#8e8e93] border-[#2c2c2e] hover:text-white hover:border-[#48484a]'
                  }`}
                >
                  {m}m
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 3: 防沉迷严格度守护 (Ant Design Mini List Cell) */}
        <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-[#2c2c2e]">
            <span className="text-xs font-semibold text-white">防沉迷防脱轨机制</span>
            <span className="text-[11px] text-[#8e8e93]">约束下意识切屏刷手机</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: 'standard' as const,
                title: '标准守护',
                desc: '切屏警示拦截',
              },
              {
                id: 'strict' as const,
                title: '深度闭关',
                desc: '开锁冷静60秒',
              },
              {
                id: 'gentle' as const,
                title: '自由自律',
                desc: '随时自由开锁',
              },
            ].map((st) => {
              const active = strictness === st.id;
              return (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setStrictness(st.id)}
                  className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                    active
                      ? 'bg-[#2c2c2e] text-white border-[#48484a]'
                      : 'bg-[#141416] text-[#8e8e93] border-[#2c2c2e] hover:border-[#3a3a3c]'
                  }`}
                >
                  <div className="text-xs font-semibold">{st.title}</div>
                  <div className="text-[10px] text-[#636366] mt-0.5">{st.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 4: 今日研学日程与清单 (Ant Design Mini List) */}
        <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#2c2c2e]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-semibold text-white">今日研学日程规划</span>
            </div>
            <span className="text-[11px] text-[#8e8e93] font-mono">
              {planItems.filter((p) => p.completed).length}/{planItems.length} 完成
            </span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {planItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onTogglePlanItem(item.id)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer ${
                  item.completed
                    ? 'bg-[#141416] text-[#636366] line-through'
                    : 'bg-[#242426] text-white hover:bg-[#2c2c2e]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {item.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158] shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[#8e8e93] shrink-0" />
                  )}
                  <span className="truncate">{item.title}</span>
                </div>
                <span className="text-[10px] font-mono text-[#8e8e93] shrink-0">
                  {item.minutes}m
                </span>
              </div>
            ))}
          </div>

          {/* Quick add plan */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newPlanText}
              onChange={(e) => setNewPlanText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPlan();
                }
              }}
              placeholder="添加今日时段安排，如：下午背诵专八词汇..."
              className="flex-1 px-3 py-2 rounded-xl bg-[#141416] border border-[#2c2c2e] text-xs text-white placeholder-[#636366] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddPlan()}
              className="px-3 py-2 rounded-xl bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white text-xs font-medium transition cursor-pointer shrink-0"
            >
              添加
            </button>
          </div>
        </div>

        {/* Capsule Start Button (Ant Design Mini Button Primary) */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 rounded-full bg-white hover:bg-[#e5e5ea] active:scale-[0.98] text-black font-semibold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>开启锁屏专注 ({plannedMinutes} 分钟)</span>
          </button>
          <div className="text-center text-[11px] text-[#636366] mt-2.5 font-mono">
            全屏防切屏巡查 · 随时可自主开锁 · 结束生成学情档案
          </div>
        </div>
      </form>
    </div>
  );
};
