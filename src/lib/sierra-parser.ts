import { ParsedTrade, SierraChartEvent } from '@/types'

interface OrderGroup {
  parent: SierraChartEvent | null
  stopLoss: SierraChartEvent | null
  takeProfit: SierraChartEvent | null
  fills: SierraChartEvent[]
  modifications: SierraChartEvent[]
}

/**
 * Parse Sierra Chart Trade Activity Log files
 * Handles OCO orders (Stop Loss + Take Profit) correctly
 */
export class SierraChartParser {
  private events: SierraChartEvent[] = []
  private orderGroups: Map<string, OrderGroup> = new Map()

  /**
   * Parse binary .data file from Sierra Chart
   */
  async parseFile(fileContent: ArrayBuffer): Promise<ParsedTrade[]> {
    this.events = this.extractEvents(fileContent)
    this.groupOrders()
    return this.buildTrades()
  }

  /**
   * Extract events from binary file
   */
  private extractEvents(buffer: ArrayBuffer): SierraChartEvent[] {
    const decoder = new TextDecoder('utf-8', { fatal: false })
    const text = decoder.decode(buffer)
    const events: SierraChartEvent[] = []

    // Split by lines and filter non-empty
    const lines = text.split('\n').filter(line => line.trim().length > 0)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Skip connection messages
      if (
        line.includes('Connected to server') ||
        line.includes('Disconnected') ||
        line.includes('Trade Locked') ||
        line.includes('Requested Open orders')
      ) {
        continue
      }

      // Parse different event types
      if (line.includes('User order entry')) {
        const event = this.parseOrderEntry(line, i)
        if (event) events.push(event)
      } else if (line.includes('Filled')) {
        const event = this.parseFill(line, i)
        if (event) events.push(event)
      } else if (line.includes('Cancel/Replace complete')) {
        const event = this.parseReplace(line, i)
        if (event) events.push(event)
      } else if (line.includes('Order update')) {
        const event = this.parseOrderUpdate(line, i)
        if (event) events.push(event)
      } else if (line.includes('(New)')) {
        const event = this.parseNew(line, i)
        if (event) events.push(event)
      } else if (line.includes('Cash Balance update | Trade Fee')) {
        const event = this.parseFee(line, i)
        if (event) events.push(event)
      }
    }

