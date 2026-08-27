import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import {
  Brain,
  Zap,
  Target,
  Sparkles,
  Trophy,
  History,
  TrendingUp,
  Award,
  Calendar,
  RotateCcw,
  Download,
  CheckCircle,
  Clock,
  Flame,
} from 'lucide-react';
import { Achievement, CognitiveProfile, GameScoreEntry } from '../types';
import { sound } from '../utils/audio';

Chart.register(...registerables);

interface AnalyticsSectionProps {
  profile: CognitiveProfile;
  scores: GameScoreEntry[];
  achievements: Achievement[];
  onResetData: () => void;
  onSelectGame: (gameId: 'stroop' | 'pattern' | 'number-tap') => void;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  profile,
  scores,
  achievements,
  onResetData,
  onSelectGame,
}) => {
  const lineChartRef = useRef<HTMLCanvasElement | null>(null);
  const radarChartRef = useRef<HTMLCanvasElement | null>(null);
  const barChartRef = useRef<HTMLCanvasElement | null>(null);

  const lineChartInstance = useRef<Chart | null>(null);
  const radarChartInstance = useRef<Chart | null>(null);
  const barChartInstance = useRef<Chart | null>(null);

  // Initialize and update Chart.js instances
  useEffect(() => {
    // 1. Reaction Time Line Chart
    if (lineChartRef.current) {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }

      const recentSessions = [...scores].slice(0, 10).reverse();
      const labels = recentSessions.map((_, idx) => `Session ${idx + 1}`);
      const dataPoints = recentSessions.map((s) => s.reactionTimeMs);

      const ctx = lineChartRef.current.getContext('2d');
      if (ctx) {
        lineChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels.length > 0 ? labels : ['Baseline 1', 'Baseline 2', 'Baseline 3'],
            datasets: [
              {
                label: 'Reaction Latency (ms)',
                data: dataPoints.length > 0 ? dataPoints : [540, 480, 420],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                borderWidth: 3,
                pointBackgroundColor: '#818cf8',
                pointBorderColor: '#1e1b4b',
                pointHoverRadius: 6,
                tension: 0.35,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0d0d14',
                borderColor: '#262638',
                borderWidth: 1,
                titleColor: '#cbd5e1',
                bodyColor: '#f1f5f9',
                callbacks: {
                  label: (context) => `Latency: ${context.parsed.y} ms`,
                },
              },
            },
            scales: {
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8', font: { size: 11 } },
              },
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: {
                  color: '#94a3b8',
                  font: { size: 11 },
                  callback: (val) => `${val}ms`,
                },
              },
            },
          },
        });
      }
    }

    // 2. Cognitive Profile Radar Chart
    if (radarChartRef.current) {
      if (radarChartInstance.current) {
        radarChartInstance.current.destroy();
      }

      const ctx = radarChartRef.current.getContext('2d');
      if (ctx) {
        radarChartInstance.current = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: [
              'Focus (Inhibition)',
              'Working Memory',
              'Spatial Speed',
              'Precision (Accuracy)',
              'Consistency',
            ],
            datasets: [
              {
                label: 'Cognitive Index',
                data: [
                  profile.focusScore,
                  profile.memoryScore,
                  profile.spatialSpeedScore,
                  profile.overallAccuracy,
                  profile.consistencyScore,
                ],
                backgroundColor: 'rgba(168, 85, 247, 0.25)',
                borderColor: '#a855f7',
                borderWidth: 2,
                pointBackgroundColor: '#c084fc',
                pointBorderColor: '#3b0764',
                pointRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0d0d14',
                borderColor: '#262638',
                borderWidth: 1,
              },
            },
            scales: {
              r: {
                min: 20,
                max: 100,
                ticks: { display: false, stepSize: 20 },
                grid: { color: 'rgba(255, 255, 255, 0.08)' },
                angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
                pointLabels: {
                  color: '#cbd5e1',
                  font: { size: 11, weight: 'bold' },
                },
              },
            },
          },
        });
      }
    }

    // 3. Accuracy by Game Discipline Bar Chart
    if (barChartRef.current) {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }

      const stroopScores = scores.filter((s) => s.gameId === 'stroop');
      const patternScores = scores.filter((s) => s.gameId === 'pattern');
      const numberScores = scores.filter((s) => s.gameId === 'number-tap');

      const avgStroopAcc = stroopScores.length ? Math.round(stroopScores.reduce((a, b) => a + b.accuracy, 0) / stroopScores.length) : 85;
      const avgPatternAcc = patternScores.length ? Math.round(patternScores.reduce((a, b) => a + b.accuracy, 0) / patternScores.length) : 80;
      const avgNumberAcc = numberScores.length ? Math.round(numberScores.reduce((a, b) => a + b.accuracy, 0) / numberScores.length) : 95;

      const ctx = barChartRef.current.getContext('2d');
      if (ctx) {
        barChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Stroop Focus', 'Pattern Recall', 'Number Tap'],
            datasets: [
              {
                label: 'Accuracy %',
                data: [avgStroopAcc, avgPatternAcc, avgNumberAcc],
                backgroundColor: [
                  'rgba(99, 102, 241, 0.8)',
                  'rgba(168, 85, 247, 0.8)',
                  'rgba(6, 182, 212, 0.8)',
                ],
                borderRadius: 8,
                borderWidth: 1,
                borderColor: ['#6366f1', '#a855f7', '#06b6d4'],
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0d0d14',
                borderColor: '#262638',
                borderWidth: 1,
                callbacks: {
                  label: (ctx) => `Accuracy: ${ctx.parsed.y}%`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { size: 11 } },
              },
              y: {
                min: 0,
                max: 100,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: {
                  color: '#94a3b8',
                  font: { size: 11 },
                  callback: (val) => `${val}%`,
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (lineChartInstance.current) lineChartInstance.current.destroy();
      if (radarChartInstance.current) radarChartInstance.current.destroy();
      if (barChartInstance.current) barChartInstance.current.destroy();
    };
  }, [scores, profile]);

  const handleExportData = () => {
    sound.playTap();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ profile, scores, achievements }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `brainot_cognitive_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getTierBadge = (score: number) => {
    if (score >= 900) return { label: 'Grandmaster (Top 1%)', color: 'from-amber-400 to-yellow-600 text-amber-950 border-amber-300' };
    if (score >= 800) return { label: 'Superior Neuro-Grade (Top 5%)', color: 'from-indigo-400 to-purple-600 text-white border-indigo-400' };
    if (score >= 700) return { label: 'High Competency (Top 15%)', color: 'from-cyan-400 to-blue-600 text-slate-950 border-cyan-400' };
    return { label: 'Baseline Developing', color: 'from-[#1c1c28] to-[#252538] text-slate-200 border-[#2d2d40]' };
  };

  const tier = getTierBadge(profile.overallScore);

  return (
    <section id="analytics" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1f1f2c] pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Neurological Analytics Telemetry
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Real-Time Cognitive Dashboard
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
            Live millisecond performance profiling, spatial memory span, and longitudinal cognitive health trends updated synchronously after every game.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            id="export-telemetry-btn"
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-[#14141d] hover:bg-[#1e1e2c] text-slate-200 font-medium text-xs sm:text-sm flex items-center gap-2 border border-white/[0.08] transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            id="reset-stats-btn"
            onClick={() => {
              if (window.confirm('Reset all training history and re-seed baseline test data?')) {
                sound.playTap();
                onResetData();
              }
            }}
            className="px-4 py-2 rounded-xl bg-[#14141d] hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 font-medium text-xs sm:text-sm flex items-center gap-2 border border-white/[0.08] hover:border-rose-500/30 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Data
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Composite Score Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950/30 to-[#111118]/90 border border-indigo-500/25 backdrop-blur-xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Cognitive Index (BQ)</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white">{profile.overallScore}</span>
            <span className="text-xs text-slate-400 font-semibold">/ 1000</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1f1f2c]">
            <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r ${tier.color} shadow-sm`}>
              {tier.label}
            </span>
          </div>
        </div>

        {/* Reaction Time */}
        <div className="p-6 rounded-2xl bg-[#111118]/90 border border-[#1f1f2c] backdrop-blur-xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Reaction Latency</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-blue-400">{profile.avgReactionTime}</span>
            <span className="text-xs text-slate-400 font-semibold">ms</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1f1f2c] text-xs text-slate-400 flex items-center justify-between">
            <span>Neural synaptic speed</span>
            <span className="text-blue-400 font-semibold">{profile.avgReactionTime < 450 ? '⚡ Elite' : 'Normal'}</span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="p-6 rounded-2xl bg-[#111118]/90 border border-[#1f1f2c] backdrop-blur-xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Accuracy</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-emerald-400">{profile.overallAccuracy}%</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1f1f2c] text-xs text-slate-400 flex items-center justify-between">
            <span>Inhibition precision</span>
            <span className="text-emerald-400 font-semibold">{profile.overallAccuracy >= 90 ? '🌟 High' : 'Good'}</span>
          </div>
        </div>

        {/* Working Memory Span */}
        <div className="p-6 rounded-2xl bg-[#111118]/90 border border-[#1f1f2c] backdrop-blur-xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Max Memory Span</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-purple-400">{profile.maxMemorySpan}</span>
            <span className="text-xs text-slate-400 font-semibold">items</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1f1f2c] text-xs text-slate-400 flex items-center justify-between">
            <span>Corsi spatial capacity</span>
            <span className="text-purple-400 font-semibold">{profile.maxMemorySpan >= 6 ? '🧠 Superior' : 'Active'}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reaction Time Trend Line Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111118]/95 border border-[#1f1f2c] shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Reaction Latency Trend (Last Sessions)
              </h3>
              <p className="text-xs text-slate-400">Lower millisecond values indicate faster sensory-motor reflex</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#181824] text-indigo-300 border border-white/[0.08]">
              Live Feed
            </span>
          </div>
          <div className="w-full h-64 sm:h-72 relative">
            <canvas ref={lineChartRef} id="reaction-time-chart" />
          </div>
        </div>

        {/* Cognitive Domain Radar Chart */}
        <div className="p-6 rounded-2xl bg-[#111118]/95 border border-[#1f1f2c] shadow-xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              Neurological Radar Profile
            </h3>
            <p className="text-xs text-slate-400">Multi-domain cognitive equilibrium analysis</p>
          </div>
          <div className="w-full h-64 sm:h-72 relative flex items-center justify-center">
            <canvas ref={radarChartRef} id="cognitive-radar-chart" />
          </div>
        </div>
      </div>

      {/* Accuracy Comparison & Session History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accuracy Bar Chart */}
        <div className="p-6 rounded-2xl bg-[#111118]/95 border border-[#1f1f2c] shadow-xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              Accuracy by Game Discipline
            </h3>
            <p className="text-xs text-slate-400">Cross-paradigm precision distribution</p>
          </div>
          <div className="w-full h-60 relative">
            <canvas ref={barChartRef} id="accuracy-bar-chart" />
          </div>
        </div>

        {/* Session History Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111118]/95 border border-[#1f1f2c] shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                Recent Training Sessions
              </h3>
              <p className="text-xs text-slate-400">Recorded trial telemetry and outcome summaries</p>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Total Sessions: {scores.length}
            </span>
          </div>

          <div className="overflow-x-auto max-h-60 rounded-xl border border-[#1f1f2c]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c0c12] text-slate-400 font-semibold uppercase tracking-wider border-b border-[#1f1f2c]">
                <tr>
                  <th className="py-3 px-4">Game</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Reaction Time</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b1b26] font-medium">
                {scores.slice(0, 6).map((score) => {
                  const dateStr = new Date(score.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={score.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4 flex items-center gap-2 text-slate-200">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            score.gameId === 'stroop'
                              ? 'bg-indigo-400'
                              : score.gameId === 'pattern'
                              ? 'bg-purple-400'
                              : 'bg-cyan-400'
                          }`}
                        />
                        {score.gameName}
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-300">{score.score}</td>
                      <td className="py-3 px-4 text-slate-300">{score.reactionTimeMs} ms</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            score.accuracy >= 90
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : score.accuracy >= 75
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {score.accuracy}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{dateStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Achievements Showcase */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#121219] to-[#0d0d12] border border-[#1f1f2c] shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Milestone Neuro-Badges</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                ach.unlocked
                  ? 'bg-amber-950/15 border-amber-500/25 shadow-md shadow-amber-500/5'
                  : 'bg-[#0f0f16]/60 border-[#1c1c28] opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  ach.unlocked
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-[#181824] text-slate-500'
                }`}
              >
                <Trophy className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs sm:text-sm font-bold truncate ${ach.unlocked ? 'text-amber-200' : 'text-slate-300'}`}>
                    {ach.title}
                  </h4>
                  {ach.unlocked && <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{ach.description}</p>
                {!ach.unlocked && (
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>
                        {ach.progress} / {ach.maxProgress}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#181824] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
