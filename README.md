# TopMove Trading Journal 📈

Application web professionnelle de journal de trading avec import Sierra Chart, analytics avancées et position sizing calculator.

## 🚀 Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Email + OAuth Google)
- **Payments**: Stripe (17.99€/mois)
- **Deployment**: Vercel
- **Charts**: Recharts
- **PDF**: jsPDF

## 📦 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/your-repo/trading-journal.git
cd trading-journal
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Copier l'URL et l'ANON KEY
3. Exécuter le schéma SQL :
   - Aller dans SQL Editor
   - Copier/coller le contenu de `supabase-schema.sql`
   - Exécuter

4. Configurer OAuth Google :
   - Aller dans Authentication > Providers
   - Activer Google
   - Ajouter Client ID et Secret depuis [Google Cloud Console](https://console.cloud.google.com)
   - Authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

### 4. Configuration Stripe

1. Créer un compte [Stripe](https://stripe.com)
2. Créer un produit "TopMove Trading Journal" à 17.99€/mois
3. Récupérer les clés API (test et production)
4. Configurer le webhook pour `/api/webhooks/stripe`

### 5. Variables d'environnement

Créer un fichier `.env.local` :

```bash
cp .env.local.example .env.local
```

Remplir les variables :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://topmovetrading.fr
```

### 6. Lancer l'application

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 📁 Structure du projet

```
trading-journal/
├── app/                          # Next.js App Router
│   ├── auth/                     # Pages d'authentification
│   │   ├── login/                # Connexion
│   │   ├── signup/               # Inscription
│   │   └── callback/             # OAuth callback
│   ├── dashboard/                # Dashboard principal
│   ├── trades/                   # Liste et détails des trades
│   ├── import/                   # Import Sierra Chart
│   ├── journal/                  # Journal quotidien
│   ├── analytics/                # Analytics et rapports
│   ├── calculator/               # Position Size Calculator
│   ├── settings/                 # Paramètres
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Styles globaux
├── src/
│   ├── components/
│   │   └── ui/                   # Composants UI réutilisables
│   ├── lib/
│   │   ├── supabase.ts          # Client Supabase
│   │   ├── sierra-parser.ts     # Parser Sierra Chart
│   │   ├── futures-contracts.ts # Base de données contrats
│   │   └── utils.ts             # Utilitaires
│   └── types/
│       └── index.ts              # Types TypeScript
├── public/
│   └── assets/                   # Images et assets
├── supabase-schema.sql           # Schéma SQL complet
├── middleware.ts                 # Middleware auth
└── package.json
```

## 🔐 Authentification

L'application supporte deux méthodes d'authentification :

1. **Email/Password** : Inscription classique avec confirmation par email
2. **OAuth Google** : Connexion rapide avec compte Google

Toutes les routes `/dashboard/*` sont protégées par middleware.

## 📊 Fonctionnalités

### ✅ Déjà implémenté

- [x] Landing page avec pricing
- [x] Authentification (Email + OAuth Google)
- [x] Schéma database complet
- [x] Parser Sierra Chart avec gestion OCO
- [x] Base de données contrats futures
- [x] Types TypeScript
- [x] Middleware protection routes

### 🚧 En cours de développement

- [ ] Dashboard avec KPIs
- [ ] Import fichiers Sierra Chart
- [ ] Liste des trades avec filtres
- [ ] Journal quotidien
- [ ] Analytics et graphiques
- [ ] Position Size Calculator
- [ ] Gestion multi-comptes
- [ ] Exports PDF
- [ ] Intégration Stripe

## 🎨 Thème et Design

Le design utilise les couleurs de la marque TopMove Trading :
- **Primaire** : Vert (#10b981)
- **Secondaire** : Or (#eab308)
- **Fond** : Bleu marine foncé

## 📝 Parser Sierra Chart

Le parser supporte :
- Import des fichiers `.data` de Sierra Chart
- Détection automatique des ordres OCO (Stop Loss + Take Profit)
- Gestion des modifications de SL/TP
- Calcul automatique du P&L
- Support des contrats micro (MGC, MES, MNQ, etc.)

Exemple d'utilisation :

```typescript
import { parseSierraChartFile } from '@/lib/sierra-parser'

const file = // File object
const trades = await parseSierraChartFile(file)
```

## 🧮 Position Size Calculator

Supporte les contrats suivants :
- **Métaux** : GC/MGC, SI/SIL, HG
- **Énergies** : CL/MCL, NG, RB
- **Indices** : ES/MES, NQ/MNQ, YM/MYM, RTY/M2K
- **Devises** : 6E/M6E, 6J, 6B
- **Agriculture** : ZC, ZS, ZW
- **Taux** : ZN, ZB
- **Volatilité** : VX

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

```bash
vercel --prod
```

### Variables d'environnement sur Vercel

Ajouter toutes les variables de `.env.local` dans les settings Vercel.

## 📈 Roadmap

### Phase 1 - MVP (Actuel)
- [x] Auth et landing page
- [ ] Dashboard basique
- [ ] Import Sierra Chart
- [ ] Liste des trades

### Phase 2 - Analytics
- [ ] Graphiques de performance
- [ ] Calendrier heatmap
- [ ] Métriques avancées
- [ ] Session Replay

### Phase 3 - Tools
- [ ] Position Size Calculator
- [ ] Checklist pré-trade
- [ ] Questionnaire psychologique
- [ ] Exports PDF

### Phase 4 - Monétisation
- [ ] Intégration Stripe complète
- [ ] Gestion abonnements
- [ ] Webhooks paiements

## 🤝 Support

Pour toute question : contact@topmovetrading.fr

## 📄 Licence

Propriétaire - TopMove Trading © 2025
