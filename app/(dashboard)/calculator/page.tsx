'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calculator as CalcIcon } from 'lucide-react'
import { FUTURES_CONTRACTS, calculatePositionSize, getContractsByCategory } from '@/lib/futures-contracts'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function CalculatorPage() {
  const [accountBalance, setAccountBalance] = useState(10000)
  const [riskPercent, setRiskPercent] = useState(1)
  const [entryPrice, setEntryPrice] = useState(4080)
  const [stopLoss, setStopLoss] = useState(4070)
  const [selectedContract, setSelectedContract] = useState('MGC')
  const [useMicro, setUseMicro] = useState(true)

  const contract = FUTURES_CONTRACTS.find(c => c.symbol === selectedContract)
  const categories = getContractsByCategory()

  let result = null
  if (contract && entryPrice && stopLoss) {
    result = calculatePositionSize(
      accountBalance,
      riskPercent,
      entryPrice,
      stopLoss,
      contract,
      useMicro
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Position Size Calculator</h1>
        <p className="text-muted-foreground">
          Calculez votre taille de position idéale en fonction de votre risque
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
            <CardDescription>
              Configurez votre trade et votre risque
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contract">Contrat</Label>
              <select
                id="contract"
                value={selectedContract}
                onChange={(e) => setSelectedContract(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
              >
                {Object.entries(categories).map(([category, contracts]) => (
                  <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                    {contracts.map((c) => (
                      <option key={c.symbol} value={c.symbol}>
                        {c.symbol} - {c.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {contract?.microContract && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useMicro"
                  checked={useMicro}
                  onChange={(e) => setUseMicro(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="useMicro" className="cursor-pointer">
                  Utiliser le micro contrat ({contract.microContract.symbol})
                </Label>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="accountBalance">Capital de trading</Label>
              <Input
                id="accountBalance"
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskPercent">Risque par trade (%)</Label>
              <Input
                id="riskPercent"
                type="number"
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryPrice">Prix d'entrée</Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.1"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                id="stopLoss"
                type="number"
                step="0.1"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
              />
            </div>

            <Button className="w-full" size="lg">
              <CalcIcon className="mr-2 h-5 w-5" />
              Calculer
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Résultats</CardTitle>
            <CardDescription>
              Votre position sizing optimale
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                {/* Main Result */}
                <div className="rounded-lg border-2 border-primary bg-primary/5 p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Nombre de contrats</p>
                  <p className="text-5xl font-bold text-primary">{result.contracts}</p>
                  {useMicro && contract?.microContract && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {contract.microContract.symbol}
                    </p>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Montant risqué</span>
                    <span className="font-medium">{formatCurrency(result.riskAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Points risqués</span>
                    <span className="font-medium">{formatNumber(result.pointsRisked, 1)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">$ Risque / contrat</span>
                    <span className="font-medium">{formatCurrency(result.dollarRiskPerContract)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Marge requise</span>
                    <span className="font-medium">{formatCurrency(result.totalMargin)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Effet de levier</span>
                    <span className="font-medium">{formatNumber(result.leverageUsed, 2)}%</span>
                  </div>
                </div>

                {/* Warning */}
                {result.leverageUsed > 50 && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">
                      ⚠️ Attention : Votre effet de levier est élevé ({formatNumber(result.leverageUsed, 1)}%).
                      Assurez-vous d'avoir une marge suffisante.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center py-12">
                <p className="text-sm text-muted-foreground text-center">
                  Configurez vos paramètres pour voir les résultats
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Info */}
        {contract && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Spécifications du contrat</CardTitle>
              <CardDescription>
                {contract.name} ({contract.symbol})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Exchange</p>
                  <p className="font-medium">{contract.exchange}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tick Size</p>
                  <p className="font-medium">{contract.tickSize}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tick Value</p>
                  <p className="font-medium">{formatCurrency(contract.tickValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marge initiale</p>
                  <p className="font-medium">{formatCurrency(contract.marginRequirement)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
