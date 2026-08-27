import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gauge, Target, RefreshCw, ArrowRight, Trophy, Clock, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/audio';
import { GameScoreEntry } from '../../types';

interface NumberTapGameProps {
  onComplete: (score: Omit<GameScoreEntry, 'id' | 'timestamp'>) => void;
  onExit: () => void;
}

interface NumberTile {
  num: number;
  xPercent: number;
  yPercent: number;
  isTapped: boolean;
}

const DEFAULT_TARGET_COUNT = 10;

export const NumberTapGame: React.FC<NumberTapGameProps> = ({ onComplete, onExit }) => {
  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'playing' | 'summary'>('intro');
  const [countdown, setCountdown] = useState(3);
  const [maxNumbers, setMaxNumbers] = useState<number>(10);
  const [nextExpectedNum, setNextExpectedNum] = useState<number>(1);
  const [tiles, setTiles] = useState<NumberTile[]>([]);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [penaltyCount, setPenaltyCount] = useState<number>(0);
  const [errorFlash, setErrorFlash] = useState<boolean>(false);
  const [stepLatencies, setStepLatencies] = useState<number[]>([]);

  const timerRef = useRef<number | null>(null);
  const gameStartTimestampRef = useRef<number>(0);
  const lastTapTimestampRef = useRef<number>(0);

  // Generate randomized positions without excessive overlapping
  const generateTiles = useCallback((count: number): NumberTile[] => {
    const generated: NumberTile[] = [];
    const positions: { x: number; y: number }[] = [];

    // Grid cells to guarantee even dispersion with slight jitter
    const cols = count <= 10 ? 5 : 4;
    const rows = Math.ceil(count / cols);

    const cellWidth = 80 / cols;
    const cellHeight = 70 / rows;

    const indices = Array.from({ length: count }, (_, i) => i + 1);
    // Shuffle numbers so they aren't in neat spatial order
    const shuffledNums = [...indices].sort(() => Math.random() - 0.5);

    shuffledNums.forEach((num, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      // Random jitter inside cell
      const jitterX = (Math.random() - 0.5) * (cellWidth * 0.4);
      const jitterY = (Math.random() - 0.5) * (cellHeight * 0.4);

      const x = 10 + col * cellWidth + cellWidth / 2 + jitterX;
      const y = 15 + row * cellHeight + cellHeight / 2 + jitterY;

      generated.push({
        num,
        xPercent: Math.min(88, Math.max(12, x)),
        yPercent: Math.min(88, Math.max(14, y)),
        isTapped: false,
      });
    });

    return generated;
  }, []);

  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        sound.playTick();
        const t = setTimeout(() => setCountdown(countdown - 1), 800);
        return () => clearTimeout(t);
      } else {
        // Start playing
        setGameState('playing');
        setNextExpectedNum(1);
        setPenaltyCount(0);
        setStepLatencies([]);
        const newTiles = generateTiles(maxNumbers);
        setTiles(newTiles);

        gameStartTimestampRef.current = performance.now();
        lastTapTimestampRef.current = performance.now();

        // High precision timer loop
        timerRef.current = window.setInterval(() => {
          setElapsedMs(Math.round(performance.now() - gameStartTimestampRef.current));
        }, 16);
      }
    }
  }, [gameState, countdown, maxNumbers, generateTiles]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStart = (count: number = 10) => {
    sound.playTap();
    setMaxNumbers(count);
    setCountdown(3);
    setGameState('countdown');
  };

  const handleNumberTap = (tile: NumberTile) => {
    if (gameState !== 'playing' || tile.isTapped) return;

    if (tile.num === nextExpectedNum) {
      // Correct number tapped!
      sound.playCorrect();
      const now = performance.now();
      const latency = Math.round(now - lastTapTimestampRef.current);
      lastTapTimestampRef.current = now;
      setStepLatencies((prev) => [...prev, latency]);

      const updatedTiles = tiles.map((t) => (t.num === tile.num ? { ...t, isTapped: true } : t));
      setTiles(updatedTiles);

      if (nextExpectedNum === maxNumbers) {
        // Completed all numbers!
        if (timerRef.current) clearInterval(timerRef.current);
        const finalTime = Math.round(performance.now() - gameStartTimestampRef.current);
        setElapsedMs(finalTime);
        finishGame(finalTime, penaltyCount, [...stepLatencies, latency]);
      } else {
        setNextExpectedNum(nextExpectedNum + 1);
      }
    } else {
      // Incorrect number tapped!
      sound.playWrong();
      setPenaltyCount((prev) => prev + 1);
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 300);
    }
  };

  const finishGame = (totalMs: number, penalties: number, latencies: number[]) => {
    sound.playVictory();
    setGameState('summary');

    const totalTaps = maxNumbers + penalties;
    const accuracy = Math.round((maxNumbers / totalTaps) * 100);
    const avgStepRt = Math.round(totalMs / maxNumbers);

    // Score calculation (Fast completion + high accuracy)
    const targetBenchmark = maxNumbers * 400; // 400ms per number is benchmark
    const speedFactor = Math.max(100, Math.round(1000 - Math.max(0, totalMs - targetBenchmark) * 0.15));
    const finalScore = Math.min(1000, Math.max(100, Math.round(speedFactor * 0.7 + accuracy * 3)));

    if (accuracy >= 85 && totalMs < maxNumbers * 600) {
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#10b981'],
      });
    }

    onComplete({
      gameId: 'number-tap',
      gameName: 'Number Tap (Spatial Trail Speed)',
      score: finalScore,
      accuracy,
      reactionTimeMs: avgStepRt,
      totalTrials: maxNumbers,
      correctTrials: maxNumbers,
      metadata: {
        totalTimeFormatted: (totalMs / 1000).toFixed(2) + 's',
        penalties,
        mode: `${maxNumbers} Numbers`,
      },
    });
  };

  return (
    <div id="number-tap-game-container" className="w-full max-w-4xl mx-auto bg-[#101017]/95 border border-cyan-500/25 rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1e1e2c] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Number Tap (Trail Making)
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                Visual Search &amp; Processing
              </span>
            </h3>
            <p className="text-xs text-slate-400">Scan and tap numbers in sequential ascending order as quickly as possible</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="exit-number-tap-btn"
            onClick={onExit}
            className="px-3.5 py-1.5 rounded-lg bg-[#181824] hover:bg-[#222232] text-slate-300 text-xs font-medium transition-colors border border-white/[0.08] cursor-pointer"
          >
            Exit Game
          </button>
        </div>
      </div>

      {/* Main Game State Views */}
      <div className="py-6 relative z-10 min-h-[420px] flex flex-col justify-center items-center">
        {gameState === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-lg mx-auto space-y-6"
          >
            <div className="p-4 rounded-xl bg-[#0c0c14]/90 border border-cyan-500/20 text-left space-y-3">
              <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Trail Making Test (TMT-A) Mechanics:
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Adapted from neuropsychological diagnostic tests, this drill measures your <strong className="text-cyan-300">visual scanning speed, spatial orientation</strong>, and psychomotor processing. Numbers are scattered randomly across the field. Tap <span className="font-bold text-white">1 → 2 → 3 ...</span> consecutively.
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#1e1e2c]">
                <span>🎯 Instant visual feedback</span>
                <span>⏱️ Millisecond tracking</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                id="start-number-10-btn"
                onClick={() => handleStart(10)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Zap className="w-5 h-5" />
                Classic Mode (1 – 10)
              </button>
              <button
                id="start-number-16-btn"
                onClick={() => handleStart(16)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#181824] hover:bg-[#222232] text-cyan-300 font-bold text-base border border-cyan-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Trophy className="w-5 h-5 text-cyan-400" />
                Pro Mode (1 – 16)
              </button>
            </div>
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
            <div className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600">
              {countdown === 0 ? 'GO!' : countdown}
            </div>
            <p className="text-sm font-medium text-slate-400 mt-4 tracking-wider uppercase">
              Find and tap number 1 first!
            </p>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <div className="w-full max-w-2xl mx-auto space-y-4">
            {/* Live HUD Header */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0c0c12] border border-[#1e1e2c] text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Next Target:</span>
                <span className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 font-black text-base flex items-center justify-center shadow-md shadow-cyan-500/30 animate-pulse">
                  {nextExpectedNum}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-sm">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  {(elapsedMs / 1000).toFixed(2)}s
                </div>

                {penaltyCount > 0 && (
                  <div className="flex items-center gap-1 text-rose-400 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {penaltyCount} {penaltyCount === 1 ? 'Miss' : 'Misses'}
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Spatial Arena */}
            <div
              className={`relative w-full h-[360px] sm:h-[400px] rounded-2xl bg-[#08080d] border transition-colors shadow-2xl overflow-hidden ${
                errorFlash ? 'border-rose-500 bg-rose-950/20' : 'border-[#1e1e2c]'
              }`}
            >
              {/* Subtle Grid Pattern Overlay */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {tiles.map((tile) => {
                const isTarget = tile.num === nextExpectedNum;
                return (
                  <button
                    key={tile.num}
                    id={`number-tap-tile-${tile.num}`}
                    disabled={tile.isTapped}
                    onClick={() => handleNumberTap(tile)}
                    style={{
                      left: `${tile.xPercent}%`,
                      top: `${tile.yPercent}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center transition-all duration-150 cursor-pointer select-none shadow-lg ${
                      tile.isTapped
                        ? 'bg-[#151520]/40 border border-[#1e1e2c] text-slate-600 scale-90 opacity-40 cursor-default'
                        : isTarget
                        ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 border-2 border-white scale-110 shadow-xl shadow-cyan-500/50 ring-4 ring-cyan-400/30 animate-pulse z-20'
                        : 'bg-[#151522] hover:bg-[#1e1e2f] text-cyan-200 border border-white/[0.08] hover:border-cyan-400/50 hover:scale-105 active:scale-95 z-10'
                    }`}
                  >
                    {tile.isTapped ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      tile.num
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'summary' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mx-auto text-center space-y-6"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-2xl font-bold text-white">Trail Speed Assessment Complete!</h4>
              <p className="text-sm text-slate-400 mt-1">Spatial search &amp; visual motor coordinates recorded</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0d0d14] border border-[#1e1e2c]">
                <span className="text-xs text-slate-400 block mb-1">Total Time</span>
                <span className="text-2xl font-black text-cyan-300">{(elapsedMs / 1000).toFixed(2)}s</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">trail duration</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0d0d14] border border-[#1e1e2c]">
                <span className="text-xs text-slate-400 block mb-1">Avg Tap Latency</span>
                <span className="text-2xl font-black text-blue-300">{Math.round(elapsedMs / maxNumbers)} ms</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">per number</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0d0d14] border border-[#1e1e2c]">
                <span className="text-xs text-slate-400 block mb-1">Accuracy</span>
                <span className="text-2xl font-black text-emerald-300">
                  {Math.round((maxNumbers / (maxNumbers + penaltyCount)) * 100)}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{penaltyCount} mistakes</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                id="replay-number-tap-btn"
                onClick={() => handleStart(maxNumbers)}
                className="px-6 py-2.5 rounded-xl bg-[#181824] hover:bg-[#222232] text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/[0.08]"
              >
                <RefreshCw className="w-4 h-4" />
                Train Again
              </button>
              <button
                id="done-number-tap-btn"
                onClick={onExit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/25"
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
