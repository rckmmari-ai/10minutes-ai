-- ======================================================================
-- FIRST 10 MINUTES FOOTBALL PREDICTION MODEL - POSTGRESQL DATABASE SCHEMA
-- ======================================================================

-- 1. COMPETITIONS TABLE
CREATE TABLE IF NOT EXISTS competitions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    tier VARCHAR(50),
    is_continental BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_code VARCHAR(10),
    country VARCHAR(100),
    domestic_league_id VARCHAR(64) REFERENCES competitions(id),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. FIXTURES TABLE
CREATE TABLE IF NOT EXISTS fixtures (
    id VARCHAR(64) PRIMARY KEY,
    date DATE NOT NULL,
    kickoff_time TIMESTAMP WITH TIME ZONE NOT NULL,
    competition_id VARCHAR(64) REFERENCES competitions(id) NOT NULL,
    home_team_id VARCHAR(64) REFERENCES teams(id) NOT NULL,
    away_team_id VARCHAR(64) REFERENCES teams(id) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('SCHEDULED', 'TIMED', 'IN_PLAY', 'FINISHED', 'POSTPONED', 'CANCELLED')),
    home_score_fulltime INT,
    away_score_fulltime INT,
    first_10m_outcome VARCHAR(10) CHECK (first_10m_outcome IN ('GOAL', '0-0')),
    first_10m_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_fixtures_date ON fixtures(date);
CREATE INDEX IF NOT EXISTS idx_fixtures_teams ON fixtures(home_team_id, away_team_id);

-- 4. HISTORICAL MATCHES TABLE (RULE A, RULE B, RULE C, RULE D)
CREATE TABLE IF NOT EXISTS historical_matches (
    id VARCHAR(64) PRIMARY KEY,
    match_date DATE NOT NULL,
    competition_id VARCHAR(64) REFERENCES competitions(id) NOT NULL,
    competition_type VARCHAR(50) NOT NULL CHECK (competition_type IN ('target_comp', 'domestic_league', 'domestic_cup', 'continental', 'previous_season')),
    home_team_id VARCHAR(64) REFERENCES teams(id) NOT NULL,
    away_team_id VARCHAR(64) REFERENCES teams(id) NOT NULL,
    home_score INT NOT NULL,
    away_score INT NOT NULL,
    verified_events BOOLEAN NOT NULL DEFAULT TRUE, -- RULE D: Must have verified event timestamps
    first_10m_goals_home INT NOT NULL DEFAULT 0,
    first_10m_goals_away INT NOT NULL DEFAULT 0,
    first_10m_outcome VARCHAR(10) NOT NULL CHECK (first_10m_outcome IN ('GOAL', '0-0')), -- RULE C
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_historical_matches_date ON historical_matches(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_historical_matches_home ON historical_matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_historical_matches_away ON historical_matches(away_team_id);

-- 5. GOAL EVENTS TABLE (RULE C: 00:00 - 09:59 STRICT WINDOW)
CREATE TABLE IF NOT EXISTS goal_events (
    id SERIAL PRIMARY KEY,
    match_id VARCHAR(64) REFERENCES historical_matches(id) ON DELETE CASCADE,
    fixture_id VARCHAR(64) REFERENCES fixtures(id) ON DELETE CASCADE,
    minute INT NOT NULL CHECK (minute >= 0 AND minute <= 130),
    second INT CHECK (second >= 0 AND second <= 59),
    formatted_time VARCHAR(10) NOT NULL,
    team_id VARCHAR(64) REFERENCES teams(id) NOT NULL,
    scorer_name VARCHAR(255) NOT NULL,
    is_own_goal BOOLEAN DEFAULT FALSE,
    is_first_10_minutes BOOLEAN GENERATED ALWAYS AS (minute < 10 OR (minute = 10 AND second = 0)) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_goal_events_match ON goal_events(match_id);
CREATE INDEX IF NOT EXISTS idx_goal_events_first10 ON goal_events(is_first_10_minutes);

-- 6. PREDICTIONS TABLE (PRESERVES LOCK TIMESTAMP TO PREVENT HINDSIGHT BIAS)
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    fixture_id VARCHAR(64) REFERENCES fixtures(id) UNIQUE NOT NULL,
    probability_goal NUMERIC(6, 4) NOT NULL CHECK (probability_goal >= 0 AND probability_goal <= 1),
    probability_zero_zero NUMERIC(6, 4) NOT NULL CHECK (probability_zero_zero >= 0 AND probability_zero_zero <= 1),
    prediction VARCHAR(10) NOT NULL CHECK (prediction IN ('GOAL', '0-0')),
    confidence_level VARCHAR(20) NOT NULL CHECK (confidence_level IN ('VERY HIGH', 'HIGH', 'MODERATE', 'LOW', 'INSUFFICIENT DATA')),
    confidence_score NUMERIC(5, 2) NOT NULL,
    golden_rule_applied BOOLEAN DEFAULT FALSE, -- RULE B
    home_sample_size INT NOT NULL,
    away_sample_size INT NOT NULL,
    home_10m_scoring_rate NUMERIC(5, 4),
    home_10m_conceding_rate NUMERIC(5, 4),
    away_10m_scoring_rate NUMERIC(5, 4),
    away_10m_conceding_rate NUMERIC(5, 4),
    statistical_explanation TEXT,
    locked_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Permanent lock timestamp
    evaluated_at TIMESTAMP WITH TIME ZONE,
    actual_outcome VARCHAR(10) CHECK (actual_outcome IN ('GOAL', '0-0')),
    is_correct BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_predictions_fixture ON predictions(fixture_id);
CREATE INDEX IF NOT EXISTS idx_predictions_locked ON predictions(locked_at);

-- 7. MODEL EVALUATION & TRACKING TABLE
CREATE TABLE IF NOT EXISTS performance_metrics_history (
    id SERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    total_evaluated INT NOT NULL,
    overall_accuracy NUMERIC(5, 4) NOT NULL,
    goal_accuracy NUMERIC(5, 4) NOT NULL,
    zero_zero_accuracy NUMERIC(5, 4) NOT NULL,
    brier_score NUMERIC(6, 5) NOT NULL,
    log_loss NUMERIC(6, 5) NOT NULL,
    confusion_tp INT NOT NULL,
    confusion_fp INT NOT NULL,
    confusion_tn INT NOT NULL,
    confusion_fn INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