    return events
  }

  private parseOrderEntry(line: string, index: number): SierraChartEvent | null {
    try {
      const event: SierraChartEvent = {
        timestamp: this.extractTimestamp(line),
        eventType: 'NEW',
      }

      // Extract symbol
      const symbolMatch = line.match(/([A-Z0-9]+_FUT_[A-Z]+)/)
      if (symbolMatch) event.symbol = symbolMatch[1]

      // Extract order type
      if (line.includes('Market')) event.orderType = 'Market'
      else if (line.includes('Limit')) event.orderType = 'Limit'
      else if (line.includes('Stop Limit')) event.orderType = 'Stop Limit'
      else if (line.includes('Stop')) event.orderType = 'Stop'

      // Detect if it's an attached order (SL/TP)
      if (line.includes('Attached Order')) {
        const parentMatch = line.match(/Parent[:\s]+(\d+)/)
        if (parentMatch) event.parentOrderId = parentMatch[1]
      }

      // Extract price
      const priceMatch = line.match(/Last:\s+([\d.]+)/)
      if (priceMatch) event.price = parseFloat(priceMatch[1])

      // Extract tag
      const tagMatch = line.match(/Tag:\s+([^\s|]+)/)
      if (tagMatch) event.tag = tagMatch[1]

      return event
    } catch (error) {
      console.error('Error parsing order entry:', error)
      return null
    }
  }

  private parseFill(line: string, index: number): SierraChartEvent | null {
    try {
      const event: SierraChartEvent = {
        timestamp: this.extractTimestamp(line),
        eventType: 'FILLED',
      }

      // Extract symbol
      const symbolMatch = line.match(/([A-Z0-9]+_FUT_[A-Z]+)/)
      if (symbolMatch) event.symbol = symbolMatch[1]

      // Extract internal order ID
      const internalIdMatch = line.match(/InternalOrderID:\s+(\d+)/)
      if (internalIdMatch) event.internalOrderId = internalIdMatch[1]

      // Extract exchange order ID from trade ID
      const tradeIdMatch = line.match(/(\d{13})_\d{4}-\d{2}-\d{2}_\d+_\d+/)
      if (tradeIdMatch) event.exchangeOrderId = tradeIdMatch[1]

      // Extract fill price and quantity from binary data
      // This is simplified - in production you'd parse the binary protocol properly
      const priceMatches = line.match(/([\d.]+)@/)
      if (priceMatches && priceMatches.length > 0) {
        event.fillPrice = parseFloat(priceMatches[priceMatches.length - 1])
      }

      // Extract quantity (usually 1 for micro contracts)
      const qtyMatch = line.match(/Qty:\s+([\d.]+)/)
      if (qtyMatch) {
        event.filledQuantity = parseFloat(qtyMatch[1])
      } else {
        event.filledQuantity = 1 // Default for most futures
      }

      // Detect side from position change
      if (line.includes('Position Quantity to -')) event.side = 'SELL'
      else if (line.includes('Position Quantity to 1')) event.side = 'BUY'

      return event
    } catch (error) {
      console.error('Error parsing fill:', error)
      return null
    }
  }

  private parseReplace(line: string, index: number): SierraChartEvent | null {
    try {
      const event: SierraChartEvent = {
        timestamp: this.extractTimestamp(line),
        eventType: 'REPLACE',
      }

      // Extract symbol
      const symbolMatch = line.match(/([A-Z0-9]+_FUT_[A-Z]+)/)
      if (symbolMatch) event.symbol = symbolMatch[1]

      // Extract order type
      if (line.includes('Stop Limit')) event.orderType = 'Stop Limit'
      else if (line.includes('Limit')) event.orderType = 'Limit'
      else if (line.includes('Stop')) event.orderType = 'Stop'

      // This indicates a modification of SL/TP
      const parentMatch = line.match(/Parent[:\s]+(\d+)/)
      if (parentMatch) event.parentOrderId = parentMatch[1]

      return event
    } catch (error) {
      console.error('Error parsing replace:', error)
      return null
    }
  }

  private parseOrderUpdate(line: string, index: number): SierraChartEvent | null {
    try {
      const event: SierraChartEvent = {
        timestamp: this.extractTimestamp(line),
        eventType: 'UPDATE',
      }

      // Extract internal order ID
      const internalIdMatch = line.match(/(\d{5,8})\./)
      if (internalIdMatch) event.internalOrderId = internalIdMatch[1]

      // Extract parent order ID if it's an attached order
      const parentMatch = line.match(/Parent[:\s]+(\d+)/)
      if (parentMatch) event.parentOrderId = parentMatch[1]

      return event
    } catch (error) {
      return null
    }
  }

  private parseNew(line: string, index: number): SierraChartEvent | null {
    try {
      const event: SierraChartEvent = {
        timestamp: this.extractTimestamp(line),
        eventType: 'NEW',
      }

      // Extract exchange order ID
      const exchangeIdMatch = line.match(/(\d{13})/)
      if (exchangeIdMatch) event.exchangeOrderId = exchangeIdMatch[1]

      // Extract internal order ID
      const internalIdMatch = line.match(/(\d{5,8})\./)
      if (internalIdMatch) event.internalOrderId = internalIdMatch[1]

      return event
    } catch (error) {
      return null
    }
  }

  private parseFee(line: string, index: number): SierraChartEvent | null {
    try {
      const feeMatch = line.match(/Trade Fee:\s+([\d.]+)/)
      if (!feeMatch) return null

      return {
        timestamp: this.extractTimestamp(line),
        eventType: 'UPDATE',
        price: parseFloat(feeMatch[1]), // Store fee in price field temporarily
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Extract timestamp from line (simplified - adjust based on actual format)
   */
  private extractTimestamp(line: string): string {
    // Try to extract date from trade ID format: YYYY-MM-DD
    const dateMatch = line.match(/(\d{4}-\d{2}-\d{2})/)
    if (dateMatch) {
      // Try to extract time if available
      const timeMatch = line.match(/(\d{2}:\d{2}:\d{2})/)
      if (timeMatch) {
        return `${dateMatch[1]}T${timeMatch[1]}Z`
      }
      return `${dateMatch[1]}T00:00:00Z`
    }
    return new Date().toISOString()
  }

  /**
   * Group orders by parent/child relationships
   */
  private groupOrders(): void {
    const parentOrders = this.events.filter(
      e => e.eventType === 'NEW' && !e.parentOrderId
    )

    for (const parent of parentOrders) {
      if (!parent.internalOrderId) continue

      const group: OrderGroup = {
        parent,
        stopLoss: null,
        takeProfit: null,
        fills: [],
        modifications: [],
      }

      // Find child orders (SL and TP)
      const children = this.events.filter(
        e => e.parentOrderId === parent.internalOrderId
      )

      for (const child of children) {
        if (child.orderType === 'Stop' || child.orderType === 'Stop Limit') {
          if (!group.stopLoss) group.stopLoss = child
        } else if (child.orderType === 'Limit') {
          if (!group.takeProfit) group.takeProfit = child
        }
      }

      // Find fills for this order
      group.fills = this.events.filter(
        e =>
          e.eventType === 'FILLED' &&
          (e.internalOrderId === parent.internalOrderId ||
            e.exchangeOrderId === parent.exchangeOrderId)
      )

      // Find modifications
      group.modifications = this.events.filter(
        e =>
          e.eventType === 'REPLACE' &&
          e.parentOrderId === parent.internalOrderId
      )

      if (parent.internalOrderId) {
        this.orderGroups.set(parent.internalOrderId, group)
      }
    }
  }

  /**
   * Build final trades from order groups
   */
  private buildTrades(): ParsedTrade[] {
    const trades: ParsedTrade[] = []

    for (const [orderId, group] of this.orderGroups) {
      if (!group.parent || group.fills.length === 0) continue

      const entryFill = group.fills[0]
      const exitFill = group.fills.length > 1 ? group.fills[1] : null

      // Determine side
      let side: 'long' | 'short' = 'long'
      if (entryFill.side === 'SELL' || (group.parent.price && entryFill.fillPrice && group.parent.price > entryFill.fillPrice)) {
        side = 'short'
      }

      // Extract stop loss and take profit levels
      let stopLoss: number | undefined
      let takeProfit: number | undefined

      if (group.stopLoss && group.stopLoss.price) {
        stopLoss = group.stopLoss.price
      }
      if (group.takeProfit && group.takeProfit.price) {
        takeProfit = group.takeProfit.price
      }

      // Calculate P&L if trade is closed
      let pnl: number | undefined
      let exitReason: 'stop_loss' | 'take_profit' | 'manual' | 'flatten' | undefined

      if (exitFill && exitFill.fillPrice && entryFill.fillPrice) {
        const priceChange = side === 'long'
          ? exitFill.fillPrice - entryFill.fillPrice
          : entryFill.fillPrice - exitFill.fillPrice

        // For micro gold (MGC), tick value is $1 per 0.1 point
        const tickValue = 10 // $10 per point for MGC
        pnl = priceChange * tickValue * (entryFill.filledQuantity || 1)

        // Determine exit reason
        if (stopLoss && Math.abs(exitFill.fillPrice - stopLoss) < 0.5) {
          exitReason = 'stop_loss'
        } else if (takeProfit && Math.abs(exitFill.fillPrice - takeProfit) < 0.5) {
          exitReason = 'take_profit'
        } else {
          exitReason = 'manual'
        }
      }

      // Extract fees
      const feeEvents = this.events.filter(
        e =>
          e.eventType === 'UPDATE' &&
          e.price !== undefined &&
          e.timestamp >= entryFill.timestamp
      )
      const fees = feeEvents.reduce((sum, e) => sum + (e.price || 0), 0)

      const trade: ParsedTrade = {
        internalOrderId: orderId,
        exchangeOrderId: entryFill.exchangeOrderId,
        symbol: entryFill.symbol || group.parent.symbol || 'UNKNOWN',
        side,
        quantity: entryFill.filledQuantity || 1,
        entryPrice: entryFill.fillPrice || group.parent.price || 0,
        entryTime: entryFill.timestamp,
        exitPrice: exitFill?.fillPrice,
        exitTime: exitFill?.timestamp,
        stopLoss,
        takeProfit,
        fees,
        pnl: pnl ? pnl - fees : undefined,
        status: exitFill ? 'closed' : 'open',
        exitReason,
        parentOrderId: group.parent.internalOrderId,
        childOrders: {
          stopLoss: group.stopLoss?.internalOrderId,
          takeProfit: group.takeProfit?.internalOrderId,
        },
      }

      trades.push(trade)
    }

    return trades
  }
}

/**
 * Utility function to parse Sierra Chart file
 */
export async function parseSierraChartFile(
  file: File
): Promise<ParsedTrade[]> {
  const buffer = await file.arrayBuffer()
  const parser = new SierraChartParser()
  return parser.parseFile(buffer)
}
