import Link from 'next/link'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface Trade {
  id: string
  symbol: string
  side: 'long' | 'short'
  entry_price: number
  exit_price?: number
  pnl?: number
  entry_time: string
  status: 'open' | 'closed' | 'cancelled'
}

interface RecentTradesProps {
  trades: Trade[]
}

export function RecentTrades({ trades }: RecentTradesProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trades récents</CardTitle>
            <CardDescription>Vos dernières positions</CardDescription>
          </div>
          <Link href="/trades">
            <Button variant="ghost" size="sm">
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun trade pour le moment
            </p>
            <Link href="/import">
              <Button variant="outline" size="sm" className="mt-4">
                Importer des trades
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold',
                      trade.side === 'long'
                        ? 'bg-profit/10 text-profit'
                        : 'bg-loss/10 text-loss'
                    )}
                  >
                    {trade.side === 'long' ? 'L' : 'S'}
                  </div>
                  <div>
                    <p className="font-medium">{trade.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(trade.entry_time)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {trade.status === 'open' ? (
                    <div>
                      <p className="text-sm font-medium">En cours</p>
                      <p className="text-xs text-muted-foreground">
                        @ {trade.entry_price}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p
                        className={cn(
                          'text-sm font-medium',
                          trade.pnl && trade.pnl > 0
                            ? 'text-profit'
                            : 'text-loss'
                        )}
                      >
                        {trade.pnl ? formatCurrency(trade.pnl) : '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {trade.exit_price ? `@ ${trade.exit_price}` : '-'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
