import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Brain, Heart, Trophy, RefreshCw, ArrowRight, Sparkles, Volume2, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/audio';
import { GameScoreEntry } from '../../types';

interface PatternMemoryProps {
  onComplete: (score: Omit<GameScoreEntry, 'id' | 'timestamp'>) => void;
  onExit: () => void;
}

const GRID_SIZE = 9; // 3x3

export const PatternMemoryGame: React.FC<PatternMemoryProps> = ({ onComplete, onExit }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [highestSpan, setHighestSpan] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('Watch closely...');
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);

  const startTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  // Play the visual sequence
  const playSequence = useCallback((seq: number[]) => {
    setIsPlayingSequence(true);
    isPlayingRef.current = true;
    setStatusMessage(`Level ${seq.length - 2}: Memorize the sequence...`);

    seq.forEach((tileIdx, step) => {
      setTimeout(() => {
        setActiveTile(tileIdx);
        sound.playTileNote(tileIdx);

        setTimeout(() => {
          setActiveTile(null);
          // If this is the last step
          if (step === seq.length - 1) {
            setTimeout(() => {
              setIsPlayingSequence(false);
              isPlayingRef.current = false;
              setStatusMessage('Your turn! Repeat the pattern.');
              startTimeRef.current = performance.now();
            }, 300);
          }
        }, 420);
      }, (step + 1) * 650);
    });
  }, []);

  const startNewGame = () => {
    sound.playTap();
    setLives(3);
    setLevel(1);
    setScore(0);
    setHighestSpan(0);
    setTotalAttempts(0);
    setCorrectAttempts(0);
    setPlayerSequence([]);
    
    // Initial 3-step sequence
    const initialSeq = [
      Math.floor(Math.random() * GRID_SIZE),
      Math.floor(Math.random() * GRID_SIZE),
      Math.floor(Math.random() * GRID_SIZE),
    ];
    setSequence(initialSeq);
    setGameState('playing');
    setTimeout(() => {
      playSequence(initialSeq);
    }, 600);
  };

  const handleTileClick = (index: number) => {
    if (isPlayingSequence || gameState !== 'playing') return;

    sound.playTileNote(index);
    setActiveTile(index);
    setTimeout(() => setActiveTile(null), 180);

    const nextPlayerSeq = [...playerSequence, index];
    setPlayerSequence(nextPlayerSeq);

    const currentStep = nextPlayerSeq.length - 1;

    // Check if the current click is correct
    if (nextPlayerSeq[currentStep] !== sequence[currentStep]) {
      // Wrong move!
      sound.playWrong();
      const nextLives = lives - 1;
      setLives(nextLives);
      setTotalAttempts((prev) => prev + 1);

      if (nextLives <= 0) {
        // Game Over
        finishGame(score, sequence.length - 1, totalAttempts + 1, correctAttempts);
      } else {
        setStatusMessage(`Incorrect! ${nextLives} lives left. Watch again.`);
        setPlayerSequence([]);
        setTimeout(() => {
          playSequence(sequence);
        }, 1000);
      }
      return;
    }

    // If step is correct
    if (nextPlayerSeq.length === sequence.length) {
      // Sequence completed correctly!
      sound.playCorrect();
      const currentSpan = sequence.length;
      const pointsEarned = currentSpan * 150;
      const nextScore = score + pointsEarned;
      const nextCorrect = correctAttempts + 1;
      const nextTotal = totalAttempts + 1;

      setScore(nextScore);
      setCorrectAttempts(nextCorrect);
      setTotalAttempts(nextTotal);
      if (currentSpan > highestSpan) {
        setHighestSpan(currentSpan);
      }

      setStatusMessage('Pattern matched! Leveling up...');
      setPlayerSequence([]);

      // Add a new random step to the sequence
      const nextStepTile = Math.floor(Math.random() * GRID_SIZE);
      const nextSequence = [...sequence, nextStepTile];
      setSequence(nextSequence);
      setLevel((prev) => prev + 1);

      setTimeout(() => {
        playSequence(nextSequence);
      }, 1100);
    }
  };

  const finishGame = (finalScore: number, maxSpan: number, total: number, correct: number) => {
    sound.playVictory();
    setGameState('gameover');

    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 75;
    const finalCalculatedScore = Math.min(1000, Math.max(100, finalScore + maxSpan * 50));

    if (maxSpan >= 5) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#3b82f6', '#10b981'],
      });
    }

    onComplete({
      gameId: 'pattern',
      gameName: 'Pattern Memory (Corsi Recall)',
      score: finalCalculatedScore,
      accuracy,
      reactionTimeMs: Math.max(400, 1100 - maxSpan * 80),
      levelReached: maxSpan,
      metadata: {
        maxMemorySpan: maxSpan,
        finalScore,
      },
    });
  };

  return (
    <div id="pattern-game-container" className="w-full max-w-4xl mx-auto bg-[#101017]/95 border border-purple-500/25 rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1e1e2c] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Pattern Memory Matrix
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                Spatial Working Memory
              </span>
            </h3>
            <p className="text-xs text-slate-400">Recall sequential spatial patterns and expand your working memory span</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="exit-pattern-btn"
            onClick={onExit}
            className="px-3.5 py-1.5 rounded-lg bg-[#181824] hover:bg-[#222232] text-slate-300 text-xs font-medium transition-colors border border-white/[0.08] cursor-pointer"
          >
            Exit Game
          </button>
        </div>
      </div>

      {/* Main Game Surface */}
      <div className="py-6 relative z-10 min-h-[380px] flex flex-col justify-center items-center">
        {gameState === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-lg mx-auto space-y-6"
          >
            <div className="p-4 rounded-xl bg-[#0c0c14]/90 border border-purple-500/20 text-left space-y-3">
              <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Corsi Block Memory Paradigm:
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                The 3x3 matrix will illuminate in a melodic sequence. Observe the order closely, then tap the identical sequence in exact order. With every successful recall, the sequence extends by one tile, training your <strong className="text-purple-300">visuo-spatial sketchpad</strong>.
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#1e1e2c]">
                <span>❤️ 3 Lives per session</span>
                <span>🎵 Harmonic audio spatial anchors</span>
              </div>
            </div>

            <button
              id="start-pattern-btn"
              onClick={startNewGame}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              Start Memory Training
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <div className="w-full max-w-md mx-auto space-y-6 flex flex-col items-center">
            {/* Status & Lives HUD */}
            <div className="w-full flex items-center justify-between px-2 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-300 font-bold">Span:</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-bold text-sm border border-purple-500/20">
                  {sequence.length} items
                </span>
              </div>

              <div className="flex items-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 transition-all duration-300 ${
                      i < lives ? 'text-rose-500 fill-rose-500 scale-100' : 'text-slate-700 fill-transparent scale-90'
                    }`}
                  />
                ))}
              </div>

              <div className="text-right">
                <span className="text-slate-300 font-bold">Score:</span>{' '}
                <span className="text-purple-300 font-bold text-sm">{score}</span>
              </div>
            </div>

            {/* Prompt Banner */}
            <div
              className={`w-full py-2.5 px-4 rounded-xl text-center text-xs sm:text-sm font-bold transition-all ${
                isPlayingSequence
                  ? 'bg-purple-950/40 text-purple-300 border border-purple-500/30 animate-pulse'
                  : 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {statusMessage}
            </div>

            {/* 3x3 Interactive Matrix Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#0c0c12] border border-[#1e1e2c] shadow-2xl">
              {Array.from({ length: GRID_SIZE }).map((_, index) => {
                const isActive = activeTile === index;
                return (
                  <button
                    key={index}
                    id={`pattern-tile-${index}`}
                    disabled={isPlayingSequence}
                    onClick={() => handleTileClick(index)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl transition-all duration-150 transform cursor-pointer flex items-center justify-center border ${
                      isActive
                        ? 'bg-gradient-to-tr from-purple-400 to-indigo-300 border-white shadow-xl shadow-purple-500/60 scale-105 ring-4 ring-purple-400/40'
                        : isPlayingSequence
                        ? 'bg-[#12121a] border-[#1e1e2c] opacity-60 cursor-not-allowed'
                        : 'bg-[#151520] hover:bg-[#1f1f2e] border-white/[0.08] hover:border-purple-500/40 active:scale-95 shadow-inner'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full transition-all ${
                        isActive ? 'bg-white shadow-md' : 'bg-slate-700/60'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Player Progress Indicators */}
            <div className="flex gap-1.5 justify-center mt-2">
              {sequence.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i < playerSequence.length
                      ? 'bg-purple-400 scale-110 shadow-sm shadow-purple-400'
                      : 'bg-[#1c1c28]'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mx-auto text-center space-y-6"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-500/10">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-2xl font-bold text-white">Memory Matrix Session Complete!</h4>
              <p className="text-sm text-slate-400 mt-1">Spatial working span telemetries calculated</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0d0d14] border border-[#1e1e2c]">
                <span className="text-xs text-slate-400 block mb-1">Max Span</span>
                <span className="text-2xl font-black text-purple-300">{highestSpan || sequence.length - 1}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">items remembered</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0d0d14] border border-[#1e1e2c]">
                <span className="text-xs text-slate-400 block mb-1">Total Score</span>
                <span className="text-2xl font-black text-indigo-300">{score}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">points</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0d0d14] border border-[#1e1e2c]">
                <span className="text-xs text-slate-400 block mb-1">Accuracy</span>
                <span className="text-2xl font-black text-emerald-300">
                  {totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 100}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">trial precision</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                id="replay-pattern-btn"
                onClick={startNewGame}
                className="px-6 py-2.5 rounded-xl bg-[#181824] hover:bg-[#222232] text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/[0.08]"
              >
                <RefreshCw className="w-4 h-4" />
                Train Again
              </button>
              <button
                id="done-pattern-btn"
                onClick={onExit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/25"
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
