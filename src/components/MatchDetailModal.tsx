import React, { useState } from 'react';
import { PredictionDetail, HistoricalMatch } from '../types/football.ts';
import { X, Target, Shield, Sparkles, CheckCircle2, AlertTriangle, Layers, Clock, TrendingUp } from 'lucide-react';

interface MatchDetailModalProps {
  predictionDetail: PredictionDetail | null;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  predictionDetail,
  onClose,
}) => {
  const [activeTeamTab, setActiveTeamTab] = useState<'home' | 'away'>('home');

  if (!predictionDetail) return null;

  const {
    fixture,
    homeTeam,
    awayTeam,
    homeAnalysis,
    awayAnalysis,
    probabilityGoal,
    probabilityZeroZero,
    prediction,
    confidence,
    confidenceScore,
    goldenRuleApplied,
    goldenRuleExplanation,
    modelComponents,
    sampleReliability,
    statisticalExplanation,
    lockedAt,
  } = predictionDetail;

  const activeAnalysis = activeTeamTab === 'home' ? homeAnalysis : awayAnalysis;
  const isGoal = prediction === 'GOAL';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/70">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>{fixture.competition}</span>
              <span>·</span>
              <span>Kickoff: {new Date(fixture.kickoffTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>·</span>
              <span>Locked: {new Date(lockedAt).toLocaleTimeString()}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {homeTeam} <span className="text-slate-400 font-normal">vs</span> {awayTeam}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Prediction Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            {/* Outcome Badge */}
            <div className="flex flex-col justify-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Proprietary Model Output
              </span>
              <div className="flex items-center gap-2">
                {isGoal ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                    <Target className="w-4 h-4" />
                    <span>PREDICTION: GOAL</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                    <Shield className="w-4 h-4" />
                    <span>PREDICTION: 0–0</span>
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {confidence} CONFIDENCE
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Interval: 00:00 to 09:59 (Rule C verified)
              </span>
            </div>

            {/* Probability Bars */}
            <div className="md:col-span-2 flex flex-col justify-center space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>P(GOAL in 00–09:59)</span>
                </span>
                <span className="font-mono text-sm font-bold tabular-nums text-teal-600 dark:text-teal-400">
                  {(probabilityGoal * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-teal-500 h-full transition-all duration-500"
                  style={{ width: `${probabilityGoal * 100}%` }}
                />
                <div
                  className="bg-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${probabilityZeroZero * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>P(0–0 at 10:00)</span>
                </span>
                <span className="font-mono text-sm font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                  {(probabilityZeroZero * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Golden Rule Banner if applicable */}
          {goldenRuleApplied && (
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Rule B Active: Champions League Golden Rule Applied</span>
                <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                  {goldenRuleExplanation} All historical UEFA Champions League matches were filtered out and substituted with verified domestic league and cup fixtures to avoid sample distortion.
                </p>
              </div>
            </div>
          )}

          {/* Mathematical & Statistical Explanation */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Statistical Model Narrative</span>
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {statisticalExplanation}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Home μ(10m)</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  {modelComponents.homeExpectedGoals10m}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Away μ(10m)</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  {modelComponents.awayExpectedGoals10m}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Home Adv. Weight</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  ×{modelComponents.homeAdvantageFactor}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Sample Reliability</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {sampleReliability.totalVerifiedMatches}/20 Verified
                </span>
              </div>
            </div>
          </div>

          {/* 10-Match Historical Sample Inspector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-500" />
                <span>Historical 10-Match Competitive Sample</span>
              </h3>

              {/* Team Selector Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  onClick={() => setActiveTeamTab('home')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    activeTeamTab === 'home'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {homeTeam} (Home)
                </button>
                <button
                  onClick={() => setActiveTeamTab('away')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    activeTeamTab === 'away'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {awayTeam} (Away)
                </button>
              </div>
            </div>

            {/* Team Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Scored in 10m
                </span>
                <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {activeAnalysis.scoringPercent}%
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Avg: {activeAnalysis.averageGoalsScored10m} g/10m
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Conceded in 10m
                </span>
                <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                  {activeAnalysis.concedingPercent}%
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Avg: {activeAnalysis.averageGoalsConceded10m} g/10m
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  10m 0–0 Clean Sheet
                </span>
                <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {Math.round(activeAnalysis.cleanSheet10mFrequency * 100)}%
                </span>
                <span className="text-[10px] text-slate-500 block">Early defensive lock</span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Home/Away Rate
                </span>
                <span className="text-base font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                  {Math.round(
                    (activeTeamTab === 'home'
                      ? activeAnalysis.homeScoringFrequency
                      : activeAnalysis.awayScoringFrequency) * 100
                  )}%
                </span>
                <span className="text-[10px] text-slate-500 block">Venue specific</span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Verified Data
                </span>
                <span className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums">
                  {activeAnalysis.verifiedMatchesCount}/10
                </span>
                <span className="text-[10px] text-slate-500 block">Timestamp fidelity</span>
              </div>
            </div>

            {/* Individual Matches List */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Competition</th>
                      <th className="py-2.5 px-3">Opponent</th>
                      <th className="py-2.5 px-2 text-center">Venue</th>
                      <th className="py-2.5 px-2 text-center">Full Time</th>
                      <th className="py-2.5 px-3 text-center">First 10m State</th>
                      <th className="py-2.5 px-3">Goal Timestamps (Rule C Check)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {activeAnalysis.matches.map((m: HistoricalMatch, idx: number) => {
                      const earlyGoals = m.goalEvents.filter((g) => g.isFirst10Minutes);
                      const lateGoals = m.goalEvents.filter((g) => !g.isFirst10Minutes);

                      return (
                        <tr
                          key={m.id || idx}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                            {m.date}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-slate-800 dark:text-slate-200 font-medium">
                              {m.competition}
                            </span>
                            {m.excludedByGoldenRule && (
                              <span className="ml-1 text-[10px] text-amber-500">(Excluded by Rule B)</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                            {m.opponent}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-500 font-mono text-[11px]">
                            {m.isTeamHome ? 'Home' : 'Away'}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                            {m.fullTimeScore}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {earlyGoals.length > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300">
                                ⚽ GOAL ({earlyGoals.length})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                🛡️ 0–0
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {earlyGoals.length > 0 ? (
                                earlyGoals.map((g, gi) => (
                                  <span
                                    key={gi}
                                    title="Goal within 00:00-09:59"
                                    className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80"
                                  >
                                    ⚽ {g.formattedTime} {g.scorer} ({g.teamName})
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 text-[11px]">No goals 00–09:59</span>
                              )}
                              {lateGoals.length > 0 && (
                                <span
                                  title="Goals scored at or after 10:00 (excluded by Rule C)"
                                  className="text-[10px] text-slate-400 italic"
                                >
                                  +{lateGoals.length} post-10m
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Prediction locked prior to kickoff · Hindsight bias strictly eliminated</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
