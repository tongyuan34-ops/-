import React from 'react';
import { Timer, FileText, HelpCircle, BarChart3, Smartphone } from 'lucide-react';

export type MainTabType = 'study' | 'desk' | 'knowledge' | 'stats';

interface Props {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
  onOpenMobileInstall: () => void;
}

export const AntdMiniTabBar: React.FC<Props> = ({
  activeTab,
  onChangeTab,
  onOpenMobileInstall,
}) => {
  const tabs = [
    { id: 'study' as const, label: '自修', icon: Timer, badge: null },
    { id: 'desk' as const, label: '案头', icon: FileText, badge: '备忘' },
    { id: 'knowledge' as const, label: '查疑', icon: HelpCircle, badge: null },
    { id: 'stats' as const, label: '学情', icon: BarChart3, badge: null },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#161618]/95 backdrop-blur-xl border-t border-[#262628] px-2 py-1 safe-bottom select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 transition-all relative group cursor-pointer ${
                isActive ? 'text-white' : 'text-[#8c8c91] hover:text-[#d1d1d6]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-3 text-[9px] px-1 py-0.2 rounded-full bg-[#3a3a3c] text-[#e5e5ea] font-mono scale-90">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] tracking-tight transition-colors ${
                  isActive ? 'font-medium text-white' : 'font-normal text-[#8c8c91]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-white mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
