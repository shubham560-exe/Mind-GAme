import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ClinicalDashboard } from './components/clinical/ClinicalDashboard';
import { ScientificSection } from './components/ScientificSection';
import { Footer } from './components/Footer';
import { WebcamTelemetry } from './components/telemetry/WebcamTelemetry';
import { SpatialRecallGame } from './components/games/SpatialRecallGame';
import { StroopChallengeGame } from './components/games/StroopChallengeGame';
import { PathFinderGame } from './components/games/PathFinderGame';
import {
  getStoredScores,
  computeCognitiveProfile,
  getStoredAchievements,
  saveGameScore,
  resetAllData,
} from './utils/storage';
import { getAdaptiveState, saveAdaptiveState } from './utils/adaptiveEngine';
import {
  Achievement,
  AdaptiveState,
  AppMode,
  CognitiveProfile,
  FontSizeSetting,
  GazeTelemetry,
  GameId,
  GameScoreEntry,
  Language,
} from './types';
import { sound } from './utils/audio';
import { TRANSLATIONS } from './utils/i18n';
import { AlertTriangle, Sparkles, X } from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('patient');
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [fontSize, setFontSize] = useState<FontSizeSetting>('normal');
  const [scores, setScores] = useState<GameScoreEntry[]>([]);
  const [profile, setProfile] = useState<CognitiveProfile>(() => computeCognitiveProfile([]));
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [adaptiveState, setAdaptiveState] = useState<AdaptiveState>(() => getAdaptiveState());
  const [focusDropAlert, setFocusDropAlert] = useState<boolean>(false);

  const [gazeTelemetry, setGazeTelemetry] = useState<GazeTelemetry>({
    isEnabled: true,
    isTracking: false,
    gazeState: 'optimal',
    stabilityScore: 96,
    totalDivergences: 0,
    lastDivergenceTime: null,
    history: [],
  });

  const gameArenaRef = useRef<HTMLDivElement | null>(null);
  const t = TRANSLATIONS[language];

  // Initialize data from storage
  useEffect(() => {
    const loadedScores = getStoredScores();
    setScores(loadedScores);
    setProfile(computeCognitiveProfile(loadedScores));
    setAchievements(getStoredAchievements());
    setAdaptiveState(getAdaptiveState());
  }, []);

  const handleSelectGame = (gameId: GameId) => {
    sound.playTap();
    setActiveGame(gameId);
    setTimeout(() => {
      gameArenaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleGameComplete = (newScore: Omit<GameScoreEntry, 'id' | 'timestamp'>) => {
    const saved = saveGameScore(newScore);
    const updatedScores = [saved, ...scores];
    setScores(updatedScores);
    setProfile(computeCognitiveProfile(updatedScores));
    setAchievements(getStoredAchievements());
  };

  const handleExitGame = () => {
    sound.playTap();
    setActiveGame(null);
  };

  const handleToggleMode = (newMode: AppMode) => {
    sound.playTap();
    setCurrentMode(newMode);
    setActiveGame(null);
  };

  const handleToggleGazeTelemetry = () => {
    sound.playTap();
    setGazeTelemetry((prev) => ({
      ...prev,
      isEnabled: !prev.isEnabled,
    }));
  };

  const handleUpdateTelemetry = (updated: Partial<GazeTelemetry>) => {
    setGazeTelemetry((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleAlertFocusDrop = () => {
    setFocusDropAlert(true);
    setTimeout(() => setFocusDropAlert(false), 3000);
  };

  // Font size class mapping
  const fontSizeClass =
    fontSize === 'xl' ? 'text-lg leading-relaxed' : fontSize === 'large' ? 'text-base' : 'text-sm';

  return (
    <div
      id="cognicure-root-app"
      className={`min-h-screen bg-[#070c18] text-slate-100 font-sans selection:bg-teal-500/30 selection:text-teal-200 antialiased ${fontSizeClass}`}
    >
      {/* Top Navigation */}
      <Navbar
        mode={currentMode}
        onToggleMode={handleToggleMode}
        language={language}
        onSelectLanguage={setLanguage}
        gazeTelemetry={gazeTelemetry}
        onToggleGazeTelemetry={handleToggleGazeTelemetry}
        fontSize={fontSize}
        onSelectFontSize={setFontSize}
        onNavigateHome={() => {
          setActiveGame(null);
          setCurrentMode('patient');
        }}
      />

      {/* Global Focus Loss Banner */}
      <AnimatePresence>
        {focusDropAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2.5 border border-amber-300 pointer-events-none"
          >
            <AlertTriangle className="w-5 h-5 fill-slate-950 text-amber-500" />
            <span>{t.gazeDiverted} — {t.focusAlert}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Arena */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Game Workspace when a test module is active */}
        {activeGame && (
          <div ref={gameArenaRef} id="active-game-workspace" className="py-2">
            {activeGame === 'spatial-recall' && (
              <SpatialRecallGame
                onGameComplete={(scoreData) =>
                  handleGameComplete({
                    gameId: 'spatial-recall',
                    gameName: t.spatialRecallTitle,
                    score: scoreData.score,
                    accuracy: scoreData.accuracy,
                    reactionTimeMs: scoreData.reactionTimeMs,
                    levelReached: scoreData.levelReached,
                    gridSize: scoreData.gridSize,
                    difficultyFactor: scoreData.difficultyFactor,
                    gazeStabilityPct: scoreData.gazeStabilityPct,
                  })
                }
                onExit={handleExitGame}
                language={language}
                adaptiveState={adaptiveState}
                onUpdateAdaptiveState={setAdaptiveState}
                gazeTelemetry={gazeTelemetry}
              />
            )}

            {activeGame === 'stroop' && (
              <StroopChallengeGame
                onGameComplete={(scoreData) =>
                  handleGameComplete({
                    gameId: 'stroop',
                    gameName: t.stroopTitle,
                    score: scoreData.score,
                    accuracy: scoreData.accuracy,
                    reactionTimeMs: scoreData.reactionTimeMs,
                    errorRate: scoreData.errorRate,
                    difficultyFactor: scoreData.difficultyFactor,
                    gazeStabilityPct: scoreData.gazeStabilityPct,
                    totalTrials: scoreData.totalTrials,
                    correctTrials: scoreData.correctTrials,
                  })
                }
                onExit={handleExitGame}
                language={language}
                adaptiveState={adaptiveState}
                onUpdateAdaptiveState={setAdaptiveState}
                gazeTelemetry={gazeTelemetry}
              />
            )}

            {activeGame === 'path-finder' && (
              <PathFinderGame
                onGameComplete={(scoreData) =>
                  handleGameComplete({
                    gameId: 'path-finder',
                    gameName: t.pathFinderTitle,
                    score: scoreData.score,
                    accuracy: scoreData.accuracy,
                    reactionTimeMs: scoreData.reactionTimeMs,
                    precisionScore: scoreData.precisionScore,
                    pathDeviationPx: scoreData.pathDeviationPx,
                    tremorIndex: scoreData.tremorIndex,
                    difficultyFactor: scoreData.difficultyFactor,
                    gazeStabilityPct: scoreData.gazeStabilityPct,
                  })
                }
                onExit={handleExitGame}
                language={language}
                adaptiveState={adaptiveState}
                onUpdateAdaptiveState={setAdaptiveState}
                gazeTelemetry={gazeTelemetry}
              />
            )}
          </div>
        )}

        {/* Home / Mode Views when no game is actively running */}
        {!activeGame && (
          <>
            {currentMode === 'patient' ? (
              <HeroSection
                profile={profile}
                adaptiveState={adaptiveState}
                onSelectGame={handleSelectGame}
                language={language}
              />
            ) : (
              <ClinicalDashboard
                profile={profile}
                scores={scores}
                adaptiveState={adaptiveState}
                language={language}
              />
            )}

            {/* Scientific Validation & Literature Basis */}
            <ScientificSection language={language} />
          </>
        )}
      </main>

      {/* Floating Webcam & Gaze Telemetry HUD */}
      <WebcamTelemetry
        telemetry={gazeTelemetry}
        onUpdateTelemetry={handleUpdateTelemetry}
        language={language}
        onAlertFocusDrop={handleAlertFocusDrop}
      />

      {/* Global Footer */}
      <Footer language={language} />
    </div>
  );
}
