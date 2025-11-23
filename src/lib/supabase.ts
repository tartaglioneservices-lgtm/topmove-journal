import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For server-side
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For client-side (React components)
export const createSupabaseClient = () => createClientComponentClient()

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_status: 'trial' | 'active' | 'inactive' | 'cancelled'
          subscription_end_date: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_status?: 'trial' | 'active' | 'inactive' | 'cancelled'
          subscription_end_date?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          subscription_status?: 'trial' | 'active' | 'inactive' | 'cancelled'
          subscription_end_date?: string | null
        }
      }
      trading_accounts: {
        Row: {
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
      }
      trades: {
        Row: {
          id: string
          account_id: string
          user_id: string
          internal_order_id: string
          exchange_order_id: string | null
          parent_order_id: string | null
          symbol: string
          contract: string
          order_type: 'Market' | 'Limit' | 'Stop' | 'Stop Limit'
          side: 'long' | 'short'
          quantity: number
          entry_price: number
          entry_time: string
          exit_price: number | null
          exit_time: string | null
          stop_loss: number | null
          take_profit: number | null
          pnl: number | null
          pnl_percent: number | null
          fees: number
          commission: number
          run_up: number | null
          drawdown: number | null
          max_adverse_excursion: number | null
          max_favorable_excursion: number | null
          status: 'open' | 'closed' | 'cancelled'
          exit_reason: 'stop_loss' | 'take_profit' | 'manual' | 'time_exit' | 'flatten' | null
          setup: string | null
          tags: string[] | null
          notes: string | null
          emotions: string[] | null
          mistakes: string[] | null
          lessons: string | null
          screenshots: string[] | null
          created_at: string
          updated_at: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          date: string
          pre_trade_checklist: any | null
          pre_trade_mindset: string | null
          market_conditions: string | null
          session_summary: string | null
          what_went_well: string | null
          what_to_improve: string | null
          key_learnings: string | null
          emotional_state_before: number | null
          emotional_state_after: number | null
          discipline_score: number | null
          total_trades: number
          winning_trades: number
          losing_trades: number
          daily_pnl: number
          created_at: string
          updated_at: string
        }
      }
      setups: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          rules: string[] | null
          win_rate: number | null
          profit_factor: number | null
          average_rr: number | null
          total_trades: number
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
