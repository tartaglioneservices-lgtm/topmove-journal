// ============================================
// DATABASE TYPES
// ============================================

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_status: 'trial' | 'active' | 'inactive' | 'cancelled'
  subscription_end_date?: string
  created_at: string
  updated_at: string
}

export interface TradingAccount {
  id: string
  user_id: string
  name: string
  broker: string
  account_number: string
  initial_capital: number
  current_capital: number
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Trade {
  id: string
  account_id: string
  user_id: string
  
  // Identification
  internal_order_id: string
  exchange_order_id?: string
  parent_order_id?: string
  
  // Instrument
  symbol: string
  contract: string
  
  // Order details
  order_type: 'Market' | 'Limit' | 'Stop' | 'Stop Limit'
  side: 'long' | 'short'
  quantity: number
  
  // Execution
  entry_price: number
  entry_time: string
  exit_price?: number
  exit_time?: string
  
  // OCO Levels
  stop_loss?: number
  take_profit?: number
  
  // Results
  pnl?: number
  pnl_percent?: number
  fees: number
  commission: number
  
  // Metrics
  run_up?: number
  drawdown?: number
  max_adverse_excursion?: number
  max_favorable_excursion?: number
  
  // Status
  status: 'open' | 'closed' | 'cancelled'
  exit_reason?: 'stop_loss' | 'take_profit' | 'manual' | 'time_exit' | 'flatten'
  
  // User data
  setup?: string
  tags?: string[]
  notes?: string
  emotions?: string[]
  mistakes?: string[]
  lessons?: string
  
  // Screenshots
  screenshots?: string[]
  
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  account_id?: string
  date: string
  
  // Pre-trade
  pre_trade_checklist?: Record<string, boolean>
  pre_trade_mindset?: string
  market_conditions?: string
  
  // Post-trade
  session_summary?: string
  what_went_well?: string
  what_to_improve?: string
  key_learnings?: string
  
  // Psychology
  emotional_state_before?: number // 1-10
  emotional_state_after?: number // 1-10
  discipline_score?: number // 1-10
  
  // Metrics
  total_trades?: number
  winning_trades?: number
  losing_trades?: number
  daily_pnl?: number
  
  created_at: string
  updated_at: string
}

export interface Setup {
  id: string
  user_id: string
  name: string
  description?: string
  rules?: string[]
  win_rate?: number
  profit_factor?: number
  average_rr?: number
  total_trades?: number
  created_at: string
  updated_at: string
}

export interface Checklist {
  id: string
  user_id: string
  name: string
  type: 'pre_trade' | 'post_trade' | 'daily'
  items: ChecklistItem[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: string
  text: string
  required: boolean
  order: number
}

export interface CapitalEvent {
  id: string
  account_id: string
  user_id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  date: string
  notes?: string
  created_at: string
}

// ============================================
// PARSER TYPES
// ============================================

export interface SierraChartEvent {
  timestamp: string
  eventType: 'NEW' | 'FILLED' | 'REPLACE' | 'CANCEL' | 'UPDATE' | 'BALANCE'
  symbol?: string
  internalOrderId?: string
  exchangeOrderId?: string
  parentOrderId?: string
  orderType?: string
  side?: 'BUY' | 'SELL'
  quantity?: number
  price?: number
  stopPrice?: number
  limitPrice?: number
  filledQuantity?: number
  fillPrice?: number
  account?: string
  tag?: string
  text?: string
}

export interface ParsedTrade {
  internalOrderId: string
  exchangeOrderId?: string
  symbol: string
  side: 'long' | 'short'
  quantity: number
  entryPrice: number
  entryTime: string
  exitPrice?: number
  exitTime?: string
  stopLoss?: number
  takeProfit?: number
  fees: number
  pnl?: number
  status: 'open' | 'closed' | 'cancelled'
  exitReason?: 'stop_loss' | 'take_profit' | 'manual' | 'flatten'
  parentOrderId?: string
  childOrders?: {
    stopLoss?: string
    takeProfit?: string
  }
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface PerformanceMetrics {
  // Overview
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  
  // P&L
  totalPnL: number
  totalPnLPercent: number
  averageWin: number
  averageLoss: number
  largestWin: number
  largestLoss: number
  
  // Risk metrics
  profitFactor: number
  expectancy: number
  sharpeRatio?: number
  maxDrawdown: number
  maxDrawdownPercent: number
  
  // Consistency
  consecutiveWins: number
  consecutiveLosses: number
  averageRR: number
  
  // Time
  averageHoldTime?: string
  bestTradingDay?: string
  worstTradingDay?: string
}

export interface DailyMetrics {
  date: string
  trades: number
  winningTrades: number
  losingTrades: number
  pnl: number
  pnlPercent: number
  capital: number
}

export interface SetupMetrics {
  setup: string
  totalTrades: number
  winningTrades: number
  winRate: number
  totalPnL: number
  averageWin: number
  averageLoss: number
  profitFactor: number
}

// ============================================
// POSITION SIZING TYPES
// ============================================

export interface FuturesContract {
  symbol: string
  name: string
  exchange: string
  tickSize: number
  tickValue: number
  contractSize: number
  currency: string
  marginRequirement: number
  microContract?: {
    symbol: string
    contractSize: number
    marginRequirement: number
  }
}

export interface PositionSizeInput {
  accountBalance: number
  riskPercent: number
  entryPrice: number
  stopLoss: number
  contract: FuturesContract
}

export interface PositionSizeResult {
  riskAmount: number
  pointsRisked: number
  ticksRisked: number
  dollarRiskPerContract: number
  contracts: number
  microContracts?: number
  totalMargin: number
  leverageUsed: number
}

// ============================================
// UI TYPES
// ============================================

export interface FilterOptions {
  dateRange?: {
    from: string
    to: string
  }
  symbol?: string
  setup?: string
  side?: 'long' | 'short'
  status?: 'open' | 'closed' | 'cancelled'
  minPnL?: number
  maxPnL?: number
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface HeatmapDataPoint {
  date: string
  value: number
  trades: number
  color: string
}
