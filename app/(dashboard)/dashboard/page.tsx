'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { StatCard } from '@/components/dashboard/stat-card'
import { RecentTrades } from '@/components/dashboard/recent-trades'
import { EquityCurve } from '@/components/charts/equity-curve'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Calendar,
  AlertCircle,
  Plus
} from 'lucide-react'
import { formatCurrency, formatPercent, calculateTradeStats } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardPage() {
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<any[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [trades, setTrades] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [equityData, setEquityData] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [selectedAccount])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load user accounts
      const { data: accountsData } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (accountsData && accountsData.length > 0) {
        setAccounts(accountsData)
        
        // Select first account if none selected
        if (!selectedAccount) {
          setSelectedAccount(accountsData[0].id)
        }
      }

      // Load trades for selected account
      if (selectedAccount || accountsData?.[0]?.id) {
        const accountId = selectedAccount || accountsData?.[0]?.id

        const { data: tradesData } = await supabase
          .from('trades')
          .select('*')
          .eq('account_id', accountId)
          .order('entry_time', { ascending: false })
          .limit(10)

        if (tradesData) {
          setTrades(tradesData)

          // Calculate statistics
          const statistics = calculateTradeStats(tradesData)
          setStats(statistics)

          // Generate equity curve
          const account = accountsData?.find(a => a.id === accountId) || accountsData?.[0]
          if (account) {
            const curve = generateEquityCurve(tradesData, account.initial_capital)
            setEquityData(curve)
          }
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateEquityCurve = (trades: any[], initialCapital: number) => {
    const closedTrades = trades
      .filter(t => t.status === 'closed' && t.exit_time)
      .sort((a, b) => new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime())

    const curve = [{ date: 'Début', equity: initialCapital }]
    let equity = initialCapital

    closedTrades.forEach((trade, index) => {
      equity += trade.pnl || 0
      if (index % 5 === 0 || index === closedTrades.length - 1) {
        curve.push({
          date: new Date(trade.exit_time).toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: 'short' 
          }),
          equity: equity,
        })
      }
    })

    return curve
  }

  // Check if user has any accounts
  const hasNoAccount = !loading && accounts.length === 0

  if (hasNoAccount) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-center">Bienvenue sur TopMove Trading !</CardTitle>
            <CardDescription className="text-center">
              Commencez par créer votre premier compte de trading
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/settings">
              <Button className="w-full" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Créer un compte
              </Button>
            </Link>
            <p className="text-center text-sm text-muted-foreground">
              Vous pourrez ensuite importer vos trades depuis Sierra Chart
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Calculate today's and this week's stats
  const today = new Date().toDateString()
  const todayTrades = trades.filter(t => 
    new Date(t.entry_time).toDateString() === today && t.status === 'closed'
  )
  const todayPnL = todayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const weekTrades = trades.filter(t => 
    new Date(t.entry_time) >= weekStart && t.status === 'closed'
  )
  const weekPnL = weekTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)

  const currentAccount = accounts.find(a => a.id === selectedAccount)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de vos performances
          </p>
        </div>
        {accounts.length > 1 && (
          <select
            value={selectedAccount || ''}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="rounded-lg border border-input bg-background px-4 py-2 text-sm"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Capital Total"
          value={formatCurrency(currentAccount?.current_capital || 0)}
          icon={DollarSign}
          description={`Initial: ${formatCurrency(currentAccount?.initial_capital || 0)}`}
        />
        <StatCard
          title="P&L Aujourd'hui"
          value={formatCurrency(todayPnL)}
          icon={todayPnL >= 0 ? TrendingUp : TrendingDown}
          trend={todayPnL >= 0 ? 'up' : 'down'}
          description={`${todayTrades.length} trade${todayTrades.length > 1 ? 's' : ''}`}
        />
        <StatCard
          title="P&L Cette Semaine"
          value={formatCurrency(weekPnL)}
          icon={weekPnL >= 0 ? TrendingUp : TrendingDown}
          trend={weekPnL >= 0 ? 'up' : 'down'}
          description={`${weekTrades.length} trade${weekTrades.length > 1 ? 's' : ''}`}
        />
        <StatCard
          title="Win Rate"
          value={stats ? `${stats.winRate.toFixed(1)}%` : '-'}
          icon={Target}
          description={`${stats?.winningTrades || 0}W / ${stats?.losingTrades || 0}L`}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Equity Curve */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Courbe d'équité</CardTitle>
            <CardDescription>
              Évolution de votre capital de trading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {equityData.length > 1 ? (
                <EquityCurve data={equityData} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Pas encore de données. Importez vos premiers trades pour voir votre courbe d'équité.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <RecentTrades trades={trades.slice(0, 5)} />

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques rapides</CardTitle>
            <CardDescription>Aperçu de vos performances globales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Trades</span>
              <span className="font-medium">{stats?.totalTrades || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profit Factor</span>
              <span className="font-medium">
                {stats?.profitFactor ? stats.profitFactor.toFixed(2) : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Moyenne Gain</span>
              <span className="font-medium text-profit">
                {stats?.avgWin ? formatCurrency(stats.avgWin) : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Moyenne Perte</span>
              <span className="font-medium text-loss">
                {stats?.avgLoss ? formatCurrency(Math.abs(stats.avgLoss)) : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Expectancy</span>
              <span className={`font-medium ${stats?.expectancy >= 0 ? 'text-profit' : 'text-loss'}`}>
                {stats?.expectancy ? formatCurrency(stats.expectancy) : '-'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/import">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <TrendingUp className="mr-2 h-5 w-5" />
                Importer des trades
              </Button>
            </Link>
            <Link href="/journal">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Calendar className="mr-2 h-5 w-5" />
                Écrire dans le journal
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Target className="mr-2 h-5 w-5" />
                Voir les analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
