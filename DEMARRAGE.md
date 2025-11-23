# 🚀 Guide de Démarrage Rapide - TopMove Trading Journal

## ✅ Étape 1 : Authentification (TERMINÉ)

Nous avons créé :
- ✅ Page de connexion (/auth/login)
- ✅ Page d'inscription (/auth/signup)  
- ✅ OAuth Google
- ✅ Callback OAuth
- ✅ Middleware de protection des routes
- ✅ Landing page avec pricing 17.99€/mois

## 📦 Installation et Setup

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration Supabase

#### a) Créer un projet Supabase
- Aller sur https://supabase.com
- Créer un nouveau projet
- Copier l'URL et l'ANON KEY

#### b) Exécuter le schéma SQL
- Ouvrir l'éditeur SQL dans Supabase
- Copier/coller le contenu de `supabase-schema.sql`
- Exécuter le script

#### c) Configurer OAuth Google
1. Aller dans Authentication > Providers dans Supabase
2. Activer Google Provider
3. Créer des credentials OAuth sur Google Cloud Console :
   - https://console.cloud.google.com
   - APIs & Services > Credentials
   - Create OAuth 2.0 Client ID
   - Type: Web application
   - Authorized redirect URIs: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
4. Copier Client ID et Client Secret dans Supabase

### 3. Variables d'environnement

Créer `.env.local` à la racine :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe (pour plus tard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://topmovetrading.fr
```

### 4. Lancer en développement

```bash
npm run dev
```

L'app sera disponible sur http://localhost:3000

## 🧪 Tester l'authentification

1. Aller sur http://localhost:3000
2. Cliquer sur "Essai gratuit"
3. S'inscrire avec :
   - Email/mot de passe (confirmer par email)
   - OU OAuth Google
4. Se connecter
5. Être redirigé vers /dashboard (à créer)

## 📁 Structure actuelle

```
trading-journal/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx        ✅ Page connexion
│   │   ├── signup/page.tsx       ✅ Page inscription
│   │   └── callback/route.ts     ✅ OAuth callback
│   ├── layout.tsx                ✅ Layout principal
│   ├── page.tsx                  ✅ Landing page
│   └── globals.css               ✅ Styles
├── src/
│   ├── components/ui/            ✅ Button, Input, Card, Label
│   ├── lib/
│   │   ├── supabase.ts          ✅ Client Supabase
│   │   ├── sierra-parser.ts     ✅ Parser Sierra Chart
│   │   ├── futures-contracts.ts ✅ Base contrats
│   │   └── utils.ts             ✅ Utilitaires
│   └── types/index.ts           ✅ Types TypeScript
├── middleware.ts                 ✅ Protection routes
├── supabase-schema.sql          ✅ Schéma complet
└── public/assets/logo.jpg       ✅ Logo TopMove
```

## 🎯 Prochaines étapes

Pour continuer le développement, nous devons créer :

### Option A : Dashboard (Vue d'ensemble)
- KPIs en temps réel (P&L du jour, de la semaine, du mois)
- Mini graphique d'équité
- Derniers trades
- Statistiques rapides

### Option B : Import (Fonctionnalité clé)
- Upload de fichiers Sierra Chart
- Parsing et affichage des trades
- Sélection du compte cible
- Preview avant import

### Option C : Liste des Trades
- Table avec tous les trades
- Filtres (date, symbole, status, setup)
- Tri par colonnes
- Détail d'un trade avec notes

Quelle étape veux-tu qu'on fasse maintenant ?

## 💡 Notes importantes

### Middleware
Le middleware protège automatiquement toutes les routes :
- `/dashboard/*`
- `/trades/*`
- `/import/*`
- `/journal/*`
- `/analytics/*`
- `/calculator/*`
- `/settings/*`

Si l'utilisateur n'est pas connecté, il est redirigé vers `/auth/login`

### Parser Sierra Chart
Le parser est déjà fonctionnel et prêt à être utilisé :

```typescript
import { parseSierraChartFile } from '@/lib/sierra-parser'

// Dans un composant
const handleFileUpload = async (file: File) => {
  const trades = await parseSierraChartFile(file)
  console.log(trades)
  // Insérer dans Supabase
}
```

### Base de données
Le schéma SQL créé automatiquement :
- Tables : users, trading_accounts, trades, journal_entries, setups, etc.
- Indexes pour performance
- Triggers (auto-update timestamps, stats, etc.)
- Row Level Security (RLS) activé
- Fonction de création de profil utilisateur automatique

## 🆘 Troubleshooting

### Erreur "Module not found"
```bash
npm install
```

### Erreur Supabase
- Vérifier les variables d'environnement
- Vérifier que le schéma SQL a été exécuté

### OAuth Google ne marche pas
- Vérifier les Authorized redirect URIs
- S'assurer que le Client ID/Secret sont corrects

### Middleware bloque tout
- Vérifier que `/auth/login` et `/auth/signup` ne sont pas dans le matcher
- Vérifier la session Supabase

## 📞 Contact

Pour toute question : antonio@topmovetrading.fr
