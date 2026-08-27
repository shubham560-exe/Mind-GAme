import React from 'react';
import { motion } from 'motion/react';
import {
  Brain,
  Zap,
  Navigation,
  Activity,
  Award,
  Clock,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sliders,
  Sparkles,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { AdaptiveState, CognitiveProfile, GameId, Language } from '../types';
import { TRANSLATIONS } from '../utils/i18n';

interface HeroSectionProps {
  profile: CognitiveProfile;
  adaptiveState: AdaptiveState;
  onSelectGame: (gameId: GameId) => void;
  language: Language;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  adaptiveState,
  onSelectGame,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const mmse = profile.mmseEstimate;

  const gameModules = [
    {
      id: 'spatial-recall' as GameId,
      title: t.spatialRecallTitle,
      category: t.spatialRecallCat,
      description: t.spatialRecallDesc,
      icon: Brain,
      gradient: 'from-teal-500 to-emerald-600',
      badge: `${adaptiveState.gridDimension}x${adaptiveState.gridDimension} Matrix`,
      badgeColor: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      btnColor: 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 shadow-teal-500/25',
    },
    {
      id: 'stroop' as GameId,
      title: t.stroopTitle,
      category: t.stroopCat,
      description: t.stroopDesc,
      icon: Zap,
      gradient: 'from-indigo-500 to-violet-600',
      badge: `${adaptiveState.stroopTimeLimitMs}ms Latency`,
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      btnColor: 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-indigo-500/25',
    },
    {
      id: 'path-finder' as GameId,
      title: t.pathFinderTitle,
      category: t.pathFinderCat,
      description: t.pathFinderDesc,
      icon: Navigation,
      gradient: 'from-cyan-500 to-teal-600',
      badge: `Corridor ${adaptiveState.pathCorridorWidth}px`,
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      btnColor: 'bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 shadow-cyan-500/25',
    },
  ];

  return (
    <div id="patient-home-section" className="w-full space-y-8">
      {/* Top Clinical Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0b1222] via-[#070b14] to-[#0d172e] border border-teal-500/25 p-6 sm:p-10 overflow-hidden shadow-2xl">
        {/* Subtle ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Sliders className="w-3.5 h-3.5" />
                {t.adaptiveEngineBadge} ({adaptiveState.difficultyFactor}x)
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                Smart India Hackathon (SIH)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Adaptive Cognitive <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-400">Neuro-Rehabilitation</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Medical-grade gamified protocols calibrated with real-time gaze telemetry, reaction latency analysis, and closed-loop difficulty scaling for cognitive wellness.
            </p>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs flex items-center gap-2">
                <Brain className="w-4 h-4 text-teal-400" />
                <span className="text-slate-400">{t.overallCognitiveIndex}:</span>
                <strong className="text-teal-300 font-bold text-sm">{profile.overallScore}</strong>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-400">{t.mmseMapping}:</span>
                <strong className="text-indigo-300 font-bold text-sm">{mmse.totalScore}/30</strong>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="text-slate-400">Gaze Focus:</span>
                <strong className="text-amber-300 font-bold text-sm">{profile.gazeFocusScore}%</strong>
              </div>
            </div>
          </div>

          {/* Quick Start Clinical Assessment Card */}
          <div className="w-full lg:w-80 p-6 rounded-3xl bg-[#080d19]/90 border border-teal-500/30 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Daily Calibration</span>
              <h3 className="text-lg font-bold text-white">Recommended Modality</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adaptive AI recommends starting with <strong>Spatial Recall</strong> to stimulate prefrontal working memory circuits.
              </p>
            </div>

            <button
              id="hero-quick-start-btn"
              onClick={() => onSelectGame('spatial-recall')}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              {t.startTraining}
            </button>
          </div>
        </div>
      </div>

      {/* Gamified Test Modules Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{t.gamesTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-400">{t.gamesSubtitle}</p>
          </div>
          <span className="text-xs font-semibold text-teal-400">3 Interactive Clinical Games</span>
        </div>

        {/* 3 Game Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gameModules.map((game) => {
            const Icon = game.icon;
            return (
              <div
                key={game.id}
                id={`game-card-${game.id}`}
                className="rounded-3xl bg-[#0b1220] border border-white/[0.08] hover:border-teal-500/40 p-6 flex flex-col justify-between space-y-5 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10 group relative overflow-hidden"
              >
                {/* Ambient glow in card corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/15 transition-all" />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${game.gradient} flex items-center justify-center text-white shadow-lg`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${game.badgeColor}`}>
                      {game.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                      {game.title}
                    </h3>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">{game.category}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{game.description}</p>
                </div>

                <div className="pt-2 relative z-10">
                  <button
                    id={`play-btn-${game.id}`}
                    onClick={() => onSelectGame(game.id)}
                    className={`w-full py-3.5 px-4 rounded-2xl text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98 ${game.btnColor}`}
                  >
                    {t.startTraining}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
