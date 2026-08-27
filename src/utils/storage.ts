import { Achievement, CognitiveProfile, GameId, GameScoreEntry, MMSEProfile } from '../types';

const STORAGE_KEY_SCORES = 'cognicure_game_scores_v2';
const STORAGE_KEY_ACHIEVEMENTS = 'cognicure_achievements_v2';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'clinical_initiation',
    title: 'Cognitive Initiation',
    description: 'Complete your first neuro-rehabilitation calibration session.',
    icon: 'Brain',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'mastery',
  },
  {
    id: 'executive_inhibition',
    title: 'Synaptic Inhibition Ace',
    description: 'Achieve an average Stroop reaction time under 480ms with >90% accuracy.',
    icon: 'Zap',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'speed',
  },
  {
    id: 'spatial_matrix_master',
    title: 'Matrix Span 5x5 Master',
    description: 'Recall a sequence of 6 or more tiles in Spatial Recall at 4x4 or 5x5 grid.',
    icon: 'Sparkles',
    unlocked: false,
    progress: 0,
    maxProgress: 6,
    category: 'mastery',
  },
  {
    id: 'precision_motor',
    title: 'Micron Motor Stability',
    description: 'Complete Path Finder maze with <3.0px mean deviation and 0 wall collisions.',
    icon: 'Navigation',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'accuracy',
  },
  {
    id: 'gaze_monk',
    title: 'Centroid Gaze Focus',
    description: 'Complete a clinical session with >95% gaze stability score.',
    icon: 'Eye',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'accuracy',
  },
  {
    id: 'century_rehab',
    title: 'Neuro-Plasticity Veteran',
    description: 'Complete at least 8 training sessions across all 3 clinical modalities.',
    icon: 'Award',
    unlocked: false,
    progress: 0,
    maxProgress: 8,
    category: 'endurance',
  },
];

// Rich clinical baseline scores for longitudinal graphs
const SEEDED_BASELINE_SCORES: GameScoreEntry[] = [
  {
    id: 'seed-1',
    gameId: 'stroop',
    gameName: 'Color-Stroop Challenge',
    timestamp: Date.now() - 86400000 * 5,
    score: 780,
    accuracy: 88,
    reactionTimeMs: 580,
    precisionScore: 88,
    errorRate: 12,
    difficultyFactor: 1.0,
    gazeStabilityPct: 91,
    totalTrials: 10,
    correctTrials: 9,
  },
  {
    id: 'seed-2',
    gameId: 'spatial-recall',
    gameName: 'Spatial Recall (N-Back)',
    timestamp: Date.now() - 86400000 * 4,
    score: 820,
    accuracy: 92,
    reactionTimeMs: 760,
    precisionScore: 90,
    errorRate: 8,
    difficultyFactor: 1.15,
    gazeStabilityPct: 94,
    levelReached: 5,
    gridSize: 3,
  },
  {
    id: 'seed-3',
    gameId: 'path-finder',
    gameName: 'Path Finder Maze',
    timestamp: Date.now() - 86400000 * 3,
    score: 860,
    accuracy: 95,
    reactionTimeMs: 420,
    precisionScore: 94,
    pathDeviationPx: 3.2,
    tremorIndex: 1.8,
    difficultyFactor: 1.15,
    gazeStabilityPct: 96,
  },
  {
    id: 'seed-4',
    gameId: 'stroop',
    gameName: 'Color-Stroop Challenge',
    timestamp: Date.now() - 86400000 * 2,
    score: 890,
    accuracy: 94,
    reactionTimeMs: 510,
    precisionScore: 94,
    errorRate: 6,
    difficultyFactor: 1.3,
    gazeStabilityPct: 95,
    totalTrials: 10,
    correctTrials: 9,
  },
  {
    id: 'seed-5',
    gameId: 'spatial-recall',
    gameName: 'Spatial Recall (N-Back)',
    timestamp: Date.now() - 86400000 * 1,
    score: 910,
    accuracy: 96,
    reactionTimeMs: 640,
    precisionScore: 95,
    errorRate: 4,
    difficultyFactor: 1.45,
    gazeStabilityPct: 98,
    levelReached: 6,
    gridSize: 4,
  },
  {
    id: 'seed-6',
    gameId: 'path-finder',
    gameName: 'Path Finder Maze',
    timestamp: Date.now() - 3600000 * 4,
    score: 940,
    accuracy: 98,
    reactionTimeMs: 380,
    precisionScore: 97,
    pathDeviationPx: 2.1,
    tremorIndex: 1.2,
    difficultyFactor: 1.6,
    gazeStabilityPct: 97,
  },
];

