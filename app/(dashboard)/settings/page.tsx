'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings as SettingsIcon, Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function SettingsPage() {
  const supabase = createSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewAccount, setShowNewAccount] = useState(false)

  const [newAccount, setNewAccount] = useState({
    name: '',
    broker: '',
    account_number: '',
    initial_capital: 10000,
    currency: 'USD',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: accountsData } = await supabase
        .from('trading_accounts')
        .select('*')
        .order('created_at', { ascending: false })

      if (accountsData) {
        setAccounts(accountsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      const { error } = await supabase.from('trading_accounts').insert({
        user_id: user.id,
        ...newAccount,
        current_capital: newAccount.initial_capital,
        is_active: true,
      })

      if (error) throw error

      await loadData()
      setShowNewAccount(false)
      setNewAccount({
        name: '',
        broker: '',
        account_number: '',
        initial_capital: 10000,
        currency: 'USD',
      })
    } catch (error) {
      console.error('Error creating account:', error)
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) return

    try {
      const { error } = await supabase
        .from('trading_accounts')
        .delete()
        .eq('id', accountId)

      if (error) throw error

      await loadData()
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez vos comptes de trading et vos préférences
        </p>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Informations de votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Nom complet</Label>
            <Input value={user?.user_metadata?.full_name || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Abonnement</Label>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Essai gratuit
              </span>
              <span className="text-sm text-muted-foreground">
                14 jours restants
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Comptes de trading</CardTitle>
              <CardDescription>
                Gérez vos comptes de trading
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewAccount(!showNewAccount)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau compte
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Account Form */}
          {showNewAccount && (
            <form onSubmit={handleCreateAccount} className="rounded-lg border p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" required>Nom du compte</Label>
                  <Input
                    id="name"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="Mon compte de trading"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="broker" required>Broker</Label>
                  <Input
                    id="broker"
                    value={newAccount.broker}
                    onChange={(e) => setNewAccount({ ...newAccount, broker: e.target.value })}
                    placeholder="AMP Futures"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_number" required>Numéro de compte</Label>
                  <Input
                    id="account_number"
                    value={newAccount.account_number}
                    onChange={(e) => setNewAccount({ ...newAccount, account_number: e.target.value })}
                    placeholder="212156"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initial_capital" required>Capital initial</Label>
                  <Input
                    id="initial_capital"
                    type="number"
                    value={newAccount.initial_capital}
                    onChange={(e) => setNewAccount({ ...newAccount, initial_capital: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Créer</Button>
                <Button type="button" variant="outline" onClick={() => setShowNewAccount(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          )}

          {/* Accounts List */}
          {accounts.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Aucun compte de trading. Créez-en un pour commencer.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.broker} - {account.account_number}
                    </p>
                    <p className="text-sm mt-1">
                      Capital: <span className="font-medium">{formatCurrency(account.current_capital)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.is_active && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        Actif
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAccount(account.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Autres paramètres</CardTitle>
          <CardDescription>Bientôt disponibles</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="space-y-1">
            <li>• Préférences de notifications</li>
            <li>• Gestion de l'abonnement</li>
            <li>• Configuration des setups personnalisés</li>
            <li>• Checklists pré-trade</li>
            <li>• Export de données</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
