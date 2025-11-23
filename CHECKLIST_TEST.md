# ✅ Checklist de Test - TopMove Trading Journal

## 🏁 Setup Initial

- [ ] Cloner/télécharger le projet
- [ ] Installer les dépendances : `npm install`
- [ ] Créer un projet Supabase
- [ ] Exécuter `supabase-schema.sql` dans l'éditeur SQL
- [ ] Créer `.env.local` avec les variables
- [ ] Lancer l'app : `npm run dev`
- [ ] Accéder à http://localhost:3000

## 🔐 Tests d'Authentification

### Inscription
- [ ] Cliquer sur "Essai gratuit"
- [ ] Remplir le formulaire d'inscription
- [ ] Recevoir l'email de confirmation
- [ ] Cliquer sur le lien de confirmation
- [ ] Être redirigé vers le dashboard

### Connexion Email
- [ ] Se déconnecter
- [ ] Aller sur "Connexion"
- [ ] Se connecter avec email/mot de passe
- [ ] Être redirigé vers le dashboard

### OAuth Google (si configuré)
- [ ] Cliquer sur "Continuer avec Google"
- [ ] Autoriser l'accès
- [ ] Être redirigé vers le dashboard
- [ ] Voir son profil dans la sidebar

### Middleware
- [ ] Essayer d'accéder à `/dashboard` sans être connecté
- [ ] Vérifier la redirection vers `/auth/login`
- [ ] Se connecter et vérifier l'accès

## ⚙️ Tests Settings

### Création de compte
- [ ] Aller dans Settings
- [ ] Cliquer "Nouveau compte"
- [ ] Remplir tous les champs :
  - [ ] Nom : "Mon compte principal"
  - [ ] Broker : "AMP Futures"
  - [ ] N° compte : "212156"
  - [ ] Capital : 10000
- [ ] Cliquer "Créer"
- [ ] Voir le compte dans la liste

### Gestion des comptes
- [ ] Voir les détails du compte (nom, broker, capital)
- [ ] Créer un second compte
- [ ] Vérifier le badge "Actif"
- [ ] Supprimer un compte
- [ ] Confirmer la suppression

## 📤 Tests Import

### Upload fichier
- [ ] Aller dans Import
- [ ] Sélectionner le compte cible
- [ ] Drag & drop d'un fichier .data
- [ ] Voir le parsing en cours
- [ ] Vérifier l'aperçu des trades

### Aperçu des trades
- [ ] Voir le résumé (Total P&L, trades fermés/ouverts)
- [ ] Vérifier la liste des trades :
  - [ ] Symbole correct (MGC, GC, etc.)
  - [ ] Side (Long/Short) correct
  - [ ] Entry price
  - [ ] Stop Loss affiché
  - [ ] Take Profit affiché
  - [ ] Exit price (si fermé)
  - [ ] P&L colorisé (vert/rouge)

### Import en base
- [ ] Cliquer "Importer X trades"
- [ ] Voir le loader
- [ ] Voir le message de succès
- [ ] Être redirigé vers /trades
- [ ] Voir les trades importés

### Gestion des doublons
- [ ] Réimporter le même fichier
- [ ] Vérifier qu'il n'y a pas de doublons
- [ ] Voir le message de succès

### Erreurs
- [ ] Essayer d'uploader un fichier .txt
- [ ] Voir le message d'erreur
- [ ] Essayer sans sélectionner de compte
- [ ] Voir le blocage

## 📊 Tests Dashboard

### État vide
- [ ] Se connecter avec un nouveau compte
- [ ] Voir le message "Bienvenue"
- [ ] Cliquer "Créer un compte"
- [ ] Être redirigé vers Settings

### Avec données
- [ ] Après import, voir les KPIs :
  - [ ] Capital Total
  - [ ] P&L Aujourd'hui
  - [ ] P&L Cette Semaine
  - [ ] Win Rate
- [ ] Voir la courbe d'équité
- [ ] Voir les trades récents (5 max)
- [ ] Voir les statistiques rapides :
  - [ ] Total Trades
  - [ ] Profit Factor
  - [ ] Moyenne Gain/Perte
  - [ ] Expectancy

### Multi-comptes
- [ ] Créer un second compte
- [ ] Importer des trades dessus
- [ ] Voir le sélecteur de compte en haut
- [ ] Changer de compte
- [ ] Voir les données se mettre à jour

### Actions rapides
- [ ] Cliquer "Importer des trades" → Import
- [ ] Cliquer "Écrire dans le journal" → Journal
- [ ] Cliquer "Voir les analytics" → Analytics

## 📈 Tests Trades

### Liste vide
- [ ] Nouveau compte sans trades
- [ ] Voir "Aucun trade"
- [ ] Cliquer "Importer des trades"

### Liste avec données
- [ ] Après import, voir la table complète
- [ ] Vérifier toutes les colonnes :
  - [ ] Symbole
  - [ ] Side (badge coloré)
  - [ ] Entry
  - [ ] Exit
  - [ ] SL/TP
  - [ ] P&L (colorisé)
  - [ ] Date
  - [ ] Status (badge)

### Recherche
- [ ] Taper "MGC" dans la recherche
- [ ] Voir uniquement les trades MGC
- [ ] Effacer la recherche
- [ ] Voir tous les trades

### Tri et filtres
- [ ] Cliquer sur les en-têtes de colonnes (à implémenter)
- [ ] Tester les boutons Filtres et Export (placeholder)

## 🧮 Tests Calculator

