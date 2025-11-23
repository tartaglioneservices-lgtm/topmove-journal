'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'
import { Search, Filter, Download } from 'lucide-react'
import Link from 'next/link'

export default function TradesPage() {
  const supabase = createSupabaseClient()
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadTrades()
  }, [])

  const loadTrades = async () => {
    try {
      const { data } = await supabase
        .from('trades')
        .select('*')
        .order('entry_time', { ascending: false })

      if (data) {
        setTrades(data)
      }
    } catch (error) {
      console.error('Error loading trades:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTrades = trades.filter(trade =>
    trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.setup?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Aucun trade</CardTitle>
            <CardDescription>
              Commencez par importer vos trades depuis Sierra Chart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/import">
              <Button className="w-full">Importer des trades</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trades</h1>
          <p className="text-muted-foreground">
            {trades.length} trade{trades.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par symbole ou setup..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Trades Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium">Symbole</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">Side</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">Entry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">Exit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">SL/TP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">P&L</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{trade.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                        trade.side === 'long' 
                          ? 'bg-profit/10 text-profit'
                          : 'bg-loss/10 text-loss'
                      )}>
                        {trade.side === 'long' ? 'Long' : 'Short'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{trade.entry_price}</td>
                    <td className="px-4 py-3 text-sm">
                      {trade.exit_price || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {trade.stop_loss && <div>SL: {trade.stop_loss}</div>}
                      {trade.take_profit && <div>TP: {trade.take_profit}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {trade.pnl !== null && (
                        <span className={cn(
                          'font-medium',
                          trade.pnl >= 0 ? 'text-profit' : 'text-loss'
                        )}>
                          {formatCurrency(trade.pnl)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDateTime(trade.entry_time)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                        trade.status === 'closed' && 'bg-muted text-muted-foreground',
                        trade.status === 'open' && 'bg-primary/10 text-primary'
                      )}>
                        {trade.status === 'closed' ? 'Fermé' : 'Ouvert'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
