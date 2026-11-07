import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  Moon,
  ScanEye,
  ShieldCheck,
  Sun,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { ModelVerificationReport, PerformanceStats } from '../types/football.ts';

interface LandingPageProps {
  onEnterApp: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

interface SignalFixture {
  id: string;
  kickoffTime: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  predictionSummary: {
    prediction: 'GOAL' | '0-0';
    probabilityGoal: number;
    probabilityZeroZero: number;
    confidence: string;
    confidenceScore: number;
    sampleSize: string;
    eitherTeamWin?: { prediction: string; probabilityEitherWin: number } | null;
  } | null;
}

const DEFAULT_SIGNAL_DATE = '2026-11-04';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

const formatKickoff = (value?: string) => {
  if (!value) return 'Kickoff locked';
  const parsed = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const pct = (value?: number, digits = 1) =>
  typeof value === 'number' && Number.isFinite(value) ? `${(value * 100).toFixed(digits)}%` : '—';

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, isDark, onToggleTheme }) => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [report, setReport] = useState<ModelVerificationReport | null>(null);
  const [signal, setSignal] = useState<SignalFixture | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/performance')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setStats(data.stats);
      })
      .catch(() => {});

    fetch('/api/verify')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setReport(data.report);
      })
      .catch(() => {});

    fetch(`/api/fixtures?date=${DEFAULT_SIGNAL_DATE}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.success) return;
        const ranked = (data.fixtures as SignalFixture[])
          .filter((fixture) => fixture.predictionSummary)
          .sort(
            (a, b) =>
              (b.predictionSummary?.confidenceScore ?? 0) -
              (a.predictionSummary?.confidenceScore ?? 0)
          );
        setSignal(ranked[0] ?? null);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = signal?.predictionSummary ?? null;
  const accuracy = stats ? `${stats.overallAccuracy.toFixed(1)}%` : '—';
  const evaluated = stats ? String(stats.evaluatedPredictions) : '—';
  const brier = stats ? stats.brierScore.toFixed(3) : '—';
  const auditTotal = report ? report.passedCount + report.failedCount : 0;
  const audit = report && auditTotal > 0 ? `${report.passedCount}/${auditTotal}` : '—';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* ------------------------------------------------ Nav */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white block leading-tight whitespace-nowrap">
                10MINUTES<span className="text-emerald-500">·AI</span>
              </span>
              <span className="hidden sm:block text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                First-ten-minute intelligence
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {[
              { id: 'model', label: 'The model' },
              { id: 'products', label: 'Predictions' },
              { id: 'performance', label: 'Performance' },
              { id: 'audit', label: 'Audit' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onToggleTheme}
              aria-label="Toggle color theme"
              className="hidden sm:block p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onEnterApp}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              <span className="hidden sm:inline">Open dashboard</span>
              <span className="sm:hidden">Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------ Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_-20%,rgba(16,185,129,0.22),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.1] [background-image:linear-gradient(to_right,#64748b_1px,transparent_1px),linear-gradient(to_bottom,#64748b_1px,transparent_1px)] [background-size:56px_56px]"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-mono font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Interval 00:00 — 09:59
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              Know the{' '}
              <span className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                first ten minutes
              </span>{' '}
              before kickoff.
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              10minutes-ai reads ten verified competitive matches per side, weights them by recency, and
              locks a <span className="font-semibold text-slate-900 dark:text-slate-200">GOAL</span> or{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-200">0–0</span> call for the
              opening ten minutes — with the sample size and confidence behind every number.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onEnterApp}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Open the dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToSection('model')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                How the model works
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
              {['Locks before kickoff', 'Verified event timestamps', 'Eight-test model audit'].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Live signal card */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-emerald-500/10 blur-2xl" aria-hidden />
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 truncate">
                    {signal?.competition ?? 'Locked model output'}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 shrink-0">
                  <Lock className="w-3 h-3" />
                  Locked
                </span>
              </div>

              {signal && summary ? (
                <div className="p-5">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                        {initials(signal.homeTeam)}
                      </div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                        {signal.homeTeam}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">vs</div>
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                        {initials(signal.awayTeam)}
                      </div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                        {signal.awayTeam}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400">P(GOAL) {pct(summary.probabilityGoal)}</span>
                      <span className="text-indigo-600 dark:text-indigo-400">P(0–0) {pct(summary.probabilityZeroZero)}</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                        style={{ width: `${Math.round(summary.probabilityGoal * 100)}%` }}
                      />
                      <div
                        className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500"
                        style={{ width: `${Math.round(summary.probabilityZeroZero * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 px-3 py-2.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Model call
                      </div>
                      <div
                        className={`text-lg font-extrabold font-mono tabular-nums ${
                          summary.prediction === 'GOAL'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {summary.prediction}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 px-3 py-2.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Confidence
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight mt-1">
                        {summary.confidence}
                        <span className="text-slate-400 font-mono font-medium"> · {summary.confidenceScore}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
                    <span className="font-mono">Sample {summary.sampleSize}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatKickoff(signal.kickoffTime)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Loading the latest locked model output…
                </div>
              )}
            </div>
            <p className="mt-3 text-center text-[11px] font-mono text-slate-500 dark:text-slate-500">
              Real locked output · probabilities sum to 1.000
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Stat band */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Historical accuracy', value: accuracy, hint: 'All locked predictions' },
            { label: 'Predictions evaluated', value: evaluated, hint: 'Settled against verified events' },
            { label: 'Brier score', value: brier, hint: 'Lower is better · 0 is perfect' },
            { label: 'Audit checks passed', value: audit, hint: 'Model verification suite' },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                {item.value}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">{item.label}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.hint}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ The model */}
      <section id="model" className="scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
              The method
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Four steps from raw fixtures to a locked call.
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              No black box. Every prediction carries the sample it was built on, the competition adjustment
              applied and the probability it assigns to each opening outcome.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: Layers,
                step: '01',
                title: 'Collect verified history',
                body: 'The ten most recent competitive matches per side are gathered in strict chronological order, with domestic and continental fixtures balanced by competition.',
              },
              {
                icon: ScanEye,
                step: '02',
                title: 'Isolate 00:00 — 09:59',
                body: 'Only timestamped goal events inside the opening ten minutes count. Matches without verified event data never enter the sample.',
              },
              {
                icon: TrendingUp,
                step: '03',
                title: 'Weight by recency',
                body: 'Recent matches carry more weight than older ones. Scoring and conceding rates are split home and away, then adjusted for competition strength.',
              },
              {
                icon: Lock,
                step: '04',
                title: 'Lock GOAL or 0–0',
                body: 'Probabilities are combined into one call with a confidence band and a sample-reliability check. The output is frozen before kickoff and never revised.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300 dark:text-slate-700">{item.step}</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Products */}
      <section id="products" className="scroll-mt-20 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
              What you get
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Three views on the same ten minutes.
            </h2>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Target,
                accent: 'text-emerald-600 dark:text-emerald-400',
                title: 'First-10 outcome',
                body: 'A GOAL or 0–0 call for the 00:00–09:59 window, with both probabilities, a confidence band and the underlying home and away rates.',
              },
              {
                icon: Zap,
                accent: 'text-indigo-600 dark:text-indigo-400',
                title: 'Either team to win',
                body: 'An optional double-chance model for the full match: P(1), P(X) and P(2), flagged as either team to win or draw risk above your threshold.',
              },
              {
                icon: ShieldCheck,
                accent: 'text-teal-600 dark:text-teal-400',
                title: 'Accountable tracking',
                body: 'Every settled call feeds rolling accuracy, Brier score and calibration by confidence band, so the record is visible — not claimed.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 p-6 flex flex-col"
              >
                <item.icon className={`w-6 h-6 ${item.accent}`} />
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 flex-1">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Performance */}
      <section id="performance" className="scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
          <div>
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
              The record
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Every call is settled against verified match events.
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              Once a match finishes, the model's opening-ten-minute outcome is checked against timestamped
              goal data. Accuracy, calibration and the full prediction history stay visible inside the
              dashboard.
            </p>
            <button
              onClick={onEnterApp}
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
            >
              View the full performance ledger
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Accuracy by competition
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {stats ? `${stats.evaluatedPredictions} settled` : 'loading'}
              </span>
            </div>
            <div className="p-5 space-y-4">
              {stats && stats.accuracyByCompetition.length > 0 ? (
                stats.accuracyByCompetition.map((row) => (
                  <div key={row.competition}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{row.competition}</span>
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {row.correct}/{row.total} · {row.accuracy.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                        style={{ width: `${Math.max(3, Math.min(100, row.accuracy))}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading settled predictions…</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Audit */}
      <section id="audit" className="scroll-mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">
          <div>
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
              Audit
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              A model you can inspect.
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              The engine ships with an eight-test audit suite covering sample collection, verification rules,
              probability consistency and prediction locking. Run it any time from the dashboard and read the
              assertions it checked.
            </p>
            {report && (
              <div
                className={`mt-6 inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold ${
                  report.allPassed
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                {report.allPassed
                  ? `All ${report.passedCount} checks passing`
                  : `${report.failedCount} checks need attention`}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 overflow-hidden">
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {report && report.tests.length > 0 ? (
                report.tests.map((test) => (
                  <div key={test.id} className="flex items-start gap-3 px-5 py-3.5">
                    <CheckCircle2
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        test.status === 'PASSED'
                          ? 'text-emerald-500'
                          : test.status === 'FAILED'
                          ? 'text-red-500'
                          : 'text-slate-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                          {test.name}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
                          {test.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {test.details}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">Loading audit results…</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ CTA */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.25),transparent_60%)]"
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Open the workspace and read today's fixtures.
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Filter by competition, inspect any match's ten-match sample, and lock a batch of predictions before
            kickoff.
          </p>
          <button
            onClick={onEnterApp}
            className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            Open the dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ------------------------------------------------ Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              10MINUTES<span className="text-emerald-500">·AI</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-500 text-center">
            Interval [00:00 – 09:59] · Predictions locked before match start · Analytics only, not betting advice
          </p>
        </div>
      </footer>
    </div>
  );
};
