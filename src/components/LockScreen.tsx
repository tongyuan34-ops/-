import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  Coffee,
  Sparkles,
} from 'lucide-react';
import { StrictnessLevel, StudyCycleMode, AmbientSoundType } from '../types';
import { soundManager } from '../utils/sound';

interface Props {
  taskTitle: string;
  plannedMinutes: number;
  strictness: StrictnessLevel;
  cycleMode: StudyCycleMode;
  onFinishSession: (actualMinutes: number, isEarlyUnlock: boolean, unlockReason?: string) => void;
  activeAmbientSound: AmbientSoundType;
  onChangeAmbientSound: (type: AmbientSoundType) => void;
  onOpenKnowledgeDesk: () => void;
  onOpenScratchpad: () => void;
}

export const LockScreen: React.FC<Props> = ({
  taskTitle,
  plannedMinutes,
  strictness,
  cycleMode,
  onFinishSession,
  activeAmbientSound,
  onChangeAmbientSound,
  onOpenKnowledgeDesk,
  onOpenScratchpad,
}) => {
  const [isBreakPhase, setIsBreakPhase] = useState(false);
  const [pomodoroCycleCount, setPomodoroCycleCount] = useState(1);

  const focusSecondsTotal = plannedMinutes * 60;
  const breakSecondsTotal = 5 * 60; // 5 min pomodoro rest

  const [secondsRemaining, setSecondsRemaining] = useState(focusSecondsTotal);
  const [totalFocusedSeconds, setTotalFocusedSeconds] = useState(0);

  const [distractionCount, setDistractionCount] = useState(0);
  const [showDistractionWarning, setShowDistractionWarning] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [strictCooldownSeconds, setStrictCooldownSeconds] = useState(15);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.45);

  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fullscreen trigger
  useEffect(() => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      }
    } catch {
      // ignore
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Main Timer Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (cycleMode === 'pomodoro' && !isBreakPhase) {
            // Focus completed -> Start Rest Phase
            soundManager.playBreakChime();
            setIsBreakPhase(true);
            setTotalFocusedSeconds((acc) => acc + focusSecondsTotal);
            return breakSecondsTotal;
          } else if (cycleMode === 'pomodoro' && isBreakPhase) {
            // Rest completed -> Start Next Focus Cycle
            soundManager.playCompletionChime();
            setIsBreakPhase(false);
            setPomodoroCycleCount((c) => c + 1);
            return focusSecondsTotal;
          } else {
            // Single session completed
            clearInterval(interval);
            handleComplete(false);
            return 0;
          }
        }
        if (!isBreakPhase) {
          setTotalFocusedSeconds((acc) => acc + 1);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cycleMode, isBreakPhase, focusSecondsTotal, breakSecondsTotal]);

  // Strictness Cooldown timer in unlock modal
  useEffect(() => {
    if (showUnlockModal && strictness === 'strict' && strictCooldownSeconds > 0) {
      const cdTimer = setInterval(() => {
        setStrictCooldownSeconds((c) => Math.max(0, c - 1));
      }, 1000);
      return () => clearInterval(cdTimer);
    }
  }, [showUnlockModal, strictness, strictCooldownSeconds]);

  // Tab switch & window blur detection
  useEffect(() => {
    const handleDistraction = () => {
      if (document.hidden) {
        setDistractionCount((c) => c + 1);
        setShowDistractionWarning(true);
        soundManager.playDistractionWarning();
      }
    };

    document.addEventListener('visibilitychange', handleDistraction);
    window.addEventListener('blur', handleDistraction);

    return () => {
      document.removeEventListener('visibilitychange', handleDistraction);
      window.removeEventListener('blur', handleDistraction);
    };
  }, []);

  const handleComplete = (isEarly: boolean, reason?: string) => {
    soundManager.stopAmbient();
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    const actualMinutes = Math.max(1, Math.round(totalFocusedSeconds / 60));
    onFinishSession(actualMinutes, isEarly, reason);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleHoldStart = () => {
    setHoldProgress(0);
    const start = Date.now();
    const duration = 2000;
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(holdIntervalRef.current!);
        handleComplete(true, '学者长按确认自主开锁');
      }
    }, 40);
  };

  const handleHoldCancel = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setHoldProgress(0);
  };

  const currentTotal = isBreakPhase ? breakSecondsTotal : focusSecondsTotal;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentTotal - secondsRemaining) / currentTotal) * 100)
  );

  const minutesLeft = Math.floor(secondsRemaining / 60);
  const secondsLeft = secondsRemaining % 60;

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d0f] text-white flex flex-col justify-between select-none font-sans">
      {/* Top Bar (Ant Design Mini Navbar style) */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#1c1c1f] bg-[#141416]/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs text-[#8e8e93]">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-medium text-white">
            {isBreakPhase ? '番茄小憩阶段' : '雪穗锁屏自修中'}
          </span>
          {cycleMode === 'pomodoro' && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#242426] text-[#aeaeb2] font-mono">
              第 {pomodoroCycleCount} 轮
            </span>
          )}
          {distractionCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3a1d1d] text-[#ff6961] font-mono">
              切屏 {distractionCount} 次
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Scratchpad */}
          <button
            onClick={onOpenScratchpad}
            className="p-1.5 rounded-lg bg-[#242426] hover:bg-[#2c2c2e] text-[#aeaeb2] hover:text-white transition flex items-center gap-1 text-xs cursor-pointer"
            title="记案头便签"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">记便签</span>
          </button>

          {/* Quick Knowledge Query */}
          <button
            onClick={onOpenKnowledgeDesk}
            className="p-1.5 rounded-lg bg-[#242426] hover:bg-[#2c2c2e] text-[#aeaeb2] hover:text-white transition flex items-center gap-1 text-xs cursor-pointer"
            title="查阅学术疑难"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">查疑</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-[#8e8e93] hover:text-white transition cursor-pointer"
            title="全屏切换"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Distraction Alert Overlay Banner */}
      {showDistractionWarning && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-2xl bg-[#261818] border border-[#4a2626] text-[#fca5a5] text-xs flex items-center justify-between animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#ef4444] shrink-0" />
            <div>
              <div className="font-medium text-white">检测到离开自习室窗口</div>
              <div className="text-[11px] text-[#fca5a5]/80 mt-0.5">
                切勿手滑点开短视频或社交软件，回到当下的思考中来。
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowDistractionWarning(false)}
            className="px-3 py-1.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-[#e5e5ea] transition cursor-pointer shrink-0 ml-2"
          >
            重回专注
          </button>
        </div>
      )}

      {/* Main Focus Clock Body (Ant Design Mini Tactile Center) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto w-full">
        {/* Task Title Card */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1c1e] border border-[#2c2c2e] text-xs text-[#aeaeb2] mb-6">
          {isBreakPhase ? (
            <>
              <Coffee className="w-3.5 h-3.5 text-[#e5e5ea]" />
              <span>闭目小憩，放松肩颈与眼部</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="truncate max-w-[220px]">{taskTitle || '专注自修'}</span>
            </>
          )}
        </div>

        {/* Clean Big Digits */}
        <div className="text-7xl sm:text-8xl font-mono font-light tracking-tighter text-white drop-shadow-sm select-none">
          {String(minutesLeft).padStart(2, '0')}
          <span className="text-[#48484a] animate-pulse">:</span>
          {String(secondsLeft).padStart(2, '0')}
        </div>

        {/* Tactile Progress Line */}
        <div className="w-56 h-1 bg-[#242426] rounded-full mt-8 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              isBreakPhase ? 'bg-[#30d158]' : 'bg-white'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Sub Info */}
        <div className="text-xs text-[#8e8e93] font-mono mt-3">
          {isBreakPhase
            ? `休息还剩 ${minutesLeft}m ${secondsLeft}s`
            : `已坚持 ${Math.round(totalFocusedSeconds / 60)} 分钟 · 目标 ${plannedMinutes}m`}
        </div>

        {/* Break phase quick action */}
        {isBreakPhase && (
          <button
            onClick={() => {
              setIsBreakPhase(false);
              setPomodoroCycleCount((c) => c + 1);
              setSecondsRemaining(focusSecondsTotal);
              soundManager.playCompletionChime();
            }}
            className="mt-6 px-4 py-2 rounded-full bg-[#242426] hover:bg-[#2c2c2e] border border-[#3a3a3c] text-xs font-medium text-white transition cursor-pointer"
          >
            跳过休息 · 开始下一轮番茄钟
          </button>
        )}
      </div>

      {/* Bottom Bar (Ant Design Mini Bottom Bar) */}
      <div className="px-5 py-3.5 border-t border-[#1c1c1f] bg-[#141416]/80 backdrop-blur-md flex items-center justify-between">
        {/* Ambient Sound switcher */}
        <div className="flex items-center gap-1.5 text-xs">
          {[
            { id: 'none' as const, label: '静音' },
            { id: 'rain' as const, label: '雨声' },
            { id: 'white_noise' as const, label: '白噪' },
            { id: 'library_clock' as const, label: '木钟' },
          ].map((snd) => (
            <button
              key={snd.id}
              onClick={() => {
                onChangeAmbientSound(snd.id);
                soundManager.playAmbient(snd.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer border ${
                activeAmbientSound === snd.id
                  ? 'bg-[#2c2c2e] text-white border-[#48484a] font-medium'
                  : 'bg-[#1c1c1e] text-[#8e8e93] border-transparent hover:text-white'
              }`}
            >
              {snd.label}
            </button>
          ))}
        </div>

        {/* Unlock Button */}
        <button
          onClick={() => {
            setShowUnlockModal(true);
            setStrictCooldownSeconds(15);
          }}
          className="px-3.5 py-1.5 rounded-full border border-[#2c2c2e] bg-[#1c1c1e] hover:bg-[#2c2c2e] text-xs font-medium text-[#aeaeb2] hover:text-white transition cursor-pointer flex items-center gap-1.5"
        >
          <Unlock className="w-3.5 h-3.5" />
          <span>开锁</span>
        </button>
      </div>

      {/* Ant Design Mini Unlock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#2c2c2e]">
              <span className="text-sm font-semibold text-white">学者自主开锁确认</span>
              <span className="text-xs font-mono text-[#8e8e93]">
                已专注 {Math.round(totalFocusedSeconds / 60)} 分钟
              </span>
            </div>

            {strictness === 'strict' && strictCooldownSeconds > 0 ? (
              <div className="p-4 rounded-xl bg-[#242426] text-center space-y-2">
                <div className="text-xs font-semibold text-white">深度闭关冷静期保护</div>
                <p className="text-[11px] text-[#aeaeb2] leading-relaxed">
                  为防止下意识点开娱乐软件，请等待冷静期结束沉淀心绪：
                </p>
                <div className="text-2xl font-mono font-medium text-white pt-1">
                  {strictCooldownSeconds}s
                </div>
              </div>
            ) : strictness === 'standard' ? (
              <div className="p-4 rounded-xl bg-[#242426] text-center space-y-2.5">
                <div className="text-xs text-[#aeaeb2]">
                  长按 2 秒确认开锁（防手滑误触）：
                </div>
                <button
                  onMouseDown={handleHoldStart}
                  onMouseUp={handleHoldCancel}
                  onMouseLeave={handleHoldCancel}
                  onTouchStart={handleHoldStart}
                  onTouchEnd={handleHoldCancel}
                  className="w-full relative overflow-hidden py-3 rounded-xl bg-[#2c2c2e] border border-[#3a3a3c] text-xs font-medium text-white transition select-none cursor-pointer"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-white/30 transition-all duration-75"
                    style={{ width: `${holdProgress}%` }}
                  />
                  <span className="relative z-10">
                    {holdProgress > 0 ? `确认中 (${holdProgress}%)` : '长按此处 2 秒'}
                  </span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#aeaeb2] leading-relaxed">
                当前为自由自律模式，开锁将结束本次锁屏并生成学情档案。
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowUnlockModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#242426] text-xs text-[#aeaeb2] hover:text-white transition cursor-pointer"
              >
                继续沉浸
              </button>
              <button
                disabled={strictness === 'strict' && strictCooldownSeconds > 0}
                onClick={() => handleComplete(true, '提前自主开锁')}
                className="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-[#e5e5ea] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                结束并生成档案
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
