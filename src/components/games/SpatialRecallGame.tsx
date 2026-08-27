import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  RotateCcw,
  Sparkles,
  Heart,
  Volume2,
  VolumeX,
  Award,
  Zap,
  ArrowRight,
  TrendingUp,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdaptiveState, GazeTelemetry, Language } from '../../types';
import { sound } from '../../utils/audio';
import { TRANSLATIONS } from '../../utils/i18n';
import { processAdaptiveRound } from '../../utils/adaptiveEngine';

interface SpatialRecallGameProps {
  onGameComplete: (scoreData: {
    score: number;
    accuracy: number;
    reactionTimeMs: number;
    levelReached: number;
    gridSize: number;
    difficultyFactor: number;
    gazeStabilityPct: number;
  }) => void;
  onExit: () => void;
  language: Language;
  adaptiveState: AdaptiveState;
  onUpdateAdaptiveState: (state: AdaptiveState) => void;
  gazeTelemetry: GazeTelemetry;
}

export const SpatialRecallGame: React.FC<SpatialRecallGameProps> = ({
  onGameComplete,
  onExit,
  language,
  adaptiveState,
  onUpdateAdaptiveState,
  gazeTelemetry,
}) => {
  const t = TRANSLATIONS[language];

  // Grid dimensions determined by Adaptive Engine (3x3, 4x4, or 5x5)
  const gridDimension = adaptiveState.gridDimension || 3;
  const totalTiles = gridDimension * gridDimension;

  const [gameState, setGameState] = useState<'idle' | 'showing' | 'recalling' | 'success' | 'gameover'>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState<number>(0);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [streak, setStreak] = useState<number>(0);
  const [isSoundMuted, setIsSoundMuted] = useState(sound.getMuted());
  const [highestSpan, setHighestSpan] = useState<number>(0);
  const [totalTaps, setTotalTaps] = useState<number>(0);
  const [correctTaps, setCorrectTaps] = useState<number>(0);
  const [adaptiveToast, setAdaptiveToast] = useState<string | null>(null);

  // Latency measurement
  const tapStartRef = useRef<number>(Date.now());
  const latenciesRef = useRef<number[]>([]);

  // Start new game session
  const startNewSession = useCallback(() => {
    setLives(3);
    setLevel(1);
    setScore(0);
    setStreak(0);
    setHighestSpan(0);
    setTotalTaps(0);
    setCorrectTaps(0);
    latenciesRef.current = [];
    generateNextRound(1, []);
  }, [gridDimension]);

  // Generate next round sequence
  const generateNextRound = (currentLevel: number, existingSeq: number[]) => {
    // Sequence length starts at 3 and grows with level
    const seqLength = currentLevel + 2;
    const newSeq: number[] = [];
    for (let i = 0; i < seqLength; i++) {
      newSeq.push(Math.floor(Math.random() * totalTiles));
    }

    setSequence(newSeq);
    setUserStep(0);
    setGameState('showing');
    playSequence(newSeq);
  };

  // Play sequence with audio-visual cues
  const playSequence = async (seq: number[]) => {
    // Pacing scaled with adaptive difficulty
    const intervalMs = Math.max(380, Math.round(750 / adaptiveState.difficultyFactor));
    await new Promise((r) => setTimeout(r, 600));

    for (let i = 0; i < seq.length; i++) {
      const tileIndex = seq[i];
      setActiveTile(tileIndex);
      sound.playTileNote(tileIndex);
      await new Promise((r) => setTimeout(r, intervalMs * 0.7));
      setActiveTile(null);
      await new Promise((r) => setTimeout(r, intervalMs * 0.3));
    }

    setGameState('recalling');
    tapStartRef.current = Date.now();
  };

  // Handle tile tap by patient
  const handleTileClick = (index: number) => {
    if (gameState !== 'recalling') return;

    const tapLatency = Date.now() - tapStartRef.current;
    latenciesRef.current.push(tapLatency);
    tapStartRef.current = Date.now();

    sound.playTileNote(index);
    setActiveTile(index);
    setTimeout(() => setActiveTile(null), 200);

    setTotalTaps((prev) => prev + 1);

    const expectedTile = sequence[userStep];

    if (index === expectedTile) {
      // Correct tile in sequence
      setCorrectTaps((prev) => prev + 1);
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      if (nextStep === sequence.length) {
        // Completed sequence successfully!
        sound.playCorrect();
        const roundPoints = sequence.length * 150 + streak * 30;
        setScore((prev) => prev + roundPoints);
        setStreak((prev) => prev + 1);
        setHighestSpan((prev) => Math.max(prev, sequence.length));

        // Evaluate Adaptive AI Engine after success
        const avgRoundLatency =
          latenciesRef.current.length > 0
            ? Math.round(latenciesRef.current.reduce((a, b) => a + b, 0) / latenciesRef.current.length)
            : 600;

        const { updatedState, adjustmentMade, message } = processAdaptiveRound(
          {
            gameId: 'spatial-recall',
            accuracy: 100,
            latencyMs: avgRoundLatency,
          },
          adaptiveState
        );

        if (adjustmentMade) {
          onUpdateAdaptiveState(updatedState);
          setAdaptiveToast(message);
          setTimeout(() => setAdaptiveToast(null), 4000);
        }

        const nextLevel = level + 1;
        setLevel(nextLevel);
        setGameState('success');

        setTimeout(() => {
          generateNextRound(nextLevel, sequence);
        }, 1000);
      }
    } else {
      // Wrong tile tapped
      sound.playWrong();
      const remainingLives = lives - 1;
      setLives(remainingLives);
      setStreak(0);

      // Adaptive AI Engine adjustment on error
      const avgRoundLatency =
        latenciesRef.current.length > 0
          ? Math.round(latenciesRef.current.reduce((a, b) => a + b, 0) / latenciesRef.current.length)
          : 900;

      const { updatedState, adjustmentMade, message } = processAdaptiveRound(
        {
          gameId: 'spatial-recall',
          accuracy: 40,
          latencyMs: avgRoundLatency,
        },
        adaptiveState
      );

      if (adjustmentMade) {
        onUpdateAdaptiveState(updatedState);
        setAdaptiveToast(message);
        setTimeout(() => setAdaptiveToast(null), 4000);
      }

      if (remainingLives <= 0) {
        handleGameOver();
      } else {
        // Replay current sequence
        setGameState('showing');
        setTimeout(() => {
          playSequence(sequence);
        }, 800);
      }
    }
  };

  const handleGameOver = () => {
    setGameState('gameover');
    sound.playVictory();

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0D9488', '#4F46E5', '#F97316'],
      });
    } catch {
      // Confetti fallback
    }

    const calculatedAccuracy = totalTaps > 0 ? Math.round((correctTaps / totalTaps) * 100) : 85;
    const avgRt =
      latenciesRef.current.length > 0
        ? Math.round(latenciesRef.current.reduce((a, b) => a + b, 0) / latenciesRef.current.length)
        : 650;

    onGameComplete({
      score,
      accuracy: Math.max(50, Math.min(100, calculatedAccuracy)),
      reactionTimeMs: avgRt,
      levelReached: level,
      gridSize: gridDimension,
      difficultyFactor: adaptiveState.difficultyFactor,
      gazeStabilityPct: gazeTelemetry.stabilityScore,
    });
  };

  const toggleSound = () => {
    const isMuted = sound.toggleMute();
    setIsSoundMuted(isMuted);
  };

  // Grid style class based on grid dimension
  const gridClass =
    gridDimension === 5
      ? 'grid-cols-5 gap-2 max-w-[420px]'
      : gridDimension === 4
      ? 'grid-cols-4 gap-2.5 max-w-[380px]'
      : 'grid-cols-3 gap-3 max-w-[340px]';

  return (
    <div
      id="spatial-recall-container"
      className="w-full max-w-4xl mx-auto bg-[#0d1322]/95 border border-teal-500/25 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-teal-500/20 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">{t.spatialRecallTitle}</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                {gridDimension}x{gridDimension} Matrix
              </span>
            </div>
            <p className="text-xs text-slate-400">{t.spatialRecallCat}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-white/[0.08] cursor-pointer"
            title={isSoundMuted ? t.soundOff : t.soundOn}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
          </button>

          {/* Exit button */}
          <button
            id="exit-spatial-recall-btn"
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
            className="my-3 p-3 rounded-xl bg-teal-950/80 border border-teal-400/40 text-xs text-teal-200 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>
                <strong>Adaptive AI Engine:</strong> {adaptiveToast}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">
              {adaptiveState.difficultyFactor}x
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Content View */}
      <div className="py-6 min-h-[420px] flex flex-col items-center justify-center relative z-10">
        {/* State 1: IDLE / Launcher */}
        {gameState === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg space-y-6">
            <div className="p-5 rounded-2xl bg-[#080d1a] border border-teal-500/20 text-left space-y-3 shadow-inner">
              <h4 className="text-sm font-bold text-teal-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                {t.spatialRecallCat} Protocol:
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">{t.spatialRecallInstr}</p>
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                <span className="flex items-center gap-1 text-teal-300">
                  <Sliders className="w-3.5 h-3.5" /> AI Scaled {gridDimension}x{gridDimension} Matrix
                </span>
                <span className="flex items-center gap-1 text-indigo-300">
                  <TrendingUp className="w-3.5 h-3.5" /> N-Back Neuro-Feedback
                </span>
              </div>
            </div>

            <button
              id="start-spatial-recall-btn"
              onClick={startNewSession}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-teal-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-white" />
              {t.startTraining} ({gridDimension}x{gridDimension})
            </button>
          </motion.div>
        )}

        {/* State 2 & 3: Active Playing Sequence / Recall */}
        {(gameState === 'showing' || gameState === 'recalling' || gameState === 'success') && (
          <div className="w-full flex flex-col items-center space-y-5">
            {/* Live Status HUD */}
            <div className="w-full max-w-md flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#080d1a] border border-teal-500/20 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Level:</span>
                <span className="text-teal-300 font-bold text-sm">#{level}</span>
                <span className="text-slate-500">({sequence.length} items)</span>
              </div>

              {/* Lives */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 transition-colors ${
                      i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Score */}
              <div className="flex items-center gap-1 text-indigo-300">
                <Award className="w-3.5 h-3.5" />
                <span className="font-bold">{score} pts</span>
              </div>
            </div>

            {/* Instruction Banner */}
            <div
              className={`w-full max-w-md py-2 px-4 rounded-xl text-center text-xs sm:text-sm font-bold transition-all ${
                gameState === 'showing'
                  ? 'bg-teal-950/60 text-teal-300 border border-teal-500/30 animate-pulse'
                  : gameState === 'success'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  : 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {gameState === 'showing' && t.watchSequence}
              {gameState === 'recalling' && `${t.repeatSequence} (${userStep}/${sequence.length})`}
              {gameState === 'success' && t.congratulations}
            </div>

            {/* Matrix Grid */}
            <div
              className={`grid ${gridClass} w-full p-4 rounded-3xl bg-[#070b14] border border-teal-500/20 shadow-2xl`}
            >
              {Array.from({ length: totalTiles }).map((_, idx) => {
                const isActive = activeTile === idx;
                return (
                  <button
                    key={idx}
                    id={`spatial-tile-${idx}`}
                    onClick={() => handleTileClick(idx)}
                    disabled={gameState !== 'recalling'}
                    className={`aspect-square rounded-2xl border transition-all duration-150 relative flex items-center justify-center cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-tr from-teal-400 to-indigo-400 border-white shadow-xl shadow-teal-500/70 scale-105 ring-4 ring-teal-400/50'
                        : gameState === 'showing'
                        ? 'bg-[#0f172a] border-white/[0.05] opacity-75 cursor-not-allowed'
                        : 'bg-[#131d33] hover:bg-[#1a2744] border-white/[0.08] hover:border-teal-400/50 hover:scale-105 active:scale-95 shadow-inner'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full transition-opacity ${
                        isActive ? 'opacity-100 bg-white' : 'opacity-20 bg-teal-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Sequence progress dots */}
            <div className="flex items-center gap-1.5 pt-1">
              {sequence.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < userStep ? 'bg-teal-400 scale-110 shadow-sm shadow-teal-400' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* State 4: Game Over Modal */}
        {gameState === 'gameover' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-teal-500/30">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-2xl font-bold text-white">{t.sessionComplete}</h4>
              <p className="text-xs text-slate-400 mt-1">Visuospatial working memory span recorded in clinical telemetry</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#080d1a] border border-teal-500/20 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">{t.bestSpan}</span>
                <span className="text-2xl font-black text-teal-300">{highestSpan || sequence.length - 1}</span>
                <span className="text-[10px] text-slate-500 block">items</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#080d1a] border border-teal-500/20 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">Final Score</span>
                <span className="text-2xl font-black text-indigo-300">{score}</span>
                <span className="text-[10px] text-slate-500 block">pts</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#080d1a] border border-teal-500/20 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">{t.accuracy}</span>
                <span className="text-2xl font-black text-emerald-400">
                  {totalTaps > 0 ? Math.round((correctTaps / totalTaps) * 100) : 100}%
                </span>
                <span className="text-[10px] text-slate-500 block">precision</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="replay-spatial-btn"
                onClick={startNewSession}
                className="flex-1 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/[0.08]"
              >
                <RotateCcw className="w-4 h-4" />
                {t.trainAgain}
              </button>
              <button
                id="view-report-spatial-btn"
                onClick={onExit}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/25"
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
