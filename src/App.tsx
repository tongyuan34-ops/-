import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Sparkles,
  Layers,
  FileText,
  X,
} from 'lucide-react';
import {
  StudySession,
  CycleStats,
  DeskNote,
  StudyPlanItem,
  StrictnessLevel,
  StudyCycleMode,
  AmbientSoundType,
} from './types';
import { AntdMiniTabBar, MainTabType } from './components/AntdMiniTabBar';
import { TaskSetup } from './components/TaskSetup';
import { DeskScratchpad } from './components/DeskScratchpad';
import { ScholarKnowledgeDesk } from './components/ScholarKnowledgeDesk';
import { CycleStatsView } from './components/CycleStatsView';
import { LockScreen } from './components/LockScreen';
import { StudySummaryModal } from './components/StudySummaryModal';
import { MobileInstallModal } from './components/MobileInstallModal';
import { soundManager } from './utils/sound';

const STORAGE_KEY_CYCLE = 'yukiho_cycle_stats_v2';
const STORAGE_KEY_NOTES = 'yukiho_desk_notes_v2';
const STORAGE_KEY_PLANS = 'yukiho_plan_items_v2';

const INITIAL_CYCLE_STATS: CycleStats = {
  todayMinutes: 45,
  weekTotalMinutes: 220,
  monthTotalMinutes: 840,
  streakDays: 5,
  totalSessions: 6,
  distractionPreventedCount: 18,
  history: [
    {
      id: 'mock-1',
      taskTitle: '考研高数真题强化',
      subject: '数理',
      plannedMinutes: 45,
      actualMinutes: 45,
      startTime: Date.now() - 86400000 * 2,
      endTime: Date.now() - 86400000 * 2 + 2700000,
      isEarlyUnlock: false,
      distractionWarnings: 0,
      strictness: 'standard',
      cycleMode: 'single',
      aiReport: {
        zenScore: 94,
        evalGrade: '沉稳笃定',
        comment: '专注过程如初雪般沉静，45分钟全程深度浸润。对复杂公式推导展现了极强定力。',
        distractionAdvice: '保持手机远离桌面视线，心绪更安定。',
        cycleReview: '本周连续保持高效心流状态。',
        motto: '非淡泊无以明志，非宁静无以致远。',
      },
    },
    {
      id: 'mock-2',
      taskTitle: '英语专八真题训练',
      subject: '外语',
      plannedMinutes: 60,
      actualMinutes: 55,
      startTime: Date.now() - 86400000,
      endTime: Date.now() - 86400000 + 3300000,
      isEarlyUnlock: true,
      unlockReason: '阶段性翻译练习完成',
      distractionWarnings: 1,
      strictness: 'standard',
      cycleMode: 'single',
      aiReport: {
        zenScore: 89,
        evalGrade: '心流渐进',
        comment: '55分钟有效攻坚，虽然提前5分钟开锁，但长难句分析十分扎实。',
        distractionAdvice: '卡壳时多用案头查疑，避免切出应用。',
        cycleReview: '外语语感保持良好。',
        motto: '博学而笃志，切问而近思。',
      },
    },
  ],
};

const INITIAL_NOTES: DeskNote[] = [
  { id: '1', content: '下午自习结束去图书馆归还《微积分学教程》', updatedAt: Date.now() },
  { id: '2', content: '晚上睡前复习马原哲学第三章错题笔记', updatedAt: Date.now() },
];

