import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Target, RefreshCw, Trophy, ArrowRight, Activity, Clock, ShieldCheck, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/audio';
import { GameScoreEntry, StroopResultTrial } from '../../types';

interface StroopGameProps {
  onComplete: (score: Omit<GameScoreEntry, 'id' | 'timestamp'>) => void;
  onExit: () => void;
}

interface ColorOption {
  name: string;
  hex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  ringClass: string;
}

const COLORS: ColorOption[] = [
  { name: 'RED', hex: '#EF4444', bgClass: 'bg-rose-500/20 hover:bg-rose-500/30', borderClass: 'border-rose-500/40 hover:border-rose-400', textClass: 'text-rose-400', ringClass: 'focus:ring-rose-500' },
  { name: 'BLUE', hex: '#3B82F6', bgClass: 'bg-blue-500/20 hover:bg-blue-500/30', borderClass: 'border-blue-500/40 hover:border-blue-400', textClass: 'text-blue-400', ringClass: 'focus:ring-blue-500' },
  { name: 'GREEN', hex: '#10B981', bgClass: 'bg-emerald-500/20 hover:bg-emerald-500/30', borderClass: 'border-emerald-500/40 hover:border-emerald-400', textClass: 'text-emerald-400', ringClass: 'focus:ring-emerald-500' },
  { name: 'YELLOW', hex: '#F59E0B', bgClass: 'bg-amber-500/20 hover:bg-amber-500/30', borderClass: 'border-amber-500/40 hover:border-amber-400', textClass: 'text-amber-400', ringClass: 'focus:ring-amber-500' },
  { name: 'PURPLE', hex: '#8B5CF6', bgClass: 'bg-purple-500/20 hover:bg-purple-500/30', borderClass: 'border-purple-500/40 hover:border-purple-400', textClass: 'text-purple-400', ringClass: 'focus:ring-purple-500' },
];

const TOTAL_TRIALS = 15;

