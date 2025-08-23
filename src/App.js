import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, BarChart3, Settings, Moon, Sun, Upload, AlertTriangle, Target, Brain, BookOpen, Calculator, Download, Cloud, ChevronLeft, ChevronRight, Star, MessageSquare, DollarSign, Percent, Hash, Activity, PieChart, LineChart, Shield, CheckCircle, XCircle, AlertCircle, Users, Trophy, Award, Lock, LogIn, UserPlus, Eye, EyeOff, School, Send, Loader, Trash2 } from 'lucide-react';
import { supabase } from './supabaseClient';

const TradingJournalSupabase = () => {
  // États d'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [credentials, setCredentials] = useState({ email: '', password: '', name: '' });
  const [userRole, setUserRole] = useState('student');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  
  // États principaux
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('dashboard');
  const [trades, setTrades] = useState([]);
  const [commissions, setCommissions] = useState({
    'ES': 4.5, 'NQ': 4.5, 'YM': 4.5, 'RTY': 4.5,
    'MES': 1.5, 'MNQ': 1.5, 'MYM': 1.5, 'M2K': 1.5,
    'GC': 2.5, 'SI': 2.5, 'HG': 2.5, 'PL': 2.5,
    'MGC': 1.5, 'SIL': 1.5, 'QO': 1.5,
    'CL': 2.5, 'NG': 2.5, 'RB': 2.5, 'HO': 2.5,
    'QM': 1.5, 'QG': 1.5,
    '6E': 2.5, '6J': 2.5, '6B': 2.5, '6C': 2.5, '6A': 2.5, '6S': 2.5
  });
  const [calendarView, setCalendarView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [psychScore, setPsychScore] = useState(null);
  const [psychAnswers, setPsychAnswers] = useState({});
  const [journalEntries, setJournalEntries] = useState([]);
  const [objectives, setObjectives] = useState({ daily: 500, weekly: 2000, monthly: 8000 });
  const [riskLimit, setRiskLimit] = useState(2);
  const [showRiskAlert, setShowRiskAlert] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [capitalSettings, setCapitalSettings] = useState({
    initialCapital: 50000,
    currentCapital: 50000,
    dailyRiskPercent: 2,
    dailyRiskDollar: 1000
  });
  const [chartDateRange, setChartDateRange] = useState({ start: '', end: '' });
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newTrade, setNewTrade] = useState({
    date: new Date().toISOString().split('T')[0],
    symbol: 'ES',
    side: 'Long',
    quantity: 1,
    entry_price: 0,
    exit_price: 0,
    stop_loss: 0,
    take_profit: 0,
    comment: ''
  });

  // Questions psychologiques modifiées
  const psychQuestions = [
    { id: 'emotion', question: 'Vous sentez-vous bien émotionnellement ?' },
    { id: 'focus', question: 'Êtes-vous concentré ?' },
    { id: 'forme', question: 'Êtes vous en forme ?' },
    { id: 'detendu', question: 'Êtes-vous détendu ?' },
    { id: 'confidence', question: 'Êtes-vous confiant ?' }
  ];

  // Vérifier la session au chargement
  useEffect(() => {
    checkSession();
  }, []);

  // Charger les données quand l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadUserData(currentUser.id);
      const unsubscribe = subscribeToChat();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isAuthenticated, currentUser]);

  // Vérifier si l'utilisateur est connecté
  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setCurrentUser(session.user);
        const role = session.user.email?.includes('topmove') ? 'teacher' : 'student';
        setUserRole(role);
      }
    } catch (error) {
      console.error('Erreur session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données utilisateur depuis Supabase
  const loadUserData = async (userId) => {
    if (!userId) return;

    try {
      // Charger les trades
      const { data: tradesData } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (tradesData) {
        setTrades(tradesData);
        // Recalculer le capital avec tous les trades existants
        setTimeout(() => recalculateCapital(tradesData), 100);
      }

      // Charger le journal
      const { data: journalData } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (journalData) setJournalEntries(journalData);

      // Charger les paramètres
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (settingsData) {
        setTheme(settingsData.theme || 'dark');
        setObjectives(settingsData.objectives || { daily: 500, weekly: 2000, monthly: 8000 });
        setRiskLimit(settingsData.risk_limit || 2);
        setCapitalSettings(settingsData.capital_settings || {
          initialCapital: 50000,
          currentCapital: 50000,
          dailyRiskPercent: 2,
          dailyRiskDollar: 1000
        });
        if (settingsData.commissions) setCommissions(settingsData.commissions);
      }

      // Charger les messages du chat
      const { data: chatData } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (chatData) {
        setChatMessages(chatData.map(msg => ({
          ...msg,
          isOwn: msg.user_id === userId,
          time: new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        })));
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  // S'abonner aux messages du chat en temps réel
  const subscribeToChat = () => {
    const channel = supabase
      .channel('chat')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = {
            ...payload.new,
            isOwn: payload.new.user_id === currentUser?.id,
            time: new Date(payload.new.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Gestion de l'authentification
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        if (error) throw error;
        
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setUserRole(data.user.email?.includes('topmove') ? 'teacher' : 'student');
        
      } else {
        // Inscription
        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              name: credentials.name
            }
          }
        });

        if (error) throw error;
        
        if (data.user) {
          setIsAuthenticated(true);
          setCurrentUser(data.user);
          setUserRole('student');
          setAuthError('Compte créé ! Vérifiez votre email pour confirmer.');
        }
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setTrades([]);
    setJournalEntries([]);
    setChatMessages([]);
  };

  // Envoyer un message dans le chat
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: currentUser.id,
          user_name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0],
          message: newMessage,
          avatar: '🧑‍💼'
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  // Sauvegarder une entrée de journal
  const saveJournalEntry = async (content) => {
    if (!currentUser || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: currentUser.id,
          content: content
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setJournalEntries(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error('Erreur sauvegarde journal:', error);
    }
  };

  // Mettre à jour un trade
  const updateTrade = async (tradeId, updates) => {
    try {
      const { error } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', tradeId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      // Mettre à jour localement
      setTrades(prev => prev.map(t => 
        t.id === tradeId ? { ...t, ...updates } : t
      ));
    } catch (error) {
      console.error('Erreur mise à jour trade:', error);
    }
  };

  // Supprimer un trade
  const deleteTrade = async (tradeId) => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      // Mettre à jour localement
      setTrades(prev => prev.filter(t => t.id !== tradeId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur suppression trade:', error);
    }
  };

  // Sauvegarder les paramètres
  const saveSettings = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          id: currentUser.id,
          theme: theme,
          objectives: objectives,
          risk_limit: riskLimit,
          capital_settings: capitalSettings,
          commissions: commissions,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
    }
  };

  // Ajouter un trade manuellement
  const addTradeManually = async () => {
    try {
      // Calculer le P&L
      let pnl = 0;
      if (newTrade.exit_price && newTrade.entry_price) {
        const isLong = newTrade.side === 'Long';
        const priceDiff = newTrade.exit_price - newTrade.entry_price;
        
        // Déterminer la valeur du point selon l'instrument
        let pointValue = 50; // Par défaut pour ES
        const symbol = newTrade.symbol;
        
        if (symbol.startsWith('MGC')) pointValue = 10;
        else if (symbol.startsWith('GC')) pointValue = 100;
        else if (symbol.startsWith('MES')) pointValue = 5;
        else if (symbol.startsWith('ES')) pointValue = 50;
        else if (symbol.startsWith('MNQ')) pointValue = 2;
        else if (symbol.startsWith('NQ')) pointValue = 20;
        else if (symbol.startsWith('MYM')) pointValue = 0.5;
        else if (symbol.startsWith('YM')) pointValue = 5;
        else if (symbol.startsWith('M2K')) pointValue = 5;
        else if (symbol.startsWith('RTY')) pointValue = 50;
        else if (symbol.startsWith('CL')) pointValue = 1000;
        else if (symbol.startsWith('QM')) pointValue = 500;
        
        const multiplier = isLong ? 1 : -1;
        const pnlBrut = priceDiff * multiplier * pointValue * newTrade.quantity;
        const commission = commissions[symbol] || 0;
        pnl = pnlBrut - commission;
      }

      const tradeToAdd = {
        ...newTrade,
        pnl: pnl,
        user_id: currentUser.id,
        entry_price: parseFloat(newTrade.entry_price) || 0,
        exit_price: parseFloat(newTrade.exit_price) || null,
        stop_loss: parseFloat(newTrade.stop_loss) || null,
        take_profit: parseFloat(newTrade.take_profit) || null,
        quantity: parseInt(newTrade.quantity) || 1
      };

      const { data, error } = await supabase
        .from('trades')
        .insert(tradeToAdd)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setTrades(prev => [data, ...prev]);
        setShowAddTradeModal(false);
        // Réinitialiser le formulaire
        setNewTrade({
          date: new Date().toISOString().split('T')[0],
          symbol: 'ES',
          side: 'Long',
          quantity: 1,
          entry_price: 0,
          exit_price: 0,
          stop_loss: 0,
          take_profit: 0,
          comment: ''
        });
      }
    } catch (error) {
      console.error('Erreur ajout trade:', error);
      alert(`Erreur lors de l'ajout du trade: ${error.message}`);
    }
  };

  // Réinitialiser tous les trades
  const resetAllTrades = async () => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      setTrades([]);
      setShowResetConfirm(false);
      
      // Réinitialiser le capital
      setCapitalSettings(prev => ({
        ...prev,
        currentCapital: prev.initialCapital
      }));
      
      alert('Tous les trades ont été supprimés');
    } catch (error) {
      console.error('Erreur suppression trades:', error);
      alert(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  // Gestion de l'import CSV avec sauvegarde Supabase
  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target.result;
        console.log('Contenu du fichier (premiers 300 caractères):', content.substring(0, 300));
        
        if (!content || content.trim() === '') {
          alert('Le fichier est vide');
          return;
        }

        // Détecter si c'est un fichier d'ordres de trading
        const isOrdersFile = content.includes('Entry Time') && content.includes('Internal Order ID') && content.includes('Buy/Sell');
        
        if (isOrdersFile) {
          console.log('Fichier d\'ordres détecté - traitement spécialisé');
          await handleOrdersFileImport(content);
        } else {
          console.log('Fichier CSV standard détecté');
          await handleStandardCSVImport(content);
        }
        
      } catch (error) {
        console.error('Erreur import:', error);
        alert(`Erreur lors de l'import: ${error.message}`);
      }
    };
    
    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier');
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  // Traitement spécialisé pour les fichiers d'ordres CORRIGÉ
  const handleOrdersFileImport = async (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      alert('Fichier d\'ordres vide');
      return;
    }

    console.log('Nombre de lignes d\'ordres:', lines.length);
    console.log('Première ligne (header):', lines[0]);

    // Parser les ordres
    const orders = [];
    
    // Récupérer les headers
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('Headers CSV:', headers);
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      
      if (values.length < 15) {
        console.warn(`Ligne ${i} trop courte (${values.length} valeurs), ignorée`);
        continue;
      }
      
      try {
        const order = {
          entryTime: values[0],
          lastActivityTime: values[1],
          symbol: values[2],
          status: values[3],
          internalOrderId: values[4],
          orderType: values[5],
          buySell: values[6],
          openClose: values[7],
          orderQuantity: parseInt(values[8]) || 0,
          price: parseFloat(values[9]) || 0,
          price2: parseFloat(values[10]) || 0,
          filledQuantity: parseInt(values[11]) || 0,
          avgFillPrice: parseFloat(values[12]) || 0,
          parentInternalOrderId: values[13],
          lineIndex: i
        };
        
        orders.push(order);
        
      } catch (e) {
        console.error(`Erreur parsing ligne ${i}:`, e);
      }
    }

    console.log('Total ordres parsés:', orders.length);

    // Utiliser la nouvelle fonction de groupement améliorée
    const trades = groupOrdersIntoTradesImproved(orders);
    
    if (trades.length === 0) {
      console.error('Aucun trade créé - vérifiez les critères de groupement');
      alert('Aucun trade complet trouvé dans les ordres');
      return;
    }

    console.log(`${trades.length} trades créés avec succès`);

    // Sauvegarder dans Supabase
    const { data, error } = await supabase
      .from('trades')
      .insert(trades)
      .select();

    if (error) {
      console.error('Erreur Supabase:', error);
      alert(`Erreur lors de la sauvegarde: ${error.message}`);
      return;
    }
    
    if (data) {
      setTrades(prev => [...data, ...prev]);
      alert(`${data.length} trade(s) importé(s) avec succès !`);
    }
  };

  // NOUVELLE FONCTION DE GROUPEMENT AMÉLIORÉE
  const groupOrdersIntoTradesImproved = (orders) => {
    const trades = [];
    const processedOrders = new Set();
    
    console.log('\n=== NOUVELLE STRATÉGIE DE GROUPEMENT ===');
    
    // Trier les ordres par temps
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(a.entryTime) - new Date(b.entryTime)
    );
    
    // Stratégie: Pour chaque ordre d'entrée (Open + Filled), chercher les ordres associés
    sortedOrders.forEach(order => {
      // Si déjà traité, passer
      if (processedOrders.has(order.internalOrderId)) return;
      
      // Chercher uniquement les ordres d'entrée
      if (order.openClose === 'Open' && order.status === 'Filled' && order.filledQuantity > 0) {
        console.log(`\n--- Traitement de l'entrée ${order.internalOrderId} ---`);
        
        // Marquer comme traité
        processedOrders.add(order.internalOrderId);
        
        // Collecter tous les ordres liés
        const relatedOrders = [order];
        
        // 1. Trouver les ordres avec le même parent
        if (order.parentInternalOrderId === '0' || order.parentInternalOrderId === order.internalOrderId) {
          // C'est un ordre parent, chercher ses enfants
          const children = sortedOrders.filter(o => 
            o.parentInternalOrderId === order.internalOrderId && 
            o.internalOrderId !== order.internalOrderId &&
            !processedOrders.has(o.internalOrderId)
          );
          relatedOrders.push(...children);
          children.forEach(c => processedOrders.add(c.internalOrderId));
        }
        
        // 2. Chercher les ordres de clôture proches dans le temps (dans les 5 minutes)
        const entryTime = new Date(order.entryTime);
        const timeWindow = 5 * 60 * 1000; // 5 minutes
        
        const closeOrders = sortedOrders.filter(o => {
          if (processedOrders.has(o.internalOrderId)) return false;
          if (o.openClose !== 'Close') return false;
          if (o.symbol !== order.symbol) return false;
          
          const closeTime = new Date(o.entryTime);
          const timeDiff = Math.abs(closeTime - entryTime);
          
          // Chercher les ordres de clôture dans la fenêtre de temps
          return timeDiff <= timeWindow;
        });
        
        // Trouver l'ordre de sortie le plus probable (Filled et même quantité)
        let exitOrder = closeOrders.find(o => 
          o.status === 'Filled' && 
          o.filledQuantity === order.filledQuantity &&
          o.buySell !== order.buySell // Buy close pour un Sell open et vice versa
        );
        
        // Si pas trouvé avec même quantité, chercher n'importe quel ordre de sortie Filled
        if (!exitOrder) {
          exitOrder = closeOrders.find(o => 
            o.status === 'Filled' && 
            o.filledQuantity > 0
          );
        }
        
        if (exitOrder) {
          relatedOrders.push(exitOrder);
          processedOrders.add(exitOrder.internalOrderId);
        }
        
        // Ajouter les autres ordres de clôture (SL, TP)
        closeOrders.forEach(o => {
          if (!processedOrders.has(o.internalOrderId) && o !== exitOrder) {
            relatedOrders.push(o);
            processedOrders.add(o.internalOrderId);
          }
        });
        
        console.log(`Ordres liés trouvés: ${relatedOrders.length}`);
        relatedOrders.forEach(o => {
          console.log(`  - ${o.internalOrderId}: ${o.status} ${o.orderType} ${o.buySell} ${o.openClose}`);
        });
        
        // Créer le trade à partir des ordres liés
        const trade = createTradeFromOrders(order, relatedOrders);
        if (trade) {
          trades.push(trade);
          console.log('✅ Trade créé avec succès');
        }
      }
    });
    
    // Traiter les ordres de clôture orphelins (ceux qui n'ont pas été associés)
    sortedOrders.forEach(order => {
      if (!processedOrders.has(order.internalOrderId) && 
          order.openClose === 'Close' && 
          order.status === 'Filled' && 
          order.filledQuantity > 0) {
        
        console.log(`\n--- Ordre de clôture orphelin ${order.internalOrderId} ---`);
        
        // Créer un trade avec seulement la sortie (pour les positions overnight)
        const trade = {
          date: new Date(order.entryTime).toISOString(),
          symbol: order.symbol.replace(/\.(COMEX|NYMEX|CBOT|CME)$/, ''),
          side: order.buySell === 'Buy' ? 'Short' : 'Long', // Inverse car c'est une clôture
          quantity: order.filledQuantity,
          entry_price: null,
          exit_price: order.avgFillPrice,
          stop_loss: null,
          take_profit: null,
          pnl: 0,
          rating: null,
          comment: `Import: Clôture seule (Order: ${order.internalOrderId})`,
          grouped: false,
          execution_time: order.entryTime,
          user_id: currentUser.id
        };
        
        trades.push(trade);
        processedOrders.add(order.internalOrderId);
      }
    });
    
    console.log(`\n=== RÉSULTAT FINAL: ${trades.length} trade(s) créé(s) ===`);
    return trades;
  };

  // Fonction helper pour créer un trade à partir d'un groupe d'ordres
  const createTradeFromOrders = (entryOrder, relatedOrders) => {
    // Identifier les différents types d'ordres
    const exitOrder = relatedOrders.find(o => 
      o.openClose === 'Close' && 
      o.status === 'Filled' && 
      o.filledQuantity > 0
    );
    
    const stopOrder = relatedOrders.find(o => 
      o.orderType === 'Stop' && 
      o.openClose === 'Close'
    );
    
    const limitOrder = relatedOrders.find(o => 
      o.orderType === 'Limit' && 
      o.openClose === 'Close'
    );
    
    // Calculer le P&L
    let pnl = 0;
    if (exitOrder && entryOrder) {
      const isLong = entryOrder.buySell === 'Buy';
      const entryPrice = entryOrder.avgFillPrice;
      const exitPrice = exitOrder.avgFillPrice;
      const quantity = entryOrder.filledQuantity;
      
      const priceDiff = exitPrice - entryPrice;
      const symbol = entryOrder.symbol.replace(/\.(COMEX|NYMEX|CBOT|CME)$/, '');
      
      let pointValue = 1;
      
      // Déterminer la valeur du point selon l'instrument
      if (symbol.startsWith('MGC')) pointValue = 10;
      else if (symbol.startsWith('GC')) pointValue = 100;
      else if (symbol.startsWith('MES')) pointValue = 5;
      else if (symbol.startsWith('ES')) pointValue = 50;
      else if (symbol.startsWith('MNQ')) pointValue = 2;
      else if (symbol.startsWith('NQ')) pointValue = 20;
      else if (symbol.startsWith('MYM')) pointValue = 0.5;
      else if (symbol.startsWith('YM')) pointValue = 5;
      else if (symbol.startsWith('M2K')) pointValue = 5;
      else if (symbol.startsWith('RTY')) pointValue = 50;
      else if (symbol.startsWith('CL')) pointValue = 1000;
      else if (symbol.startsWith('QM')) pointValue = 500;
      else if (symbol.startsWith('NG')) pointValue = 10000;
      else if (symbol.startsWith('QG')) pointValue = 2500;
      else if (symbol.startsWith('SI')) pointValue = 5000;
      else if (symbol.startsWith('SIL')) pointValue = 1000;
      else if (symbol.startsWith('HG')) pointValue = 25000;
      else if (symbol.startsWith('PL')) pointValue = 50;
      else if (symbol.startsWith('6E')) pointValue = 125000;
      else if (symbol.startsWith('6J')) pointValue = 12500000;
      else if (symbol.startsWith('6B')) pointValue = 62500;
      else if (symbol.startsWith('6C')) pointValue = 100000;
      else if (symbol.startsWith('6A')) pointValue = 100000;
      else if (symbol.startsWith('6S')) pointValue = 125000;
      
      const multiplier = isLong ? 1 : -1;
      const pnlBrut = priceDiff * multiplier * pointValue * quantity;
      
      // Soustraction des commissions
      const baseSymbol = symbol.replace(/[Z,H,M,U]\d+$/, '');
      const commission = commissions[baseSymbol] || commissions[symbol] || 0;
      pnl = pnlBrut - commission;
      
      console.log('Calcul P&L détaillé:', {
        symbol,
        entryPrice,
        exitPrice,
        priceDiff,
        pointValue,
        isLong,
        quantity,
        pnlBrut,
        commission,
        pnlNet: pnl
      });
    }
    
    const trade = {
      date: new Date(entryOrder.entryTime).toISOString(),
      symbol: entryOrder.symbol.replace(/\.(COMEX|NYMEX|CBOT|CME)$/, ''),
      side: entryOrder.buySell === 'Buy' ? 'Long' : 'Short',
      quantity: entryOrder.filledQuantity,
      entry_price: entryOrder.avgFillPrice,
      exit_price: exitOrder ? exitOrder.avgFillPrice : null,
      stop_loss: stopOrder ? stopOrder.price : null,
      take_profit: limitOrder ? limitOrder.price : null,
      pnl: Math.round(pnl * 100) / 100,
      rating: null,
      comment: `Import: Entry ${entryOrder.internalOrderId}${exitOrder ? `, Exit ${exitOrder.internalOrderId}` : ''}`,
      grouped: false,
      execution_time: entryOrder.entryTime,
      user_id: currentUser.id
    };
    
    return trade;
  };

  // Traitement CSV standard (comme avant)
  const handleStandardCSVImport = async (csv) => {
    const lines = csv.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      alert('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
      return;
    }

    const separator = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(separator).map(h => h.trim());
    console.log('En-têtes CSV détectés:', headers);
    
    const newTrades = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = line.split(separator).map(v => v.trim());
      
      if (values.length < 3) continue;
      
      const trade = {};
      headers.forEach((header, idx) => {
        trade[header] = values[idx] || '';
      });
      
      const mappedTrade = {
        date: trade.Date || trade.date || trade.Timestamp || new Date().toISOString(),
        symbol: trade.Symbol || trade.symbol || trade.Instrument || 'ES',
        side: trade.Side || trade.side || trade.Direction || 'Long',
        quantity: parseInt(trade.Quantity || trade.quantity || trade.Size || trade.Qty || '1') || 1,
        entry_price: parseFloat(trade.EntryPrice || trade.entry_price || trade.Entry || trade.Fill || '0') || 0,
        exit_price: parseFloat(trade.ExitPrice || trade.exit_price || trade.Exit || '0') || 0,
        stop_loss: parseFloat(trade.StopLoss || trade.stop_loss || trade.SL || trade.sl || '0') || null,
        take_profit: parseFloat(trade.TakeProfit || trade.take_profit || trade.TP || trade.tp || '0') || null,
        pnl: parseFloat(trade.PnL || trade.pnl || trade.PL || trade.Profit || '0') || 0,
        rating: null,
        comment: trade.Comment || trade.comment || '',
        grouped: false,
        execution_time: trade.ExecutionTime || trade.execution_time || trade.Time || new Date().toISOString(),
        user_id: currentUser.id
      };
      
      if (mappedTrade.stop_loss === 0) mappedTrade.stop_loss = null;
      if (mappedTrade.take_profit === 0) mappedTrade.take_profit = null;
      
      newTrades.push(mappedTrade);
    }

    if (newTrades.length === 0) {
      alert('Aucun trade valide trouvé dans le fichier CSV');
      return;
    }

    // Sauvegarder dans Supabase
    const { data, error } = await supabase
      .from('trades')
      .insert(newTrades)
      .select();

    if (error) {
      console.error('Erreur Supabase:', error);
      alert(`Erreur lors de la sauvegarde: ${error.message}`);
      return;
    }
    
    if (data) {
      setTrades(prev => [...data, ...prev]);
      alert(`${data.length} trades importés avec succès !`);
    }
  };
  // Métriques de trading
  const metrics = useMemo(() => {
    if (trades.length === 0) return {
      totalPL: 0, winRate: 0, avgRR: 0, profitFactor: 0,
      maxDrawdown: 0, avgWin: 0, avgLoss: 0, totalTrades: 0,
      winStreak: 0, lossStreak: 0, expectancy: 0
    };

    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const totalPL = trades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
    
    let cumulative = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    trades.forEach(t => {
      cumulative += parseFloat(t.pnl || 0);
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;

      if (t.pnl > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else {
        currentLossStreak++;
        currentWinStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
      }
    });

    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0) / losses.length) : 0;
    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
    const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;
    const profitFactor = losses.length > 0 ? 
      wins.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0) / Math.abs(losses.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0)) : 0;
    const expectancy = (winRate / 100 * avgWin) - ((100 - winRate) / 100 * avgLoss);

    return {
      totalPL, winRate, avgRR, profitFactor, maxDrawdown,
      avgWin, avgLoss, totalTrades: trades.length,
      winStreak: maxWinStreak, lossStreak: maxLossStreak, expectancy
    };
  }, [trades]);

  // Achievements système
  const checkAchievements = () => {
    const newAchievements = [];
    
    // Achievements de progression
    if (trades.length >= 10) newAchievements.push({ id: 'first10', name: 'Premiers Pas', icon: '🎯', desc: '10 trades complétés' });
    if (trades.length >= 50) newAchievements.push({ id: 'trader50', name: 'Trader Régulier', icon: '📈', desc: '50 trades complétés' });
    if (trades.length >= 100) newAchievements.push({ id: 'centurion', name: 'Centurion', icon: '💯', desc: '100 trades complétés' });
    
    // Achievements d'analyse
    if (trades.filter(t => t.rating).length >= 20) newAchievements.push({ id: 'analyst20', name: 'Analyste Junior', icon: '🔍', desc: '20 trades notés' });
    if (trades.filter(t => t.comment).length >= 30) newAchievements.push({ id: 'commentator', name: 'Commentateur', icon: '💭', desc: '30 trades commentés' });
    
    // Achievements de discipline
    if (journalEntries.length >= 10) newAchievements.push({ id: 'writer10', name: 'Diariste', icon: '📓', desc: '10 entrées journal' });
    if (journalEntries.length >= 30) newAchievements.push({ id: 'writer30', name: 'Écrivain', icon: '✏️', desc: '30 entrées journal' });
    
    // Achievements de mentalité
    if (psychScore > 4) newAchievements.push({ id: 'zenmaster', name: 'Maître Zen', icon: '🧘', desc: 'Score mental parfait' });
    if (psychAnswers && Object.keys(psychAnswers).length >= 5) newAchievements.push({ id: 'selfaware', name: 'Conscience de Soi', icon: '🪞', desc: 'Auto-évaluation régulière' });
    
    // Achievements de communauté
    if (chatMessages.filter(m => m.isOwn).length >= 5) newAchievements.push({ id: 'social5', name: 'Membre Actif', icon: '💬', desc: '5 messages envoyés' });
    if (chatMessages.filter(m => m.isOwn).length >= 20) newAchievements.push({ id: 'social20', name: 'Pilier Communauté', icon: '🤝', desc: '20 messages envoyés' });
    
    // Achievements de constance
    const tradeDates = [...new Set(trades.map(t => new Date(t.date).toDateString()))];
    if (tradeDates.length >= 5) newAchievements.push({ id: 'consistent5', name: 'Constance', icon: '📅', desc: 'Tradé 5 jours différents' });
    if (tradeDates.length >= 20) newAchievements.push({ id: 'consistent20', name: 'Persévérant', icon: '🎖️', desc: 'Tradé 20 jours différents' });
    
    setAchievements(newAchievements);
  };

  // Check achievements quand les données changent
  useEffect(() => {
    if (isAuthenticated) {
      checkAchievements();
    }
  }, [trades, journalEntries, chatMessages, psychScore, isAuthenticated]);

  // Calcul du score psychologique
  useEffect(() => {
    const answers = Object.values(psychAnswers);
    if (answers.length === psychQuestions.length) {
      const score = answers.reduce((a, b) => a + b, 0) / answers.length;
      setPsychScore(score);
    }
  }, [psychAnswers, psychQuestions.length]);

  // Sauvegarder les paramètres quand ils changent
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const timeoutId = setTimeout(() => {
        saveSettings();
      }, 1000); // Debounce de 1 seconde
      
      return () => clearTimeout(timeoutId);
    }
  }, [theme, objectives, riskLimit, commissions, capitalSettings]);

  // Mettre à jour les dates du graphique quand les trades changent
  useEffect(() => {
    if (trades.length > 0 && (!chartDateRange.start || !chartDateRange.end)) {
      const dates = trades.map(t => new Date(t.date)).sort((a, b) => a - b);
      setChartDateRange({
        start: dates[0].toISOString().split('T')[0],
        end: dates[dates.length - 1].toISOString().split('T')[0]
      });
    }
  }, [trades]);

  // Fonction pour mettre à jour le capital avec les nouveaux trades
  const updateCapitalWithTrades = (newTrades) => {
    const totalPnL = newTrades.reduce((sum, trade) => sum + (parseFloat(trade.pnl) || 0), 0);
    setCapitalSettings(prev => ({
      ...prev,
      currentCapital: prev.currentCapital + totalPnL
    }));
  };

  // Fonction pour recalculer le capital total basé sur tous les trades
  const recalculateCapital = (allTrades) => {
    const totalPnL = allTrades.reduce((sum, trade) => sum + (parseFloat(trade.pnl) || 0), 0);
    setCapitalSettings(prev => ({
      ...prev,
      currentCapital: prev.initialCapital + totalPnL
    }));
    console.log('Capital recalculé:', {
      initial: capitalSettings.initialCapital,
      totalPnL,
      current: capitalSettings.initialCapital + totalPnL
    });
  };

  // Fonctions helper
  const checkRiskExposure = (tradesToCheck) => {
    const openTrades = tradesToCheck.filter(t => !t.exit_price);
    const exposure = openTrades.reduce((sum, t) => sum + Math.abs(t.quantity * t.entry_price), 0);
    const accountSize = 100000;
    const exposurePercent = (exposure / accountSize) * 100;
    
    if (exposurePercent > riskLimit) {
      setShowRiskAlert(true);
      setTimeout(() => setShowRiskAlert(false), 5000);
    }
  };

  const calculatePositionSize = (accountSize, riskPercent, stopLoss) => {
    return Math.floor((accountSize * (riskPercent / 100)) / stopLoss);
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 1) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getDayPL = (date) => {
    return trades
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.toDateString() === date.toDateString();
      })
      .reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
  };

  const getDayTradeCount = (date) => {
    return trades.filter(t => {
      const tDate = new Date(t.date);
      return tDate.toDateString() === date.toDateString();
    }).length;
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi = début de semaine
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date) => {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  };

  const getWeekDays = (date) => {
    const start = getWeekStart(date);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getWeekPL = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return trades
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate >= weekStart && tDate <= weekEnd;
      })
      .reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
  };

  const getWeekTradeCount = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return trades.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= weekStart && tDate <= weekEnd;
    }).length;
  };

  const getMonthPL = (date) => {
    return trades
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
  };

  const getMonthTradeCount = (date) => {
    return trades.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
    }).length;
  };

  const getYearPL = (date) => {
    return trades
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
  };

  const getYearTradeCount = (date) => {
    return trades.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === date.getFullYear();
    }).length;
  };

  const exportFiscal = () => {
    const csvContent = trades.map(t => 
      `${t.date},${t.symbol},${t.side},${t.quantity},${t.entry_price},${t.stop_loss || ''},${t.take_profit || ''},${t.exit_price},${t.pnl},${commissions[t.symbol] || 0}`
    ).join('\n');
    
    const blob = new Blob([`Date,Symbol,Side,Qty,Entry,SL,TP,Exit,P&L,Commission\n${csvContent}`], 
      { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades_fiscal_${new Date().getFullYear()}.csv`;
    a.click();
  };

  // Fonction pour obtenir les données de P&L journalier avec auto-scaling
  const getDailyPLData = () => {
    const dailyData = {};
    
    trades.forEach(trade => {
      const date = new Date(trade.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      if (!dailyData[date]) {
        dailyData[date] = 0;
      }
      dailyData[date] += parseFloat(trade.pnl || 0);
    });

    const sortedData = Object.entries(dailyData)
      .sort(([dateA], [dateB]) => {
        const [dayA, monthA] = dateA.split('/');
        const [dayB, monthB] = dateB.split('/');
        return new Date(`${monthA}/${dayA}`) - new Date(`${monthB}/${dayB}`);
      })
      .slice(-30); // Derniers 30 jours

    return sortedData;
  };

  // Fonction pour obtenir les données R
  const getRData = () => {
    const filteredTrades = trades.filter(trade => {
      if (!chartDateRange.start || !chartDateRange.end) return true;
      const tradeDate = new Date(trade.date).toISOString().split('T')[0];
      return tradeDate >= chartDateRange.start && tradeDate <= chartDateRange.end;
    });

    const dailyRisk = capitalSettings.dailyRiskDollar || 
      (capitalSettings.initialCapital * capitalSettings.dailyRiskPercent / 100);

    return filteredTrades.map(trade => ({
      date: new Date(trade.date).toLocaleDateString('fr-FR'),
      r: (parseFloat(trade.pnl) || 0) / dailyRisk,
      cumR: 0 // Will be calculated below
    })).sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item, index, array) => ({
        ...item,
        cumR: array.slice(0, index + 1).reduce((sum, t) => sum + t.r, 0)
      }));
  };

  // Fonction pour obtenir les données d'évolution du capital
  const getCapitalData = () => {
    const filteredTrades = trades.filter(trade => {
      if (!chartDateRange.start || !chartDateRange.end) return true;
      const tradeDate = new Date(trade.date).toISOString().split('T')[0];
      return tradeDate >= chartDateRange.start && tradeDate <= chartDateRange.end;
    });

    let runningCapital = capitalSettings.initialCapital;
    return filteredTrades.sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(trade => {
        runningCapital += parseFloat(trade.pnl) || 0;
        return {
          date: new Date(trade.date).toLocaleDateString('fr-FR'),
          capital: runningCapital
        };
      });
  };

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

  // Écran de chargement
  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} ${textClass} flex items-center justify-center`}>
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 mx-auto mb-4" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  // Page de connexion
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${bgClass} ${textClass} flex items-center justify-center p-4`}>
        <div className={`${cardClass} rounded-2xl p-8 max-w-md w-full border ${borderClass} shadow-2xl`}>
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">TM</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold">TopMove Trading</h1>
            <p className="text-sm opacity-70">École de Trading Professionnelle</p>
          </div>

          {/* Message d'erreur */}
          {authError && (
            <div className={`mb-4 p-3 rounded-lg ${authError.includes('créé') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {authError}
            </div>
          )}

          {/* Formulaire */}
          <div className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="text-sm opacity-70">Nom complet</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-3 size-4 opacity-50" />
                  <input
                    type="text"
                    value={credentials.name}
                    onChange={(e) => setCredentials({...credentials, name: e.target.value})}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm opacity-70">Email</label>
              <div className="relative">
                <School className="absolute left-3 top-3 size-4 opacity-50" />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  className={`w-full pl-10 pr-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  placeholder="eleve@email.com"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm opacity-70">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 size-4 opacity-50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className={`w-full pl-10 pr-10 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  placeholder="••••••••"
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth(e)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? <EyeOff size={16} className="opacity-50" /> : <Eye size={16} className="opacity-50" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Chargement...' : (authMode === 'login' ? 'Se connecter' : "S'inscrire")}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError('');
              }}
              className="text-sm text-blue-400 hover:underline"
            >
              {authMode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
            <p className="text-xs text-center">
              📚 Réservé aux élèves de TopMove Trading
            </p>
            <p className="text-xs text-center mt-1 opacity-70">
              Données synchronisées sur tous vos appareils
            </p>
          </div>
        </div>
      </div>
    );
  }import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, BarChart3, Settings, Moon, Sun, Upload, AlertTriangle, Target, Brain, BookOpen, Calculator, Download, Cloud, ChevronLeft, ChevronRight, Star, MessageSquare, DollarSign, Percent, Hash, Activity, PieChart, LineChart, Shield, CheckCircle, XCircle, AlertCircle, Users, Trophy, Award, Lock, LogIn, UserPlus, Eye, EyeOff, School, Send, Loader, Trash2 } from 'lucide-react';
