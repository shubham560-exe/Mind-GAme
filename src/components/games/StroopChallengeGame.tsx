import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Clock,
  Target,
  Flame,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  ArrowRight,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdaptiveState, GazeTelemetry, Language, StroopResultTrial, StroopTrial } from '../../types';
import { sound } from '../../utils/audio';
import { TRANSLATIONS } from '../../utils/i18n';
import { processAdaptiveRound } from '../../utils/adaptiveEngine';

interface StroopChallengeGameProps {
  onGameComplete: (scoreData: {
    score: number;
    accuracy: number;
    reactionTimeMs: number;
    errorRate: number;
    difficultyFactor: number;
    gazeStabilityPct: number;
    totalTrials: number;
    correctTrials: number;
  }) => void;
  onExit: () => void;
  language: Language;
  adaptiveState: AdaptiveState;
  onUpdateAdaptiveState: (state: AdaptiveState) => void;
  gazeTelemetry: GazeTelemetry;
}

interface ColorOption {
  key: string;
  nameEn: string;
  hex: string;
  twClass: string;
}

const COLOR_PALETTE: ColorOption[] = [
  { key: 'red', nameEn: 'RED', hex: '#EF4444', twClass: 'bg-red-500 hover:bg-red-400 text-white' },
  { key: 'green', nameEn: 'GREEN', hex: '#10B981', twClass: 'bg-emerald-500 hover:bg-emerald-400 text-white' },
  { key: 'blue', nameEn: 'BLUE', hex: '#3B82F6', twClass: 'bg-blue-500 hover:bg-blue-400 text-white' },
  { key: 'yellow', nameEn: 'YELLOW', hex: '#EAB308', twClass: 'bg-amber-400 hover:bg-amber-300 text-slate-950' },
  { key: 'purple', nameEn: 'PURPLE', hex: '#A855F7', twClass: 'bg-purple-500 hover:bg-purple-400 text-white' },
  { key: 'orange', nameEn: 'ORANGE', hex: '#F97316', twClass: 'bg-orange-500 hover:bg-orange-400 text-white' },
];

const TOTAL_TRIALS = 12;

