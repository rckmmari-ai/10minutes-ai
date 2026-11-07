import React, { useState } from 'react';
import { AppSettings } from '../types/football.ts';
import { Key, Database, Globe, Sparkles, CheckCircle2, ShieldAlert, Download, RefreshCw, Cpu, Zap } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings | null;
  onUpdateSettings: (newSettings: Partial<AppSettings> & { apiKey?: string }) => void;
  onSyncData: () => void;
  isSyncing: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onSyncData,
  isSyncing,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AppSettings['apiProvider']>(
    settings?.apiProvider || 'internal_verified'
  );
  const [uclGoldenRule, setUclGoldenRule] = useState<boolean>(
    settings?.championsLeagueGoldenRule ?? true
  );
  const [enableEitherTeamWin, setEnableEitherTeamWin] = useState<boolean>(
    settings?.enableEitherTeamWinModel ?? true
  );
  const [eitherTeamWinThreshold, setEitherTeamWinThreshold] = useState<number>(
    settings?.eitherTeamWinThresholdPercent ?? 70
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      apiProvider: selectedProvider,
      championsLeagueGoldenRule: uclGoldenRule,
      enableEitherTeamWinModel: enableEitherTeamWin,
      eitherTeamWinThresholdPercent: eitherTeamWinThreshold,
      apiKey: apiKeyInput.trim() || undefined,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          API Integration & Model Architecture Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure football data providers, secure API credentials, Rule B overrides, and database persistence settings.
        </p>
      </div>

      {/* Provider & Credentials Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-500" />
          <span>Football Data Provider Configuration</span>
        </h3>

        {/* Status Callout */}
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-start justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              Active Data Environment:
            </span>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              {settings?.apiKeyConfigured
                ? `Connected to external provider (${settings.apiProvider}). Live event streaming active.`
                : 'Using Verified Reference Sports Dataset. Authentic timestamped event records loaded for UCL, EPL, Bundesliga, and La Liga.'}
            </p>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
              settings?.apiKeyConfigured
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
            }`}
          >
            {settings?.apiKeyConfigured ? 'LIVE API' : 'VERIFIED DATASET'}
          </span>
        </div>

        {/* Provider Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Data Provider
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              {
                id: 'internal_verified',
                name: 'Verified Reference Dataset (Pre-loaded)',
                desc: 'Authentic 10-match histories with exact minute/second timestamps.',
              },
              {
                id: 'api_football',
                name: 'API-Football (RapidAPI / API-Sports)',
                desc: 'Live global fixtures and event-level timestamps.',
              },
              {
                id: 'football_data_org',
                name: 'Football-Data.org',
                desc: 'European top leagues and cup competitions.',
              },
              {
                id: 'sportmonks',
                name: 'Sportmonks Football API',
                desc: 'Broad historical coverage and fixture schedules.',
              },
            ].map((p) => (
              <label
                key={p.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors block ${
                  selectedProvider === p.id
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  value={p.id}
                  checked={selectedProvider === p.id}
                  onChange={() => setSelectedProvider(p.id as any)}
                  className="sr-only"
                />
                <span className="font-semibold text-slate-900 dark:text-white block">
                  {p.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  {p.desc}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* API Key */}
        {selectedProvider !== 'internal_verified' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              API Access Key / Bearer Token
            </label>
            <input
              type="password"
              placeholder="Paste your API provider key here..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Stored securely in server-side memory. Never exposed on the frontend client.
            </span>
          </div>
        )}

        {/* Model Rules */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Permanent Model Settings
            </h4>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={uclGoldenRule}
                onChange={(e) => setUclGoldenRule(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Rule B: Champions League Golden Rule (Active by Default)
                </span>
                <span className="text-slate-500 dark:text-slate-400 block mt-0.5">
                  When analyzing UEFA Champions League fixtures, exclude previous UCL matches from the 10-match historical sample and substitute with domestic league/cup matches.
                </span>
              </div>
            </label>
          </div>

          {/* Optional Model: Either Team to Win */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <Zap className="w-3.5 h-3.5" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Optional Model: Either Team to Win (Double Chance 12)
              </h4>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableEitherTeamWin}
                onChange={(e) => setEnableEitherTeamWin(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Enable Either Team to Win Analysis (Double Chance 12)
                </span>
                <span className="text-slate-500 dark:text-slate-400 block mt-0.5">
                  Computes full-time bivariate Poisson outcome distribution combined with 10-match historical decisive frequency to calculate P(Home Win), P(Draw), P(Away Win), and P(Either Win = 1 - P(Draw)).
                </span>
              </div>
            </label>

            {enableEitherTeamWin && (
              <div className="pl-6 pt-1 max-w-md space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    Recommendation Threshold:
                  </span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {eitherTeamWinThreshold}% probability
                  </span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={85}
                  step={1}
                  value={eitherTeamWinThreshold}
                  onChange={(e) => setEitherTeamWinThreshold(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>60% (Permissive)</span>
                  <span>70% (Standard)</span>
                  <span>85% (High threshold)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
          >
            Save Configuration
          </button>

          {saveSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings successfully saved</span>
            </span>
          )}
        </div>
      </form>

      {/* Database Schema & Deployment Guide */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Relational PostgreSQL Database Architecture
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">schema.sql ready</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The application persists data to the server data store and is fully compatible with production PostgreSQL instances.
          Tables include <code className="font-mono text-emerald-600">fixtures</code>, <code className="font-mono text-emerald-600">historical_matches</code>, <code className="font-mono text-emerald-600">goal_events</code>, and <code className="font-mono text-emerald-600">predictions</code> with timestamp locking to ensure zero hindsight bias.
        </p>

        <div className="p-3 bg-slate-950 text-slate-300 font-mono text-[11px] rounded-lg overflow-x-auto">
          <pre>{`-- Execute in your PostgreSQL console:
psql -U postgres -d football_predictions -f schema.sql`}</pre>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
          <span>Last automated sync: {new Date(settings?.lastSyncedAt || '').toLocaleString()}</span>
          <button
            onClick={onSyncData}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Matches & Verify Outcomes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
