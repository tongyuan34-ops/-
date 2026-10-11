import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Flame,
  ShieldCheck,
  TrendingUp,
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { CycleStats } from '../types';

interface Props {
  cycleStats: CycleStats;
}

export const CycleStatsView: React.FC<Props> = ({ cycleStats }) => {
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d'>('7d');

  // Generate 7-day bar chart
  const getLast7DaysData = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86400000;

      const sessionsOnDay = cycleStats.history.filter(
        (s) => s.endTime >= dayStart && s.endTime < dayEnd
      );
      const totalMinutes = sessionsOnDay.reduce((acc, s) => acc + s.actualMinutes, 0);

      days.push({
        label: i === 0 ? '今日' : dateStr,
        minutes: totalMinutes,
      });
    }
    return days;
  };

  // Generate 28-day (4-week) heatmap
  const getHeatmapData = () => {
    const grid = [];
    const now = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86400000;
      const mins = cycleStats.history
        .filter((s) => s.endTime >= dayStart && s.endTime < dayEnd)
        .reduce((acc, s) => acc + s.actualMinutes, 0);
      grid.push({
        date: d.toLocaleDateString([], { month: 'numeric', day: 'numeric' }),
        minutes: mins,
      });
    }
    return grid;
  };

  // Time of Day distribution
  const getTimeOfDayDistribution = () => {
    let morning = 0, afternoon = 0, night = 0;
    cycleStats.history.forEach((s) => {
      const h = new Date(s.endTime).getHours();
      if (h >= 5 && h < 12) morning += s.actualMinutes;
      else if (h >= 12 && h < 18) afternoon += s.actualMinutes;
      else night += s.actualMinutes;
    });
    const total = Math.max(1, morning + afternoon + night);
    return {
      morningPct: Math.round((morning / total) * 100),
      afternoonPct: Math.round((afternoon / total) * 100),
      nightPct: Math.round((night / total) * 100),
    };
  };

  const last7Days = getLast7DaysData();
  const maxMinutes = Math.max(60, ...last7Days.map((d) => d.minutes));
  const heatmap = getHeatmapData();
  const timeDist = getTimeOfDayDistribution();

  const totalMinutesAllTime = cycleStats.history.reduce(
    (acc, s) => acc + (s.actualMinutes || 0),
    0
  );
  const totalHours = (totalMinutesAllTime / 60).toFixed(1);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-5 space-y-4 select-none pb-24">
      {/* Header (Ant Design Mini style) */}
      <div className="px-1">
        <h2 className="text-lg font-semibold text-white tracking-tight">学情周期档案</h2>
        <p className="text-xs text-[#8c8c91] mt-0.5">
          记录专注天数 · 习惯沉淀 · 战胜娱乐软件轨迹
        </p>
      </div>

      {/* Card 1: 核心指标四宫格 (Ant Design Mini Grid Card) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-[#8e8e93]">
            <Clock className="w-3.5 h-3.5 text-white" />
            <span>累计研学时长</span>
          </div>
          <div className="text-2xl font-mono font-medium text-white mt-1">
            {totalHours} <span className="text-xs text-[#8e8e93] font-sans">小时</span>
          </div>
          <div className="text-[10px] text-[#636366] mt-0.5">
            共 {cycleStats.totalSessions} 次深度锁屏
          </div>
        </div>

        <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-[#8e8e93]">
            <Flame className="w-3.5 h-3.5 text-white" />
            <span>自律连续打卡</span>
          </div>
          <div className="text-2xl font-mono font-medium text-white mt-1">
            {cycleStats.streakDays} <span className="text-xs text-[#8e8e93] font-sans">天</span>
          </div>
          <div className="text-[10px] text-[#636366] mt-0.5">
            日拱一卒，行稳致远
          </div>
        </div>

        <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-[#8e8e93]">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
            <span>本周累计沉浸</span>
          </div>
          <div className="text-2xl font-mono font-medium text-white mt-1">
            {cycleStats.weekTotalMinutes} <span className="text-xs text-[#8e8e93] font-sans">分钟</span>
          </div>
          <div className="text-[10px] text-[#636366] mt-0.5">
            约 {(cycleStats.weekTotalMinutes / 60).toFixed(1)}h 有效时长
          </div>
        </div>

        <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-[#8e8e93]">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>防沉迷戒断</span>
          </div>
          <div className="text-2xl font-mono font-medium text-white mt-1">
            {cycleStats.distractionPreventedCount || cycleStats.totalSessions * 2}{' '}
            <span className="text-xs text-[#8e8e93] font-sans">次</span>
          </div>
          <div className="text-[10px] text-[#636366] mt-0.5">
            抵制娱乐分心冲动
          </div>
        </div>
      </div>

      {/* Card 2: 7日柱状走势图 (Ant Design Mini Chart Card) */}
      <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#2c2c2e]">
          <span className="text-xs font-semibold text-white">近 7 日研学周期走势</span>
          <span className="text-[11px] font-mono text-[#8e8e93]">单位: 分钟</span>
        </div>

        <div className="h-32 flex items-end justify-between gap-1.5 pt-4 px-1">
          {last7Days.map((d, i) => {
            const hPercent = Math.max(8, Math.round((d.minutes / maxMinutes) * 100));
            const isToday = i === last7Days.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[10px] font-mono text-[#636366] group-hover:text-white transition">
                  {d.minutes > 0 ? d.minutes : ''}
                </span>
                <div className="w-full max-w-[26px] h-20 bg-[#141416] rounded-md flex items-end p-0.5">
                  <div
                    style={{ height: `${hPercent}%` }}
                    className={`w-full rounded-sm transition-all duration-300 ${
                      isToday ? 'bg-white' : d.minutes > 0 ? 'bg-[#48484a]' : 'bg-[#242426]'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-mono ${
                    isToday ? 'text-white font-semibold' : 'text-[#8e8e93]'
                  }`}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 3: 28日专注热力矩阵 (Ant Design Mini Heatmap Card) */}
      <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-[#2c2c2e]">
          <span className="text-xs font-semibold text-white">28 日研学热力矩阵</span>
          <div className="flex items-center gap-1 text-[10px] text-[#8e8e93]">
            <span>淡</span>
            <span className="w-2 h-2 rounded bg-[#242426]" />
            <span className="w-2 h-2 rounded bg-[#48484a]" />
            <span className="w-2 h-2 rounded bg-[#8e8e93]" />
            <span className="w-2 h-2 rounded bg-white" />
            <span>浓</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {heatmap.map((cell, idx) => {
            let bgClass = 'bg-[#242426]';
            if (cell.minutes >= 90) bgClass = 'bg-white';
            else if (cell.minutes >= 45) bgClass = 'bg-[#8e8e93]';
            else if (cell.minutes > 0) bgClass = 'bg-[#48484a]';

            return (
              <div
                key={idx}
                className={`h-6 rounded-md ${bgClass} transition flex items-center justify-center`}
                title={`${cell.date}: 专注 ${cell.minutes} 分钟`}
              />
            );
          })}
        </div>
      </div>

      {/* Card 4: 专注时段分布 (Ant Design Mini Progress Bar) */}
      <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#2c2c2e]">
          <span className="text-xs font-semibold text-white">个人专注时段偏好</span>
          <span className="text-[11px] text-[#8e8e93]">晨 / 午 / 夜</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#aeaeb2]">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-white" /> 晨间自修 (05:00-12:00)
            </span>
            <span className="font-mono text-white">{timeDist.morningPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#141416] rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${timeDist.morningPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[#aeaeb2] pt-1">
            <span className="flex items-center gap-1.5">
              <Sunset className="w-3.5 h-3.5 text-white" /> 午后攻坚 (12:00-18:00)
            </span>
            <span className="font-mono text-white">{timeDist.afternoonPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#141416] rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${timeDist.afternoonPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[#aeaeb2] pt-1">
            <span className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-white" /> 夜间沉潜 (18:00-24:00)
            </span>
            <span className="font-mono text-white">{timeDist.nightPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#141416] rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${timeDist.nightPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 5: 历史明细 (Ant Design Mini List Cell) */}
      <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-[#2c2c2e]">
          <span className="text-xs font-semibold text-white">自修历史明细档案</span>
          <span className="text-[11px] text-[#8e8e93] font-mono">
            {cycleStats.history.length} 条
          </span>
        </div>

        {cycleStats.history.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#636366]">暂无历史记录</div>
        ) : (
          <div className="space-y-1.5">
            {cycleStats.history.slice(0, 10).map((s) => (
              <div
                key={s.id}
                className="p-2.5 rounded-xl bg-[#141416] border border-[#2c2c2e] flex items-center justify-between text-xs"
              >
                <div className="truncate pr-2">
                  <div className="font-medium text-white truncate">{s.taskTitle}</div>
                  <div className="text-[10px] text-[#8e8e93] font-mono mt-0.5">
                    {new Date(s.endTime).toLocaleDateString([], {
                      month: 'numeric',
                      day: 'numeric',
                    })}{' '}
                    · 专注 {s.actualMinutes} 分钟
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#242426] text-[#aeaeb2] shrink-0 font-mono">
                  {s.isEarlyUnlock ? '自主开锁' : '全程锁屏'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
