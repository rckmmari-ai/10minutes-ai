import React from 'react';
import { Sun, Moon, Activity, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'fixtures' | 'performance' | 'verification' | 'settings';
  onSelectTab: (tab: 'fixtures' | 'performance' | 'verification' | 'settings') => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onRunBatch: () => void;
  isBatchRunning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  onRunBatch,
  isBatchRunning,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <button
            onClick={() => onSelectTab('fixtures')}
            className="text-left cursor-pointer group"
          >
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white block">
              FIRST 10' PREDICTOR
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block -mt-1">
              PROPRIETARY QUANTITATIVE MODEL
            </span>
          </button>
        </div>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onSelectTab('fixtures')}
            className={`cursor-pointer pb-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'fixtures'
                ? 'border-emerald-500 text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Fixtures & Predictions
          </button>
          <button
            onClick={() => onSelectTab('performance')}
            className={`cursor-pointer pb-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'performance'
                ? 'border-emerald-500 text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Historical Tracking
          </button>
          <button
            onClick={() => onSelectTab('verification')}
            className={`cursor-pointer pb-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'verification'
                ? 'border-emerald-500 text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Model Audit & 8-Test Suite
          </button>
          <button
            onClick={() => onSelectTab('settings')}
            className={`cursor-pointer pb-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'settings'
                ? 'border-emerald-500 text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            API & Data Sources
          </button>
        </nav>

        {/* Zone 3: 1 primary action + theme toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle color theme"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onRunBatch}
            disabled={isBatchRunning}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBatchRunning ? 'animate-spin' : ''}`} />
            <span>{isBatchRunning ? 'Analyzing...' : 'Batch Predict All'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
