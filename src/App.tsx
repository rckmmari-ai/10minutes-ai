/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useTransition } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { OverviewMetrics } from './components/OverviewMetrics.tsx';
import { FixtureFilters } from './components/FixtureFilters.tsx';
import { PredictionTable } from './components/PredictionTable.tsx';
import { MatchDetailModal } from './components/MatchDetailModal.tsx';
import { PerformanceView } from './components/PerformanceView.tsx';
import { VerificationView } from './components/VerificationView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import {
  AppSettings,
  Fixture,
  ModelVerificationReport,
  PerformanceStats,
  PredictionDetail,
} from './types/football.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'fixtures' | 'performance' | 'verification' | 'settings'>('fixtures');
  const [isDark, setIsDark] = useState<boolean>(true);

  // Front door: the public page lives at "/", the analytics workspace at "/app".
  const [route, setRoute] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(path);
    window.scrollTo({ top: 0 });
  };

  // Fixtures & Filtering
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-04');
  const [selectedCompetition, setSelectedCompetition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [isLoadingFixtures, setIsLoadingFixtures] = useState<boolean>(false);
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);

  // Modal Detail
  const [selectedFixtureForModal, setSelectedFixtureForModal] = useState<Fixture | null>(null);
  const [modalPredictionDetail, setModalPredictionDetail] = useState<PredictionDetail | null>(null);
  const [isLoadingModalDetail, setIsLoadingModalDetail] = useState<boolean>(false);

  // Historical Performance
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState<boolean>(false);

  // Model Verification Suite
  const [verificationReport, setVerificationReport] = useState<ModelVerificationReport | null>(null);
  const [isRunningVerification, setIsRunningVerification] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Initialize theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Fetch settings on mount
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error('Failed to load settings:', err));

    // Also run initial verification suite check so report is readily available
    fetch('/api/verify')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVerificationReport(data.report);
        }
      })
      .catch((err) => console.error('Failed to load verification report:', err));
  }, []);

  // Fetch fixtures whenever date or competition changes
  const loadFixtures = async () => {
    setIsLoadingFixtures(true);
    try {
      const res = await fetch(`/api/fixtures?date=${selectedDate}&competition=${selectedCompetition}`);
      const data = await res.json();
      if (data.success) {
        setFixtures(data.fixtures);
      }
    } catch (err) {
      console.error('Error loading fixtures:', err);
    } finally {
      setIsLoadingFixtures(false);
    }
  };

  useEffect(() => {
    loadFixtures();
  }, [selectedDate, selectedCompetition]);

  // Fetch performance metrics whenever switching to performance tab
  const loadPerformance = async () => {
    setIsLoadingPerformance(true);
    try {
      const res = await fetch('/api/performance');
      const data = await res.json();
      if (data.success) {
        setPerformanceStats(data.stats);
      }
    } catch (err) {
      console.error('Error loading performance:', err);
    } finally {
      setIsLoadingPerformance(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'performance') {
      loadPerformance();
    }
  }, [activeTab]);

  // Batch run prediction for all fixtures
  const handleRunBatch = async () => {
    setIsBatchRunning(true);
    try {
      const res = await fetch('/api/predict-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh fixtures to show populated prediction summaries
        await loadFixtures();
      }
    } catch (err) {
      console.error('Error in batch predict:', err);
    } finally {
      setIsBatchRunning(false);
    }
  };

  // Run single prediction
  const handleGenerateSinglePrediction = async (fixtureId: string) => {
    try {
      const res = await fetch(`/api/prediction/${fixtureId}`);
      const data = await res.json();
      if (data.success) {
        await loadFixtures();
      }
    } catch (err) {
      console.error('Error predicting fixture:', err);
    }
  };

  // Open detailed match analysis modal
  const handleSelectFixture = async (fixture: Fixture) => {
    setSelectedFixtureForModal(fixture);
    setIsLoadingModalDetail(true);
    try {
      const res = await fetch(`/api/prediction/${fixture.id}`);
      const data = await res.json();
      if (data.success) {
        setModalPredictionDetail(data.prediction);
      }
    } catch (err) {
      console.error('Error loading modal detail:', err);
    } finally {
      setIsLoadingModalDetail(false);
    }
  };

  // Run 8-point verification suite
  const handleRunVerificationSuite = async () => {
    setIsRunningVerification(true);
    try {
      const res = await fetch('/api/verify');
      const data = await res.json();
      if (data.success) {
        setVerificationReport(data.report);
      }
    } catch (err) {
      console.error('Error running verification suite:', err);
    } finally {
      setIsRunningVerification(false);
    }
  };

  // Update Settings
  const handleUpdateSettings = async (newSettings: Partial<AppSettings> & { apiKey?: string }) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        // Refresh fixtures in case UCL Golden Rule changed
        loadFixtures();
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  // Toggle Golden Rule directly from filter toolbar
  const handleToggleGoldenRule = () => {
    if (!settings) return;
    const toggled = !settings.championsLeagueGoldenRule;
    handleUpdateSettings({ championsLeagueGoldenRule: toggled });
  };

  // Toggle Optional Either Team to Win Model directly from filter toolbar
  const handleToggleEitherTeamWinModel = () => {
    if (!settings) return;
    const toggled = !settings.enableEitherTeamWinModel;
    handleUpdateSettings({ enableEitherTeamWinModel: toggled });
  };

  // Sync data & verify outcomes
  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await loadFixtures();
        if (activeTab === 'performance') await loadPerformance();
      }
    } catch (err) {
      console.error('Error syncing data:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter fixtures by search and status in UI
  const filteredFixtures = fixtures.filter((f) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHome = f.homeTeam.toLowerCase().includes(q);
      const matchAway = f.awayTeam.toLowerCase().includes(q);
      const matchComp = f.competition.toLowerCase().includes(q);
      if (!matchHome && !matchAway && !matchComp) return false;
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'SCHEDULED' && f.status !== 'SCHEDULED' && f.status !== 'TIMED') {
        return false;
      }
      if (statusFilter === 'FINISHED' && f.status !== 'FINISHED') {
        return false;
      }
    }
    return true;
  });

  // Calculate overview counts for Section 7.A
  const totalCount = fixtures.length;
  const analyzedCount = fixtures.filter((f) => f.hasPrediction).length;
  const goalCount = fixtures.filter((f) => f.predictionSummary?.prediction === 'GOAL').length;
  const zeroZeroCount = fixtures.filter((f) => f.predictionSummary?.prediction === '0-0').length;
  const insufficientCount = fixtures.filter(
    (f) => f.predictionSummary?.confidence === 'INSUFFICIENT DATA'
  ).length;
  const eitherWinCount = fixtures.filter(
    (f) => f.predictionSummary?.eitherTeamWin?.prediction === 'EITHER TEAM TO WIN'
  ).length;
  const drawRiskCount = fixtures.filter(
    (f) => f.predictionSummary?.eitherTeamWin?.prediction === 'DRAW RISK'
  ).length;

  const isEitherModelActive = settings?.enableEitherTeamWinModel ?? true;

  if (!route.startsWith('/app')) {
    return (
      <LandingPage
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onEnterApp={() => navigateTo('/app')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Bar Contract (§2) */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onRunBatch={handleRunBatch}
        isBatchRunning={isBatchRunning}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'fixtures' && (
          <div>
            {/* Section 7.A: Overview Metrics */}
            <OverviewMetrics
              date={selectedDate}
              totalFixtures={totalCount}
              analyzedFixtures={analyzedCount}
              goalPredictions={goalCount}
              zeroZeroPredictions={zeroZeroCount}
              insufficientDataCount={insufficientCount}
              showEitherTeamWinModel={isEitherModelActive}
              eitherWinPredictions={eitherWinCount}
              drawRiskPredictions={drawRiskCount}
            />

            {/* Section 7.B: Competition Filter & Controls */}
            <FixtureFilters
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              selectedCompetition={selectedCompetition}
              onSelectCompetition={setSelectedCompetition}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              goldenRuleEnabled={settings?.championsLeagueGoldenRule ?? true}
              onToggleGoldenRule={handleToggleGoldenRule}
              eitherTeamWinModelEnabled={isEitherModelActive}
              onToggleEitherTeamWinModel={handleToggleEitherTeamWinModel}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />

            {/* Section 7.C: High-Density Prediction Table */}
            <PredictionTable
              fixtures={filteredFixtures}
              isLoading={isLoadingFixtures}
              showEitherTeamWinModel={isEitherModelActive}
              onSelectFixture={handleSelectFixture}
              onGeneratePrediction={handleGenerateSinglePrediction}
            />
          </div>
        )}

        {activeTab === 'performance' && (
          <PerformanceView
            stats={performanceStats}
            isLoading={isLoadingPerformance}
            onRefresh={loadPerformance}
          />
        )}

        {activeTab === 'verification' && (
          <VerificationView
            report={verificationReport}
            isRunning={isRunningVerification}
            onRunSuite={handleRunVerificationSuite}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onSyncData={handleSyncData}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Section 7.D: Match Analysis Modal */}
      {selectedFixtureForModal && (
        <MatchDetailModal
          predictionDetail={modalPredictionDetail}
          onClose={() => {
            setSelectedFixtureForModal(null);
            setModalPredictionDetail(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 text-xs text-slate-500 text-center">
        <span>First 10 Minutes Football Prediction Model · Interval [00:00 – 09:59] · All predictions strictly locked before match start</span>
        <button
          onClick={() => navigateTo('/')}
          className="block mx-auto mt-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold cursor-pointer"
        >
          ← Back to 10minutes-ai
        </button>
      </footer>
    </div>
  );
}
