import { FuturesContract } from '@/types'

/**
 * Database of major futures contracts with specifications
 * Updated specifications as of 2025
 */
export const FUTURES_CONTRACTS: FuturesContract[] = [
  // ============================================
  // METALS
  // ============================================
  {
    symbol: 'GC',
    name: 'Gold (COMEX)',
    exchange: 'CME',
    tickSize: 0.1,
    tickValue: 10,
    contractSize: 100, // 100 troy ounces
    currency: 'USD',
    marginRequirement: 10000,
    microContract: {
      symbol: 'MGC',
      contractSize: 10, // 10 troy ounces
      marginRequirement: 1000,
    },
  },
  {
    symbol: 'SI',
    name: 'Silver (COMEX)',
    exchange: 'CME',
    tickSize: 0.005,
    tickValue: 25,
    contractSize: 5000, // 5000 troy ounces
    currency: 'USD',
    marginRequirement: 8000,
    microContract: {
      symbol: 'SIL',
      contractSize: 1000,
      marginRequirement: 1600,
    },
  },
  {
    symbol: 'HG',
    name: 'Copper',
    exchange: 'CME',
    tickSize: 0.0005,
    tickValue: 12.5,
    contractSize: 25000, // 25,000 pounds
    currency: 'USD',
    marginRequirement: 4000,
  },

  // ============================================
  // ENERGIES
  // ============================================
  {
    symbol: 'CL',
    name: 'Crude Oil (WTI)',
    exchange: 'NYMEX',
    tickSize: 0.01,
    tickValue: 10,
    contractSize: 1000, // 1000 barrels
    currency: 'USD',
    marginRequirement: 6000,
    microContract: {
      symbol: 'MCL',
      contractSize: 100,
      marginRequirement: 600,
    },
  },
  {
    symbol: 'NG',
    name: 'Natural Gas',
    exchange: 'NYMEX',
    tickSize: 0.001,
    tickValue: 10,
    contractSize: 10000, // 10,000 mmBtu
    currency: 'USD',
    marginRequirement: 3000,
  },
  {
    symbol: 'RB',
    name: 'RBOB Gasoline',
    exchange: 'NYMEX',
    tickSize: 0.0001,
    tickValue: 4.2,
    contractSize: 42000, // 42,000 gallons
    currency: 'USD',
    marginRequirement: 5000,
  },

  // ============================================
  // INDICES
  // ============================================
  {
    symbol: 'ES',
    name: 'E-mini S&P 500',
    exchange: 'CME',
    tickSize: 0.25,
    tickValue: 12.5,
    contractSize: 50, // $50 x Index
    currency: 'USD',
    marginRequirement: 13000,
    microContract: {
      symbol: 'MES',
      contractSize: 5,
      marginRequirement: 1300,
    },
  },
  {
    symbol: 'NQ',
    name: 'E-mini Nasdaq 100',
    exchange: 'CME',
    tickSize: 0.25,
    tickValue: 5,
    contractSize: 20, // $20 x Index
    currency: 'USD',
    marginRequirement: 17000,
    microContract: {
      symbol: 'MNQ',
      contractSize: 2,
      marginRequirement: 1700,
    },
  },
  {
    symbol: 'YM',
    name: 'E-mini Dow Jones',
    exchange: 'CBOT',
    tickSize: 1,
    tickValue: 5,
    contractSize: 5, // $5 x Index
    currency: 'USD',
    marginRequirement: 11000,
    microContract: {
      symbol: 'MYM',
      contractSize: 0.5,
      marginRequirement: 1100,
    },
  },
  {
    symbol: 'RTY',
    name: 'E-mini Russell 2000',
    exchange: 'CME',
    tickSize: 0.1,
    tickValue: 5,
    contractSize: 50, // $50 x Index
    currency: 'USD',
    marginRequirement: 7000,
    microContract: {
      symbol: 'M2K',
      contractSize: 5,
      marginRequirement: 700,
    },
  },

  // ============================================
  // CURRENCIES
  // ============================================
  {
    symbol: '6E',
    name: 'Euro FX',
    exchange: 'CME',
    tickSize: 0.00005,
    tickValue: 6.25,
    contractSize: 125000, // €125,000
    currency: 'USD',
    marginRequirement: 2500,
    microContract: {
      symbol: 'M6E',
      contractSize: 12500,
      marginRequirement: 250,
    },
  },
  {
    symbol: '6J',
    name: 'Japanese Yen',
    exchange: 'CME',
    tickSize: 0.0000005,
    tickValue: 6.25,
    contractSize: 12500000, // ¥12,500,000
    currency: 'USD',
    marginRequirement: 2000,
  },
  {
    symbol: '6B',
    name: 'British Pound',
    exchange: 'CME',
    tickSize: 0.0001,
    tickValue: 6.25,
    contractSize: 62500, // £62,500
    currency: 'USD',
    marginRequirement: 2500,
  },

  // ============================================
  // AGRICULTURE
  // ============================================
  {
    symbol: 'ZC',
    name: 'Corn',
    exchange: 'CBOT',
    tickSize: 0.25,
    tickValue: 12.5,
    contractSize: 5000, // 5000 bushels
    currency: 'USD',
    marginRequirement: 1500,
  },
  {
    symbol: 'ZS',
    name: 'Soybeans',
    exchange: 'CBOT',
    tickSize: 0.25,
    tickValue: 12.5,
    contractSize: 5000, // 5000 bushels
    currency: 'USD',
    marginRequirement: 3000,
  },
  {
    symbol: 'ZW',
    name: 'Wheat',
    exchange: 'CBOT',
    tickSize: 0.25,
    tickValue: 12.5,
    contractSize: 5000, // 5000 bushels
    currency: 'USD',
    marginRequirement: 2000,
  },

  // ============================================
  // RATES
  // ============================================
  {
    symbol: 'ZN',
    name: '10-Year T-Note',
    exchange: 'CBOT',
    tickSize: 0.015625, // 1/64th
    tickValue: 15.625,
    contractSize: 100000, // $100,000 face value
    currency: 'USD',
    marginRequirement: 1500,
  },
  {
    symbol: 'ZB',
    name: '30-Year T-Bond',
    exchange: 'CBOT',
    tickSize: 0.03125, // 1/32nd
    tickValue: 31.25,
    contractSize: 100000,
    currency: 'USD',
    marginRequirement: 4000,
  },

  // ============================================
  // VOLATILITY
  // ============================================
  {
    symbol: 'VX',
    name: 'VIX Futures',
    exchange: 'CFE',
    tickSize: 0.05,
    tickValue: 50,
    contractSize: 1000, // $1000 x Index
    currency: 'USD',
    marginRequirement: 5000,
  },
]