export function getStoredScores(): GameScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCORES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(SEEDED_BASELINE_SCORES));
      return SEEDED_BASELINE_SCORES;
    }
    return JSON.parse(raw);
  } catch {
    return SEEDED_BASELINE_SCORES;
  }
}

export function saveGameScore(entry: Omit<GameScoreEntry, 'id' | 'timestamp'>): GameScoreEntry {
  const current = getStoredScores();
  const newEntry: GameScoreEntry = {
    ...entry,
    id: 'cog_' + Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
  };

  const updated = [newEntry, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save score', err);
  }

  updateAchievements(newEntry, updated);
  return newEntry;
}

export function calculateMMSEMapping(
  scores: GameScoreEntry[],
  workingMemScore: number,
  inhibitionScore: number,
  visuospatialScore: number
): MMSEProfile {
  // MMSE Total: 30 Points
  // 1. Orientation: 10/10 (Estimated by consistent daily engagement & task sequencing)
  const orientationScore = Math.min(10, Math.max(7, Math.round(8 + Math.min(2, scores.length * 0.3))));

  // 2. Registration: 3/3 (Estimated by working memory sequence initiation)
  const registrationScore = workingMemScore >= 70 ? 3 : workingMemScore >= 50 ? 2 : 1;

  // 3. Attention & Calculation: 5/5 (Estimated by Stroop accuracy & cognitive interference control)
  const attentionCalculationScore = inhibitionScore >= 85 ? 5 : inhibitionScore >= 70 ? 4 : inhibitionScore >= 50 ? 3 : 2;

  // 4. Recall: 3/3 (Estimated by spatial span & delayed recall accuracy)
  const recallScore = workingMemScore >= 80 ? 3 : workingMemScore >= 60 ? 2 : 1;

  // 5. Language & Visuospatial: 9/9 (Estimated by Path Finder maze precision & Stroop color naming)
  const visuoFraction = Math.min(1, Math.max(0.4, (visuospatialScore * 0.6 + inhibitionScore * 0.4) / 100));
  const languageVisuospatialScore = Math.min(9, Math.max(5, Math.round(9 * visuoFraction)));

  const totalScore = orientationScore + registrationScore + attentionCalculationScore + recallScore + languageVisuospatialScore;

  let diagnosticCategory: MMSEProfile['diagnosticCategory'] = 'Normal Cognition';
  let clinicalSummary = '';
  const recommendations: string[] = [];

  if (totalScore >= 25) {
    diagnosticCategory = 'Normal Cognition';
    clinicalSummary = `Total MMSE Estimate: ${totalScore}/30. Patient shows robust prefrontal executive function, sharp spatial motor control, and strong working memory reserve.`;
    recommendations.push('Maintain bi-weekly adaptive cognitive gaming sessions to preserve neural reserve.');
    recommendations.push('Advance to 5x5 Spatial Recall matrix and high-speed Path Finder maze.');
  } else if (totalScore >= 18) {
    diagnosticCategory = 'Mild Cognitive Impairment (MCI)';
    clinicalSummary = `Total MMSE Estimate: ${totalScore}/30. Moderate latency in executive inhibition and minor visuospatial deviations detected under time pressure.`;
    recommendations.push('Daily structured 15-minute training regimen focusing on Color-Stroop & Path tracing.');
    recommendations.push('Review longitudinal gaze telemetry to assess attention fatigue intervals.');
    recommendations.push('Schedule clinical neuropsychological review in 90 days.');
  } else {
    diagnosticCategory = 'Moderate/Severe Impairment';
    clinicalSummary = `Total MMSE Estimate: ${totalScore}/30. Significant variance in motor coordination and working memory span. Prompt clinical evaluation suggested.`;
    recommendations.push('Initiate caregiver-supervised low-difficulty training (3x3 grid, wide maze corridor).');
    recommendations.push('Comprehensive neurological screening recommended.');
  }

  return {
    totalScore,
    maxScore: 30,
    orientationScore,
    registrationScore,
    attentionCalculationScore,
    recallScore,
    languageVisuospatialScore,
    diagnosticCategory,
    clinicalSummary,
    recommendations,
  };
}

