export type GameId = 'spatial-recall' | 'stroop' | 'path-finder';
export type Language = 'en' | 'hi' | 'ta';
export type AppMode = 'patient' | 'clinical';
export type FontSizeSetting = 'normal' | 'large' | 'xl';

export interface GameMetadata {
  id: GameId;
  name: string;
  category: string;
  description: string;
  scientificBasis: string;
  durationEstimate: string;
  colorAccent: string;
  badge: string;
  skillsTrained: string[];
}

export interface GameScoreEntry {
  id: string;
  gameId: GameId;
  gameName: string;
  timestamp: number;
  score: number;
  accuracy: number; // 0 - 100%
  reactionTimeMs: number; // average reaction time in ms
  precisionScore?: number; // 0 - 100%
  errorRate?: number; // 0 - 100%
  pathDeviationPx?: number; // visuospatial deviation for path finder
  tremorIndex?: number; // motor coordination tremor metric
  difficultyFactor: number; // 1.0 - 2.5
  gazeStabilityPct?: number; // 0 - 100%
  gridSize?: number; // for spatial recall (3, 4, 5)
  levelReached?: number;
  totalTrials?: number;
  correctTrials?: number;
  metadata?: Record<string, unknown>;
}

export interface AdaptiveState {
  difficultyFactor: number; // base 1.0, scales with player performance
  consecutiveSuccessRounds: number;
  gridDimension: number; // 3, 4, 5
  stroopTimeLimitMs: number; // 2500ms -> 1200ms
  stroopIncongruencyRatio: number; // 0.5 -> 0.85
  pathCorridorWidth: number; // 60px -> 32px
  pathObstacleCount: number; // 0 -> 4
  recentAccuracies: number[];
  recentLatencies: number[];
  aiRecommendations: string[];
  lastAdjustmentReason: string;
  adaptationAuditLog: Array<{
    timestamp: number;
    change: string;
    reason: string;
    newDifficulty: number;
  }>;
}

export interface GazeTelemetry {
  isEnabled: boolean;
  isTracking: boolean;
  gazeState: 'optimal' | 'diverted' | 'lost';
  stabilityScore: number; // 0 - 100%
  totalDivergences: number;
  lastDivergenceTime: number | null;
  history: Array<{ timestamp: number; stability: number }>;
}

export interface MMSEProfile {
  totalScore: number; // out of 30
  maxScore: 30;
  orientationScore: number; // 10/10
  registrationScore: number; // 3/3
  attentionCalculationScore: number; // 5/5
  recallScore: number; // 3/3
  languageVisuospatialScore: number; // 9/9
  diagnosticCategory: 'Normal Cognition' | 'Mild Cognitive Impairment (MCI)' | 'Moderate/Severe Impairment';
  clinicalSummary: string;
  recommendations: string[];
}

export interface CognitiveProfile {
  overallScore: number; // 0 - 1000 Cognitive Index (CQ - CogniCure Quotient)
  avgReactionTime: number; // ms
  overallAccuracy: number; // %
  maxMemorySpan: number; // sequence length
  visuospatialPrecision: number; // %
  gazeFocusScore: number; // %
  totalGamesPlayed: number;
  lastTrained: number | null;
  workingMemoryScore: number; // 0-100
  executiveInhibitionScore: number; // 0-100
  visuospatialCoordinationScore: number; // 0-100
  consistencyScore: number; // 0-100
  mmseEstimate: MMSEProfile;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
  category: 'speed' | 'accuracy' | 'endurance' | 'mastery';
}

export interface StroopTrial {
  word: string;
  colorName: string; // The ink color
  colorHex: string;
  isCongruent: boolean;
}

export interface StroopResultTrial {
  trialIndex: number;
  word: string;
  inkColor: string;
  chosenColor: string;
  isCorrect: boolean;
  reactionTimeMs: number;
}

export interface PathWaypoint {
  x: number;
  y: number;
}

export interface PathObstacle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
}