/**
 * Get contract by symbol
 */
export function getContractBySymbol(symbol: string): FuturesContract | undefined {
  return FUTURES_CONTRACTS.find(
    c => c.symbol === symbol || c.microContract?.symbol === symbol
  )
}

/**
 * Get all contract symbols
 */
export function getAllSymbols(): string[] {
  const symbols: string[] = []
  for (const contract of FUTURES_CONTRACTS) {
    symbols.push(contract.symbol)
    if (contract.microContract) {
      symbols.push(contract.microContract.symbol)
    }
  }
  return symbols
}

/**
 * Group contracts by category
 */
export function getContractsByCategory() {
  return {
    metals: FUTURES_CONTRACTS.filter(c =>
      ['GC', 'SI', 'HG'].includes(c.symbol)
    ),
    energies: FUTURES_CONTRACTS.filter(c =>
      ['CL', 'NG', 'RB'].includes(c.symbol)
    ),
    indices: FUTURES_CONTRACTS.filter(c =>
      ['ES', 'NQ', 'YM', 'RTY'].includes(c.symbol)
    ),
    currencies: FUTURES_CONTRACTS.filter(c =>
      ['6E', '6J', '6B'].includes(c.symbol)
    ),
    agriculture: FUTURES_CONTRACTS.filter(c =>
      ['ZC', 'ZS', 'ZW'].includes(c.symbol)
    ),
    rates: FUTURES_CONTRACTS.filter(c =>
      ['ZN', 'ZB'].includes(c.symbol)
    ),
    volatility: FUTURES_CONTRACTS.filter(c => c.symbol === 'VX'),
  }
}

/**
 * Calculate position size
 */
export function calculatePositionSize(
  accountBalance: number,
  riskPercent: number,
  entryPrice: number,
  stopLoss: number,
  contract: FuturesContract,
  useMicro: boolean = false
): {
  riskAmount: number
  pointsRisked: number
  ticksRisked: number
  dollarRiskPerContract: number
  contracts: number
  totalMargin: number
  leverageUsed: number
} {
  const riskAmount = (accountBalance * riskPercent) / 100
  const pointsRisked = Math.abs(entryPrice - stopLoss)
  const ticksRisked = pointsRisked / contract.tickSize

  const effectiveTickValue = useMicro && contract.microContract
    ? contract.tickValue * (contract.microContract.contractSize / contract.contractSize)
    : contract.tickValue

  const dollarRiskPerContract = ticksRisked * effectiveTickValue

  const contracts = dollarRiskPerContract > 0
    ? Math.floor(riskAmount / dollarRiskPerContract)
    : 0

  const effectiveMargin = useMicro && contract.microContract
    ? contract.microContract.marginRequirement
    : contract.marginRequirement

  const totalMargin = contracts * effectiveMargin
  const leverageUsed = totalMargin > 0 ? (totalMargin / accountBalance) * 100 : 0

  return {
    riskAmount,
    pointsRisked,
    ticksRisked,
    dollarRiskPerContract,
    contracts,
    totalMargin,
    leverageUsed,
  }
}