import { supabase } from './supabaseClient';

const TradingJournalSupabase = () => {
  // États d'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [credentials, setCredentials] = useState({ email: '', password: '', name: '' });
  const [userRole, setUserRole] = useState('student');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  
  // États principaux
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('dashboard');
  const [trades, setTrades] = useState([]);
  const [commissions, setCommissions] = useState({
    'ES': 4.5, 'NQ': 4.5, 'YM': 4.5, 'RTY': 4.5,
    'MES': 1.5, 'MNQ': 1.5, 'MYM': 1.5, 'M2K': 1.5,
    'GC': 2.5, 'SI': 2.5, 'HG': 2.5, 'PL': 2.5,
    'MGC': 1.5, 'SIL': 1.5, 'QO': 1.5,
    'CL': 2.5, 'NG': 2.5, 'RB': 2.5, 'HO': 2.5,
    'QM': 1.5, 'QG': 1.5,
    '6E': 2.5, '6J': 2.5, '6B': 2.5, '6C': 2.5, '6A': 2.5, '6S': 2.5
  });
  const [calendarView, setCalendarView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [psychScore, setPsychScore] = useState(null);
  const [psychAnswers, setPsychAnswers] = useState({});
  const [journalEntries, setJournalEntries] = useState([]);
  const [objectives, setObjectives] = useState({ daily: 500, weekly: 2000, monthly: 8000 });
  const [riskLimit, setRiskLimit] = useState(2);
  const [showRiskAlert, setShowRiskAlert] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [capitalSettings, setCapitalSettings] = useState({
    initialCapital: 50000,
    currentCapital: 50000,
    dailyRiskPercent: 2,
    dailyRiskDollar: 1000
  });
  const [chartDateRange, setChartDateRange] = useState({ start: '', end: '' });
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newTrade, setNewTrade] = useState({
    date: new Date().toISOString().split('T')[0],
    symbol: 'ES',
    side: 'Long',
    quantity: 1,
    entry_price: 0,
    exit_price: 0,
    stop_loss: 0,
    take_profit: 0,
    comment: ''
  });

  // Questions psychologiques modifiées
  const psychQuestions = [
    { id: 'emotion', question: 'Vous sentez-vous bien émotionnellement ?' },
    { id: 'focus', question: 'Êtes-vous concentré ?' },
    { id: 'forme', question: 'Êtes vous en forme ?' },
    { id: 'detendu', question: 'Êtes-vous détendu ?' },
    { id: 'confidence', question: 'Êtes-vous confiant ?' }
  ];

  // Vérifier la session au chargement
  useEffect(() => {
    checkSession();
  }, []);

  // Charger les données quand l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadUserData(currentUser.id);
      const unsubscribe = subscribeToChat();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isAuthenticated, currentUser]);

  // Vérifier si l'utilisateur est connecté
  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setCurrentUser(session.user);
        const role = session.user.email?.includes('topmove') ? 'teacher' : 'student';
        setUserRole(role);
      }
    } catch (error) {
      console.error('Erreur session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données utilisateur depuis Supabase
  const loadUserData = async (userId) => {
    if (!userId) return;

    try {
      // Charger les trades
      const { data: tradesData } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (tradesData) {
        setTrades(tradesData);
        // Recalculer le capital avec tous les trades existants
        setTimeout(() => recalculateCapital(tradesData), 100);
      }

      // Charger le journal
      const { data: journalData } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (journalData) setJournalEntries(journalData);

      // Charger les paramètres
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (settingsData) {
        setTheme(settingsData.theme || 'dark');
        setObjectives(settingsData.objectives || { daily: 500, weekly: 2000, monthly: 8000 });
        setRiskLimit(settingsData.risk_limit || 2);
        setCapitalSettings(settingsData.capital_settings || {
          initialCapital: 50000,
          currentCapital: 50000,
          dailyRiskPercent: 2,
          dailyRiskDollar: 1000
        });
        if (settingsData.commissions) setCommissions(settingsData.commissions);
      }

      // Charger les messages du chat
      const { data: chatData } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (chatData) {
        setChatMessages(chatData.map(msg => ({
          ...msg,
          isOwn: msg.user_id === userId,
          time: new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        })));
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  // S'abonner aux messages du chat en temps réel
  const subscribeToChat = () => {
    const channel = supabase
      .channel('chat')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = {
            ...payload.new,
            isOwn: payload.new.user_id === currentUser?.id,
            time: new Date(payload.new.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Gestion de l'authentification
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        if (error) throw error;
        
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setUserRole(data.user.email?.includes('topmove') ? 'teacher' : 'student');
        
      } else {
        // Inscription
        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              name: credentials.name
            }
          }
        });

        if (error) throw error;
        
        if (data.user) {
          setIsAuthenticated(true);
          setCurrentUser(data.user);
          setUserRole('student');
          setAuthError('Compte créé ! Vérifiez votre email pour confirmer.');
        }
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setTrades([]);
    setJournalEntries([]);
    setChatMessages([]);
  };

  // Envoyer un message dans le chat
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: currentUser.id,
          user_name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0],
          message: newMessage,
          avatar: '🧑‍💼'
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  // Sauvegarder une entrée de journal
  const saveJournalEntry = async (content) => {
    if (!currentUser || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: currentUser.id,
          content: content
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setJournalEntries(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error('Erreur sauvegarde journal:', error);
    }
  };

  // Mettre à jour un trade
  const updateTrade = async (tradeId, updates) => {
    try {
      const { error } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', tradeId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      // Mettre à jour localement
      setTrades(prev => prev.map(t => 
        t.id === tradeId ? { ...t, ...updates } : t
      ));
    } catch (error) {
      console.error('Erreur mise à jour trade:', error);
    }
  };

  // Supprimer un trade
  const deleteTrade = async (tradeId) => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      // Mettre à jour localement
      setTrades(prev => prev.filter(t => t.id !== tradeId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur suppression trade:', error);
    }
  };

  // Sauvegarder les paramètres
  const saveSettings = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          id: currentUser.id,
          theme: theme,
          objectives: objectives,
          risk_limit: riskLimit,
          capital_settings: capitalSettings,
          commissions: commissions,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
    }
  };

  // Ajouter un trade manuellement
  const addTradeManually = async () => {
    try {
      // Calculer le P&L
      let pnl = 0;
      if (newTrade.exit_price && newTrade.entry_price) {
        const isLong = newTrade.side === 'Long';
        const priceDiff = newTrade.exit_price - newTrade.entry_price;
        
        // Déterminer la valeur du point selon l'instrument
        let pointValue = 50; // Par défaut pour ES
        const symbol = newTrade.symbol;
        
        if (symbol.startsWith('MGC')) pointValue = 10;
        else if (symbol.startsWith('GC')) pointValue = 100;
        else if (symbol.startsWith('MES')) pointValue = 5;
        else if (symbol.startsWith('ES')) pointValue = 50;
        else if (symbol.startsWith('MNQ')) pointValue = 2;
        else if (symbol.startsWith('NQ')) pointValue = 20;
        else if (symbol.startsWith('MYM')) pointValue = 0.5;
        else if (symbol.startsWith('YM')) pointValue = 5;
        else if (symbol.startsWith('M2K')) pointValue = 5;
        else if (symbol.startsWith('RTY')) pointValue = 50;
        else if (symbol.startsWith('CL')) pointValue = 1000;
        else if (symbol.startsWith('QM')) pointValue = 500;
        
        const multiplier = isLong ? 1 : -1;
        const pnlBrut = priceDiff * multiplier * pointValue * newTrade.quantity;
        const commission = commissions[symbol] || 0;
        pnl = pnlBrut - commission;
      }

      const tradeToAdd = {
        ...newTrade,
        pnl: pnl,
        user_id: currentUser.id,
        entry_price: parseFloat(newTrade.entry_price) || 0,
        exit_price: parseFloat(newTrade.exit_price) || null,
        stop_loss: parseFloat(newTrade.stop_loss) || null,
        take_profit: parseFloat(newTrade.take_profit) || null,
        quantity: parseInt(newTrade.quantity) || 1
      };

      const { data, error } = await supabase
        .from('trades')
        .insert(tradeToAdd)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setTrades(prev => [data, ...prev]);
        setShowAddTradeModal(false);
        // Réinitialiser le formulaire
        setNewTrade({
          date: new Date().toISOString().split('T')[0],
          symbol: 'ES',
          side: 'Long',
          quantity: 1,
          entry_price: 0,
          exit_price: 0,
          stop_loss: 0,
          take_profit: 0,
          comment: ''
        });
      }
    } catch (error) {
      console.error('Erreur ajout trade:', error);
      alert(`Erreur lors de l'ajout du trade: ${error.message}`);
    }
  };

  // Réinitialiser tous les trades
  const resetAllTrades = async () => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      setTrades([]);
      setShowResetConfirm(false);
      
      // Réinitialiser le capital
      setCapitalSettings(prev => ({
        ...prev,
        currentCapital: prev.initialCapital
      }));
      
      alert('Tous les trades ont été supprimés');
    } catch (error) {
      console.error('Erreur suppression trades:', error);
      alert(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  // Gestion de l'import CSV avec sauvegarde Supabase
  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target.result;
        console.log('Contenu du fichier (premiers 300 caractères):', content.substring(0, 300));
        
        if (!content || content.trim() === '') {
          alert('Le fichier est vide');
          return;
        }

        // Détecter si c'est un fichier d'ordres de trading
        const isOrdersFile = content.includes('Entry Time') && content.includes('Internal Order ID') && content.includes('Buy/Sell');
        
        if (isOrdersFile) {
          console.log('Fichier d\'ordres détecté - traitement spécialisé');
          await handleOrdersFileImport(content);
        } else {
          console.log('Fichier CSV standard détecté');
          await handleStandardCSVImport(content);
        }
        
      } catch (error) {
        console.error('Erreur import:', error);
        alert(`Erreur lors de l'import: ${error.message}`);
      }
    };
    
    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier');
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  // Traitement spécialisé pour les fichiers d'ordres CORRIGÉ
  const handleOrdersFileImport = async (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      alert('Fichier d\'ordres vide');
      return;
    }

    console.log('Nombre de lignes d\'ordres:', lines.length);
    console.log('Première ligne (header):', lines[0]);

    // Parser les ordres
    const orders = [];
    
    // Récupérer les headers
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('Headers CSV:', headers);
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      
      if (values.length < 15) {
        console.warn(`Ligne ${i} trop courte (${values.length} valeurs), ignorée`);
        continue;
      }
      
      try {
        const order = {
          entryTime: values[0],
          lastActivityTime: values[1],
          symbol: values[2],
          status: values[3],
          internalOrderId: values[4],
          orderType: values[5],
          buySell: values[6],
          openClose: values[7],
          orderQuantity: parseInt(values[8]) || 0,
          price: parseFloat(values[9]) || 0,
          price2: parseFloat(values[10]) || 0,
          filledQuantity: parseInt(values[11]) || 0,
          avgFillPrice: parseFloat(values[12]) || 0,
          parentInternalOrderId: values[13],
          lineIndex: i
        };
        
        orders.push(order);
        
      } catch (e) {
        console.error(`Erreur parsing ligne ${i}:`, e);
      }
    }

    console.log('Total ordres parsés:', orders.length);

    // Utiliser la nouvelle fonction de groupement améliorée
    const trades = groupOrdersIntoTradesImproved(orders);
    
    if (trades.length === 0) {
      console.error('Aucun trade créé - vérifiez les critères de groupement');
      alert('Aucun trade complet trouvé dans les ordres');
      return;
    }

    console.log(`${trades.length} trades créés avec succès`);

    // Sauvegarder dans Supabase
    const { data, error } = await supabase
      .from('trades')
      .insert(trades)
      .select();

    if (error) {
      console.error('Erreur Supabase:', error);
      alert(`Erreur lors de la sauvegarde: ${error.message}`);
      return;
    }
    
    if (data) {
      setTrades(prev => [...data, ...prev]);
      alert(`${data.length} trade(s) importé(s) avec succès !`);
    }
  };

  // NOUVELLE FONCTION DE GROUPEMENT AMÉLIORÉE
  const groupOrdersIntoTradesImproved = (orders) => {
    const trades = [];
    const processedOrders = new Set();
    
    console.log('\n=== NOUVELLE STRATÉGIE DE GROUPEMENT ===');
    
    // Trier les ordres par temps
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(a.entryTime) - new Date(b.entryTime)
    );
    
    // Stratégie: Pour chaque ordre d'entrée (Open + Filled), chercher les ordres associés
    sortedOrders.forEach(order => {
      // Si déjà traité, passer
      if (processedOrders.has(order.internalOrderId)) return;
      
      // Chercher uniquement les ordres d'entrée
      if (order.openClose === 'Open' && order.status === 'Filled' && order.filledQuantity > 0) {
        console.log(`\n--- Traitement de l'entrée ${order.internalOrderId} ---`);
        
        // Marquer comme traité
        processedOrders.add(order.internalOrderId);
        
        // Collecter tous les ordres liés
        const relatedOrders = [order];
        
        // 1. Trouver les ordres avec le même parent
        if (order.parentInternalOrderId === '0' || order.parentInternalOrderId === order.internalOrderId) {
          // C'est un ordre parent, chercher ses enfants
          const children = sortedOrders.filter(o => 
            o.parentInternalOrderId === order.internalOrderId && 
            o.internalOrderId !== order.internalOrderId &&
            !processedOrders.has(o.internalOrderId)
          );
          relatedOrders.push(...children);
          children.forEach(c => processedOrders.add(c.internalOrderId));
        }
        
        // 2. Chercher les ordres de clôture proches dans le temps (dans les 5 minutes)
        const entryTime = new Date(order.entryTime);
        const timeWindow = 5 * 60 * 1000; // 5 minutes
        
        const closeOrders = sortedOrders.filter(o => {
          if (processedOrders.has(o.internalOrderId)) return false;
          if (o.openClose !== 'Close') return false;
          if (o.symbol !== order.symbol) return false;
          
          const closeTime = new Date(o.entryTime);
          const timeDiff = Math.abs(closeTime - entryTime);
          
          // Chercher les ordres de clôture dans la fenêtre de temps
          return timeDiff <= timeWindow;
        });
        
        // Trouver l'ordre de sortie le plus probable (Filled et même quantité)
        let exitOrder = closeOrders.find(o => 
          o.status === 'Filled' && 
          o.filledQuantity === order.filledQuantity &&
          o.buySell !== order.buySell // Buy close pour un Sell open et vice versa
        );
        
        // Si pas trouvé avec même quantité, chercher n'importe quel ordre de sortie Filled
        if (!exitOrder) {
          exitOrder = closeOrders.find(o => 
            o.status === 'Filled' && 
            o.filledQuantity > 0
          );
        }
        
        if (exitOrder) {
          relatedOrders.push(exitOrder);
          processedOrders.add(exitOrder.internalOrderId);
        }
        
        // Ajouter les autres ordres de clôture (SL, TP)
        closeOrders.forEach(o => {
          if (!processedOrders.has(o.internalOrderId) && o !== exitOrder) {
            relatedOrders.push(o);
            processedOrders.add(o.internalOrderId);
          }
        });
        
        console.log(`Ordres liés trouvés: ${relatedOrders.length}`);
        relatedOrders.forEach(o => {
          console.log(`  - ${o.internalOrderId}: ${o.status} ${o.orderType} ${o.buySell} ${o.openClose}`);
        });
        
        // Créer le trade à partir des ordres liés
        const trade = createTradeFromOrders(order, relatedOrders);
        if (trade) {
          trades.push(trade);
          console.log('✅ Trade créé avec succès');
        }
      }
    });
    
    // Traiter les ordres de clôture orphelins (ceux qui n'ont pas été associés)
    sortedOrders.forEach(order => {
      if (!processedOrders.has(order.internalOrderId) && 
          order.openClose === 'Close' && 
          order.status === 'Filled' && 
          order.filledQuantity > 0) {
        
        console.log(`\n--- Ordre de clôture orphelin ${order.internalOrderId} ---`);
        
        // Créer un trade avec seulement la sortie (pour les positions overnight)
        const trade = {
          date: new Date(order.entryTime).toISOString(),
          symbol: order.symbol.replace(/\.(COMEX|NYMEX|CBOT|CME)$/, ''),
          side: order.buySell === 'Buy' ? 'Short' : 'Long', // Inverse car c'est une clôture
          quantity: order.filledQuantity,
          entry_price: null,
          exit_price: order.avgFillPrice,
          stop_loss: null,
          take_profit: null,
          pnl: 0,
          rating: null,
          comment: `Import: Clôture seule (Order: ${order.internalOrderId})`,
          grouped: false,
          execution_time: order.entryTime,
          user_id: currentUser.id
        };
        
        trades.push(trade);
        processedOrders.add(order.internalOrderId);
      }
    });
    
    console.log(`\n=== RÉSULTAT FINAL: ${trades.length} trade(s) créé(s) ===`);
    return trades;
  };

  // Fonction helper pour créer un trade à partir d'un groupe d'ordres
  const createTradeFromOrders = (entryOrder, relatedOrders) => {
    // Identifier les différents types d'ordres
    const exitOrder = relatedOrders.find(o => 
      o.openClose === 'Close' && 
      o.status === 'Filled' && 
      o.filledQuantity > 0
    );
    
    const stopOrder = relatedOrders.find(o => 
      o.orderType === 'Stop' && 
      o.openClose === 'Close'
    );
    
    const limitOrder = relatedOrders.find(o => 
      o.orderType === 'Limit' && 
      o.openClose === 'Close'
    );
    
    // Calculer le P&L
    let pnl = 0;
    if (exitOrder && entryOrder) {
      const isLong = entryOrder.buySell === 'Buy';
      const entryPrice = entryOrder.avgFillPrice;
      const exitPrice = exitOrder.avgFillPrice;
      const quantity = entryOrder.filledQuantity;
      
      const priceDiff = exitPrice - entryPrice;
      const symbol = entryOrder.symbol.replace(/\.(COMEX|NYMEX|CBOT|CME)$/, '');
      
      let pointValue = 1;
      
      // Déterminer la valeur du point selon l'instrument
      if (symbol.startsWith('MGC')) pointValue = 10;
      else if (symbol.startsWith('GC')) pointValue = 100;
      else if (symbol.startsWith('MES')) pointValue = 5;
      else if (symbol.startsWith('ES')) pointValue = 50;
      else if (symbol.startsWith('MNQ')) pointValue = 2;
      else if (symbol.startsWith('NQ')) pointValue = 20;
      else if (symbol.startsWith('MYM')) pointValue = 0.5;
      else if (symbol.startsWith('YM')) pointValue = 5;
      else if (symbol.startsWith('M2K')) pointValue = 5;
      else if (symbol.startsWith('RTY')) pointValue = 50;
      else if (symbol.startsWith('CL')) pointValue = 1000;
      else if (symbol.startsWith('QM')) pointValue = 500;
      else if (symbol.startsWith('NG')) pointValue = 10000;
      else if (symbol.startsWith('QG')) pointValue = 2500;
      else if (symbol.startsWith('SI')) pointValue = 5000;
      else if (symbol.startsWith('SIL')) pointValue = 1000;
      else if (symbol.startsWith('HG')) pointValue = 25000;
      else if (symbol.startsWith('PL')) pointValue = 50;
      else if (symbol.startsWith('6E')) pointValue = 125000;
      else if (symbol.startsWith('6J')) pointValue = 12500000;
      else if (symbol.startsWith('6B')) pointValue = 62500;
      else if (symbol.startsWith('6C')) pointValue = 100000;
      else if (symbol.startsWith('6A')) pointValue = 100000;
      else if (symbol.startsWith('6S')) pointValue = 125000;
      
      const multiplier = isLong ? 1 : -1;
      const pnlBrut = priceDiff * multiplier * pointValue * quantity;
      
      // Soustraction des commissions
      const baseSymbol = symbol.replace(/[Z,H,M,U]\d+$/, '');
      const commission = commissions[baseSymbol] || commissions[symbol] || 0;
      pnl = pnlBrut - commission;
      
      console.log('Calcul P&L détaillé:', {
        symbol,
        entryPrice,
        exitPrice,
        priceDiff,
        pointValue,
        isLong,
        quantity,
        pnlBrut,
        commission,
        pnlNet: pnl
      });
    }
    
    const trade = {
      date: new Date(entryOrder.entryTime).toISOString(),
      symbol: entryOrder.symbol.replace(/\.(COMEX|NYMEX|CBOT|CME)$/, ''),
      side: entryOrder.buySell === 'Buy' ? 'Long' : 'Short',
      quantity: entryOrder.filledQuantity,
      entry_price: entryOrder.avgFillPrice,
      exit_price: exitOrder ? exitOrder.avgFillPrice : null,
      stop_loss: stopOrder ? stopOrder.price : null,
      take_profit: limitOrder ? limitOrder.price : null,
      pnl: Math.round(pnl * 100) / 100,
      rating: null,
      comment: `Import: Entry ${entryOrder.internalOrderId}${exitOrder ? `, Exit ${exitOrder.internalOrderId}` : ''}`,
      grouped: false,
      execution_time: entryOrder.entryTime,
      user_id: currentUser.id
    };
    
    return trade;
  };

  // Traitement CSV standard (comme avant)
  const handleStandardCSVImport = async (csv) => {
    const lines = csv.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      alert('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
      return;
    }

    const separator = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(separator).map(h => h.trim());
    console.log('En-têtes CSV détectés:', headers);
    
    const newTrades = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = line.split(separator).map(v => v.trim());
      
      if (values.length < 3) continue;
      
      const trade = {};
      headers.forEach((header, idx) => {
        trade[header] = values[idx] || '';
      });
      
      const mappedTrade = {
        date: trade.Date || trade.date || trade.Timestamp || new Date().toISOString(),
        symbol: trade.Symbol || trade.symbol || trade.Instrument || 'ES',
        side: trade.Side || trade.side || trade.Direction || 'Long',
        quantity: parseInt(trade.Quantity || trade.quantity || trade.Size || trade.Qty || '1') || 1,
        entry_price: parseFloat(trade.EntryPrice || trade.entry_price || trade.Entry || trade.Fill || '0') || 0,
        exit_price: parseFloat(trade.ExitPrice || trade.exit_price || trade.Exit || '0') || 0,
        stop_loss: parseFloat(trade.StopLoss || trade.stop_loss || trade.SL || trade.sl || '0') || null,
        take_profit: parseFloat(trade.TakeProfit || trade.take_profit || trade.TP || trade.tp || '0') || null,
        pnl: parseFloat(trade.PnL || trade.pnl || trade.PL || trade.Profit || '0') || 0,
        rating: null,
        comment: trade.Comment || trade.comment || '',
        grouped: false,
        execution_time: trade.ExecutionTime || trade.execution_time || trade.Time || new Date().toISOString(),
        user_id: currentUser.id
      };
      
      if (mappedTrade.stop_loss === 0) mappedTrade.stop_loss = null;
      if (mappedTrade.take_profit === 0) mappedTrade.take_profit = null;
      
      newTrades.push(mappedTrade);
    }

    if (newTrades.length === 0) {
      alert('Aucun trade valide trouvé dans le fichier CSV');
      return;
    }

    // Sauvegarder dans Supabase
    const { data, error } = await supabase
      .from('trades')
      .insert(newTrades)
      .select();

    if (error) {
      console.error('Erreur Supabase:', error);
      alert(`Erreur lors de la sauvegarde: ${error.message}`);
      return;
    }
    
    if (data) {
      setTrades(prev => [...data, ...prev]);
      alert(`${data.length} trades importés avec succès !`);
    }
  };
  {/* Trades avec suppression */}
        {currentView === 'trades' && (
          <div className={`${cardClass} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Historique des Trades</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddTradeModal(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                >
                  ➕ Ajouter un trade
                </button>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                >
                  🗑️ Tout supprimer
                </button>
              </div>
            </div>
            
            {trades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Symbol</th>
                      <th className="text-left p-2">Side</th>
                      <th className="text-left p-2">Qty</th>
                      <th className="text-left p-2">Entry</th>
                      <th className="text-left p-2">Exit</th>
                      <th className="text-left p-2">SL</th>
                      <th className="text-left p-2">TP</th>
                      <th className="text-left p-2">P&L</th>
                      <th className="text-left p-2">Note</th>
                      <th className="text-left p-2">Commentaire</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map(trade => (
                      <tr key={trade.id} className={`border-b ${borderClass} ${trade.grouped ? 'bg-blue-500/10' : ''}`}>
                        <td className="p-2 text-sm">
                          {new Date(trade.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-2 text-sm">{trade.symbol}</td>
                        <td className="p-2 text-sm">{trade.side}</td>
                        <td className="p-2 text-sm">{trade.quantity}</td>
                        <td className="p-2 text-sm">
                          <input
                            type="number"
                            value={trade.entry_price || ''}
                            onChange={(e) => updateTrade(trade.id, { entry_price: parseFloat(e.target.value) || 0 })}
                            className={`w-20 px-1 py-1 text-xs rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                            step="0.01"
                          />
                        </td>
                        <td className="p-2 text-sm">
                          <input
                            type="number"
                            value={trade.exit_price || ''}
                            onChange={(e) => updateTrade(trade.id, { exit_price: parseFloat(e.target.value) || 0 })}
                            className={`w-20 px-1 py-1 text-xs rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                            step="0.01"
                          />
                        </td>
                        <td className="p-2 text-sm">
                          <input
                            type="number"
                            value={trade.stop_loss || ''}
                            onChange={(e) => updateTrade(trade.id, { stop_loss: parseFloat(e.target.value) || null })}
                            className={`w-20 px-1 py-1 text-xs rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                            placeholder="SL"
                            step="0.01"
                          />
                        </td>
                        <td className="p-2 text-sm">
                          <input
                            type="number"
                            value={trade.take_profit || ''}
                            onChange={(e) => updateTrade(trade.id, { take_profit: parseFloat(e.target.value) || null })}
                            className={`w-20 px-1 py-1 text-xs rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                            placeholder="TP"
                            step="0.01"
                          />
                        </td>
                        <td className={`p-2 text-sm font-bold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ${parseFloat(trade.pnl || 0).toFixed(2)}
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(star => (
                              <button
                                key={star}
                                onClick={() => updateTrade(trade.id, { rating: star })}
                                className={trade.rating >= star ? 'text-yellow-500' : 'text-gray-600'}
                              >
                                <Star size={16} fill={trade.rating >= star ? 'currentColor' : 'none'} />
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={trade.comment || ''}
                            onChange={(e) => updateTrade(trade.id, { comment: e.target.value })}
                            className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-sm`}
                            placeholder="Ajouter un commentaire..."
                          />
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => setShowDeleteConfirm(trade.id)}
                            className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                            title="Supprimer le trade"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Upload size={48} className="mx-auto mb-4 opacity-50" />
                <p>Aucun trade</p>
                <p className="text-sm mt-2">Utilisez l'import CSV ou ajoutez un trade manuellement</p>
              </div>
            )}

            {/* Modal d'ajout de trade */}
            {showAddTradeModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${cardClass} p-6 rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto`}>
                  <h3 className="text-lg font-bold mb-4">Ajouter un trade</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm opacity-70">Date</label>
                        <input
                          type="date"
                          value={newTrade.date}
                          onChange={(e) => setNewTrade(prev => ({...prev, date: e.target.value}))}
                          className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                        />
                      </div>
                      <div>
                        <label className="text-sm opacity-70">Symbol</label>
                        <select
                          value={newTrade.symbol}
                          onChange={(e) => setNewTrade(prev => ({...prev, symbol: e.target.value}))}
                          className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                        >
                          <option value="ES">ES</option>
                          <option value="NQ">NQ</option>
                          <option value="YM">YM</option>
                          <option value="RTY">RTY</option>
                          <option value="MES">MES</option>
                          <option value="MNQ">MNQ</option>
                          <option value="MYM">MYM</option>
                          <option value="M2K">M2K</option>
                          <option value="GC">GC</option>
                          <option value="SI">SI</option>
                          <option value="MGC">MGC</option>
                          <option value="SIL">SIL</option>
                          <option value="CL">CL</option>
                          <option value="NG">NG</option>
                          <option value="QM">QM</option>
                          <option value="QG">QG</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm opacity-70">Direction</label>
                        <select
                          value={newTrade.side}
                          onChange={(e) => setNewTrade(prev => ({...prev, side: e.target.value}))}
                          className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                        >
                          <option value="Long">Long</option>
                          <option value="Short">Short</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm opacity-70">Quantité</label>
                        <input
                          type="number"
                          value={newTrade.quantity}
                          onChange={(e) => setNewTrade(prev => ({...prev, quantity: e.target.value}))}
                          className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm opacity-70">Prix d'entrée</label>
                        <input
                          type="number"
                          value={newTrade.entry_price}
                          onChange={(e) => setNewTrade(prev => ({...prev, entry_price: e.target.value}))}
                          className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="text-sm opacity-70">Prix de sortie</label>
                        <input
                          type="number"
                          value={newTrade.exit_price}
                          onChange={(e) => setNewTrade(prev => ({...prev, exit_price: e.target.value}))}
                          className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                          step="0.1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm opacity-70">Stop Loss</label>
                        <input
                          type="number"
                          value={newTrade.stop_loss}
                          onChange={(e) => setNewTrade(prev => ({...prev, stop_loss: e.target.value}))}
                          className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                          step="0.1"
                          placeholder="Optionnel"
                        />
                      </div>
                      <div>
                        <label className="text-sm opacity-70">Take Profit</label>
                        <input
                          type="number"
                          value={newTrade.take_profit}
                          onChange={(e) => setNewTrade(prev => ({...prev, take_profit: e.target.value}))}
                          className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                          step="0.1"
                          placeholder="Optionnel"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm opacity-70">Commentaire</label>
                      <textarea
                        value={newTrade.comment}
                        onChange={(e) => setNewTrade(prev => ({...prev, comment: e.target.value}))}
                        className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                        rows="2"
                        placeholder="Commentaire optionnel..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowAddTradeModal(false)}
                      className="flex-1 py-2 bg-gray-500 rounded hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={addTradeManually}
                      className="flex-1 py-2 bg-green-500 rounded hover:bg-green-600"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de confirmation reset */}
            {showResetConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className={`${cardClass} p-6 rounded-xl max-w-md w-full mx-4`}>
                  <h3 className="text-lg font-bold mb-4 text-red-500">⚠️ Attention !</h3>
                  <p className="text-sm opacity-70 mb-6">
                    Êtes-vous sûr de vouloir supprimer <strong>TOUS</strong> vos trades ? 
                    Cette action est <strong>irréversible</strong> et supprimera également l'historique du capital.
                  </p>
                  <div className="bg-yellow-500/10 border border-yellow-500 p-3 rounded mb-4">
                    <p className="text-sm text-yellow-400">
                      💡 <strong>Conseil :</strong> Exportez vos données avant de continuer (bouton Export Fiscal dans les paramètres)
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 py-2 bg-gray-500 rounded hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={resetAllTrades}
                      className="flex-1 py-2 bg-red-500 rounded hover:bg-red-600"
                    >
                      Supprimer tout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de confirmation de suppression individuelle */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className={`${cardClass} p-6 rounded-xl max-w-md w-full mx-4`}>
                  <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
                  <p className="text-sm opacity-70 mb-6">
                    Êtes-vous sûr de vouloir supprimer ce trade ? Cette action est irréversible.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 py-2 bg-gray-500 rounded hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => deleteTrade(showDeleteConfirm)}
                      className="flex-1 py-2 bg-red-500 rounded hover:bg-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TradingJournalSupabase;  // Métriques de trading
  const metrics = useMemo(() => {
    if (trades.length === 0) return {
      totalPL: 0, winRate: 0, avgRR: 0, profitFactor: 0,
      maxDrawdown: 0, avgWin: 0, avgLoss: 0, totalTrades: 0,
      winStreak: 0, lossStreak: 0, expectancy: 0
    };

    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const totalPL = trades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
    
    let cumulative = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    trades.forEach(t => {
      cumulative += parseFloat(t.pnl || 0);
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;

      if (t.pnl > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else {
        currentLossStreak++;
        currentWinStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
      }
    });

    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0) / losses.length) : 0;
    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
    const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;
    const profitFactor = losses.length > 0 ? 
      wins.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0) / Math.abs(losses.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0)) : 0;
    const expectancy = (winRate / 100 * avgWin) - ((100 - winRate) / 100 * avgLoss);

    return {
      totalPL, winRate, avgRR, profitFactor, maxDrawdown,
      avgWin, avgLoss, totalTrades: trades.length,
      winStreak: maxWinStreak, lossStreak: maxLossStreak, expectancy
    };
  }, [trades]);

  // Achievements système
  const checkAchievements = () => {
    const newAchievements = [];
    
    // Achievements de progression
    if (trades.length >= 10) newAchievements.push({ id: 'first10', name: 'Premiers Pas', icon: '🎯', desc: '10 trades complétés' });
    if (trades.length >= 50) newAchievements.push({ id: 'trader50', name: 'Trader Régulier', icon: '📈', desc: '50 trades complétés' });
    if (trades.length >= 100) newAchievements.push({ id: 'centurion', name: 'Centurion', icon: '💯', desc: '100 trades complétés' });
    
    // Achievements d'analyse
    if (trades.filter(t => t.rating).length >= 20) newAchievements.push({ id: 'analyst20', name: 'Analyste Junior', icon: '🔍', desc: '20 trades notés' });
    if (trades.filter(t => t.comment).length >= 30) newAchievements.push({ id: 'commentator', name: 'Commentateur', icon: '💭', desc: '30 trades commentés' });
    
    // Achievements de discipline
    if (journalEntries.length >= 10) newAchievements.push({ id: 'writer10', name: 'Diariste', icon: '📓', desc: '10 entrées journal' });
    if (journalEntries.length >= 30) newAchievements.push({ id: 'writer30', name: 'Écrivain', icon: '✏️', desc: '30 entrées journal' });
    
    // Achievements de mentalité
    if (psychScore > 4) newAchievements.push({ id: 'zenmaster', name: 'Maître Zen', icon: '🧘', desc: 'Score mental parfait' });
    if (psychAnswers && Object.keys(psychAnswers).length >= 5) newAchievements.push({ id: 'selfaware', name: 'Conscience de Soi', icon: '🪞', desc: 'Auto-évaluation régulière' });
    
    // Achievements de communauté
    if (chatMessages.filter(m => m.isOwn).length >= 5) newAchievements.push({ id: 'social5', name: 'Membre Actif', icon: '💬', desc: '5 messages envoyés' });
    if (chatMessages.filter(m => m.isOwn).length >= 20) newAchievements.push({ id: 'social20', name: 'Pilier Communauté', icon: '🤝', desc: '20 messages envoyés' });
    
    // Achievements de constance
    const tradeDates = [...new Set(trades.map(t => new Date(t.date).toDateString()))];
    if (tradeDates.length >= 5) newAchievements.push({ id: 'consistent5', name: 'Constance', icon: '📅', desc: 'Tradé 5 jours différents' });
    if (tradeDates.length >= 20) newAchievements.push({ id: 'consistent20', name: 'Persévérant', icon: '🎖️', desc: 'Tradé 20 jours différents' });
    
    setAchievements(newAchievements);
  };

  // Check achievements quand les données changent
  useEffect(() => {
    if (isAuthenticated) {
      checkAchievements();
    }
  }, [trades, journalEntries, chatMessages, psychScore, isAuthenticated]);

  // Calcul du score psychologique
  useEffect(() => {
    const answers = Object.values(psychAnswers);
    if (answers.length === psychQuestions.length) {
      const score = answers.reduce((a, b) => a + b, 0) / answers.length;
      setPsychScore(score);
    }
  }, [psychAnswers, psychQuestions.length]);

  // Sauvegarder les paramètres quand ils changent
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const timeoutId = setTimeout(() => {
        saveSettings();
      }, 1000); // Debounce de 1 seconde
      
      return () => clearTimeout(timeoutId);
    }
  }, [theme, objectives, riskLimit, commissions, capitalSettings]);

  // Mettre à jour les dates du graphique quand les trades changent
  useEffect(() => {
    if (trades.length > 0 && (!chartDateRange.start || !chartDateRange.end)) {
      const dates = trades.map(t => new Date(t.date)).sort((a, b) => a - b);
      setChartDateRange({
        start: dates[0].toISOString().split('T')[0],
        end: dates[dates.length - 1].toISOString().split('T')[0]
      });
    }
  }, [trades]);

  // Fonction pour mettre à jour le capital avec les nouveaux trades
  const updateCapitalWithTrades = (newTrades) => {
    const totalPnL = newTrades.reduce((sum, trade) => sum + (parseFloat(trade.pnl) || 0), 0);
    setCapitalSettings(prev => ({
      ...prev,
      currentCapital: prev.currentCapital + totalPnL
    }));
  };

  // Fonction pour recalculer le capital total basé sur tous les trades
  const recalculateCapital = (allTrades) => {
    const totalPnL = allTrades.reduce((sum, trade) => sum + (parseFloat(trade.pnl) || 0), 0);
    setCapitalSettings(prev => ({
      ...prev,
      currentCapital: prev.initialCapital + totalPnL
    }));
    console.log('Capital recalculé:', {
      initial: capitalSettings.initialCapital,
      totalPnL,
      current: capitalSettings.initialCapital + totalPnL
    });
  };

  // Fonctions helper
  const checkRiskExposure = (tradesToCheck) => {
    const openTrades = tradesToCheck.filter(t => !t.exit_price);
    const exposure = openTrades.reduce((sum, t) => sum + Math.abs(t.quantity * t.entry_price), 0);
    const accountSize = 100000;
    const exposurePercent = (exposure / accountSize) * 100;
    
    if (exposurePercent > riskLimit) {
      setShowRiskAlert(true);
      setTimeout(() => setShowRiskAlert(false), 5000);
    }
  };

  const calculatePositionSize = (accountSize, riskPercent, stopLoss) => {
    return Math.floor((accountSize * (riskPercent / 100)) / stopLoss);
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 1) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getDayPL = (date) => {
    return trades
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.toDateString() === date.toDateString();
      })
      .reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
  };

  const getDayTradeCount = (date) => {
    return trades.filter(t => {
      const tDate = new Date(t.date);
      return tDate.toDateString() === date.toDateString();
    }).length;
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi = début de semaine
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date) => {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  };

  const getWeekDays = (date) => {
    const start = getWeekStart(date);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getWeekPL = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return trades
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate >= weekStart && tDate <= weekEnd;
      })
      .reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
  };

  const getWeekTradeCount = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return trades.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= weekStart && tDate <= weekEnd;
    }).length;
  };

  const getMonthPL = (date) => {
    return trades
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
  };

  const getMonthTradeCount = (date) => {
    return trades.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
    }).length;
  };

  const getYearPL = (date) => {
    return trades
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
  };

  const getYearTradeCount = (date) => {
    return trades.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === date.getFullYear();
    }).length;
  };

  const exportFiscal = () => {
    const csvContent = trades.map(t => 
      `${t.date},${t.symbol},${t.side},${t.quantity},${t.entry_price},${t.stop_loss || ''},${t.take_profit || ''},${t.exit_price},${t.pnl},${commissions[t.symbol] || 0}`
    ).join('\n');
    
    const blob = new Blob([`Date,Symbol,Side,Qty,Entry,SL,TP,Exit,P&L,Commission\n${csvContent}`], 
      { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades_fiscal_${new Date().getFullYear()}.csv`;
    a.click();
  };

  // Fonction pour obtenir les données de P&L journalier avec auto-scaling
  const getDailyPLData = () => {
    const dailyData = {};
    
    trades.forEach(trade => {
      const date = new Date(trade.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      if (!dailyData[date]) {
        dailyData[date] = 0;
      }
      dailyData[date] += parseFloat(trade.pnl || 0);
    });

    const sortedData = Object.entries(dailyData)
      .sort(([dateA], [dateB]) => {
        const [dayA, monthA] = dateA.split('/');
        const [dayB, monthB] = dateB.split('/');
        return new Date(`${monthA}/${dayA}`) - new Date(`${monthB}/${dayB}`);
      })
      .slice(-30); // Derniers 30 jours

    return sortedData;
  };

  // Fonction pour obtenir les données R
  const getRData = () => {
    const filteredTrades = trades.filter(trade => {
      if (!chartDateRange.start || !chartDateRange.end) return true;
      const tradeDate = new Date(trade.date).toISOString().split('T')[0];
      return tradeDate >= chartDateRange.start && tradeDate <= chartDateRange.end;
    });

    const dailyRisk = capitalSettings.dailyRiskDollar || 
      (capitalSettings.initialCapital * capitalSettings.dailyRiskPercent / 100);

    return filteredTrades.map(trade => ({
      date: new Date(trade.date).toLocaleDateString('fr-FR'),
      r: (parseFloat(trade.pnl) || 0) / dailyRisk,
      cumR: 0 // Will be calculated below
    })).sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item, index, array) => ({
        ...item,
        cumR: array.slice(0, index + 1).reduce((sum, t) => sum + t.r, 0)
      }));
  };

  // Fonction pour obtenir les données d'évolution du capital
  const getCapitalData = () => {
    const filteredTrades = trades.filter(trade => {
      if (!chartDateRange.start || !chartDateRange.end) return true;
      const tradeDate = new Date(trade.date).toISOString().split('T')[0];
      return tradeDate >= chartDateRange.start && tradeDate <= chartDateRange.end;
    });

    let runningCapital = capitalSettings.initialCapital;
    return filteredTrades.sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(trade => {
        runningCapital += parseFloat(trade.pnl) || 0;
        return {
          date: new Date(trade.date).toLocaleDateString('fr-FR'),
          capital: runningCapital
        };
      });
  };

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

  // Écran de chargement
  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} ${textClass} flex items-center justify-center`}>
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 mx-auto mb-4" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  // Page de connexion
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${bgClass} ${textClass} flex items-center justify-center p-4`}>
        <div className={`${cardClass} rounded-2xl p-8 max-w-md w-full border ${borderClass} shadow-2xl`}>
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">TM</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold">TopMove Trading</h1>
            <p className="text-sm opacity-70">École de Trading Professionnelle</p>
          </div>

          {/* Message d'erreur */}
          {authError && (
            <div className={`mb-4 p-3 rounded-lg ${authError.includes('créé') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {authError}
            </div>
          )}

          {/* Formulaire */}
          <div className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="text-sm opacity-70">Nom complet</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-3 size-4 opacity-50" />
                  <input
                    type="text"
                    value={credentials.name}
                    onChange={(e) => setCredentials({...credentials, name: e.target.value})}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm opacity-70">Email</label>
              <div className="relative">
                <School className="absolute left-3 top-3 size-4 opacity-50" />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  className={`w-full pl-10 pr-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  placeholder="eleve@email.com"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm opacity-70">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 size-4 opacity-50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className={`w-full pl-10 pr-10 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  placeholder="••••••••"
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth(e)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? <EyeOff size={16} className="opacity-50" /> : <Eye size={16} className="opacity-50" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Chargement...' : (authMode === 'login' ? 'Se connecter' : "S'inscrire")}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError('');
              }}
              className="text-sm text-blue-400 hover:underline"
            >
              {authMode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
            <p className="text-xs text-center">
              📚 Réservé aux élèves de TopMove Trading
            </p>
            <p className="text-xs text-center mt-1 opacity-70">
              Données synchronisées sur tous vos appareils
            </p>
          </div>
        </div>
      </div>
    );
  }import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, BarChart3, Settings, Moon, Sun, Upload, AlertTriangle, Target, Brain, BookOpen, Calculator, Download, Cloud, ChevronLeft, ChevronRight, Star, MessageSquare, DollarSign, Percent, Hash, Activity, PieChart, LineChart, Shield, CheckCircle, XCircle, AlertCircle, Users, Trophy, Award, Lock, LogIn, UserPlus, Eye, EyeOff, School, Send, Loader, Trash2 } from 'lucide-react';
