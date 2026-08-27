import { AdaptiveState, GameId } from '../types';

const ADAPTIVE_STORAGE_KEY = 'cognicure_adaptive_ai_state_v1';

export const INITIAL_ADAPTIVE_STATE: AdaptiveState = {
  difficultyFactor: 1.0,
  consecutiveSuccessRounds: 0,
  gridDimension: 3,
  stroopTimeLimitMs: 2200,
  stroopIncongruencyRatio: 0.6,
  pathCorridorWidth: 54,
  pathObstacleCount: 0,
  recentAccuracies: [88, 92, 85],
  recentLatencies: [620, 580, 540],
  aiRecommendations: [
    'Baseline cognitive calibration established. Prefrontal inhibition and working memory span are within expected clinical norms.',
  ],
  lastAdjustmentReason: 'Initial baseline calibration active',
  adaptationAuditLog: [
    {
      timestamp: Date.now() - 3600000,
      change: 'Difficulty set to baseline 1.0x',
      reason: 'Clinical calibration initial setup',
      newDifficulty: 1.0,
    },
  ],
};

export function getAdaptiveState(): AdaptiveState {
  try {
    const raw = localStorage.getItem(ADAPTIVE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADAPTIVE_STORAGE_KEY, JSON.stringify(INITIAL_ADAPTIVE_STATE));
      return INITIAL_ADAPTIVE_STATE;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ADAPTIVE_STATE;
  }
}

export function saveAdaptiveState(state: AdaptiveState): void {
  try {
    localStorage.setItem(ADAPTIVE_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save adaptive AI state', err);
  }
}

export interface RoundPerformance {
  gameId: GameId;
  accuracy: number; // 0 - 100%
  latencyMs: number;
  precisionScore?: number;
  errorRate?: number;
  pathDeviationPx?: number;
}

export function processAdaptiveRound(
  performance: RoundPerformance,
  currentState: AdaptiveState
): {
  updatedState: AdaptiveState;
  adjustmentMade: boolean;
  message: string;
} {
  const { accuracy, latencyMs, gameId } = performance;
  
  const recentAccuracies = [accuracy, ...currentState.recentAccuracies.slice(0, 5)];
  const recentLatencies = [latencyMs, ...currentState.recentLatencies.slice(0, 5)];

  const avgAcc = recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length;
  const avgRt = recentLatencies.reduce((a, b) => a + b, 0) / recentLatencies.length;

  let difficultyFactor = currentState.difficultyFactor;
  let consecutiveSuccess = currentState.consecutiveSuccessRounds;
  let adjustmentMade = false;
  let reason = '';
  let changeDescription = '';

  // Clinical Adaptive Rules:
  // 1. High Performance: accuracy > 85% and latency < 1200ms
  if (accuracy >= 85 && latencyMs < 1200) {
    consecutiveSuccess += 1;
    if (consecutiveSuccess >= 2 || (accuracy >= 95 && latencyMs < 800)) {
      difficultyFactor = Math.min(2.5, +(difficultyFactor + 0.15).toFixed(2));
      adjustmentMade = true;
      reason = `Accuracy ${accuracy}% & Latency ${latencyMs}ms exceeded threshold (High Cognitive Reserve)`;
      changeDescription = `Difficulty increased to ${difficultyFactor}x`;
      consecutiveSuccess = 0;
    }
  } 
  // 2. Cognitive Fatigue / Low Performance: accuracy < 65% or latency > 1800ms
  else if (accuracy < 65 || latencyMs > 1900) {
    consecutiveSuccess = 0;
    if (difficultyFactor > 0.8) {
      difficultyFactor = Math.max(0.75, +(difficultyFactor - 0.10).toFixed(2));
      adjustmentMade = true;
      reason = `Accuracy ${accuracy}% or Latency ${latencyMs}ms indicates fatigue/cognitive load`;
      changeDescription = `Difficulty moderated to ${difficultyFactor}x for stabilization`;
    }
  } else {
    consecutiveSuccess = Math.max(0, consecutiveSuccess - 1);
  }

  // Parameter Derivation based on Difficulty Factor
  let gridDimension = 3;
  if (difficultyFactor >= 1.7) {
    gridDimension = 5;
  } else if (difficultyFactor >= 1.3) {
    gridDimension = 4;
  } else {
    gridDimension = 3;
  }

  // Stroop pacing & incongruency ratio
  const stroopTimeLimitMs = Math.max(1100, Math.round(2400 / difficultyFactor));
  const stroopIncongruencyRatio = Math.min(0.85, Math.max(0.4, 0.5 + (difficultyFactor - 1.0) * 0.25));

  // Path Finder corridor width (narrower = harder) & obstacles
  const pathCorridorWidth = Math.max(30, Math.round(62 - (difficultyFactor - 1.0) * 18));
  const pathObstacleCount = difficultyFactor >= 1.6 ? Math.min(3, Math.floor((difficultyFactor - 1.2) * 2)) : 0;

  // Generate AI Clinical Insights
  const recommendations = [...currentState.aiRecommendations];
  if (adjustmentMade) {
    let newRec = '';
    if (difficultyFactor >= 1.8) {
      newRec = `Patient demonstrates advanced neural plasticity. Matrix grid scaled to ${gridDimension}x${gridDimension} with high-speed executive inhibition challenges.`;
    } else if (difficultyFactor > 1.2) {
      newRec = `Consistent synaptic firing and accurate spatial recall. Adaptive difficulty raised to ${difficultyFactor}x.`;
    } else {
      newRec = `Pacing adjusted for comfort and stabilization. Maintained baseline ${gridDimension}x${gridDimension} grid to rebuild working memory endurance.`;
    }
    recommendations.unshift(newRec);
    if (recommendations.length > 5) recommendations.pop();
  }

  const newAuditEntry = adjustmentMade
    ? {
        timestamp: Date.now(),
        change: changeDescription,
        reason,
        newDifficulty: difficultyFactor,
      }
    : null;

  const updatedAuditLog = newAuditEntry
    ? [newAuditEntry, ...currentState.adaptationAuditLog.slice(0, 9)]
    : currentState.adaptationAuditLog;

  const updatedState: AdaptiveState = {
    difficultyFactor,
    consecutiveSuccessRounds: consecutiveSuccess,
    gridDimension,
    stroopTimeLimitMs,
    stroopIncongruencyRatio,
    pathCorridorWidth,
    pathObstacleCount,
    recentAccuracies,
    recentLatencies,
    aiRecommendations: recommendations,
    lastAdjustmentReason: reason || currentState.lastAdjustmentReason,
    adaptationAuditLog: updatedAuditLog,
  };

  saveAdaptiveState(updatedState);

  return {
    updatedState,
    adjustmentMade,
    message: adjustmentMade ? `${changeDescription} — ${reason}` : 'Performance stable within calibrated parameters.',
  };
}