export const StroopChallengeGame: React.FC<StroopChallengeGameProps> = ({
  onGameComplete,
  onExit,
  language,
  adaptiveState,
  onUpdateAdaptiveState,
  gazeTelemetry,
}) => {
  const t = TRANSLATIONS[language];

  // Vernacular localized color name getter
  const getLocalizedColorName = (key: string): string => {
    switch (key) {
      case 'red':
        return t.colorRed;
      case 'green':
        return t.colorGreen;
      case 'blue':
        return t.colorBlue;
      case 'yellow':
        return t.colorYellow;
      case 'purple':
        return t.colorPurple;
      case 'orange':
        return t.colorOrange;
      default:
        return key.toUpperCase();
    }
  };

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [currentTrialIndex, setCurrentTrialIndex] = useState<number>(0);
  const [displayedWord, setDisplayedWord] = useState<string>('');
  const [inkColor, setInkColor] = useState<ColorOption>(COLOR_PALETTE[0]);
  const [options, setOptions] = useState<ColorOption[]>([]);
  const [results, setResults] = useState<StroopResultTrial[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(sound.getMuted());
  const [timeRemainingPct, setTimeRemainingPct] = useState<number>(100);
  const [adaptiveToast, setAdaptiveToast] = useState<string | null>(null);

  // Time & Latency tracker
  const trialStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);
  const trialTimeLimitMs = adaptiveState.stroopTimeLimitMs || 2000;

  // Generate next trial stimulus
  const setupNextTrial = useCallback(
    (trialIdx: number) => {
      if (trialIdx >= TOTAL_TRIALS) {
        finishGame();
        return;
      }

      // Pick 4 distinct colors for this trial
      const shuffledPalette = [...COLOR_PALETTE].sort(() => 0.5 - Math.random());
      const selectedOptions = shuffledPalette.slice(0, 4);

      // Incongruency probability from adaptive engine
      const isIncongruent = Math.random() < adaptiveState.stroopIncongruencyRatio;

      const chosenInk = selectedOptions[Math.floor(Math.random() * selectedOptions.length)];
      let wordColor = chosenInk;

      if (isIncongruent) {
        const otherOptions = selectedOptions.filter((c) => c.key !== chosenInk.key);
        wordColor = otherOptions[Math.floor(Math.random() * otherOptions.length)];
      }

      setCurrentTrialIndex(trialIdx);
      setInkColor(chosenInk);
      setDisplayedWord(getLocalizedColorName(wordColor.key));
      setOptions(selectedOptions);
      setTimeRemainingPct(100);

      trialStartTimeRef.current = performance.now();

      // Countdown timer bar
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      const startTime = performance.now();

      timerIntervalRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / trialTimeLimitMs) * 100);
        setTimeRemainingPct(remaining);

        if (remaining <= 0) {
          clearInterval(timerIntervalRef.current!);
          handleTimeOut(trialIdx, chosenInk);
        }
      }, 30);
    },
    [adaptiveState.stroopIncongruencyRatio, trialTimeLimitMs, language]
  );

  const handleStartGame = () => {
    setGameState('playing');
    setResults([]);
    setStreak(0);
    setMaxStreak(0);
    setScore(0);
    setupNextTrial(0);
  };

  const handleTimeOut = (trialIdx: number, targetInk: ColorOption) => {
    sound.playWrong();
    const trialResult: StroopResultTrial = {
      trialIndex: trialIdx,
      word: displayedWord,
      inkColor: targetInk.nameEn,
      chosenColor: 'TIMEOUT',
      isCorrect: false,
      reactionTimeMs: trialTimeLimitMs,
    };

    setResults((prev) => [...prev, trialResult]);
    setStreak(0);

    setTimeout(() => {
      setupNextTrial(trialIdx + 1);
    }, 400);
  };

  const handleOptionClick = (option: ColorOption) => {
    if (gameState !== 'playing') return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const reactionTime = Math.round(performance.now() - trialStartTimeRef.current);
    const isCorrect = option.key === inkColor.key;

    if (isCorrect) {
      sound.playCorrect();
      const currentCombo = streak + 1;
      setStreak(currentCombo);
      setMaxStreak((prev) => Math.max(prev, currentCombo));

      // Speed bonus: Faster answer = higher points
      const speedMultiplier = Math.max(1, Math.round((trialTimeLimitMs - reactionTime) / 10));
      const points = 100 + speedMultiplier + currentCombo * 25;
      setScore((prev) => prev + points);
    } else {
      sound.playWrong();
      setStreak(0);
    }

    const trialResult: StroopResultTrial = {
      trialIndex: currentTrialIndex,
      word: displayedWord,
      inkColor: inkColor.nameEn,
      chosenColor: option.nameEn,
      isCorrect,
      reactionTimeMs: reactionTime,
    };

    const updatedResults = [...results, trialResult];
    setResults(updatedResults);

    // After every 4 trials, check adaptive AI engine adjustment
    if (updatedResults.length % 4 === 0) {
      const recentTrials = updatedResults.slice(-4);
      const acc = Math.round((recentTrials.filter((t) => t.isCorrect).length / recentTrials.length) * 100);
      const avgLatency = Math.round(recentTrials.reduce((a, b) => a + b.reactionTimeMs, 0) / recentTrials.length);

      const { updatedState, adjustmentMade, message } = processAdaptiveRound(
        {
          gameId: 'stroop',
          accuracy: acc,
          latencyMs: avgLatency,
        },
        adaptiveState
      );

      if (adjustmentMade) {
        onUpdateAdaptiveState(updatedState);
        setAdaptiveToast(message);
        setTimeout(() => setAdaptiveToast(null), 3500);
      }
    }

    setTimeout(() => {
      setupNextTrial(currentTrialIndex + 1);
    }, 300);
  };

  const finishGame = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setGameState('gameover');
    sound.playVictory();

    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#EF4444', '#10B981', '#3B82F6', '#F97316'],
      });
    } catch {
      // Confetti fallback
    }

    const correctCount = results.filter((r) => r.isCorrect).length;
    const finalAccuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 85;
    const finalAvgRt =
      results.length > 0 ? Math.round(results.reduce((a, b) => a + b.reactionTimeMs, 0) / results.length) : 550;
    const finalErrorRate = 100 - finalAccuracy;

    onGameComplete({
      score,
      accuracy: finalAccuracy,
      reactionTimeMs: finalAvgRt,
      errorRate: finalErrorRate,
      difficultyFactor: adaptiveState.difficultyFactor,
      gazeStabilityPct: gazeTelemetry.stabilityScore,
      totalTrials: TOTAL_TRIALS,
      correctTrials: correctCount,
    });
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const toggleSound = () => {
    const isMuted = sound.toggleMute();
    setIsSoundMuted(isMuted);
  };

  const currentAccuracy =
    results.length > 0 ? Math.round((results.filter((r) => r.isCorrect).length / results.length) * 100) : 100;
  const currentAvgRt =
    results.length > 0 ? Math.round(results.reduce((a, b) => a + b.reactionTimeMs, 0) / results.length) : 0;

  return (
    <div
      id="stroop-challenge-container"
      className="w-full max-w-4xl mx-auto bg-[#0d1322]/95 border border-indigo-500/25 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-indigo-500/20 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">{t.stroopTitle}</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {TOTAL_TRIALS} Trials
              </span>
            </div>
            <p className="text-xs text-slate-400">{t.stroopCat}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-white/[0.08] cursor-pointer"
            title={isSoundMuted ? t.soundOff : t.soundOn}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Exit button */}
          <button
            id="exit-stroop-btn"
            onClick={onExit}
            className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/[0.08] cursor-pointer transition-colors"
          >
            {t.exitGame}
          </button>
        </div>
      </div>

      {/* Adaptive Toast Banner */}
      <AnimatePresence>
        {adaptiveToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="my-3 p-3 rounded-xl bg-indigo-950/80 border border-indigo-400/40 text-xs text-indigo-200 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>
                <strong>Adaptive AI Engine:</strong> {adaptiveToast}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
              {adaptiveState.difficultyFactor}x
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main View Area */}
      <div className="py-6 min-h-[420px] flex flex-col items-center justify-center relative z-10">
        {/* State 1: IDLE / Launcher */}
        {gameState === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg space-y-6">
            <div className="p-5 rounded-2xl bg-[#080d1a] border border-indigo-500/20 text-left space-y-3 shadow-inner">
              <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                {t.stroopCat} Protocol:
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">{t.stroopInstr}</p>
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                <span>⏱️ {TOTAL_TRIALS} fast-paced trials</span>
                <span>⚡ Millisecond latency telemetry</span>
              </div>
            </div>

            <button
              id="start-stroop-btn"
              onClick={handleStartGame}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-white" />
              {t.startTraining} ({TOTAL_TRIALS} Trials)
            </button>
          </motion.div>
        )}

        {/* State 2: Active Playing */}
        {gameState === 'playing' && (
          <div className="w-full max-w-xl space-y-6">
            {/* Progress HUD */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>
                  Trial {currentTrialIndex + 1} of {TOTAL_TRIALS}
                </span>
                <span className="flex items-center gap-3">
                  {streak >= 2 && (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" /> {streak}x Combo!
                    </span>
                  )}
                  <span>
                    Accuracy: <strong className="text-white">{currentAccuracy}%</strong>
                  </span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-[#1b253b] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                  style={{ width: `${(currentTrialIndex / TOTAL_TRIALS) * 100}%` }}
                />
              </div>

              {/* Trial countdown timer */}
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 ${
                    timeRemainingPct > 40 ? 'bg-indigo-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${timeRemainingPct}%` }}
                />
              </div>
            </div>

            {/* Stimulus Word Card */}
            <div className="relative py-12 px-6 rounded-3xl bg-[#080d1a] border border-indigo-500/20 text-center shadow-inner flex flex-col items-center justify-center min-h-[190px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentTrialIndex}-${displayedWord}-${inkColor.key}`}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <span
                    className="text-5xl sm:text-6xl font-black tracking-wider uppercase select-none drop-shadow-md"
                    style={{ color: inkColor.hex }}
                  >
                    {displayedWord}
                  </span>
                </motion.div>
              </AnimatePresence>
              <span className="text-[11px] text-slate-500 font-medium mt-3">{t.tapMatchingInk}</span>
            </div>

            {/* 4 Interactive Color Options */}
            <div className="grid grid-cols-2 gap-3.5">
              {options.map((opt) => (
                <button
                  key={opt.key}
                  id={`stroop-option-${opt.key}`}
                  onClick={() => handleOptionClick(opt)}
                  className={`py-4 px-6 rounded-2xl font-bold text-sm sm:text-base transition-all duration-150 transform hover:scale-[1.03] active:scale-[0.97] cursor-pointer shadow-lg flex items-center justify-center gap-2 select-none ${opt.twClass}`}
                >
                  <span className="w-3 h-3 rounded-full bg-white/40 shadow-inner" />
                  {getLocalizedColorName(opt.key)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* State 3: Game Over Modal */}
        {gameState === 'gameover' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-500/30">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-2xl font-bold text-white">{t.sessionComplete}</h4>
              <p className="text-xs text-slate-400 mt-1">Prefrontal inhibitory control & latency recorded</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#080d1a] border border-indigo-500/20 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">{t.avgLatency}</span>
                <span className="text-2xl font-black text-indigo-300">{currentAvgRt}</span>
                <span className="text-[10px] text-slate-500 block">ms</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#080d1a] border border-indigo-500/20 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">{t.accuracy}</span>
                <span className="text-2xl font-black text-emerald-400">{currentAccuracy}%</span>
                <span className="text-[10px] text-slate-500 block">precision</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#080d1a] border border-indigo-500/20 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">Best Streak</span>
                <span className="text-2xl font-black text-amber-400">{maxStreak}x</span>
                <span className="text-[10px] text-slate-500 block">combo</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="replay-stroop-btn"
                onClick={handleStartGame}
                className="flex-1 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/[0.08]"
              >
                <RotateCcw className="w-4 h-4" />
                {t.trainAgain}
              </button>
              <button
                id="view-report-stroop-btn"
                onClick={onExit}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/25"
              >
                {t.viewClinicalReport}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