export const StroopGame: React.FC<StroopGameProps> = ({ onComplete, onExit }) => {
  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'playing' | 'summary'>('intro');
  const [countdown, setCountdown] = useState(3);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [displayedWord, setDisplayedWord] = useState<string>('RED');
  const [inkColor, setInkColor] = useState<ColorOption>(COLORS[1]);
  const [isCongruent, setIsCongruent] = useState<boolean>(false);
  const [results, setResults] = useState<StroopResultTrial[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'wrong' | null>(null);

  const trialStartTimeRef = useRef<number>(0);

  // Generate next trial
  const generateTrial = useCallback(() => {
    // 35% chance congruent, 65% chance incongruent (to test Stroop interference)
    const shouldBeCongruent = Math.random() < 0.35;
    const wordColorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    let inkColorObj: ColorOption;
    if (shouldBeCongruent) {
      inkColorObj = wordColorObj;
    } else {
      const remainingColors = COLORS.filter((c) => c.name !== wordColorObj.name);
      inkColorObj = remainingColors[Math.floor(Math.random() * remainingColors.length)];
    }

    setDisplayedWord(wordColorObj.name);
    setInkColor(inkColorObj);
    setIsCongruent(shouldBeCongruent);
    trialStartTimeRef.current = performance.now();
    setLastFeedback(null);
  }, []);

  // Countdown timer before starting
  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        sound.playTick();
        const timer = setTimeout(() => setCountdown(countdown - 1), 800);
        return () => clearTimeout(timer);
      } else {
        setGameState('playing');
        setCurrentTrialIndex(0);
        setResults([]);
        setStreak(0);
        setMaxStreak(0);
        generateTrial();
      }
    }
  }, [gameState, countdown, generateTrial]);

  const handleStartGame = () => {
    sound.playTap();
    setCountdown(3);
    setGameState('countdown');
  };

  const handleColorChoice = (chosen: ColorOption) => {
    if (gameState !== 'playing') return;

    const reactionTime = Math.max(120, Math.round(performance.now() - trialStartTimeRef.current));
    const isCorrect = chosen.name === inkColor.name;

    if (isCorrect) {
      sound.playCorrect();
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) setMaxStreak(nextStreak);
      setLastFeedback('correct');
    } else {
      sound.playWrong();
      setStreak(0);
      setLastFeedback('wrong');
    }

    const trialRecord: StroopResultTrial = {
      trialIndex: currentTrialIndex + 1,
      word: displayedWord,
      inkColor: inkColor.name,
      chosenColor: chosen.name,
      isCorrect,
      reactionTimeMs: reactionTime,
    };

    const nextResults = [...results, trialRecord];
    setResults(nextResults);

    if (currentTrialIndex + 1 < TOTAL_TRIALS) {
      setCurrentTrialIndex(currentTrialIndex + 1);
      generateTrial();
    } else {
      // Game Finished!
      finishGame(nextResults);
    }
  };

  const finishGame = (allResults: StroopResultTrial[]) => {
    sound.playVictory();
    setGameState('summary');

    const totalTrials = allResults.length;
    const correctTrials = allResults.filter((r) => r.isCorrect).length;
    const accuracy = Math.round((correctTrials / totalTrials) * 100);
    const avgRt = Math.round(allResults.reduce((acc, r) => acc + r.reactionTimeMs, 0) / totalTrials);

    // Score formula: high accuracy + fast speed + streak bonus
    const speedScore = Math.max(100, Math.round(1000 - avgRt));
    const finalScore = Math.min(1000, Math.max(100, Math.round(accuracy * 5 + speedScore * 0.4 + maxStreak * 20)));

    if (accuracy >= 80) {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
      });
    }

    onComplete({
      gameId: 'stroop',
      gameName: 'Stroop Test (Focus & Reaction)',
      score: finalScore,
      accuracy,
      reactionTimeMs: avgRt,
      totalTrials,
      correctTrials,
      metadata: {
        maxStreak,
        stroopInterferenceMs: calculateStroopInterference(allResults),
      },
    });
  };

  const calculateStroopInterference = (data: StroopResultTrial[]) => {
    const congruent = data.filter((d) => d.word === d.inkColor && d.isCorrect);
    const incongruent = data.filter((d) => d.word !== d.inkColor && d.isCorrect);
    if (congruent.length === 0 || incongruent.length === 0) return 0;
    const avgC = congruent.reduce((a, b) => a + b.reactionTimeMs, 0) / congruent.length;
    const avgI = incongruent.reduce((a, b) => a + b.reactionTimeMs, 0) / incongruent.length;
    return Math.round(avgI - avgC);
  };

  const correctCount = results.filter((r) => r.isCorrect).length;
  const currentAccuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 100;
  const currentAvgRt = results.length > 0 ? Math.round(results.reduce((a, b) => a + b.reactionTimeMs, 0) / results.length) : 0;

  return (
    <div id="stroop-game-container" className="w-full max-w-4xl mx-auto bg-[#101017]/95 border border-indigo-500/25 rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1e1e2c] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Stroop Focus Test
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                Cognitive Inhibition
              </span>
            </h3>
            <p className="text-xs text-slate-400">Identify the INK color, not what the word reads</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="exit-stroop-btn"
            onClick={onExit}
            className="px-3.5 py-1.5 rounded-lg bg-[#181824] hover:bg-[#222232] text-slate-300 text-xs font-medium transition-colors border border-white/[0.08] cursor-pointer"
          >
            Exit Game
          </button>
        </div>
      </div>

      {/* Main State Views */}
      <div className="py-6 relative z-10 min-h-[380px] flex flex-col justify-center items-center">
        {gameState === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-lg mx-auto space-y-6"
          >
            <div className="p-4 rounded-xl bg-[#0c0c14]/90 border border-indigo-500/20 text-left space-y-3">
              <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                How the Stroop Task Works:
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your brain naturally reads words automatically before processing their ink color. When a word like <span className="font-bold text-blue-400">"RED"</span> appears in <span className="font-bold text-emerald-400">Green ink</span>, your prefrontal cortex must actively suppress the impulse to read the text and instead tap <span className="underline decoration-emerald-400 font-semibold text-white">GREEN</span>.
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#1e1e2c]">
                <span>⏱️ {TOTAL_TRIALS} fast-paced trials</span>
                <span>⚡ Millisecond latency tracking</span>
              </div>
            </div>

            <button
              id="start-stroop-btn"
              onClick={handleStartGame}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-base shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-5 h-5" />
              Begin Stroop Test
            </button>
          </motion.div>
        )}

        {gameState === 'countdown' && (
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-center"
          >
            <div className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-indigo-300 to-indigo-600">
              {countdown === 0 ? 'GO!' : countdown}
            </div>
            <p className="text-sm font-medium text-slate-400 mt-4 tracking-wider uppercase">
              Get ready to select the INK color
            </p>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <div className="w-full max-w-xl mx-auto space-y-8">
            {/* Live Progress Bar & Stats HUD */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  Trial {currentTrialIndex + 1} of {TOTAL_TRIALS}
                </span>
                <span className="flex items-center gap-3">
                  {streak >= 3 && (
                    <span className="flex items-center gap-1 text-amber-400 font-bold animate-pulse">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" /> {streak}x Combo!
                    </span>
                  )}
                  <span>Accuracy: <strong className="text-white">{currentAccuracy}%</strong></span>
                </span>
              </div>
              <div className="w-full h-2 bg-[#1b1b26] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                  style={{ width: `${((currentTrialIndex) / TOTAL_TRIALS) * 100}%` }}
                />
              </div>
            </div>

            {/* Stimulus Word Card */}
            <div className="relative py-12 px-6 rounded-2xl bg-[#0a0a0f] border border-[#1e1e2c] text-center shadow-inner flex flex-col items-center justify-center min-h-[180px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentTrialIndex}-${displayedWord}-${inkColor.name}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="select-none"
                >
                  <span
                    className="text-5xl sm:text-6xl font-black tracking-wider drop-shadow-md"
                    style={{ color: inkColor.hex }}
                  >
                    {displayedWord}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Feedback indicator overlay */}
              {lastFeedback && (
                <div
                  className={`absolute top-3 right-4 text-xs font-bold px-2 py-0.5 rounded-full ${
                    lastFeedback === 'correct' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {lastFeedback === 'correct' ? '✓ Correct' : '✗ Miss'}
                </div>
              )}
            </div>

            {/* Choice Buttons */}
            <div>
              <p className="text-center text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Select the <span className="text-indigo-300 font-bold">Ink Color</span> of the word above:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {COLORS.map((col) => (
                  <button
                    key={col.name}
                    id={`stroop-btn-${col.name.toLowerCase()}`}
                    onClick={() => handleColorChoice(col)}
                    className={`py-3.5 px-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide border transition-all duration-150 active:scale-95 cursor-pointer shadow-md ${col.bgClass} ${col.borderClass} ${col.textClass}`}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameState === 'summary' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mx-auto text-center space-y-6"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-2xl font-bold text-white">Stroop Assessment Complete!</h4>
              <p className="text-sm text-slate-400 mt-1">Neurological inhibition &amp; reaction telemetry recorded</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0d0d14] border border-[#1e1e2c]">
                <span className="text-xs text-slate-400 block mb-1 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Avg Reaction
                </span>
                <span className="text-xl font-black text-indigo-300">{currentAvgRt} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0d0d14] border border-[#1e1e2c]">
                <span className="text-xs text-slate-400 block mb-1 flex items-center justify-center gap-1">
                  <Target className="w-3.5 h-3.5 text-emerald-400" /> Accuracy
                </span>
                <span className="text-xl font-black text-emerald-300">{currentAccuracy}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0d0d14] border border-[#1e1e2c]">
                <span className="text-xs text-slate-400 block mb-1 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Best Streak
                </span>
                <span className="text-xl font-black text-amber-300">{maxStreak}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                id="replay-stroop-btn"
                onClick={handleStartGame}
                className="px-6 py-2.5 rounded-xl bg-[#181824] hover:bg-[#222232] text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/[0.08]"
              >
                <RefreshCw className="w-4 h-4" />
                Train Again
              </button>
              <button
                id="done-stroop-btn"
                onClick={onExit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/25"
              >
                View Analytics &amp; Other Games
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
