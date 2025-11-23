-- ============================================
-- SUPABASE DATABASE SCHEMA
-- TopMove Trading Journal
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends auth.users)
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'inactive', 'cancelled')),
  subscription_end_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRADING ACCOUNTS
-- ============================================
CREATE TABLE public.trading_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  broker TEXT NOT NULL,
  account_number TEXT NOT NULL,
  initial_capital DECIMAL(15, 2) NOT NULL,
  current_capital DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, account_number)
);

-- ============================================
-- TRADES
-- ============================================
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Identification
  internal_order_id TEXT NOT NULL,
  exchange_order_id TEXT,
  parent_order_id TEXT,
  
  -- Instrument
  symbol TEXT NOT NULL,
  contract TEXT NOT NULL,
  
  -- Order details
  order_type TEXT NOT NULL CHECK (order_type IN ('Market', 'Limit', 'Stop', 'Stop Limit')),
  side TEXT NOT NULL CHECK (side IN ('long', 'short')),
  quantity DECIMAL(15, 4) NOT NULL,
  
  -- Execution
  entry_price DECIMAL(15, 4) NOT NULL,
  entry_time TIMESTAMPTZ NOT NULL,
  exit_price DECIMAL(15, 4),
  exit_time TIMESTAMPTZ,
  
  -- OCO Levels
  stop_loss DECIMAL(15, 4),
  take_profit DECIMAL(15, 4),
  
  -- Results
  pnl DECIMAL(15, 2),
  pnl_percent DECIMAL(10, 4),
  fees DECIMAL(10, 2) DEFAULT 0,
  commission DECIMAL(10, 2) DEFAULT 0,
  
  -- Metrics
  run_up DECIMAL(15, 4),
  drawdown DECIMAL(15, 4),
  max_adverse_excursion DECIMAL(15, 4),
  max_favorable_excursion DECIMAL(15, 4),
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  exit_reason TEXT CHECK (exit_reason IN ('stop_loss', 'take_profit', 'manual', 'time_exit', 'flatten')),
  
  -- User data
  setup TEXT,
  tags TEXT[],
  notes TEXT,
  emotions TEXT[],
  mistakes TEXT[],
  lessons TEXT,
  
  -- Screenshots
  screenshots TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(account_id, internal_order_id)
);

-- ============================================
-- JOURNAL ENTRIES
-- ============================================
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.trading_accounts(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  
  -- Pre-trade
  pre_trade_checklist JSONB,
  pre_trade_mindset TEXT,
  market_conditions TEXT,
  
  -- Post-trade
  session_summary TEXT,
  what_went_well TEXT,
  what_to_improve TEXT,
  key_learnings TEXT,
  
  -- Psychology
  emotional_state_before INT CHECK (emotional_state_before BETWEEN 1 AND 10),
  emotional_state_after INT CHECK (emotional_state_after BETWEEN 1 AND 10),
  discipline_score INT CHECK (discipline_score BETWEEN 1 AND 10),
  
  -- Metrics
  total_trades INT DEFAULT 0,
  winning_trades INT DEFAULT 0,
  losing_trades INT DEFAULT 0,
  daily_pnl DECIMAL(15, 2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- ============================================
-- SETUPS
-- ============================================
CREATE TABLE public.setups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT[],
  win_rate DECIMAL(5, 2),
  profit_factor DECIMAL(10, 2),
  average_rr DECIMAL(10, 2),
  total_trades INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

-- ============================================
-- CHECKLISTS
-- ============================================
CREATE TABLE public.checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pre_trade', 'post_trade', 'daily')),
  items JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAPITAL EVENTS
-- ============================================
CREATE TABLE public.capital_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount DECIMAL(15, 2) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- IMPORT HISTORY
-- ============================================
CREATE TABLE public.import_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  trades_imported INT NOT NULL,
  date_range_from TIMESTAMPTZ,
  date_range_to TIMESTAMPTZ,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'partial', 'failed')),
  errors TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_trading_accounts_user_id ON public.trading_accounts(user_id);
CREATE INDEX idx_trades_account_id ON public.trades(account_id);
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_entry_time ON public.trades(entry_time DESC);
CREATE INDEX idx_trades_status ON public.trades(status);
CREATE INDEX idx_trades_symbol ON public.trades(symbol);
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_journal_entries_date ON public.journal_entries(date DESC);
CREATE INDEX idx_capital_events_account_id ON public.capital_events(account_id);
CREATE INDEX idx_capital_events_date ON public.capital_events(date DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Trading accounts policies
CREATE POLICY "Users can view own accounts" ON public.trading_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own accounts" ON public.trading_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON public.trading_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON public.trading_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Trades policies
CREATE POLICY "Users can view own trades" ON public.trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trades" ON public.trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON public.trades
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades" ON public.trades
  FOR DELETE USING (auth.uid() = user_id);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries" ON public.journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journal entries" ON public.journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON public.journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON public.journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Setups policies
CREATE POLICY "Users can view own setups" ON public.setups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own setups" ON public.setups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own setups" ON public.setups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own setups" ON public.setups
  FOR DELETE USING (auth.uid() = user_id);

-- Checklists policies
CREATE POLICY "Users can view own checklists" ON public.checklists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checklists" ON public.checklists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklists" ON public.checklists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklists" ON public.checklists
  FOR DELETE USING (auth.uid() = user_id);

-- Capital events policies
CREATE POLICY "Users can view own capital events" ON public.capital_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own capital events" ON public.capital_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own capital events" ON public.capital_events
  FOR DELETE USING (auth.uid() = user_id);

-- Import history policies
CREATE POLICY "Users can view own import history" ON public.import_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own import history" ON public.import_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_accounts_updated_at BEFORE UPDATE ON public.trading_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_setups_updated_at BEFORE UPDATE ON public.setups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON public.checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, subscription_status, subscription_end_date)
  VALUES (
    NEW.id,
    NEW.email,
    'trial',
    NOW() + INTERVAL '14 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update account capital on capital event
CREATE OR REPLACE FUNCTION update_account_capital()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'deposit' THEN
    UPDATE public.trading_accounts
    SET current_capital = current_capital + NEW.amount
    WHERE id = NEW.account_id;
  ELSIF NEW.type = 'withdrawal' THEN
    UPDATE public.trading_accounts
    SET current_capital = current_capital - NEW.amount
    WHERE id = NEW.account_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_capital_event_created
  AFTER INSERT ON public.capital_events
  FOR EACH ROW EXECUTE FUNCTION update_account_capital();

-- Update setup statistics when trade is closed
CREATE OR REPLACE FUNCTION update_setup_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'closed' AND NEW.setup IS NOT NULL THEN
    UPDATE public.setups
    SET 
      total_trades = total_trades + 1,
      win_rate = (
        SELECT ROUND(
          (COUNT(*) FILTER (WHERE pnl > 0)::DECIMAL / COUNT(*)::DECIMAL) * 100,
          2
        )
        FROM public.trades
        WHERE setup = NEW.setup AND status = 'closed' AND user_id = NEW.user_id
      ),
      profit_factor = (
        SELECT ROUND(
          ABS(SUM(CASE WHEN pnl > 0 THEN pnl ELSE 0 END) / 
          NULLIF(SUM(CASE WHEN pnl < 0 THEN pnl ELSE 0 END), 0)),
          2
        )
        FROM public.trades
        WHERE setup = NEW.setup AND status = 'closed' AND user_id = NEW.user_id
      )
    WHERE name = NEW.setup AND user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_trade_closed_update_setup
  AFTER UPDATE ON public.trades
  FOR EACH ROW 
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'closed')
  EXECUTE FUNCTION update_setup_stats();
