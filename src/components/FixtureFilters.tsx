import React from 'react';
import { Search, Sparkles, Filter } from 'lucide-react';

interface FixtureFiltersProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedCompetition: string;
  onSelectCompetition: (comp: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  goldenRuleEnabled: boolean;
  onToggleGoldenRule: () => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

const COMPETITIONS = [
  { id: 'all', label: 'All Competitions' },
  { id: 'ucl', label: 'Champions League' },
  { id: 'epl', label: 'Premier League' },
  { id: 'bundesliga', label: 'Bundesliga' },
  { id: 'la_liga', label: 'La Liga' },
  { id: 'uel', label: 'Europa League' },
];

export const FixtureFilters: React.FC<FixtureFiltersProps> = ({
  selectedDate,
  onSelectDate,
  selectedCompetition,
  onSelectCompetition,
  searchQuery,
  onSearchChange,
  goldenRuleEnabled,
  onToggleGoldenRule,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 space-y-4">
      {/* Row 1: Date Segmented Picker + Team Search + Golden Rule Toggle */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
          <button
            onClick={() => onSelectDate('2026-11-03')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              selectedDate === '2026-11-03'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Yesterday (Nov 3)
          </button>
          <button
            onClick={() => onSelectDate('2026-11-04')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              selectedDate === '2026-11-04'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Today (Nov 4)
          </button>
          <button
            onClick={() => onSelectDate('2026-11-05')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              selectedDate === '2026-11-05'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tomorrow (Nov 5)
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="px-2 py-1 text-xs bg-transparent border-0 text-slate-700 dark:text-slate-300 font-mono focus:outline-none cursor-pointer"
          />
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search teams (e.g. Real Madrid, Arsenal)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Champions League Golden Rule Toggle (Rule B) */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Rule B: UCL Golden Rule</span>
            </span>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={goldenRuleEnabled}
                onChange={onToggleGoldenRule}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </div>
          </label>
        </div>
      </div>

      {/* Row 2: Competition Filter Tabs + Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Leagues:</span>
          </span>
          {COMPETITIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCompetition(c.id)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCompetition === c.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 mr-1">Status:</span>
          {['all', 'SCHEDULED', 'FINISHED'].map((st) => (
            <button
              key={st}
              onClick={() => onStatusFilterChange(st)}
              className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'font-bold text-slate-900 dark:text-white underline underline-offset-4 decoration-emerald-500'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {st === 'all' ? 'All' : st === 'SCHEDULED' ? 'Upcoming' : 'Completed'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
