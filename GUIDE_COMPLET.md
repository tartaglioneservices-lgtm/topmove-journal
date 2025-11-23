# 🎯 TopMove Trading Journal - Application Complète

## 📦 Ce qui a été développé

### ✅ PHASE 1 - Infrastructure & Auth (TERMINÉ)
- Next.js 14 + TypeScript + Tailwind CSS
- Landing page avec pricing 17.99€/mois
- Authentification Email + OAuth Google
- Middleware de protection des routes
- Schéma Supabase complet avec RLS

### ✅ PHASE 2 - Dashboard & Import (TERMINÉ)
- **Dashboard complet** avec KPIs temps réel
- **Import Sierra Chart** 100% fonctionnel
- **Liste des trades** avec recherche
- **Position Size Calculator** opérationnel
- **Gestion des comptes** dans Settings
- Navigation avec sidebar responsive
- Composants UI professionnels

## 🚀 Lancement Rapide

### 1. Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.local.example .env.local
```

### 2. Configuration Supabase

#### a) Créer un projet
1. Aller sur https://supabase.com
2. Créer un nouveau projet
3. Copier l'URL et l'ANON_KEY

#### b) Exécuter le schéma SQL
1. Ouvrir l'éditeur SQL dans Supabase
2. Copier/coller le contenu de `supabase-schema.sql`
3. Exécuter le script complet

#### c) Configurer OAuth Google (optionnel)
1. Google Cloud Console → Create OAuth 2.0 Client ID
2. Authorized redirect URI: `https://[votre-projet].supabase.co/auth/v1/callback`
3. Dans Supabase → Authentication → Providers → Google
4. Activer et coller Client ID + Secret

### 3. Variables d'environnement

