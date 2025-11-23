import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  decimals: number = 2
): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format date
 */
export function formatDate(
  date: string | Date,
  formatStr: string = 'dd MMM yyyy'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: fr })
}

/**
 * Format date relative (today, yesterday, etc.)
 */
export function formatDateRelative(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date

  if (isToday(dateObj)) return "Aujourd'hui"
  if (isYesterday(dateObj)) return 'Hier'

  const days = differenceInDays(new Date(), dateObj)
  if (days <= 7) return `Il y a ${days} jours`

  return formatDate(dateObj)
}

/**
 * Format time
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'HH:mm:ss')
}

/**
 * Format datetime
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: fr })
}

/**
 * Calculate win rate
 */
export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0
  return (wins / total) * 100
}

/**
 * Calculate profit factor
 */
export function calculateProfitFactor(
  grossProfit: number,
  grossLoss: number
): number {
  if (grossLoss === 0) return grossProfit > 0 ? 999 : 0
  return Math.abs(grossProfit / grossLoss)
}

/**
 * Calculate expectancy
 */
export function calculateExpectancy(
  winRate: number,
  avgWin: number,
  avgLoss: number
): number {
  return winRate * avgWin + (1 - winRate) * avgLoss
}

/**
 * Calculate R-multiple (Risk/Reward ratio achieved)
 */
export function calculateRMultiple(
  pnl: number,
  entryPrice: number,
  stopLoss: number,
  quantity: number,
  tickValue: number
): number {
  const riskPerContract = Math.abs(entryPrice - stopLoss) * tickValue
  const totalRisk = riskPerContract * quantity
  if (totalRisk === 0) return 0
  return pnl / totalRisk
}

/**
 * Get color based on P&L
 */
export function getPnLColor(pnl: number): string {
  if (pnl > 0) return 'text-profit'
  if (pnl < 0) return 'text-loss'
  return 'text-muted-foreground'
}

/**
 * Get background color based on P&L
 */
export function getPnLBgColor(pnl: number): string {
  if (pnl > 0) return 'bg-profit/10'
  if (pnl < 0) return 'bg-loss/10'
  return 'bg-muted/10'
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Delay function
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Download file
 */
export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Calculate statistics from trades
 */
export function calculateTradeStats(trades: any[]) {
  const closedTrades = trades.filter(t => t.status === 'closed')
  const winningTrades = closedTrades.filter(t => t.pnl && t.pnl > 0)
  const losingTrades = closedTrades.filter(t => t.pnl && t.pnl < 0)

  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const grossProfit = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const grossLoss = Math.abs(
    losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  )

  const avgWin =
    winningTrades.length > 0
      ? grossProfit / winningTrades.length
      : 0
  const avgLoss =
    losingTrades.length > 0
      ? grossLoss / losingTrades.length
      : 0

  const winRate = calculateWinRate(winningTrades.length, closedTrades.length)
  const profitFactor = calculateProfitFactor(grossProfit, grossLoss)
  const expectancy = calculateExpectancy(winRate / 100, avgWin, -avgLoss)

  return {
    totalTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    totalPnL,
    grossProfit,
    grossLoss,
    avgWin,
    avgLoss,
    profitFactor,
    expectancy,
    largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl || 0)) : 0,
    largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl || 0)) : 0,
  }
}

/**
 * Group trades by date
 */
export function groupTradesByDate(trades: any[]) {
  const grouped = new Map<string, any[]>()

  for (const trade of trades) {
    const date = formatDate(trade.entry_time, 'yyyy-MM-dd')
    if (!grouped.has(date)) {
      grouped.set(date, [])
    }
    grouped.get(date)!.push(trade)
  }

  return grouped
}

/**
 * Calculate equity curve
 */
export function calculateEquityCurve(trades: any[], initialCapital: number) {
  const closedTrades = trades
    .filter(t => t.status === 'closed' && t.entry_time)
    .sort((a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime())

  const curve = [{ date: 'Initial', equity: initialCapital }]
  let runningEquity = initialCapital

  for (const trade of closedTrades) {
    runningEquity += trade.pnl || 0
    curve.push({
      date: formatDate(trade.exit_time || trade.entry_time, 'dd/MM'),
      equity: runningEquity,
    })
  }

  return curve
}

/**
 * Calculate drawdown
 */
export function calculateDrawdown(equityCurve: number[]) {
  let maxEquity = equityCurve[0]
  let maxDrawdown = 0

  for (const equity of equityCurve) {
    if (equity > maxEquity) {
      maxEquity = equity
    }
    const drawdown = ((equity - maxEquity) / maxEquity) * 100
    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown
    }
  }

  return maxDrawdown
}
