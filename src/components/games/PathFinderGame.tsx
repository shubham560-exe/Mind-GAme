import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Navigation,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  ArrowRight,
  ShieldCheck,
  Sliders,
  Zap,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdaptiveState, GazeTelemetry, Language, PathObstacle, PathWaypoint } from '../../types';
import { sound } from '../../utils/audio';
import { TRANSLATIONS } from '../../utils/i18n';
import { processAdaptiveRound } from '../../utils/adaptiveEngine';

interface PathFinderGameProps {
  onGameComplete: (scoreData: {
    score: number;
    accuracy: number;
    reactionTimeMs: number;
    precisionScore: number;
    pathDeviationPx: number;
    tremorIndex: number;
    difficultyFactor: number;
    gazeStabilityPct: number;
  }) => void;
  onExit: () => void;
  language: Language;
  adaptiveState: AdaptiveState;
  onUpdateAdaptiveState: (state: AdaptiveState) => void;
  gazeTelemetry: GazeTelemetry;
}

export const PathFinderGame: React.FC<PathFinderGameProps> = ({
  onGameComplete,
  onExit,
  language,
  adaptiveState,
  onUpdateAdaptiveState,
  gazeTelemetry,
}) => {
  const t = TRANSLATIONS[language];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'idle' | 'tracing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [wallCollisions, setWallCollisions] = useState<number>(0);
  const [meanDeviation, setMeanDeviation] = useState<number>(0);
  const [tremorMetric, setTremorMetric] = useState<number>(0);
  const [elapsedTimeMs, setElapsedTimeMs] = useState<number>(0);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(sound.getMuted());
  const [adaptiveToast, setAdaptiveToast] = useState<string | null>(null);

  // Live trace state
  const isTracingRef = useRef<boolean>(false);
  const currentPosRef = useRef<{ x: number; y: number }>({ x: 40, y: 150 });
  const userPathRef = useRef<Array<{ x: number; y: number; time: number }>>([]);
  const startTimeRef = useRef<number>(0);
  const wallCollisionsRef = useRef<number>(0);
  const deviationsRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Dynamic Corridor Parameters
  const corridorWidth = adaptiveState.pathCorridorWidth || 48;
  const numObstacles = adaptiveState.pathObstacleCount || 0;

  // Waypoints defining the ideal path centerline
  const waypointsRef = useRef<PathWaypoint[]>([
    { x: 50, y: 180 },
    { x: 160, y: 80 },
    { x: 280, y: 240 },
    { x: 400, y: 90 },
    { x: 520, y: 230 },
    { x: 620, y: 150 },
  ]);

  const obstaclesRef = useRef<PathObstacle[]>([]);

  // Initialize obstacles based on difficulty
  const initObstacles = useCallback((count: number, w: number, h: number) => {
    const obs: PathObstacle[] = [];
    for (let i = 0; i < count; i++) {
      obs.push({
        x: 200 + i * 140,
        y: 120 + (i % 2 === 0 ? 40 : -40),
        radius: 14,
        vx: (Math.random() > 0.5 ? 1 : -1) * (1.2 + i * 0.4),
        vy: (Math.random() > 0.5 ? 1 : -1) * (1.5 + i * 0.3),
      });
    }
    obstaclesRef.current = obs;
  }, []);

  // Distance from point to line segment
  const distToSegment = (p: { x: number; y: number }, v: PathWaypoint, w: PathWaypoint) => {
    const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  };

  // Find minimum distance from user point to whole centerline
  const getMinDistanceToCenterline = (p: { x: number; y: number }) => {
    const wps = waypointsRef.current;
    let minDist = Infinity;
    for (let i = 0; i < wps.length - 1; i++) {
      const d = distToSegment(p, wps[i], wps[i + 1]);
      if (d < minDist) minDist = d;
    }
    return minDist;
  };

  // Start Maze Trace
  const handleStartMaze = () => {
    setGameState('tracing');
    setWallCollisions(0);
    wallCollisionsRef.current = 0;
    deviationsRef.current = [];
    userPathRef.current = [];
    isTracingRef.current = false;

    const startPt = waypointsRef.current[0];
    currentPosRef.current = { x: startPt.x, y: startPt.y };
    startTimeRef.current = performance.now();

    const canvas = canvasRef.current;
    if (canvas) {
      initObstacles(numObstacles, canvas.width, canvas.height);
    }
  };

  // Canvas interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'tracing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const startPt = waypointsRef.current[0];
    const distToStart = Math.hypot(x - startPt.x, y - startPt.y);

    // If tapped near start point
    if (distToStart < 35 || userPathRef.current.length === 0) {
      isTracingRef.current = true;
      currentPosRef.current = { x, y };
      userPathRef.current.push({ x, y, time: performance.now() });
      sound.playTap();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isTracingRef.current || gameState !== 'tracing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    currentPosRef.current = { x, y };
    const now = performance.now();
    userPathRef.current.push({ x, y, time: now });

    // Calculate real-time path deviation
    const deviation = getMinDistanceToCenterline({ x, y });
    deviationsRef.current.push(deviation);

    // Wall collision check (corridor boundary threshold)
    const halfCorridor = corridorWidth / 2;
    if (deviation > halfCorridor) {
      wallCollisionsRef.current += 1;
      setWallCollisions(wallCollisionsRef.current);
      sound.playWrong();
    }

    // Goal reached check
    const goalPt = waypointsRef.current[waypointsRef.current.length - 1];
    const distToGoal = Math.hypot(x - goalPt.x, y - goalPt.y);

    if (distToGoal < 30 && userPathRef.current.length > 25) {
      handleCompleteMaze();
    }
  };

  const handlePointerUp = () => {
    isTracingRef.current = false;
  };

  // Complete Maze and compute metrics
  const handleCompleteMaze = () => {
    isTracingRef.current = false;
    setGameState('gameover');
    sound.playVictory();

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0D9488', '#38BDF8', '#F97316'],
      });
    } catch {
      // Confetti fallback
    }

    const duration = Math.round(performance.now() - startTimeRef.current);
    setElapsedTimeMs(duration);

    // Compute Mean Deviation in Pixels
    const avgDev =
      deviationsRef.current.length > 0
        ? +(deviationsRef.current.reduce((a, b) => a + b, 0) / deviationsRef.current.length).toFixed(2)
        : 3.5;
    setMeanDeviation(avgDev);

    // Compute Neuromotor Tremor Metric (Jitter rate in acceleration)
    const path = userPathRef.current;
    let jitterSum = 0;
    for (let i = 2; i < path.length; i++) {
      const v1x = path[i - 1].x - path[i - 2].x;
      const v1y = path[i - 1].y - path[i - 2].y;
      const v2x = path[i].x - path[i - 1].x;
      const v2y = path[i].y - path[i - 1].y;
      const accel = Math.hypot(v2x - v1x, v2y - v1y);
      jitterSum += accel;
    }
    const computedTremor = path.length > 2 ? +(jitterSum / path.length).toFixed(2) : 1.2;
    setTremorMetric(computedTremor);

    // Precision score: 100 minus wall collisions and deviation penalties
    const collisionPenalty = wallCollisionsRef.current * 8;
    const deviationPenalty = Math.max(0, (avgDev - 2.0) * 6);
    const precisionScore = Math.max(45, Math.min(100, Math.round(100 - collisionPenalty - deviationPenalty)));
    const calculatedScore = Math.max(300, Math.round(precisionScore * 10 - duration * 0.04));
    setScore(calculatedScore);

    // Process with Adaptive AI Engine
    const { updatedState, adjustmentMade, message } = processAdaptiveRound(
      {
        gameId: 'path-finder',
        accuracy: precisionScore,
        latencyMs: Math.min(1500, Math.round(duration / 6)),
        precisionScore,
        pathDeviationPx: avgDev,
      },
      adaptiveState
    );

    if (adjustmentMade) {
      onUpdateAdaptiveState(updatedState);
      setAdaptiveToast(message);
      setTimeout(() => setAdaptiveToast(null), 4000);
    }

    onGameComplete({
      score: calculatedScore,
      accuracy: precisionScore,
      reactionTimeMs: Math.round(duration / 6),
      precisionScore,
      pathDeviationPx: avgDev,
      tremorIndex: computedTremor,
      difficultyFactor: adaptiveState.difficultyFactor,
      gazeStabilityPct: gazeTelemetry.stabilityScore,
    });
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const wps = waypointsRef.current;
      const halfW = corridorWidth / 2;

      // 1. Draw safe corridor background glow
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Corridor outer boundary (Walls)
      ctx.beginPath();
      ctx.moveTo(wps[0].x, wps[0].y);
      for (let i = 1; i < wps.length; i++) {
        ctx.lineTo(wps[i].x, wps[i].y);
      }
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = corridorWidth + 12;
      ctx.stroke();

      // Corridor inner track
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = corridorWidth;
      ctx.stroke();

      // Centerline guide (subtle dashed line)
      ctx.setLineDash([6, 8]);
      ctx.strokeStyle = 'rgba(13, 148, 136, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Draw Moving Obstacles (if active)
      obstaclesRef.current.forEach((obs) => {
        obs.x += obs.vx;
        obs.y += obs.vy;
        if (obs.x < 120 || obs.x > canvas.width - 120) obs.vx *= -1;
        if (obs.y < 70 || obs.y > canvas.height - 70) obs.vy *= -1;

        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. Draw User's drawn path
      const userPath = userPathRef.current;
      if (userPath.length > 1) {
        ctx.beginPath();
        ctx.moveTo(userPath[0].x, userPath[0].y);
        for (let i = 1; i < userPath.length; i++) {
          ctx.lineTo(userPath[i].x, userPath[i].y);
        }
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 4. Draw Start Anchor (Green)
      const startPt = wps[0];
      ctx.beginPath();
      ctx.arc(startPt.x, startPt.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('START', startPt.x, startPt.y);

      // 5. Draw Destination Goal Portal (Teal/Gold)
      const goalPt = wps[wps.length - 1];
      ctx.beginPath();
      ctx.arc(goalPt.x, goalPt.y, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#0D9488';
      ctx.shadowColor = '#0D9488';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('GOAL', goalPt.x, goalPt.y);

      // 6. Draw Active Probe Cursor
      if (isTracingRef.current) {
        const cur = currentPosRef.current;
        ctx.beginPath();
        ctx.arc(cur.x, cur.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#F97316';
        ctx.shadowColor = '#F97316';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [corridorWidth, gameState]);

  const toggleSound = () => {
    const isMuted = sound.toggleMute();
    setIsSoundMuted(isMuted);
  };

  return (
    <div
      id="path-finder-container"
      className="w-full max-w-4xl mx-auto bg-[#0d1322]/95 border border-cyan-500/25 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-cyan-500/20 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">{t.pathFinderTitle}</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Corridor: {corridorWidth}px
              </span>
            </div>
            <p className="text-xs text-slate-400">{t.pathFinderCat}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-white/[0.08] cursor-pointer"
            title={isSoundMuted ? t.soundOff : t.soundOn}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Exit button */}
          <button
            id="exit-path-finder-btn"
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
            className="my-3 p-3 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-xs text-cyan-200 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>
                <strong>Adaptive AI Engine:</strong> {adaptiveToast}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
              {adaptiveState.difficultyFactor}x
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game Area */}
      <div className="py-6 min-h-[420px] flex flex-col items-center justify-center relative z-10">
        {/* State 1: Idle Launcher */}
        {gameState === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg space-y-6">
            <div className="p-5 rounded-2xl bg-[#080d1a] border border-cyan-500/20 text-left space-y-3 shadow-inner">
              <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                {t.pathFinderCat} Protocol:
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">{t.pathFinderInstr}</p>
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                <span>🎯 Mean deviation tracking</span>
                <span>📈 Neuromotor tremor analysis</span>
              </div>
            </div>

            <button
              id="start-path-finder-btn"
              onClick={handleStartMaze}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-white" />
              {t.startTraining} (Corridor {corridorWidth}px)
            </button>
          </motion.div>
        )}

        {/* State 2: Active Tracing Canvas */}
        {gameState === 'tracing' && (
          <div className="w-full flex flex-col items-center space-y-4">
            {/* Live HUD */}
            <div className="w-full max-w-2xl flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#080d1a] border border-cyan-500/20 text-xs font-semibold">
              <div className="flex items-center gap-2 text-cyan-300">
                <Activity className="w-4 h-4" />
                <span>{t.traceCorridor}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-400">
                  Wall Collisions:{' '}
                  <strong className={wallCollisions > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    {wallCollisions}
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-bold">
                  {adaptiveState.difficultyFactor}x AI Level
                </span>
              </div>
            </div>

            {/* Interactive Canvas */}
            <div className="relative w-full max-w-2xl aspect-[670/320] bg-[#070b14] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl touch-none">
              <canvas
                ref={canvasRef}
                width={670}
                height={320}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="w-full h-full cursor-crosshair"
              />

              {/* Helper prompt banner */}
              <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/80 px-3 py-1 rounded-xl backdrop-blur-sm pointer-events-none">
                <span>1. Tap START (Green)</span>
                <span>2. Drag through corridor without hitting walls</span>
                <span>3. Reach GOAL (Teal)</span>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Game Over Modal */}
        {gameState === 'gameover' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-teal-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-cyan-500/30">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-2xl font-bold text-white">{t.sessionComplete}</h4>
              <p className="text-xs text-slate-400 mt-1">Visuospatial trajectory & motor tremor metrics calculated</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#080d1a] border border-cyan-500/20 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">{t.pathDeviation}</span>
                <span className="text-2xl font-black text-cyan-300">{meanDeviation}</span>
                <span className="text-[10px] text-slate-500 block">pixels</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#080d1a] border border-cyan-500/20 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">{t.precision}</span>
                <span className="text-2xl font-black text-emerald-400">{Math.round((score / 1000) * 100)}%</span>
                <span className="text-[10px] text-slate-500 block">score</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#080d1a] border border-cyan-500/20 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">Tremor Index</span>
                <span className="text-2xl font-black text-amber-400">{tremorMetric}</span>
                <span className="text-[10px] text-slate-500 block">px/accel</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="replay-path-btn"
                onClick={handleStartMaze}
                className="flex-1 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/[0.08]"
              >
                <RotateCcw className="w-4 h-4" />
                {t.trainAgain}
              </button>
              <button
                id="view-report-path-btn"
                onClick={onExit}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/25"
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