import { supabase } from './supabaseClient';

const TradingJournalSupabase = () => {
  // États d'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [credentials, setCredentials] = useState({ email: '', password: '', name: '' });
  const [userRole, setUserRole] = useState('student');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  
  // États principaux
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('dashboard');
  const [trades, setTrades] = useState([]);
  const [commissions, setCommissions] = useState({
    'ES': 4.5, 'NQ': 4.5, 'YM': 4.5, 'RTY': 4.5,
    'MES': 1.5, 'MNQ': 1.5, 'MYM': 1.5, 'M2K': 1.5,
    'GC': 2.5, 'SI': 2.5, 'HG': 2.5, 'PL': 2.5,
    'MGC': 1.5, 'SIL': 1.5, 'QO': 1.5,
    'CL': 2.5, 'NG': 2.5, 'RB': 2.5, 'HO': 2.5,
    'QM': 1.5, 'QG': 1.5,
    '6E': 2.5, '6J': 2.5, '6B': 2.5, '6C': 2.5, '6A': 2.5, '6S': 2.5
  });
  const [calendarView, setCalendarView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [psychScore, setPsychScore] = useState(null);
  const [psychAnswers, setPsychAnswers] = useState({});
  const [journalEntries, setJournalEntries] = useState([]);
  const [objectives, setObjectives] = useState({ daily: 500, weekly: 2000, monthly: 8000 });
  const [riskLimit, setRiskLimit] = useState(2);
  const [showRiskAlert, setShowRiskAlert] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [capitalSettings, setCapitalSettings] = useState({
    initialCapital: 50000,
    currentCapital: 50000,
    dailyRiskPercent: 2,
    dailyRiskDollar: 1000
  });
  const [chartDateRange, setChartDateRange] = useState({ start: '', end: '' });
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newTrade, setNewTrade] = useState({
    date: new Date().toISOString().split('T')[0],
    symbol: 'ES',
    side: 'Long',
    quantity: 1,
    entry_price: 0,
    exit_price: 0,
    stop_loss: 0,
    take_profit: 0,
    comment: ''
  });

  // Questions psychologiques modifiées
  const psychQuestions = [
    { id: 'emotion', question: 'Vous sentez-vous bien émotionnellement ?' },
    { id: 'focus', question: 'Êtes-vous concentré ?' },
    { id: 'forme', question: 'Êtes vous en forme ?' },
    { id: 'detendu', question: 'Êtes-vous détendu ?' },
    { id: 'confidence', question: 'Êtes-vous confiant ?' }
  ];

  // Vérifier la session au chargement
  useEffect(() => {
    checkSession();
  }, []);

  // Charger les données quand l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadUserData(currentUser.id);
      const unsubscribe = subscribeToChat();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isAuthenticated, currentUser]);

  // Vérifier si l'utilisateur est connecté
  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setCurrentUser(session.user);
        const role = session.user.email?.includes('topmove') ? 'teacher' : 'student';
        setUserRole(role);
      }
    } catch (error) {
      console.error('Erreur session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données utilisateur depuis Supabase
  const loadUserData = async (userId) => {
    if (!userId) return;

    try {
      // Charger les trades
      const { data: tradesData } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (tradesData) {
        setTrades(tradesData);
        // Recalculer le capital avec tous les trades existants
        setTimeout(() => recalculateCapital(tradesData), 100);
      }

      // Charger le journal
      const { data: journalData } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (journalData) setJournalEntries(journalData);

      // Charger les paramètres
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (settingsData) {
        setTheme(settingsData.theme || 'dark');
        setObjectives(settingsData.objectives || { daily: 500, weekly: 2000, monthly: 8000 });
        setRiskLimit(settingsData.risk_limit || 2);
        setCapitalSettings(settingsData.capital_settings || {
          initialCapital: 50000,
          currentCapital: 50000,
          dailyRiskPercent: 2,
          dailyRiskDollar: 1000
        });
        if (settingsData.commissions) setCommissions(settingsData.commissions);
      }

      // Charger les messages du chat
      const { data: chatData } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (chatData) {
        setChatMessages(chatData.map(msg => ({
          ...msg,
          isOwn: msg.user_id === userId,
          time: new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        })));
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  // S'abonner aux messages du chat en temps réel
  const subscribeToChat = () => {
    const channel = supabase
      .channel('chat')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = {
            ...payload.new,
            isOwn: payload.new.user_id === currentUser?.id,
            time: new Date(payload.new.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Gestion de l'authentification
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        if (error) throw error;
        
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setUserRole(data.user.email?.includes('topmove') ? 'teacher' : 'student');
        
      } else {
        // Inscription
        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              name: credentials.name
            }
          }
        });

        if (error) throw error;
        
        if (data.user) {
          setIsAuthenticated(true);
          setCurrentUser(data.user);
          setUserRole('student');
          setAuthError('Compte créé ! Vérifiez votre email pour confirmer.');
        }
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setTrades([]);
    setJournalEntries([]);
    setChatMessages([]);
  };

  // Envoyer un message dans le chat
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: currentUser.id,
          user_name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0],
          message: newMessage,
          avatar: '🧑‍💼'
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  // Sauvegarder une entrée de journal
  const saveJournalEntry = async (content) => {
    if (!currentUser || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: currentUser.id,
          content: content
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setJournalEntries(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error('Erreur sauvegarde journal:', error);
    }
  };

  // Mettre à jour un trade
  const updateTrade = async (tradeId, updates) => {
    try {
      const { error } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', tradeId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      // Mettre à jour localement
      setTrades(prev => prev.map(t => 
        t.id === tradeId ? { ...t, ...updates } : t
      ));
    } catch (error) {
      console.error('Erreur mise à jour trade:', error);
    }
  };

  // Supprimer un trade
  const deleteTrade = async (tradeId) => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      // Mettre à jour localement
      setTrades(prev => prev.filter(t => t.id !== tradeId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur suppression trade:', error);
    }
  };

  // Sauvegarder les paramètres
  const saveSettings = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          id: currentUser.id,
          theme: theme,
          objectives: objectives,
          risk_limit: riskLimit,
          capital_settings: capitalSettings,
          commissions: commissions,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
    }
  };

  // Ajouter un trade manuellement
  const addTradeManually = async () => {
    try {
      // Calculer le P&L
      let pnl = 0;
      if (newTrade.exit_price && newTrade.entry_price) {
        const isLong = newTrade.side === 'Long';
        const priceDiff = newTrade.exit_price - newTrade.entry_price;
        
        // Déterminer la valeur du point selon l'instrument
        let pointValue = 50; // Par défaut pour ES
        const symbol = newTrade.symbol;
        
        if (symbol.startsWith('MGC')) pointValue = 10;
        else if (symbol.startsWith('GC')) pointValue = 100;
        else if (symbol.startsWith('MES')) pointValue = 5;
        else if (symbol.startsWith('ES')) pointValue = 50;
        else if (symbol.startsWith('MNQ')) pointValue = 2;
        else if (symbol.startsWith('NQ')) pointValue = 20;
        else if (symbol.startsWith('MYM')) pointValue = 0.5;
        else if (symbol.startsWith('YM')) pointValue = 5;
        else if (symbol.startsWith('M2K')) pointValue = 5;
        else if (symbol.startsWith('RTY')) pointValue = 50;
        else if (symbol.startsWith('CL')) pointValue = 1000;
        else if (symbol.startsWith('QM')) pointValue = 500;
        
        const multiplier = isLong ? 1 : -1;
        const pnlBrut = priceDiff * multiplier * pointValue * newTrade.quantity;
        const commission = commissions[symbol] || 0;
        pnl = pnlBrut - commission;
      }

      const tradeToAdd = {
        ...newTrade,
        pnl: pnl,
        user_id: currentUser.id,
        entry_price: parseFloat(newTrade.entry_price) || 0,
        exit_price: parseFloat(newTrade.exit_price) || null,
        stop_loss: parseFloat(newTrade.stop_loss) || null,
        take_profit: parseFloat(newTrade.take_profit) || null,
        quantity: parseInt(newTrade.quantity) || 1
      };

      const { data, error } = await supabase
        .from('trades')
        .insert(tradeToAdd)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setTrades(prev => [data, ...prev]);
        setShowAddTradeModal(false);
        // Réinitialiser le formulaire
        setNewTrade({
          date: new Date().toISOString().split('T')[0],
          symbol: 'ES',
          side: 'Long',
          quantity: 1,
          entry_price: 0,
          exit_price: 0,
          stop_loss: 0,
          take_profit: 0,
          comment: ''
        });
      }
    } catch (error) {
      console.error('Erreur ajout trade:', error);
      alert(`Erreur lors de l'ajout du trade: ${error.message}`);
    }
  };

  // Réinitialiser tous les trades
  const resetAllTrades = async () => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      setTrades([]);
      setShowResetConfirm(false);
      
      // Réinitialiser le capital
      setCapitalSettings(prev => ({
        ...prev,
        currentCapital: prev.initialCapital
      }));
      
      alert('Tous les trades ont été supprimés');
    } catch (error) {
      console.error('Erreur suppression trades:', error);
      alert(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  // Gestion de l'import CSV avec sauvegarde Supabase
  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target.result;
        console.log('Contenu du fichier (premiers 300 caractères):', content.substring(0, 300));
        
        if (!content || content.trim() === '') {
          alert('Le fichier est vide');
          return;
        }

        // Détecter si c'est un fichier d'ordres de trading
        const isOrdersFile = content.includes('Entry Time') && content.includes('Internal Order ID') && content.includes('Buy/Sell');
        
        if (isOrdersFile) {
          console.log('Fichier d\'ordres détecté - traitement spécialisé');
          await handleOrdersFileImport(content);
        } else {
          console.log('Fichier CSV standard détecté');
          await handleStandardCSVImport(content);
        }
        
      } catch (error) {
        console.error('Erreur import:', error);
        alert(`Erreur lors de l'import: ${error.message}`);
      }
    };
    
    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier');
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  // Traitement spécialisé pour les fichiers d'ordres CORRIGÉ
  const handleOrdersFileImport = async (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      alert('Fichier d\'ordres vide');
      return;
    }

    console.log('Nombre de lignes d\'ordres:', lines.length);
    console.log('Première ligne (header):', lines[0]);

    // Parser les ordres
    const orders = [];
    
    // Récupérer les headers
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('Headers CSV:', headers);
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      
      if (values.length < 15) {
        console.warn(`Ligne ${i} trop courte (${values.length} valeurs), ignorée`);
        continue;
      }
      
      try {
        const order = {
          entryTime: values[0],
          lastActivityTime: values[1],
          symbol: values[2],
          status: values[3],
          internalOrderId: values[4],
          orderType: values[5],
          buySell: values[6],
          openClose: values[7],
          orderQuantity: parseInt(values[8]) || 0,
          price: parseFloat(values[9]) || 0,
          price2: parseFloat(values[10]) || 0,
          filledQuantity: parseInt(values[11]) || 0,
          avgFillPrice: parseFloat(values[12]) || 0,
          parentInternalOrderId: values[13],
          lineIndex: i
        };
        
        orders.push(order);
        
      } catch (e) {
        console.error(`Erreur parsing ligne ${i}:`, e);
      }
    }

    console.log('Total ordres parsés:', orders.length);

    // Utiliser la nouvelle fonction de groupement améliorée
    const trades = groupOrdersIntoTradesImproved(orders);
    
    if (trades.length === 0) {
      console.error('Aucun trade créé - vérifiez les critères de groupement');
      alert('Aucun trade complet trouvé dans les ordres');
      return;
    }

    console.log(`${trades.length} trades créés avec succès`);

    // Sauvegarder dans Supabase
    const { data, error } = await supabase
      .from('trades')
      .insert(trades)
      .select();

    if (error) {
      console.error('Erreur Supabase:', error);
      alert(`Erreur lors de la sauvegarde: ${error.message}`);
      return;
    }
    
    if (data) {
      setTrades(prev => [...data, ...prev]);
      alert(`${data.length} trade(s) importé(s) avec succès !`);
    }
  };

  // NOUVELLE FONCTION DE GROUPEMENT AMÉLIORÉE
  const groupOrdersIntoTradesImproved = (orders) => {
    const trades = [];
    const processedOrders = new Set();
    
    console.log('\n=== NOUVELLE STRATÉGIE DE GROUPEMENT ===');
    
    // Trier les ordres par temps
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(a.entryTime) - new Date(b.entryTime)
    );
    
    // Stratégie: Pour chaque ordre d'entrée (Open + Filled), chercher les ordres associés
    sortedOrders.forEach(order => {
      // Si déjà traité, passer
      if (processedOrders.has(order.internalOrderId)) return;
      
      // Chercher uniquement les ordres d'entrée
      if (order.openClose === 'Open' && order.status === 'Filled' && order.filledQuantity > 0) {
        console.log(`\n--- Traitement de l'entrée ${order.internalOrderId} ---`);
        
        // Marquer comme traité
        processedOrders.add(order.internalOrderId);
        
        // Collecter tous les ordres liés
        const relatedOrders = [order];
        
        // 1. Trouver les ordres avec le même parent
        if (order.parentInternalOrderId === '0' || order.parentInternalOrderId === order.internalOrderId) {
          // C'est un ordre parent, chercher ses enfants
          const children = sortedOrders.filter(o => 
            o.parentInternalOrderId === order.internalOrderId && 
            o.internalOrderId !== order.internalOrderId &&
            !processedOrders.has(o.internalOrderId)
          );
          relatedOrders.push(...children);
          children.forEach(c => processedOrders.add(c.internalOrderId));
        }
        
        // 2. Chercher les ordres de clôture proches dans le temps (dans les 5 minutes)
        const entryTime = new Date(order.entryTime);
        const timeWindow = 5 * 60 * 1000; // 5 minutes
        
        const closeOrders = sortedOrders.filter(o => {
          if (processedOrders.has(o.internalOrderId)) return false;
          if (o.openClose !== 'Close') return false;
          if (o.symbol !== order.symbol) return false;
          
          const closeTime = new Date(o.entryTime);
          const timeDiff = Math.abs(closeTime - entryTime);
          
          // Chercher les ordres de clôture dans la fenêtre de temps
          return timeDiff <= timeWindow;
        });
        
        // Trouver l'ordre de sortie le plus probable (Filled et même quantité)
        let exitOrder = closeOrders.find(o => 
          o.status === 'Filled' && 
          o.filledQuantity === order.filledQuantity &&
          o.buySell !== order.buySell // Buy close pour un Sell open et vice versa
        );
        
        // Si pas trouvé avec même quantité, chercher n'importe quel ordre de sortie Filled
        if (!exitOrder) {
          exitOrder = closeOrders.find(o => 
            o.status === 'Filled' && 
            o.filledQuantity > 0
          );
        }
        
        if (exitOrder) {
          relatedOrders.push(exitOrder);
          processedOrders.add(exitOrder.internalOrderId);
        }
        
        // Ajouter les autres ordres de clôture (SL, TP)
        closeOrders.forEach(o => {
          if (!processedOrders.has(o.internalOrderId) && o !== exitOrder) {
            relatedOrders.push(o);
            processedOrders.add(o.internalOrderId);
          }
        });
        
        console.log(`Ordres liés trouvés: ${relatedOrders.length}`);
        relatedOrders.forEach(o => {
          console.log(`  - ${o.internalOrderId}: ${o.status} ${o.orderType} ${o.buySell} ${o.openClose}`);
        });
        
        // Créer le trade à partir des ordres liés
        const trade = createTradeFromOrders(order, relatedOrders);
        if (trade) {
          trades.push(trade);
          console.log('✅ Trade créé avec succès');
        }
      }
    });
    
    // Traiter les ordres de clôture orphelins (ceux qui n'ont pas été associés)
    sortedOrders.forEach(order => {
      if (!processedOrders.has(order.internalOrderId) && 
          order.openClose === 'Close' && 
          order.status === 'Filled' && 
          order.filledQuantity > 0) {
        
        console.log(`\n--- Ordre de clôture orphelin ${order.internalOrderId} ---`);
        
        // Créer un trade avec seulement la sortie (pour les positions overnight)
        const trade = {
          date: new Date(order.entryTime).toISOString(),
          symbol: order.symbol.replace(/\.(COMEX|NYMEX|CBOT|CME)$/, ''),
          side: order.buySell === 'Buy' ? 'Short' : 'Long', // Inverse car c'est une clôture
          quantity: order.filledQuantity,
          entry_price: null,
          exit_price: order.avgFillPrice,
          stop_loss: null,
          take_profit: null,
          pnl: 0,
          rating: null,
          comment: `Import: Clôture seule (Order: ${order.internalOrderId})`,
          grouped: false,
          execution_time: order.entryTime,
          user_id: currentUser.id
        };
        
        trades.push(trade);
        processedOrders.add(order.internalOrderId);
      }
    });
    
    console.log(`\n=== RÉSULTAT FINAL: ${trades.length} trade(s) créé(s) ===`);
    return trades;
  };

  // Fonction helper pour créer un trade à partir d'un groupe d'ordres
  const createTradeFromOrders = (entryOrder, relatedOrders) => {
    // Identifier les différents types d'ordres
    const exitOrder = relatedOrders.find(o => 
      o.openClose === 'Close' && 
      o.status === 'Filled' && 
      o.filledQuantity > 0
    );
    
    const stopOrder = relatedOrders.find(o => 
      o.orderType === 'Stop' && 
      o.openClose === 'Close'
    );
    
    const limitOrder = relatedOrders.find(o => 
      o.orderType === 'Limit' && 
      o.openClose === 'Close'
    );
    
    // Calculer le P&L
    let pnl = 0;
    if (exitOrder && entryOrder) {
      const isLong = entryOrder.buySell === 'Buy';
      const entryPrice = entryOrder.avgFillPrice;
      const exitPrice = exitOrder.avgFillPrice;
      const quantity = entryOrder.filledQuantity;
      
      const priceDiff = exitPrice - entryPrice;
      const symbol = entryOrder.symbol.replace(/\.(COMEX|NYMEX|CBOT|CME)$/, '');
      
      let pointValue = 1;
      
      // Déterminer la valeur du point selon l'instrument
      if (symbol.startsWith('MGC')) pointValue = 10;
      else if (symbol.startsWith('GC')) pointValue = 100;
      else if (symbol.startsWith('MES')) pointValue = 5;
      else if (symbol.startsWith('ES')) pointValue = 50;
      else if (symbol.startsWith('MNQ')) pointValue = 2;
      else if (symbol.startsWith('NQ')) pointValue = 20;
      else if (symbol.startsWith('MYM')) pointValue = 0.5;
      else if (symbol.startsWith('YM')) pointValue = 5;
      else if (symbol.startsWith('M2K')) pointValue = 5;
      else if (symbol.startsWith('RTY')) pointValue = 50;
      else if (symbol.startsWith('CL')) pointValue = 1000;
      else if (symbol.startsWith('QM')) pointValue = 500;
      else if (symbol.startsWith('NG')) pointValue = 10000;
      else if (symbol.startsWith('QG')) pointValue = 2500;
      else if (symbol.startsWith('SI')) pointValue = 5000;
      else if (symbol.startsWith('SIL')) pointValue = 1000;
      else if (symbol.startsWith('HG')) pointValue = 25000;
      else if (symbol.startsWith('PL')) pointValue = 50;
      else if (symbol.startsWith('6E')) pointValue = 125000;
      else if (symbol.startsWith('6J')) pointValue = 12500000;
      else if (symbol.startsWith('6B')) pointValue = 62500;
      else if (symbol.startsWith('6C')) pointValue = 100000;
      else if (symbol.startsWith('6A')) pointValue = 100000;
      else if (symbol.startsWith('6S')) pointValue = 125000;
      
      const multiplier = isLong ? 1 : -1;
      const pnlBrut = priceDiff * multiplier * pointValue * quantity;
      
      // Soustraction des commissions
      const baseSymbol = symbol.replace(/[Z,H,M,U]\d+$/, '');
      const commission = commissions[baseSymbol] || commissions[symbol] || 0;
      pnl = pnlBrut - commission;
      
      console.log('Calcul P&L détaillé:', {
        symbol,
        entryPrice,
        exitPrice,
        priceDiff,
        pointValue,
        isLong,
        quantity,
        pnlBrut,
        commission,
        pnlNet: pnl
      });
    }
    
    const trade = {
      date: new Date(entryOrder.entryTime).toISOString(),
      symbol: entryOrder.symbol.replace(/\.(COMEX|NYMEX|CBOT|CME)$/, ''),
      side: entryOrder.buySell === 'Buy' ? 'Long' : 'Short',
      quantity: entryOrder.filledQuantity,
      entry_price: entryOrder.avgFillPrice,
      exit_price: exitOrder ? exitOrder.avgFillPrice : null,
      stop_loss: stopOrder ? stopOrder.price : null,
      take_profit: limitOrder ? limitOrder.price : null,
      pnl: Math.round(pnl * 100) / 100,
      rating: null,
      comment: `Import: Entry ${entryOrder.internalOrderId}${exitOrder ? `, Exit ${exitOrder.internalOrderId}` : ''}`,
      grouped: false,
      execution_time: entryOrder.entryTime,
      user_id: currentUser.id
    };
    
    return trade;
  };

  // Traitement CSV standard (comme avant)
  const handleStandardCSVImport = async (csv) => {
    const lines = csv.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      alert('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
      return;
    }

    const separator = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(separator).map(h => h.trim());
    console.log('En-têtes CSV détectés:', headers);
    
    const newTrades = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = line.split(separator).map(v => v.trim());
      
      if (values.length < 3) continue;
      
      const trade = {};
      headers.forEach((header, idx) => {
        trade[header] = values[idx] || '';
      });
      
      const mappedTrade = {
        date: trade.Date || trade.date || trade.Timestamp || new Date().toISOString(),
        symbol: trade.Symbol || trade.symbol || trade.Instrument || 'ES',
        side: trade.Side || trade.side || trade.Direction || 'Long',
        quantity: parseInt(trade.Quantity || trade.quantity || trade.Size || trade.Qty || '1') || 1,
        entry_price: parseFloat(trade.EntryPrice || trade.entry_price || trade.Entry || trade.Fill || '0') || 0,
        exit_price: parseFloat(trade.ExitPrice || trade.exit_price || trade.Exit || '0') || 0,
        stop_loss: parseFloat(trade.StopLoss || trade.stop_loss || trade.SL || trade.sl || '0') || null,
        take_profit: parseFloat(trade.TakeProfit || trade.take_profit || trade.TP || trade.tp || '0') || null,
        pnl: parseFloat(trade.PnL || trade.pnl || trade.PL || trade.Profit || '0') || 0,
        rating: null,
        comment: trade.Comment || trade.comment || '',
        grouped: false,
        execution_time: trade.ExecutionTime || trade.execution_time || trade.Time || new Date().toISOString(),
        user_id: currentUser.id
      };
      
      if (mappedTrade.stop_loss === 0) mappedTrade.stop_loss = null;
      if (mappedTrade.take_profit === 0) mappedTrade.take_profit = null;
      
      newTrades.push(mappedTrade);
    }

    if (newTrades.length === 0) {
      alert('Aucun trade valide trouvé dans le fichier CSV');
      return;
    }

    // Sauvegarder dans Supabase
    const { data, error } = await supabase
      .from('trades')
      .insert(newTrades)
      .select();

    if (error) {
      console.error('Erreur Supabase:', error);
      alert(`Erreur lors de la sauvegarde: ${error.message}`);
      return;
    }
    
    if (data) {
      setTrades(prev => [...data, ...prev]);
      alert(`${data.length} trades importés avec succès !`);
    }
  };
