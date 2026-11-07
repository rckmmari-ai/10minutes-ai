/**
 * Core type definitions for First 10 Minutes Football Prediction Model
 * Strict rule: First 10 minutes corresponds exclusively to [00:00 - 09:59]
 */

export type MatchStatus = 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export type PredictionOutcome = 'GOAL' | '0-0';

export type ConfidenceLevel = 'VERY HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT DATA';

export type CompetitionId =
  | 'ucl'
  | 'uel'
  | 'uecl'
  | 'uyl'
  | 'afc_cl'
  | 'epl'
  | 'championship'
  | 'league_one'
  | 'league_two'
  | 'la_liga'
  | 'bundesliga'
  | 'serie_a'
  | 'ligue_1'
  | 'eredivisie'
  | 'domestic_cup'
  | 'other';

export interface GoalEvent {
  minute: number; // 0 to 120
  second?: number; // 0 to 59
  formattedTime: string; // e.g. "04:12" or "8'"
  team: 'home' | 'away';
  teamName: string;
  scorer: string;
  isOwnGoal: boolean;
  isFirst10Minutes: boolean; // minute < 10 (or 00:00 to 09:59)
}

export interface HistoricalMatch {
  id: string;
  date: string;
  competition: string;
  competitionType: 'target_comp' | 'domestic_league' | 'domestic_cup' | 'continental' | 'previous_season';
  homeTeam: string;
  awayTeam: string;
  isTeamHome: boolean; // Was the target team playing at home?
  opponent: string;
  fullTimeScore: string;
  verifiedEventData: boolean; // Rule D: verified timestamps present?
  goalEvents: GoalEvent[];
  first10mScored: boolean; // Rule C
  first10mConceded: boolean; // Rule C
  first10mBothScored: boolean; // Rule C
  first10m0_0: boolean; // Rule C
  first10mGoalsScored: number;
  first10mGoalsConceded: number;
  excludedByGoldenRule?: boolean; // Rule B (UCL exclusion)
}

export interface TeamHistoricalAnalysis {
  teamName: string;
  totalEligibleMatches: number; // typically 10
  verifiedMatchesCount: number; // must have verified events
  dataCoveragePercent: number;
  expansionHierarchyUsed: string[]; // e.g. ["Domestic League", "Domestic Cup"]
  scoringFrequency: number; // frequency team scored in first 10m [0-1]
  scoringPercent: number; // scoringFrequency * 100
  averageGoalsScored10m: number;
  concedingFrequency: number; // frequency team conceded in first 10m [0-1]
  concedingPercent: number; // concedingFrequency * 100
  averageGoalsConceded10m: number;
  bothScoredFrequency: number;
  cleanSheet10mFrequency: number; // neither team scored or didn't concede
  homeScoringFrequency: number;
  awayScoringFrequency: number;
  homeConcedingFrequency: number;
  awayConcedingFrequency: number;
  recencyWeightedLambdaAtt: number;
  recencyWeightedLambdaDef: number;
  matches: HistoricalMatch[];
}

export interface Fixture {
  id: string;
  date: string; // YYYY-MM-DD
  kickoffTime: string; // ISO 8601 UTC
  competition: string;
  competitionId: CompetitionId;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  status: MatchStatus;
  fullTimeResult?: {
    homeScore: number;
    awayScore: number;
  };
  actualFirst10mOutcome?: {
    outcome: PredictionOutcome;
    goals: GoalEvent[];
    verified: boolean;
  };
}

export type EitherWinOutcome = 'EITHER TEAM TO WIN' | 'DRAW RISK';

export interface EitherTeamWinAnalysis {
  probabilityHomeWin: number; // P(1)
  probabilityDraw: number; // P(X)
  probabilityAwayWin: number; // P(2)
  probabilityEitherWin: number; // P(1 or 2) = P(1) + P(2) = 1 - P(Draw)
  prediction: EitherWinOutcome;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  homeDecisiveMatches: number;
  awayDecisiveMatches: number;
  homeDrawCount: number;
  awayDrawCount: number;
  explanation: string;
}

export interface PredictionDetail {
  fixtureId: string;
  fixture: Fixture;
  homeTeam: string;
  awayTeam: string;
  homeAnalysis: TeamHistoricalAnalysis;
  awayAnalysis: TeamHistoricalAnalysis;
  probabilityGoal: number; // P(GOAL) in [0, 1]
  probabilityZeroZero: number; // P(0-0) in [0, 1] (P_GOAL + P_0-0 = 1.0)
  prediction: PredictionOutcome;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0 to 100
  goldenRuleApplied: boolean; // Rule B
  goldenRuleExplanation?: string;
  modelComponents: {
    homeExpectedGoals10m: number;
    awayExpectedGoals10m: number;
    homeAdvantageFactor: number;
    awayDiscountFactor: number;
    competitionAdjustmentFactor: number;
    recencyWeightHome: number;
    recencyWeightAway: number;
    priorProbabilityGoal: number;
  };
  sampleReliability: {
    homeSampleSize: number;
    awaySampleSize: number;
    totalVerifiedMatches: number;
    isReliable: boolean;
  };
  statisticalExplanation: string;
  lockedAt: string; // ISO timestamp when prediction was locked
  eitherTeamWin?: EitherTeamWinAnalysis; // Optional Model: Either team to win
}

export interface PerformanceStats {
  totalPredictions: number;
  evaluatedPredictions: number;
  pendingPredictions: number;
  overallAccuracy: number; // percentage
  goalAccuracy: number;
  zeroZeroAccuracy: number;
  brierScore: number; // 0 (perfect) to 1
  logLoss: number; // lower is better
  confusionMatrix: {
    truePositives: number; // Predicted GOAL, Actual GOAL
    falsePositives: number; // Predicted GOAL, Actual 0-0
    trueNegatives: number; // Predicted 0-0, Actual 0-0
    falseNegatives: number; // Predicted 0-0, Actual GOAL
  };
  accuracyByCompetition: Array<{
    competition: string;
    total: number;
    correct: number;
    accuracy: number;
  }>;
  accuracyByConfidence: Array<{
    confidence: ConfidenceLevel;
    total: number;
    correct: number;
    accuracy: number;
  }>;
  calibrationData: Array<{
    probRange: string;
    avgPredictedProb: number;
    actualGoalRate: number;
    count: number;
  }>;
  historyList: Array<{
    id: string;
    date: string;
    fixture: string;
    competition: string;
    prediction: PredictionOutcome;
    probabilityGoal: number;
    confidence: ConfidenceLevel;
    actualOutcome: PredictionOutcome;
    isCorrect: boolean;
    actualGoals10m: GoalEvent[];
  }>;
}

export interface VerificationTestResult {
  id: string;
  testNumber: number;
  name: string;
  description: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  assertionsPassed: number;
  totalAssertions: number;
  details: string;
  logs: string[];
}

export interface ModelVerificationReport {
  timestamp: string;
  allPassed: boolean;
  passedCount: number;
  failedCount: number;
  tests: VerificationTestResult[];
}

export interface AppSettings {
  championsLeagueGoldenRule: boolean;
  enableEitherTeamWinModel: boolean;
  eitherTeamWinThresholdPercent: number;
  apiProvider: 'api_football' | 'football_data_org' | 'sportmonks' | 'internal_verified';
  apiKeyConfigured: boolean;
  autoRefreshEnabled: boolean;
  autoRefreshIntervalMinutes: number;
  localTimezone: string;
  lastSyncedAt: string;
}
