import React from 'react';
import { Fixture, PredictionOutcome, ConfidenceLevel } from '../types/football.ts';
import { Target, Shield, AlertTriangle, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface PredictionTableProps {
  fixtures: any[];
  isLoading: boolean;
  onSelectFixture: (fixture: Fixture) => void;
  onGeneratePrediction: (fixtureId: string) => void;
}

export const PredictionTable: React.FC<PredictionTableProps> = ({
  fixtures,
  isLoading,
  onSelectFixture,
  onGeneratePrediction,
}) => {
  const formatKickoff = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const getConfidenceBadge = (confidence?: ConfidenceLevel) => {
    if (!confidence) return null;
    switch (confidence) {
      case 'VERY HIGH':
        return (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            VERY HIGH
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
            HIGH
          </span>
        );
      case 'MODERATE':
        return (
          <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
            MODERATE
          </span>
        );
      case 'LOW':
        return (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            LOW
          </span>
        );
      case 'INSUFFICIENT DATA':
        return (
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>INSUFFICIENT DATA</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase text-[10px]">
              <th className="py-3 px-3.5 whitespace-nowrap">Kickoff</th>
              <th className="py-3 px-3 whitespace-nowrap">Competition</th>
              <th className="py-3 px-3 whitespace-nowrap">Home Team</th>
              <th className="py-3 px-3 whitespace-nowrap">Away Team</th>
              <th className="py-3 px-2 text-right whitespace-nowrap" title="Home 10-Minute Scoring Rate">
                H.Sc%
              </th>
              <th className="py-3 px-2 text-right whitespace-nowrap" title="Home 10-Minute Conceding Rate">
                H.Conc%
              </th>
              <th className="py-3 px-2 text-right whitespace-nowrap" title="Away 10-Minute Scoring Rate">
                A.Sc%
              </th>
              <th className="py-3 px-2 text-right whitespace-nowrap" title="Away 10-Minute Conceding Rate">
                A.Conc%
              </th>
              <th className="py-3 px-3 text-right whitespace-nowrap font-bold text-teal-600 dark:text-teal-400">
                P(GOAL)
              </th>
              <th className="py-3 px-3 text-right whitespace-nowrap font-bold text-indigo-600 dark:text-indigo-400">
                P(0–0)
              </th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Model Prediction</th>
              <th className="py-3 px-3 whitespace-nowrap">Confidence</th>
              <th className="py-3 px-2 text-center whitespace-nowrap">Sample</th>
              <th className="py-3 px-3 text-right whitespace-nowrap">Analysis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {isLoading ? (
              <tr>
                <td colSpan={14} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing football fixtures and historical matrices...</span>
                  </div>
                </td>
              </tr>
            ) : fixtures.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-12 text-center text-slate-400">
                  No fixtures matching the selected date and filters.
                </td>
              </tr>
            ) : (
              fixtures.map((fixture) => {
                const summary = fixture.predictionSummary;
                const isGoal = summary?.prediction === 'GOAL';

                return (
                  <tr
                    key={fixture.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Kickoff */}
                    <td className="py-3.5 px-3.5 font-mono text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                      {formatKickoff(fixture.kickoffTime)}
                    </td>

                    {/* Competition */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {fixture.competition}
                        </span>
                        {summary?.goldenRuleApplied && (
                          <span
                            title="Rule B: Champions League Golden Rule active"
                            className="inline-flex items-center text-amber-500"
                          >
                            <Sparkles className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Home Team */}
                    <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {fixture.homeTeam}
                    </td>

                    {/* Away Team */}
                    <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {fixture.awayTeam}
                    </td>

                    {/* Rates */}
                    {summary ? (
                      <>
                        <td className="py-3.5 px-2 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {summary.home10mScoringRate}%
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {summary.home10mConcedingRate}%
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {summary.away10mScoringRate}%
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {summary.away10mConcedingRate}%
                        </td>

                        {/* Probabilities */}
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                          {(summary.probabilityGoal * 100).toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                          {(summary.probabilityZeroZero * 100).toFixed(1)}%
                        </td>

                        {/* Model Prediction Badges */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          {isGoal ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                              <Target className="w-3.5 h-3.5" />
                              <span>GOAL</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                              <Shield className="w-3.5 h-3.5" />
                              <span>0–0</span>
                            </span>
                          )}
                        </td>

                        {/* Confidence */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {getConfidenceBadge(summary.confidence)}
                        </td>

                        {/* Sample Size */}
                        <td className="py-3.5 px-2 text-center font-mono text-slate-500 text-[11px] tabular-nums whitespace-nowrap">
                          {summary.sampleSize}
                        </td>
                      </>
                    ) : (
                      <td colSpan={9} className="py-3.5 px-3 text-center text-slate-400">
                        <button
                          onClick={() => onGeneratePrediction(fixture.id)}
                          className="px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 border border-emerald-600/30 rounded-md cursor-pointer transition-colors"
                        >
                          Run Prediction Model
                        </button>
                      </td>
                    )}

                    {/* Action */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectFixture(fixture)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span>Audit 10 Matches</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