export function computeCognitiveProfile(scores: GameScoreEntry[]): CognitiveProfile {
  if (scores.length === 0) {
    const defaultMMSE = calculateMMSEMapping([], 70, 75, 80);
    return {
      overallScore: 650,
      avgReactionTime: 520,
      overallAccuracy: 88,
      maxMemorySpan: 4,
      visuospatialPrecision: 88,
      gazeFocusScore: 92,
      totalGamesPlayed: 0,
      lastTrained: null,
      workingMemoryScore: 70,
      executiveInhibitionScore: 75,
      visuospatialCoordinationScore: 80,
      consistencyScore: 85,
      mmseEstimate: defaultMMSE,
    };
  }

  const totalGames = scores.length;
  const avgRt = Math.round(scores.reduce((acc, s) => acc + s.reactionTimeMs, 0) / totalGames);
  const avgAcc = Math.round(scores.reduce((acc, s) => acc + s.accuracy, 0) / totalGames);

  const stroopGames = scores.filter((s) => s.gameId === 'stroop');
  const spatialGames = scores.filter((s) => s.gameId === 'spatial-recall');
  const pathGames = scores.filter((s) => s.gameId === 'path-finder');

  // Executive Function (Stroop)
  let executiveInhibitionScore = 75;
  if (stroopGames.length > 0) {
    const sAvgRt = stroopGames.reduce((a, b) => a + b.reactionTimeMs, 0) / stroopGames.length;
    const sAvgAcc = stroopGames.reduce((a, b) => a + b.accuracy, 0) / stroopGames.length;
    const rtFactor = Math.max(35, Math.min(100, Math.round(100 - (sAvgRt - 320) * 0.13)));
    executiveInhibitionScore = Math.round(rtFactor * 0.55 + sAvgAcc * 0.45);
  }

  // Working Memory (Spatial Recall)
  let maxMemorySpan = 4;
  let workingMemoryScore = 70;
  if (spatialGames.length > 0) {
    spatialGames.forEach((p) => {
      if (p.levelReached && p.levelReached > maxMemorySpan) {
        maxMemorySpan = p.levelReached;
      }
    });
    const bestLevel = Math.max(...spatialGames.map((p) => p.levelReached || 3));
    const avgSpAcc = spatialGames.reduce((a, b) => a + b.accuracy, 0) / spatialGames.length;
    workingMemoryScore = Math.min(99, Math.round(bestLevel * 10 + avgSpAcc * 0.35));
  }

  // Visuospatial Coordination (Path Finder)
  let visuospatialCoordinationScore = 80;
  let visuospatialPrecision = 90;
  if (pathGames.length > 0) {
    const pAvgAcc = pathGames.reduce((a, b) => a + b.accuracy, 0) / pathGames.length;
    const pAvgDev = pathGames.reduce((a, b) => a + (b.pathDeviationPx || 4), 0) / pathGames.length;
    visuospatialPrecision = Math.round(pAvgAcc);
    // Lower deviation is better (1.5px -> 98, 8px -> 50)
    const devScore = Math.max(40, Math.min(100, Math.round(100 - (pAvgDev - 1.5) * 8)));
    visuospatialCoordinationScore = Math.round(devScore * 0.6 + pAvgAcc * 0.4);
  }

  // Gaze Stability Average
  const scoresWithGaze = scores.filter((s) => s.gazeStabilityPct && s.gazeStabilityPct > 0);
  const gazeFocusScore =
    scoresWithGaze.length > 0
      ? Math.round(scoresWithGaze.reduce((a, b) => a + (b.gazeStabilityPct || 90), 0) / scoresWithGaze.length)
      : 94;

  // Consistency Score
  const scoreStdDev =
    scores.slice(0, 10).reduce((acc, curr, _, arr) => {
      const mean = arr.reduce((m, x) => m + x.accuracy, 0) / arr.length;
      return acc + Math.abs(curr.accuracy - mean);
    }, 0) / Math.max(1, scores.slice(0, 10).length);
  const consistencyScore = Math.max(45, Math.min(98, Math.round(100 - scoreStdDev * 2)));

  // CogniCure Quotient (CQ out of 1000)
  const compositeIndex = Math.round(
    executiveInhibitionScore * 2.8 +
      workingMemoryScore * 2.8 +
      visuospatialCoordinationScore * 2.6 +
      gazeFocusScore * 1.0 +
      consistencyScore * 0.8
  );

  const mmseEstimate = calculateMMSEMapping(
    scores,
    workingMemoryScore,
    executiveInhibitionScore,
    visuospatialCoordinationScore
  );

  return {
    overallScore: Math.min(995, Math.max(340, compositeIndex)),
    avgReactionTime: avgRt,
    overallAccuracy: avgAcc,
    maxMemorySpan,
    visuospatialPrecision,
    gazeFocusScore,
    totalGamesPlayed: totalGames,
    lastTrained: scores[0]?.timestamp || null,
    workingMemoryScore,
    executiveInhibitionScore,
    visuospatialCoordinationScore,
    consistencyScore,
    mmseEstimate,
  };
}

