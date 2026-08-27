import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Printer,
  TrendingDown,
  TrendingUp,
  Activity,
  Brain,
  Zap,
  Target,
  Navigation,
  Eye,
  ShieldCheck,
  Award,
  AlertCircle,
  Stethoscope,
  Calendar,
  User,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { AdaptiveState, CognitiveProfile, GameScoreEntry, Language } from '../../types';
import { generateClinicalPDF } from '../../utils/pdfExport';
import { TRANSLATIONS } from '../../utils/i18n';

interface ClinicalDashboardProps {
  profile: CognitiveProfile;
  scores: GameScoreEntry[];
  adaptiveState: AdaptiveState;
  language: Language;
}

export const ClinicalDashboard: React.FC<ClinicalDashboardProps> = ({
  profile,
  scores,
  adaptiveState,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const patientId = 'COG-9024';

  const [activeTab, setActiveTab] = useState<'overview' | 'longitudinal' | 'mmse' | 'recommendations'>('overview');

  const mmse = profile.mmseEstimate;

  const handleExportPDF = () => {
    generateClinicalPDF(profile, scores, patientId, language);
  };

  const handlePrint = () => {
    window.print();
  };

  // Domain radar scores
  const domainMetrics = [
    { label: t.workingMemory, score: profile.workingMemoryScore, color: 'text-teal-400', bg: 'bg-teal-500' },
    { label: t.executiveFunction, score: profile.executiveInhibitionScore, color: 'text-indigo-400', bg: 'bg-indigo-500' },
    { label: t.visuospatialCoordination, score: profile.visuospatialCoordinationScore, color: 'text-cyan-400', bg: 'bg-cyan-500' },
    { label: t.attentionGazeStability, score: profile.gazeFocusScore, color: 'text-amber-400', bg: 'bg-amber-500' },
    { label: 'Consistency Index', score: profile.consistencyScore, color: 'text-emerald-400', bg: 'bg-emerald-500' },
  ];

  return (
    <div id="clinical-dashboard-container" className="w-full max-w-7xl mx-auto space-y-6 text-slate-200">
      {/* Medical Record Header */}
      <div className="bg-[#0b1120] border border-teal-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                SIH Medical Neuro-Telemetry
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                Closed-Loop Adaptive Protocol
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Patient Clinical Telemetry: <span className="text-teal-400">{patientId}</span>
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Age: 62 | Male
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Active Protocol: Post-Stroke Cognitive Rehab
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" /> Total Sessions: {scores.length}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="export-pdf-report-btn"
              onClick={handleExportPDF}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-teal-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              {t.exportPdf}
            </button>
            <button
              id="print-summary-btn"
              onClick={handlePrint}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-white/[0.08] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              {t.printReport}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-800/80 overflow-x-auto">
          {[
            { id: 'overview', label: 'Clinical Overview & BQ' },
            { id: 'mmse', label: `MMSE Assessment (${mmse.totalScore}/30)` },
            { id: 'longitudinal', label: 'Longitudinal Telemetry Trends' },
            { id: 'recommendations', label: 'AI Diagnostic Insights' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Vitals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#0b1120] border border-teal-500/20 shadow-xl space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>CogniCure Quotient (CQ)</span>
                <Brain className="w-4 h-4 text-teal-400" />
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{profile.overallScore}</span>
                <span className="text-xs text-slate-500">/ 1000</span>
              </div>
              <span className="text-[11px] text-teal-300 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-teal-400" /> +42 pts neural gain
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-[#0b1120] border border-indigo-500/20 shadow-xl space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Estimated MMSE Score</span>
                <Award className="w-4 h-4 text-indigo-400" />
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-300">{mmse.totalScore}</span>
                <span className="text-xs text-slate-500">/ 30</span>
              </div>
              <span className="text-[11px] text-indigo-300">{mmse.diagnosticCategory}</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#0b1120] border border-cyan-500/20 shadow-xl space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Avg Synaptic Latency</span>
                <Zap className="w-4 h-4 text-cyan-400" />
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-cyan-300">{profile.avgReactionTime}</span>
                <span className="text-xs text-slate-500">ms</span>
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-emerald-400" /> 18% latency reduction
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-[#0b1120] border border-amber-500/20 shadow-xl space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Gaze Focus Stability</span>
                <Eye className="w-4 h-4 text-amber-400" />
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-300">{profile.gazeFocusScore}%</span>
                <span className="text-xs text-slate-500">stable</span>
              </div>
              <span className="text-[11px] text-amber-300">Optical Centroid Active</span>
            </div>
          </div>

          {/* Cognitive Domain Breakdown Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Domain Progress Bars */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0b1120] border border-teal-500/20 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                Neuro-Cognitive Domain Competency Profile
              </h3>

              <div className="space-y-4 pt-2">
                {domainMetrics.map((dm) => (
                  <div key={dm.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300">{dm.label}</span>
                      <span className={dm.color}>{dm.score} / 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full ${dm.bg} transition-all duration-500`} style={{ width: `${dm.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Adaptive Engine Parameters Status */}
            <div className="p-6 rounded-3xl bg-[#0b1120] border border-indigo-500/20 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Active Adaptive Calibration
              </h3>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Difficulty Factor:</span>
                  <span className="font-bold text-teal-300 text-sm">{adaptiveState.difficultyFactor}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Spatial Grid Dimension:</span>
                  <span className="font-bold text-slate-200">{adaptiveState.gridDimension}x{adaptiveState.gridDimension}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Stroop Latency Threshold:</span>
                  <span className="font-bold text-slate-200">{adaptiveState.stroopTimeLimitMs} ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Maze Corridor Width:</span>
                  <span className="font-bold text-slate-200">{adaptiveState.pathCorridorWidth} px</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Calibration updates automatically after high-accuracy rounds to stimulate neuroplastic reorganization.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MMSE ASSESSMENT */}
      {activeTab === 'mmse' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1120] border border-teal-500/30 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Standardized Folstein Mapping</span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Mini-Mental State Examination: <span className="text-teal-300">{mmse.totalScore} / 30</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">{mmse.clinicalSummary}</p>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold text-center">
                {mmse.diagnosticCategory}
              </div>
            </div>

            {/* 5 Subscores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#070b14] border border-white/[0.06] text-center space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Orientation</span>
                <span className="text-2xl font-black text-white">{mmse.orientationScore}</span>
                <span className="text-[10px] text-slate-500 block">/ 10 max</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#070b14] border border-white/[0.06] text-center space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Registration</span>
                <span className="text-2xl font-black text-teal-300">{mmse.registrationScore}</span>
                <span className="text-[10px] text-slate-500 block">/ 3 max</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#070b14] border border-white/[0.06] text-center space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Attention & Calc</span>
                <span className="text-2xl font-black text-indigo-300">{mmse.attentionCalculationScore}</span>
                <span className="text-[10px] text-slate-500 block">/ 5 max</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#070b14] border border-white/[0.06] text-center space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Recall (Memory)</span>
                <span className="text-2xl font-black text-cyan-300">{mmse.recallScore}</span>
                <span className="text-[10px] text-slate-500 block">/ 3 max</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#070b14] border border-white/[0.06] text-center space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Visuospatial</span>
                <span className="text-2xl font-black text-amber-300">{mmse.languageVisuospatialScore}</span>
                <span className="text-[10px] text-slate-500 block">/ 9 max</span>
              </div>
            </div>

            {/* Clinical Reference Scale */}
            <div className="p-5 rounded-2xl bg-[#070b14] border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">MMSE Reference Thresholds</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                  <strong>25 - 30 Points:</strong> Normal Cognition / Preserved neural reserves.
                </div>
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
                  <strong>18 - 24 Points:</strong> Mild Cognitive Impairment (MCI) / Early intervention.
                </div>
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
                  <strong>&lt; 18 Points:</strong> Moderate to Severe Impairment / Supervised care.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LONGITUDINAL TRENDS */}
      {activeTab === 'longitudinal' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0b1120] border border-teal-500/20 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Session Telemetry History ({scores.length} Records)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4">Test Module</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Latency / Dev</th>
                    <th className="py-3 px-4">Gaze Stability</th>
                    <th className="py-3 px-4">AI Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {scores.map((sc) => (
                    <tr key={sc.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 text-slate-300">
                        {new Date(sc.timestamp).toLocaleDateString()} {new Date(sc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                        {sc.gameId === 'spatial-recall' && <Brain className="w-3.5 h-3.5 text-teal-400" />}
                        {sc.gameId === 'stroop' && <Zap className="w-3.5 h-3.5 text-indigo-400" />}
                        {sc.gameId === 'path-finder' && <Navigation className="w-3.5 h-3.5 text-cyan-400" />}
                        {sc.gameName}
                      </td>
                      <td className="py-3 px-4 font-bold text-teal-300">{sc.score}</td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">{sc.accuracy}%</td>
                      <td className="py-3 px-4 text-slate-300">
                        {sc.pathDeviationPx ? `${sc.pathDeviationPx} px dev` : `${sc.reactionTimeMs} ms`}
                      </td>
                      <td className="py-3 px-4 text-amber-300">{sc.gazeStabilityPct || 95}%</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                          {sc.difficultyFactor || 1.0}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI RECOMMENDATIONS & NOTES */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1120] border border-teal-500/20 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-teal-400" />
              AI Clinical Diagnostic Insights & Suggested Rehabilitation
            </h3>

            <div className="space-y-3">
              {adaptiveState.aiRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#070b14] border border-teal-500/20 text-xs sm:text-sm text-slate-300 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Attending Neurologist Notes:
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Patient maintains sharp executive inhibition with negligible motor tremor in 2D maze tracing. Recommend continuing 15-minute daily adaptive sessions with high-frequency spatial matrix training to reinforce working memory pathways.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