### Sélection contrat
- [ ] Ouvrir Calculator
- [ ] Sélectionner MGC (Micro Gold)
- [ ] Voir les spécifications du contrat
- [ ] Cocher "Utiliser le micro contrat"
- [ ] Voir le changement

### Calculs
- [ ] Remplir :
  - [ ] Capital : 10000
  - [ ] Risque : 1%
  - [ ] Entry : 4080
  - [ ] Stop Loss : 4070
- [ ] Voir les résultats :
  - [ ] Nombre de contrats
  - [ ] Montant risqué (100$)
  - [ ] Points risqués (10)
  - [ ] Marge requise
  - [ ] Effet de levier

### Différents contrats
- [ ] Tester avec ES (E-mini S&P)
- [ ] Tester avec MES (Micro E-mini S&P)
- [ ] Tester avec NQ (Nasdaq)
- [ ] Tester avec CL (Crude Oil)
- [ ] Vérifier que les calculs changent

### Alertes
- [ ] Mettre un risque élevé (ex: 10%)
- [ ] Voir l'alerte si levier > 50%

## 📱 Tests Responsive

### Mobile
- [ ] Ouvrir sur mobile (ou DevTools responsive)
- [ ] Voir le bouton menu (hamburger)
- [ ] Ouvrir la sidebar mobile
- [ ] Naviguer entre les pages
- [ ] Fermer la sidebar
- [ ] Tester l'import sur mobile

### Tablet
- [ ] Tester sur tablette
- [ ] Vérifier l'affichage des grids
- [ ] Vérifier les graphiques

### Desktop
- [ ] Sidebar toujours visible
- [ ] Grids en 2-4 colonnes
- [ ] Hover states sur les cartes
- [ ] Transitions fluides

## 🎨 Tests UI/UX

### Navigation
- [ ] Cliquer sur chaque lien de la sidebar
- [ ] Voir l'item actif en surbrillance
- [ ] Logo cliquable vers dashboard
- [ ] Déconnexion fonctionnelle

### États de chargement
- [ ] Voir les skeletons sur Dashboard
- [ ] Voir le loader sur Import
- [ ] Voir le loader sur les boutons

### États vides
- [ ] Dashboard sans compte
- [ ] Trades sans données
- [ ] Import sans fichier

### Erreurs
- [ ] Voir les messages d'erreur en rouge
- [ ] Icônes d'alerte présentes
- [ ] Messages explicites

### Succès
- [ ] Message de succès après import
- [ ] Icône de validation
- [ ] Redirection automatique

## 🔍 Tests Fonctionnels

### Parsing Sierra Chart
- [ ] Uploader TradeActivityLog_2025-11-19_UTC_212156.data
- [ ] Vérifier que les trades ont :
  - [ ] Entry price correct
  - [ ] Stop Loss détecté
  - [ ] Take Profit détecté
  - [ ] Exit price (si fermé)
  - [ ] P&L calculé
  - [ ] Side correct (Long/Short)
  - [ ] Fees inclus

### Calculs de stats
- [ ] Importer plusieurs trades (wins + losses)
- [ ] Vérifier Dashboard :
  - [ ] Win Rate = (Wins / Total) * 100
  - [ ] Total P&L = somme des P&L
  - [ ] Profit Factor = Gains / |Pertes|
  - [ ] Expectancy cohérente

### Multi-utilisateurs
- [ ] Créer un second compte utilisateur
- [ ] Se connecter avec
- [ ] Vérifier qu'on ne voit pas les trades de l'autre
- [ ] Importer des trades
- [ ] Vérifier l'isolation des données

## 🚀 Tests de Performance

### Temps de chargement
- [ ] Dashboard < 2s
- [ ] Import parsing < 5s
- [ ] Trades list < 2s

### Grand volume
- [ ] Importer 100+ trades
- [ ] Vérifier que la liste scroll bien
- [ ] Vérifier que le graphique charge
- [ ] Vérifier les stats

## 🔒 Tests de Sécurité

### Accès non autorisé
- [ ] Se déconnecter
- [ ] Tenter /dashboard → Redirect login
- [ ] Tenter /trades → Redirect login
- [ ] Tenter /import → Redirect login

### RLS (Row Level Security)
- [ ] User A ne peut pas voir les trades de User B
- [ ] User A ne peut pas modifier les comptes de User B
- [ ] Les queries retournent uniquement les données du user connecté

## 📝 Checklist de Production

Avant déploiement :
- [ ] Toutes les variables d'env configurées
- [ ] Schéma SQL exécuté sur Supabase prod
- [ ] OAuth Google configuré avec redirect URI prod
- [ ] Tests sur navigateurs (Chrome, Firefox, Safari)
- [ ] Tests mobile (iOS, Android)
- [ ] Vérifier les erreurs console
- [ ] Vérifier les warnings
- [ ] Build production : `npm run build`
- [ ] Tester le build localement : `npm start`

## 🎉 Tests Finaux

- [ ] Parcours complet utilisateur :
  1. [ ] Signup
  2. [ ] Créer compte trading
  3. [ ] Importer trades
  4. [ ] Voir Dashboard
  5. [ ] Consulter Trades
  6. [ ] Utiliser Calculator
  7. [ ] Se déconnecter
  8. [ ] Se reconnecter
- [ ] Tout fonctionne sans erreur console
- [ ] Expérience fluide et intuitive
- [ ] Design cohérent et professionnel

---

**Status** : ☐ À faire | ✅ Validé | ❌ Problème

**Notes** : [Ajouter vos observations ici]
