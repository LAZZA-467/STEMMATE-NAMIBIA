import React from 'react';
import {
  Home,
  Compass,
  BookOpen,
  Wrench,
  Settings,
  School,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  CloudOff,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TopAppBar: React.FC<{
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}> = ({ title, subtitle, showBack, onBack, rightSlot }) => {
  const { isOnline, syncState, toggleOnline, triggerSync } = useApp();

  const getSyncBadge = () => {
    if (!isOnline || syncState === 'offline') {
      return (
        <button
          type="button"
          onClick={toggleOnline}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold active:scale-95 transition-transform"
          title="Working offline. Tap to connect"
        >
          <CloudOff className="w-3.5 h-3.5 text-amber-600" />
          <span>Offline</span>
        </button>
      );
    }
    if (syncState === 'syncing') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold">
          <RefreshCw className="w-3.5 h-3.5 text-teal-700 animate-spin" />
          <span>Syncing...</span>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={triggerSync}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold active:scale-95 transition-transform"
        title="Synced. Tap to manual sync"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Synced ✓</span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/90 px-3.5 h-14 flex items-center justify-between shadow-xs shrink-0 select-none">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="w-10 h-10 -ml-1 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
        ) : (
          <div
            className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center shadow-xs shrink-0"
            title="STEMMATE Namibia Crest"
          >
            <School className="w-4 h-4" />
          </div>
        )}

        <div className="flex flex-col min-w-0 flex-1 pr-1">
          <h1 className="text-[15px] font-bold text-gray-900 leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-[11px] text-gray-500 leading-tight truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1.5">
        {rightSlot || getSyncBadge()}
      </div>
    </header>
  );
};

export const BottomTabBar: React.FC = () => {
  const { activeTab, setTab } = useApp();

  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'explore' as const, label: 'Explore', icon: Compass },
    { id: 'my-plans' as const, label: 'My Plans', icon: BookOpen },
    { id: 'kit' as const, label: 'Kit', icon: Wrench },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="absolute bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-lg flex justify-around items-center px-1 py-1 pb-safe"
    >
      {tabs.map(t => {
        const isActive = activeTab === t.id;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            type="button"
            id={`nav-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center min-h-[48px] min-w-[56px] rounded-xl px-2 py-1 transition-all active:scale-95 cursor-pointer ${
              isActive
                ? 'text-[#0F766E] font-bold'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon
              className={`w-5 h-5 transition-transform ${
                isActive ? 'scale-110 stroke-[2.4] text-[#0F766E]' : 'stroke-[1.8]'
              }`}
            />
            <span
              className={`text-[10.5px] mt-0.5 tracking-tight ${
                isActive ? 'font-bold text-[#0F766E]' : 'font-medium'
              }`}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
