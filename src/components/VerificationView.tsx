import React, { useState } from 'react';
import { ModelVerificationReport } from '../types/football.ts';
import { CheckCircle2, XCircle, Play, ShieldAlert, Terminal, Clock, Check } from 'lucide-react';

interface VerificationViewProps {
  report: ModelVerificationReport | null;
  isRunning: boolean;
  onRunSuite: () => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  report,
  isRunning,
  onRunSuite,
}) => {
  const [selectedTestId, setSelectedTestId] = useState<string>('test_1');

  const selectedTest = report?.tests.find((t) => t.id === selectedTestId) || report?.tests[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Automated {report?.tests.length || 9}-Point Model Verification Suite
            </h2>
            {report?.allPassed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <Check className="w-3.5 h-3.5" />
                <span>ALL {report?.tests.length || 9} TESTS VERIFIED</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Section 13 validation protocol: Verifies 10-match hierarchy, strict 00:00–09:59 event extraction, Champions League Golden Rule, probability calibration, performance metrics, and optional Either Team to Win model.
          </p>
        </div>

        <button
          onClick={onRunSuite}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-pulse' : ''}`} />
          <span>{isRunning ? 'Running Test Suite...' : `Execute All ${report?.tests.length || 9} Tests`}</span>
        </button>
      </div>

      {/* Main Grid: Test List on Left, Diagnostic Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Test List */}
        <div className="lg:col-span-5 space-y-2">
          {report?.tests.map((test) => {
            const isSelected = selectedTest?.id === test.id;
            const isPassed = test.status === 'PASSED';

            return (
              <button
                key={test.id}
                onClick={() => setSelectedTestId(test.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Test {test.testNumber}: {test.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {test.durationMs}ms
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 ml-6">
                  {test.description}
                </p>
                <div className="flex items-center gap-2 mt-2 ml-6 text-[10px] text-slate-400 font-mono">
                  <span>{test.assertionsPassed}/{test.totalAssertions} assertions verified</span>
                  <span>·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{test.status}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Diagnostic Inspector */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  Test Specification #{selectedTest?.testNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedTest?.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {selectedTest?.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              {selectedTest?.description}
            </p>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 mb-4">
              <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                Verification Details:
              </span>
              {selectedTest?.details}
            </div>

            {/* Assertion Terminal Output */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>Execution Logs & Assertions</span>
              </div>
              <div className="p-3.5 bg-slate-950 text-slate-200 font-mono text-[11px] rounded-lg space-y-1 overflow-x-auto max-h-56">
                {selectedTest?.logs.map((log, li) => (
                  <div key={li} className="flex items-start gap-2">
                    <span className="text-emerald-400 select-none">›</span>
                    <span className="whitespace-pre-wrap">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Execution Duration: {selectedTest?.durationMs}ms</span>
            <span>Assertions: {selectedTest?.assertionsPassed}/{selectedTest?.totalAssertions} Passed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
