-- Tempelan Query untuk inisiasi tabel di Supabase SQL Editor

CREATE TABLE bot_config (
  id INT PRIMARY KEY,
  status TEXT DEFAULT 'STOPPED',
  mode TEXT DEFAULT 'paper',
  trade_size_pct NUMERIC DEFAULT 10,
  max_positions INT DEFAULT 5,
  min_confidence INT DEFAULT 80,
  tp_pct NUMERIC DEFAULT 75,
  sl_pct NUMERIC DEFAULT -40,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default config
INSERT INTO bot_config (id, status, mode, trade_size_pct, max_positions, min_confidence, tp_pct, sl_pct)
VALUES (1, 'STOPPED', 'paper', 10, 5, 80, 75, -40);

CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id TEXT NOT NULL,
  question TEXT NOT NULL,
  action TEXT NOT NULL,
  side TEXT NOT NULL,
  entry_price NUMERIC NOT NULL,
  current_price NUMERIC,
  size_usdc NUMERIC NOT NULL,
  pnl NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'OPEN',
  mode TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE weather_cache (
  city_slug TEXT PRIMARY KEY,
  data_json JSONB NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
