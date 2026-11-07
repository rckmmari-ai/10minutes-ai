/**
 * First 10 Minutes Football Prediction Model - Express Full-Stack Server
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { dbInstance } from './server/db.ts';
import { footballApi } from './server/footballApi.ts';
import {
  analyzeTeamHistoricalPerformance,
  calculateFirst10MinutesPrediction,
  calculateEitherTeamWinPrediction,
  runModelVerificationSuite,
} from './server/engine.ts';
import { PredictionDetail } from './src/types/football.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Get Fixtures
app.get('/api/fixtures', async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || '2026-11-04';
    const comp = (req.query.competition as string) || 'all';

    const fixtures = await footballApi.fetchFixturesForDate(date, comp);
    const settings = dbInstance.getSettings();

    // Attach locked prediction summary if already analyzed
    const fixturesWithSummary = fixtures.map((fix) => {
      const locked = dbInstance.getLockedPrediction(fix.id);
      if (locked && !locked.eitherTeamWin && locked.homeAnalysis && locked.awayAnalysis) {
        locked.eitherTeamWin = calculateEitherTeamWinPrediction(
          locked.homeAnalysis,
          locked.awayAnalysis,
          locked.fixture?.competitionId || fix.competitionId || 'epl',
          settings.eitherTeamWinThresholdPercent || 70
        );
        dbInstance.saveLockedPrediction(locked);
      }

      return {
        ...fix,
        hasPrediction: Boolean(locked),
        predictionSummary: locked
          ? {
              prediction: locked.prediction,
              probabilityGoal: locked.probabilityGoal,
              probabilityZeroZero: locked.probabilityZeroZero,
              confidence: locked.confidence,
              confidenceScore: locked.confidenceScore,
              goldenRuleApplied: locked.goldenRuleApplied,
              home10mScoringRate: locked.homeAnalysis.scoringPercent,
              home10mConcedingRate: locked.homeAnalysis.concedingPercent,
              away10mScoringRate: locked.awayAnalysis.scoringPercent,
              away10mConcedingRate: locked.awayAnalysis.concedingPercent,
              sampleSize: `${locked.sampleReliability.homeSampleSize}/${locked.sampleReliability.awaySampleSize}`,
              eitherTeamWin: locked.eitherTeamWin || null,
            }
          : null,
      };
    });

    res.json({
      success: true,
      date,
      count: fixturesWithSummary.length,
      fixtures: fixturesWithSummary,
    });
  } catch (error: any) {
    console.error('Error fetching fixtures:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get or Calculate Prediction for a Single Fixture
app.get('/api/prediction/:fixtureId', async (req: Request, res: Response) => {
  try {
    const { fixtureId } = req.params;
    let fixture = dbInstance.getFixtureById(fixtureId);

    if (!fixture) {
      // Try populating from live API or date catalog
      const dateStr = (req.query.date as string) || new Date().toISOString().slice(0, 10);
      await footballApi.fetchFixturesForDate(dateStr);
      fixture = dbInstance.getFixtureById(fixtureId);
    }

    if (!fixture) {
      return res.status(404).json({ success: false, error: 'Fixture not found' });
    }

    // Check if prediction is already locked
    const existing = dbInstance.getLockedPrediction(fixtureId);
    if (existing) {
      if (!existing.eitherTeamWin && existing.homeAnalysis && existing.awayAnalysis) {
        const settings = dbInstance.getSettings();
        existing.eitherTeamWin = calculateEitherTeamWinPrediction(
          existing.homeAnalysis,
          existing.awayAnalysis,
          existing.fixture?.competitionId || fixture.competitionId || 'epl',
          settings.eitherTeamWinThresholdPercent || 70
        );
        dbInstance.saveLockedPrediction(existing);
      }
      return res.json({ success: true, prediction: existing, isLocked: true });
    }

    // Otherwise calculate fresh
    const settings = dbInstance.getSettings();
    const isUcl =
      fixture.competitionId === 'ucl' || fixture.competition.toLowerCase().includes('champions league');

    const homeRawMatches = await footballApi.getOrFetchTeamHistory(
      fixture.homeTeam,
      isUcl,
      settings.championsLeagueGoldenRule
    );
    const awayRawMatches = await footballApi.getOrFetchTeamHistory(
      fixture.awayTeam,
      isUcl,
      settings.championsLeagueGoldenRule
    );

    const homeAnalysis = analyzeTeamHistoricalPerformance(
      fixture.homeTeam,
      homeRawMatches,
      isUcl,
      settings.championsLeagueGoldenRule
    );

    const awayAnalysis = analyzeTeamHistoricalPerformance(
      fixture.awayTeam,
      awayRawMatches,
      isUcl,
      settings.championsLeagueGoldenRule
    );

    const goldenRuleApplied = isUcl && settings.championsLeagueGoldenRule;

    const result = calculateFirst10MinutesPrediction(
      homeAnalysis,
      awayAnalysis,
      fixture.competitionId,
      isUcl,
      goldenRuleApplied
    );

    // Optional Model: Either team to win (Double Chance 12)
    const eitherTeamWin = calculateEitherTeamWinPrediction(
      homeAnalysis,
      awayAnalysis,
      fixture.competitionId,
      settings.eitherTeamWinThresholdPercent || 70
    );

    const predictionDetail: PredictionDetail = {
      fixtureId: fixture.id,
      fixture,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      homeAnalysis,
      awayAnalysis,
      probabilityGoal: result.probabilityGoal,
      probabilityZeroZero: result.probabilityZeroZero,
      prediction: result.prediction,
      confidence: result.confidence,
      confidenceScore: result.confidenceScore,
      goldenRuleApplied,
      goldenRuleExplanation: goldenRuleApplied
        ? 'Rule B: UEFA Champions League matches were excluded from the historical 10-match sample and substituted with domestic league and cup fixtures.'
        : undefined,
      modelComponents: result.modelComponents,
      sampleReliability: result.sampleReliability,
      statisticalExplanation: result.statisticalExplanation,
      lockedAt: new Date().toISOString(),
      eitherTeamWin,
    };

    // Save and lock prediction
    dbInstance.saveLockedPrediction(predictionDetail);

    res.json({ success: true, prediction: predictionDetail, isLocked: true });
  } catch (error: any) {
    console.error('Error generating prediction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Batch Generate Predictions for All Fixtures on Date
app.post('/api/predict-all', async (req: Request, res: Response) => {
  try {
    const date = req.body.date || '2026-11-04';
    const fixtures = await footballApi.fetchFixturesForDate(date);
    const settings = dbInstance.getSettings();

    const results: PredictionDetail[] = [];

    for (const fix of fixtures) {
      let locked = dbInstance.getLockedPrediction(fix.id);
      if (locked && !locked.eitherTeamWin && locked.homeAnalysis && locked.awayAnalysis) {
        locked.eitherTeamWin = calculateEitherTeamWinPrediction(
          locked.homeAnalysis,
          locked.awayAnalysis,
          locked.fixture?.competitionId || fix.competitionId || 'epl',
          settings.eitherTeamWinThresholdPercent || 70
        );
        dbInstance.saveLockedPrediction(locked);
      }
      if (!locked) {
        const isUcl = fix.competitionId === 'ucl' || fix.competition.toLowerCase().includes('champions league');
        const homeRaw = await footballApi.getOrFetchTeamHistory(
          fix.homeTeam,
          isUcl,
          settings.championsLeagueGoldenRule
        );
        const awayRaw = await footballApi.getOrFetchTeamHistory(
          fix.awayTeam,
          isUcl,
          settings.championsLeagueGoldenRule
        );

        const homeAnalysis = analyzeTeamHistoricalPerformance(
          fix.homeTeam,
          homeRaw,
          isUcl,
          settings.championsLeagueGoldenRule
        );
        const awayAnalysis = analyzeTeamHistoricalPerformance(
          fix.awayTeam,
          awayRaw,
          isUcl,
          settings.championsLeagueGoldenRule
        );

        const goldenRuleApplied = isUcl && settings.championsLeagueGoldenRule;
        const result = calculateFirst10MinutesPrediction(
          homeAnalysis,
          awayAnalysis,
          fix.competitionId,
          isUcl,
          goldenRuleApplied
        );

        // Optional Model: Either team to win
        const eitherTeamWin = calculateEitherTeamWinPrediction(
          homeAnalysis,
          awayAnalysis,
          fix.competitionId,
          settings.eitherTeamWinThresholdPercent || 70
        );

        locked = {
          fixtureId: fix.id,
          fixture: fix,
          homeTeam: fix.homeTeam,
          awayTeam: fix.awayTeam,
          homeAnalysis,
          awayAnalysis,
          probabilityGoal: result.probabilityGoal,
          probabilityZeroZero: result.probabilityZeroZero,
          prediction: result.prediction,
          confidence: result.confidence,
          confidenceScore: result.confidenceScore,
          goldenRuleApplied,
          goldenRuleExplanation: goldenRuleApplied
            ? 'Rule B: UEFA Champions League historical fixtures were excluded and replaced with domestic fixtures.'
            : undefined,
          modelComponents: result.modelComponents,
          sampleReliability: result.sampleReliability,
          statisticalExplanation: result.statisticalExplanation,
          lockedAt: new Date().toISOString(),
          eitherTeamWin,
        };

        dbInstance.saveLockedPrediction(locked);
      }
      results.push(locked);
    }

    res.json({ success: true, count: results.length, predictions: results });
  } catch (error: any) {
    console.error('Error in predict-all:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Performance Tracking Metrics (Rule 9)
app.get('/api/performance', (_req: Request, res: Response) => {
  try {
    const stats = dbInstance.getPerformanceStats();
    res.json({ success: true, stats });
  } catch (error: any) {
    console.error('Error in performance endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Run 8-Point Model Verification Suite (Rule 13)
app.get('/api/verify', (_req: Request, res: Response) => {
  try {
    const report = runModelVerificationSuite();
    res.json({ success: true, report });
  } catch (error: any) {
    console.error('Error in verification suite:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({ success: true, settings: dbInstance.getSettings() });
});

app.post('/api/settings', (req: Request, res: Response) => {
  try {
    const updated = dbInstance.updateSettings(req.body);
    if (req.body.apiKey) {
      footballApi.setApiKey(req.body.apiKey, req.body.apiProvider || 'api_football');
    }
    res.json({ success: true, settings: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Data Sync & Result Verification
app.post('/api/sync', async (_req: Request, res: Response) => {
  try {
    const settings = dbInstance.updateSettings({ lastSyncedAt: new Date().toISOString() });
    res.json({ success: true, message: 'Data synchronization completed successfully.', syncedAt: settings.lastSyncedAt });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// Dev & Static Serving Setup
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`First 10 Minutes Prediction Model server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