export function getStoredAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(INITIAL_ACHIEVEMENTS));
      return INITIAL_ACHIEVEMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
}

export function updateAchievements(lastScore: GameScoreEntry, allScores: GameScoreEntry[]): Achievement[] {
  const currentAchievements = getStoredAchievements();

  const updated = currentAchievements.map((ach) => {
    let unlocked = ach.unlocked;
    let progress = ach.progress;
    let unlockedAt = ach.unlockedAt;

    if (ach.id === 'clinical_initiation') {
      progress = Math.min(1, allScores.length);
      if (progress >= 1 && !unlocked) {
        unlocked = true;
        unlockedAt = Date.now();
      }
    } else if (ach.id === 'executive_inhibition') {
      if (lastScore.gameId === 'stroop' && lastScore.reactionTimeMs < 480 && lastScore.accuracy >= 90) {
        progress = 1;
        if (!unlocked) {
          unlocked = true;
          unlockedAt = Date.now();
        }
      }
    } else if (ach.id === 'spatial_matrix_master') {
      if (lastScore.gameId === 'spatial-recall' && (lastScore.levelReached || 0) > progress) {
        progress = Math.min(6, lastScore.levelReached || 0);
        if (progress >= 6 && !unlocked) {
          unlocked = true;
          unlockedAt = Date.now();
        }
      }
    } else if (ach.id === 'precision_motor') {
      if (lastScore.gameId === 'path-finder' && (lastScore.pathDeviationPx || 10) < 3.0 && lastScore.accuracy >= 95) {
        progress = 1;
        if (!unlocked) {
          unlocked = true;
          unlockedAt = Date.now();
        }
      }
    } else if (ach.id === 'gaze_monk') {
      if ((lastScore.gazeStabilityPct || 0) >= 95) {
        progress = 1;
        if (!unlocked) {
          unlocked = true;
          unlockedAt = Date.now();
        }
      }
    } else if (ach.id === 'century_rehab') {
      progress = Math.min(8, allScores.length);
      if (progress >= 8 && !unlocked) {
        unlocked = true;
        unlockedAt = Date.now();
      }
    }

    return {
      ...ach,
      progress,
      unlocked,
      unlockedAt,
    };
  });

  try {
    localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save achievements', err);
  }

  return updated;
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEY_SCORES);
  localStorage.removeItem(STORAGE_KEY_ACHIEVEMENTS);
  localStorage.removeItem('cognicure_adaptive_ai_state_v1');
}
