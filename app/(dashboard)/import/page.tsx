'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { parseSierraChartFile } from '@/lib/sierra-parser'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'

export default function ImportPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()

  const [accounts, setAccounts] = useState<any[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [parsedTrades, setParsedTrades] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    const { data } = await supabase
      .from('trading_accounts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (data && data.length > 0) {
      setAccounts(data)
      setSelectedAccount(data[0].id)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleFileSelect = async (selectedFile: File) => {
    setError(null)
    setParsedTrades([])
    setSuccess(false)

    // Validate file
    if (!selectedFile.name.endsWith('.data')) {
      setError('Fichier invalide. Veuillez sélectionner un fichier .data de Sierra Chart')
      return
    }

    setFile(selectedFile)

    // Parse file
    try {
      setParsing(true)
      const trades = await parseSierraChartFile(selectedFile)
      
      if (trades.length === 0) {
        setError('Aucun trade trouvé dans ce fichier')
        return
      }

      setParsedTrades(trades)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du parsing du fichier')
    } finally {
      setParsing(false)
    }
  }

  const handleImport = async () => {
    if (!selectedAccount || parsedTrades.length === 0) return

    setImporting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // Prepare trades for insertion
      const tradesToInsert = parsedTrades.map(trade => ({
        account_id: selectedAccount,
        user_id: user.id,
        internal_order_id: trade.internalOrderId,
        exchange_order_id: trade.exchangeOrderId,
        parent_order_id: trade.parentOrderId,
        symbol: trade.symbol,
        contract: trade.symbol,
        order_type: 'Market',
        side: trade.side,
        quantity: trade.quantity,
        entry_price: trade.entryPrice,
        entry_time: trade.entryTime,
        exit_price: trade.exitPrice,
        exit_time: trade.exitTime,
        stop_loss: trade.stopLoss,
        take_profit: trade.takeProfit,
        fees: trade.fees,
        commission: 0,
        pnl: trade.pnl,
        pnl_percent: trade.pnl && trade.entryPrice 
          ? ((trade.pnl / (trade.entryPrice * trade.quantity)) * 100)
          : null,
        status: trade.status,
        exit_reason: trade.exitReason,
      }))

      // Insert trades (upsert to avoid duplicates)
      const { error: insertError } = await supabase
        .from('trades')
        .upsert(tradesToInsert, {
          onConflict: 'account_id,internal_order_id',
          ignoreDuplicates: false,
        })

      if (insertError) throw insertError

      // Log import history
      await supabase.from('import_history').insert({
        account_id: selectedAccount,
        user_id: user.id,
        filename: file?.name,
        trades_imported: parsedTrades.length,
        date_range_from: parsedTrades[0]?.entryTime,
        date_range_to: parsedTrades[parsedTrades.length - 1]?.entryTime,
        status: 'success',
      })

      setSuccess(true)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/trades')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'import')
    } finally {
      setImporting(false)
    }
  }

  const totalPnL = parsedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const closedTrades = parsedTrades.filter(t => t.status === 'closed')
  const openTrades = parsedTrades.filter(t => t.status === 'open')

  if (accounts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Aucun compte de trading</CardTitle>
            <CardDescription>
              Créez d'abord un compte de trading pour importer vos trades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/settings')} className="w-full">
              Créer un compte
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-profit/10">
              <CheckCircle2 className="h-8 w-8 text-profit" />
            </div>
            <CardTitle>Import réussi !</CardTitle>
            <CardDescription>
              {parsedTrades.length} trade{parsedTrades.length > 1 ? 's' : ''} importé{parsedTrades.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Redirection vers vos trades...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import de trades</h1>
        <p className="text-muted-foreground">
          Importez vos trades depuis Sierra Chart Trade Activity Log
        </p>
      </div>

      {/* Account Selection */}
      <Card>
        <CardHeader>
          <CardTitle>1. Sélectionnez le compte</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2"
            disabled={importing}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} - {account.broker} ({account.account_number})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>2. Importez votre fichier</CardTitle>
          <CardDescription>
            Fichier Trade Activity Log (.data) depuis Sierra Chart
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'relative rounded-lg border-2 border-dashed p-12 text-center transition-colors',
              dragActive && 'border-primary bg-primary/5',
              !dragActive && 'border-muted-foreground/25 hover:border-muted-foreground/50'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".data"
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={importing || parsing}
            />

            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {parsing ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <Upload className="h-8 w-8 text-primary" />
                )}
              </div>

              {file ? (
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">
                    Glissez-déposez votre fichier ici
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou cliquez pour sélectionner
                  </p>
                </div>
              )}

              {parsing && (
                <p className="text-sm text-primary">
                  Analyse du fichier en cours...
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {parsedTrades.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>3. Aperçu des trades</CardTitle>
              <CardDescription>
                {parsedTrades.length} trade{parsedTrades.length > 1 ? 's' : ''} détecté{parsedTrades.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total P&L</p>
                  <p className={cn(
                    'text-2xl font-bold',
                    totalPnL >= 0 ? 'text-profit' : 'text-loss'
                  )}>
                    {formatCurrency(totalPnL)}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Trades fermés</p>
                  <p className="text-2xl font-bold">{closedTrades.length}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Trades ouverts</p>
                  <p className="text-2xl font-bold">{openTrades.length}</p>
                </div>
              </div>

              {/* Trades List */}
              <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-lg border p-4">
                {parsedTrades.map((trade, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border bg-card p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded text-xs font-bold',
                          trade.side === 'long'
                            ? 'bg-profit/10 text-profit'
                            : 'bg-loss/10 text-loss'
                        )}
                      >
                        {trade.side === 'long' ? 'L' : 'S'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{trade.symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(trade.entryTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Entry</p>
                        <p className="text-sm font-medium">{trade.entryPrice}</p>
                      </div>
                      {trade.stopLoss && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">SL</p>
                          <p className="text-sm font-medium text-loss">{trade.stopLoss}</p>
                        </div>
                      )}
                      {trade.takeProfit && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">TP</p>
                          <p className="text-sm font-medium text-profit">{trade.takeProfit}</p>
                        </div>
                      )}
                      {trade.status === 'closed' && trade.pnl !== undefined && (
                        <div className="text-right min-w-[80px]">
                          <p className="text-xs text-muted-foreground">P&L</p>
                          <p className={cn(
                            'text-sm font-bold',
                            trade.pnl >= 0 ? 'text-profit' : 'text-loss'
                          )}>
                            {formatCurrency(trade.pnl)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Import Button */}
              <Button
                onClick={handleImport}
                disabled={importing || !selectedAccount}
                className="w-full"
                size="lg"
                loading={importing}
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Importer {parsedTrades.length} trade{parsedTrades.length > 1 ? 's' : ''}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