const INITIAL_PLANS: StudyPlanItem[] = [
  { id: 'p1', title: '考研高数真题第二套微分大题', minutes: 45, completed: true, tag: '数理' },
  { id: 'p2', title: '专八阅读长难句精读两篇', minutes: 30, completed: false, tag: '英语' },
  { id: 'p3', title: '数据结构树与图算法推导', minutes: 45, completed: false, tag: '专业' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('study');
  const [isLocked, setIsLocked] = useState(false);

  // States with localStorage persistence
  const [cycleStats, setCycleStats] = useState<CycleStats>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CYCLE);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_CYCLE_STATS;
  });

  const [notes, setNotes] = useState<DeskNote[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTES);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_NOTES;
  });

  const [planItems, setPlanItems] = useState<StudyPlanItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PLANS);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_PLANS;
  });

  // Active Session Config
  const [activeSession, setActiveSession] = useState<{
    taskTitle: string;
    plannedMinutes: number;
    strictness: StrictnessLevel;
    cycleMode: StudyCycleMode;
  }>({
    taskTitle: '专注自修',
    plannedMinutes: 45,
    strictness: 'standard',
    cycleMode: 'single',
  });

  const [activeAmbientSound, setActiveAmbientSound] = useState<AmbientSoundType>('rain');
  const [finishedSessionForModal, setFinishedSessionForModal] = useState<Partial<StudySession> | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showMobileInstallModal, setShowMobileInstallModal] = useState(false);

  // In-lock drawers
  const [showInLockScratchpad, setShowInLockScratchpad] = useState(false);
  const [showInLockKnowledge, setShowInLockKnowledge] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CYCLE, JSON.stringify(cycleStats));
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(planItems));
    } catch {
      // ignore
    }
  }, [cycleStats, notes, planItems]);

  // Note actions
  const handleAddNote = (content: string) => {
    setNotes((prev) => [{ id: Date.now().toString(), content, updatedAt: Date.now() }, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Plan actions
  const handleTogglePlan = (id: string) => {
    setPlanItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p))
    );
  };

  const handleAddPlan = (title: string, minutes: number) => {
    setPlanItems((prev) => [
      ...prev,
      { id: Date.now().toString(), title, minutes, completed: false, tag: '自修' },
    ]);
  };

  // Start Lock
  const handleStartLock = (params: {
    taskTitle: string;
    plannedMinutes: number;
    strictness: StrictnessLevel;
    cycleMode: StudyCycleMode;
    ambientSound: AmbientSoundType;
  }) => {
    setActiveSession({
      taskTitle: params.taskTitle,
      plannedMinutes: params.plannedMinutes,
      strictness: params.strictness,
      cycleMode: params.cycleMode,
    });
    setActiveAmbientSound(params.ambientSound);
    soundManager.playAmbient(params.ambientSound);
    setIsLocked(true);
  };

  // Session completed or early unlocked
  const handleFinishSession = (
    actualMinutes: number,
    isEarlyUnlock: boolean,
    unlockReason?: string
  ) => {
    soundManager.stopAmbient();
    const sessionRecord: Partial<StudySession> = {
      id: Date.now().toString(),
      taskTitle: activeSession.taskTitle,
      subject: '自修',
      plannedMinutes: activeSession.plannedMinutes,
      actualMinutes,
      startTime: Date.now() - actualMinutes * 60000,
      endTime: Date.now(),
      isEarlyUnlock,
      unlockReason,
      distractionWarnings: 0,
      strictness: activeSession.strictness,
      cycleMode: activeSession.cycleMode,
    };

    setFinishedSessionForModal(sessionRecord);
    setShowSummaryModal(true);
    setIsLocked(false);
  };

  // Save session from modal to CycleStats
  const handleSaveSessionFromModal = (completedSession: StudySession) => {
    setCycleStats((prev) => {
      const newHistory = [completedSession, ...prev.history];
      const todayMinutes = prev.todayMinutes + completedSession.actualMinutes;
      const weekTotalMinutes = prev.weekTotalMinutes + completedSession.actualMinutes;
      const monthTotalMinutes = prev.monthTotalMinutes + completedSession.actualMinutes;

      const lastSessionTime = prev.history[0]?.endTime;
      let streakDays = prev.streakDays;
      if (!lastSessionTime || Date.now() - lastSessionTime > 86400000 * 2) {
        streakDays = 1;
      } else {
        streakDays = prev.streakDays + 1;
      }

      return {
        todayMinutes,
        weekTotalMinutes,
        monthTotalMinutes,
        streakDays,
        totalSessions: prev.totalSessions + 1,
        distractionPreventedCount:
          prev.distractionPreventedCount + (completedSession.isEarlyUnlock ? 1 : 3),
        history: newHistory,
      };
    });

    setShowSummaryModal(false);
    setFinishedSessionForModal(null);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-[#f5f5f7] flex flex-col font-sans selection:bg-[#3a3a3c] selection:text-white">
      {/* Top Header Navbar (Ant Design Mini Navbar style) */}
      {!isLocked && (
        <header className="sticky top-0 z-30 bg-[#161618]/90 backdrop-blur-xl border-b border-[#262628] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
            <span className="font-semibold text-sm tracking-tight text-white">
              雪穗自习室
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileInstallModal(true)}
              className="text-[11px] text-[#aeaeb2] hover:text-white transition px-2.5 py-1 rounded-full border border-[#2c2c2e] hover:border-[#48484a] flex items-center gap-1 cursor-pointer bg-[#1c1c1e]"
              title="手机端扫码与添加桌面"
            >
              <Smartphone className="w-3 h-3 text-white" />
              <span>手机端</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {!isLocked && activeTab === 'study' && (
          <TaskSetup
            onStartLock={handleStartLock}
            planItems={planItems}
            onTogglePlanItem={handleTogglePlan}
            onAddPlanItem={handleAddPlan}
            activeAmbientSound={activeAmbientSound}
          />
        )}

        {!isLocked && activeTab === 'desk' && (
          <DeskScratchpad
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            activeAmbientSound={activeAmbientSound}
            onChangeAmbientSound={(snd) => {
              setActiveAmbientSound(snd);
              soundManager.playAmbient(snd);
            }}
          />
        )}

        {!isLocked && activeTab === 'knowledge' && (
          <ScholarKnowledgeDesk currentTaskTitle={activeSession.taskTitle} />
        )}

        {!isLocked && activeTab === 'stats' && (
          <CycleStatsView cycleStats={cycleStats} />
        )}

        {isLocked && (
          <LockScreen
            taskTitle={activeSession.taskTitle}
            plannedMinutes={activeSession.plannedMinutes}
            strictness={activeSession.strictness}
            cycleMode={activeSession.cycleMode}
            onFinishSession={handleFinishSession}
            activeAmbientSound={activeAmbientSound}
            onChangeAmbientSound={(snd) => {
              setActiveAmbientSound(snd);
              soundManager.playAmbient(snd);
            }}
            onOpenScratchpad={() => setShowInLockScratchpad(true)}
            onOpenKnowledgeDesk={() => setShowInLockKnowledge(true)}
          />
        )}
      </main>

      {/* Bottom TabBar (Ant Design Mini TabBar style) */}
      {!isLocked && (
        <AntdMiniTabBar
          activeTab={activeTab}
          onChangeTab={(t) => setActiveTab(t)}
          onOpenMobileInstall={() => setShowMobileInstallModal(true)}
        />
      )}

      {/* In-Lock Quick Scratchpad Sheet */}
      {showInLockScratchpad && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#1c1c1e] border-t sm:border border-[#2c2c2e] rounded-t-3xl sm:rounded-3xl p-5 text-white max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#2c2c2e] mb-4">
              <span className="text-sm font-semibold text-white">案头闪现便签 (锁屏中)</span>
              <button
                onClick={() => setShowInLockScratchpad(false)}
                className="p-1 rounded-lg text-[#8e8e93] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <DeskScratchpad
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              activeAmbientSound={activeAmbientSound}
              onChangeAmbientSound={(snd) => {
                setActiveAmbientSound(snd);
                soundManager.playAmbient(snd);
              }}
            />
          </div>
        </div>
      )}

      {/* In-Lock Quick Knowledge Sheet */}
      {showInLockKnowledge && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#1c1c1e] border-t sm:border border-[#2c2c2e] rounded-t-3xl sm:rounded-3xl p-5 text-white max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#2c2c2e] mb-4">
              <span className="text-sm font-semibold text-white">学者求索台 (锁屏中)</span>
              <button
                onClick={() => setShowInLockKnowledge(false)}
                className="p-1 rounded-lg text-[#8e8e93] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ScholarKnowledgeDesk currentTaskTitle={activeSession.taskTitle} />
          </div>
        </div>
      )}

      {/* Modals */}
      <StudySummaryModal
        isOpen={showSummaryModal}
        session={finishedSessionForModal}
        cycleStats={cycleStats}
        onCloseAndSave={handleSaveSessionFromModal}
        onViewCycleStats={() => {
          setShowSummaryModal(false);
          setActiveTab('stats');
        }}
      />

      <MobileInstallModal
        isOpen={showMobileInstallModal}
        onClose={() => setShowMobileInstallModal(false)}
      />
    </div>
  );
}
