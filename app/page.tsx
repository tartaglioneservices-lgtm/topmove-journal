import Link from 'next/link'
import { ArrowRight, BarChart3, TrendingUp, Calculator, BookOpen, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-40">
              <img
                src="/assets/logo.jpg"
                alt="TopMove Trading"
                className="object-contain h-full"
              />
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Connexion
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Essai gratuit
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            14 jours d'essai gratuit
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Journal de Trading{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Professionnel
            </span>
          </h1>
          <p className="mb-10 text-xl text-muted-foreground md:text-2xl">
            Importez vos trades Sierra Chart, analysez vos performances et
            développez votre discipline de trading comme un hedge fund.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-white hover:bg-primary/90"
            >
              Commencer gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="flex items-center gap-2 rounded-lg border border-border px-8 py-4 text-lg font-semibold hover:bg-accent"
            >
              Découvrir les fonctionnalités
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Seulement <span className="font-bold text-foreground">17,99€/mois</span> après l'essai
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/50 py-20">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Toutes les fonctionnalités dont vous avez besoin
            </h2>
            <p className="text-lg text-muted-foreground">
              Un journal complet pour traders sérieux
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="card-hover rounded-lg border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Import Sierra Chart</h3>
              <p className="text-muted-foreground">
                Importez automatiquement vos trades depuis Sierra Chart avec
                support OCO complet (Stop Loss & Take Profit).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-hover rounded-lg border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Analytics Avancées</h3>
              <p className="text-muted-foreground">
                Win rate, profit factor, expectancy, equity curve, heatmap
                calendar et métriques détaillées par setup.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-hover rounded-lg border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Position Size Calculator</h3>
              <p className="text-muted-foreground">
                Calculateur de taille de position pour tous les contrats
                futures majeurs (MGC, MES, MNQ, etc.).
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-hover rounded-lg border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Journal Quotidien</h3>
              <p className="text-muted-foreground">
                Notes enrichies, checklist pré-trade, analyse psychologique et
                session replay pour revoir vos journées.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card-hover rounded-lg border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Multi-comptes</h3>
              <p className="text-muted-foreground">
                Gérez plusieurs comptes de trading, suivez votre capital avec
                dépôts/retraits et gestion des risques.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card-hover rounded-lg border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Exports PDF</h3>
              <p className="text-muted-foreground">
                Générez des rapports mensuels professionnels de vos
                performances pour vos investisseurs ou votre suivi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="border-t py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Un tarif simple et transparent
            </h2>
            <p className="mb-12 text-lg text-muted-foreground">
              Accédez à toutes les fonctionnalités sans limite
            </p>

            <div className="rounded-2xl border-2 border-primary bg-card p-8 shadow-lg">
              <div className="mb-6">
                <div className="mb-2 text-5xl font-bold">17,99€</div>
                <div className="text-muted-foreground">par mois</div>
              </div>

              <ul className="mb-8 space-y-3 text-left">
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/20 p-1">
                    <div className="h-full w-full rounded-full bg-primary"></div>
                  </div>
                  <span>14 jours d'essai gratuit</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/20 p-1">
                    <div className="h-full w-full rounded-full bg-primary"></div>
                  </div>
                  <span>Import illimité de trades</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/20 p-1">
                    <div className="h-full w-full rounded-full bg-primary"></div>
                  </div>
                  <span>Comptes de trading illimités</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/20 p-1">
                    <div className="h-full w-full rounded-full bg-primary"></div>
                  </div>
                  <span>Toutes les analytics premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/20 p-1">
                    <div className="h-full w-full rounded-full bg-primary"></div>
                  </div>
                  <span>Support prioritaire</span>
                </li>
              </ul>

              <Link
                href="/auth/signup"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-white hover:bg-primary/90"
              >
                Commencer l'essai gratuit
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-32">
                <img
                  src="/assets/logo.jpg"
                  alt="TopMove Trading"
                  className="object-contain h-full"
                />
              </div>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="https://topmovetrading.fr" className="hover:text-foreground">
                Site principal
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Confidentialité
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                CGU
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © 2025 TopMove Trading. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