Éditer `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Lancer l'application

```bash
npm run dev
```

Ouvrir http://localhost:3000

## 📖 Guide d'utilisation

### Premier usage

1. **S'inscrire**
   - Cliquer sur "Essai gratuit"
   - S'inscrire avec email ou Google
   - Confirmer l'email (vérifier spams)

2. **Créer un compte de trading**
   - Aller dans Settings (⚙️)
   - Cliquer "Nouveau compte"
   - Remplir : Nom, Broker, N° compte, Capital
   - Sauvegarder

3. **Importer des trades**
   - Aller dans Import (📤)
   - Drag & drop d'un fichier Trade Activity Log (.data)
   - Vérifier l'aperçu
   - Cliquer "Importer X trades"

4. **Visualiser les résultats**
   - Dashboard : Vue d'ensemble avec courbe d'équité
   - Trades : Liste complète avec détails
   - Calculator : Calculer vos positions

## 🎨 Fonctionnalités Détaillées

### Dashboard (/)
- **KPIs** : Capital, P&L jour/semaine, Win Rate
- **Courbe d'équité** interactive
- **Trades récents** avec status
- **Stats rapides** : Profit Factor, Expectancy, Moyennes
- **Actions rapides** : Import, Journal, Analytics
- **Multi-comptes** : Sélection si plusieurs comptes

### Import (/import)
- **Drag & Drop** de fichiers .data Sierra Chart
- **Parsing automatique** des trades avec OCO
- **Aperçu détaillé** :
  - Total P&L
  - Nombre de trades fermés/ouverts
  - Liste complète avec Entry/SL/TP/Exit/P&L
- **Import sécurisé** avec gestion des doublons
- **Redirection auto** vers Trades après succès

### Trades (/trades)
- **Table complète** de tous les trades
- **Recherche** par symbole ou setup
- **Colonnes** : Symbole, Side, Entry, Exit, SL/TP, P&L, Date, Status
- **Couleurs** : Long/Short, Profit/Loss
- **Boutons** : Filtres, Export (à venir)

### Calculator (/calculator)
- **Tous les contrats futures**
  - Métaux : GC/MGC, SI/SIL, HG
  - Énergies : CL/MCL, NG, RB
  - Indices : ES/MES, NQ/MNQ, YM/MYM, RTY/M2K
  - Devises : 6E/M6E, 6J, 6B
  - Agriculture : ZC, ZS, ZW
  - Taux : ZN, ZB
- **Calculs** :
  - Nombre de contrats optimal
  - Montant risqué ($)
  - Points/ticks risqués
  - Marge requise
  - Effet de levier (%)
- **Support micro-contrats** (MGC, MES, MNQ, etc.)
- **Spécifications** complètes de chaque contrat
- **Alertes** si levier > 50%

### Settings (/settings)
- **Profil** : Email, Nom, Statut abonnement
- **Comptes de trading** :
  - Créer nouveau compte
  - Voir liste des comptes
  - Capital initial et actuel
  - Supprimer compte
- **Coming Soon** : Notifications, Setups, Checklists

### Journal & Analytics (Coming Soon)
- Pages placeholder avec liste des features
- Développement prévu en Phase 3

## 🔧 Architecture Technique

### Stack
- **Frontend** : Next.js 14 (App Router), React 18, TypeScript
- **Styling** : Tailwind CSS, shadcn/ui
- **Database** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth (Email + OAuth)
- **Charts** : Recharts
- **Déploiement** : Vercel (recommandé)

### Structure des dossiers
```
trading-journal/
├── app/
│   ├── (dashboard)/          # Routes protégées avec sidebar
│   │   ├── layout.tsx        # Layout avec navigation
│   │   ├── dashboard/        # Page principale
│   │   ├── import/           # Import Sierra Chart
│   │   ├── trades/           # Liste des trades
│   │   ├── calculator/       # Position sizing
│   │   ├── settings/         # Paramètres
│   │   ├── journal/          # Placeholder
│   │   └── analytics/        # Placeholder
│   ├── auth/                 # Authentification
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   └── globals.css
├── src/
│   ├── components/
│   │   ├── ui/               # Composants de base
│   │   ├── dashboard/        # StatCard, RecentTrades
│   │   └── charts/           # EquityCurve
│   ├── lib/
│   │   ├── supabase.ts       # Client DB
│   │   ├── sierra-parser.ts  # Parser .data
│   │   ├── futures-contracts.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── public/
│   └── assets/
│       └── logo.jpg
├── middleware.ts             # Protection routes
├── supabase-schema.sql       # Schéma complet
└── package.json
```

### Base de données

**Tables principales** :
- `users` : Profils utilisateurs
- `trading_accounts` : Comptes de trading
- `trades` : Tous les trades importés
- `journal_entries` : Notes quotidiennes (à venir)
- `setups` : Setups de trading (à venir)
- `import_history` : Historique des imports

**Features** :
- Row Level Security (RLS) activé
- Triggers automatiques (timestamps, stats)
- Indexes pour performance
- Upsert sur import (évite doublons)

## 🧪 Test du Parser Sierra Chart

Le parser gère :

✅ **Ordres OCO** : Parent + Stop Loss + Take Profit  
✅ **Fills** : Entrée et sortie avec prix exacts  
✅ **Modifications** : Cancel/Replace des SL/TP  
✅ **Exit reasons** : stop_loss, take_profit, manual, flatten  
✅ **Fees** : Extraction depuis Cash Balance updates  
✅ **Side detection** : Long/Short automatique  
✅ **Micro-contrats** : MGC, MES, MNQ supportés  

**Fichiers de test fournis** :
- TradeActivityLog_2025-11-19_UTC_212156.data
- TradeActivityLog_2025-11-18_UTC_212156.data

## 📊 Métriques Calculées

Le système calcule automatiquement :
- Total P&L (€ ou $)
- Win Rate (%)
- Profit Factor
- Expectancy ($ moyen par trade)
- Average Win / Average Loss
- Largest Win / Largest Loss
- Total trades, Winning trades, Losing trades
- Consecutive wins / losses
- Equity curve (graphique)

## 🎯 Roadmap

### ✅ Phase 1 - Infrastructure (TERMINÉ)
- Next.js + Supabase
- Auth + Landing page
- Schéma DB complet

### ✅ Phase 2 - Core Features (TERMINÉ)
- Dashboard avec KPIs
- Import Sierra Chart
- Liste des trades
- Position Size Calculator
- Gestion des comptes

### 🚧 Phase 3 - Advanced Features (À venir)
- [ ] Journal quotidien complet
- [ ] Checklist pré-trade personnalisable
- [ ] Analytics avancées (heatmap, par setup)
- [ ] Session Replay
- [ ] Comparaison de périodes
- [ ] Exports PDF

### 🔮 Phase 4 - Monétisation (À venir)
- [ ] Intégration Stripe complète
- [ ] Gestion abonnements (17.99€/mois)
- [ ] Webhooks paiements
- [ ] Billing dashboard

## 🐛 Troubleshooting

### Erreur d'import
- Vérifier le format du fichier (.data uniquement)
- Regarder la console pour les erreurs du parser
- Vérifier qu'un compte est sélectionné
- S'assurer que le schéma SQL est exécuté

### Problème d'authentification
- Vérifier les variables d'environnement
- Vérifier que le trigger `handle_new_user()` existe dans Supabase
- Vérifier les policies RLS

### Dashboard vide
- Créer un compte dans Settings
- Importer des trades dans Import
- Rafraîchir la page

### Erreur Supabase
- Vérifier l'URL et l'ANON_KEY dans .env.local
- Vérifier que le projet Supabase est actif
- Vérifier les logs dans Supabase Dashboard

## 🔐 Sécurité

- **RLS activé** : Chaque user ne voit que ses données
- **Middleware** : Protection automatique des routes
- **Validation** : Côté client et serveur
- **Hashing** : Mots de passe hashés par Supabase
- **OAuth** : Connexion sécurisée via Google

## 🚀 Déploiement sur Vercel

1. Pusher le code sur GitHub
2. Connecter le repo à Vercel
3. Configurer les variables d'environnement
4. Déployer automatiquement

**Variables Vercel** :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (URL de production)

## 📞 Support & Ressources

**Documentation** :
- [README.md](README.md) - Vue d'ensemble
- [DEMARRAGE.md](DEMARRAGE.md) - Guide de démarrage
- [MISE_A_JOUR.md](MISE_A_JOUR.md) - Détails techniques

**Fichiers importants** :
- `src/lib/sierra-parser.ts` - Logique de parsing
- `app/(dashboard)/import/page.tsx` - UI d'import
- `supabase-schema.sql` - Structure complète DB

**Contact** :
- Email : antonio@topmovetrading.fr
- Site : https://topmovetrading.fr

---

**Développé avec ❤️ pour TopMove Trading**

*Application professionnelle de journal de trading - Version 1.0*
