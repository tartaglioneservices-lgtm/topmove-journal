import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, BarChart3, Settings, Moon, Sun, Upload, AlertTriangle, Target, Brain, BookOpen, Calculator, Download, Cloud, ChevronLeft, ChevronRight, Star, MessageSquare, DollarSign, Percent, Hash, Activity, PieChart, LineChart, Shield, CheckCircle, XCircle, AlertCircle, Users, Trophy, Award, Lock, LogIn, UserPlus, Eye, EyeOff, School, Send, Loader, Trash2, Plus, RefreshCw } from 'lucide-react';
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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [capitalSettings, setCapitalSettings] = useState({
    initialCapital: 50000,
    currentCapital: 50000,
    dailyRiskPercent: 2,
    dailyRiskDollar: 1000
  });
  const [chartDateRange, setChartDateRange] = useState({ start: '', end: '' });
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

  // Questions psychologiques
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

  // Fonction pour obtenir la valeur du point selon l'instrument
  const getPointValue = (symbol) => {
    const cleanSymbol = symbol.replace(/\.(COMEX|NYMEX|CBOT|CME)$/, '').replace(/[Z,H,M,U]\d+$/, '');
    
    const pointValues = {
      'MGC': 10,    // Micro or
      'GC': 100,    // Or standard
      'MES': 5,     // Micro E-mini S&P 500
      'ES': 50,     // E-mini S&P 500
      'MNQ': 2,     // Micro E-mini Nasdaq
      'NQ': 20,     // E-mini Nasdaq
      'MYM': 0.5,   // Micro E-mini Dow
      'YM': 5,      // E-mini Dow
      'M2K': 5,     // Micro Russell
      'RTY': 50,    // Russell
      'CL': 1000,   // Crude Oil (1$ par 0.01)
      'QM': 500,    // Micro Crude
      'NG': 10000,  // Natural Gas
      'QG': 2500,   // Micro Natural Gas
      'SI': 5000,   // Silver
      'SIL': 1000,  // Micro Silver
      'HG': 25000,  // Copper
      'QO': 2500,   // Micro Copper
      'PL': 50,     // Platinum
      '6E': 125000, // Euro FX
      '6J': 12500000, // Japanese Yen
      '6B': 62500,  // British Pound
      '6C': 100000, // Canadian Dollar
      '6A': 100000, // Australian Dollar
      '6S': 125000  // Swiss Franc
    };
    
    return pointValues[cleanSymbol] || 1;
  };

  // Fonction pour ajouter un trade manuellement
  const addTradeManually = async () => {
    // Calculer le P&L
    const pointValue = getPointValue(newTrade.symbol);
    const priceDiff = parseFloat(newTrade.exit_price) - parseFloat(newTrade.entry_price);
    const multiplier = newTrade.side === 'Long' ? 1 : -1;
    const pnlBrut = priceDiff * multiplier * pointValue * parseFloat(newTrade.quantity);
    const commission = commissions[newTrade.symbol] || 0;
    const pnl = pnlBrut - commission;

    const trade = {
      ...newTrade,
      entry_price: parseFloat(newTrade.entry_price),
      exit_price: parseFloat(newTrade.exit_price) || null,
      stop_loss: parseFloat(newTrade.stop_loss) || null,
      take_profit: parseFloat(newTrade.take_profit) || null,
      quantity: parseInt(newTrade.quantity),
      pnl: pnl,
      rating: null,
      grouped: false,
      execution_time: new Date().toISOString(),
      user_id: currentUser?.id
    };

    try {
      const { data, error } = await supabase
        .from('trades')
        .insert(trade)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setTrades(prev => [data, ...prev]);
        
        // Mettre à jour le capital
        setCapitalSettings(prev => ({
          ...prev,
          currentCapital: prev.currentCapital + pnl
        }));

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

        setShowAddTradeModal(false);
        alert('Trade ajouté avec succès !');
      }
    } catch (error) {
      console.error('Erreur ajout trade:', error);
      alert('Erreur lors de l\'ajout du trade');
    }
  };

  // Fonction pour réinitialiser tous les trades
  const resetAllTrades = async () => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      setTrades([]);
      
      // Réinitialiser le capital au capital initial
      setCapitalSettings(prev => ({
        ...prev,
        currentCapital: prev.initialCapital
      }));
      
      setShowResetConfirm(false);
      alert('Tous les trades ont été supprimés avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression des trades');
    }
  };

  // Fonction pour créer un trade à partir d'un groupe d'ordres
  const createTradeFromOrders = (orderGroup) => {
    console.log(`\nCréation d'un trade à partir de ${orderGroup.length} ordres`);
    
    // Identifier l'ordre d'entrée
    let entryOrder = orderGroup.find(o => 
      o.openClose === 'Open' && o.status === 'Filled' && o.filledQuantity > 0
    );
    
    // Si pas d'ordre Open, chercher le premier ordre Filled
    if (!entryOrder) {
      entryOrder = orderGroup.find(o => o.status === 'Filled' && o.filledQuantity > 0);
    }
    
    if (!entryOrder) {
      console.warn('Pas d\'ordre d\'entrée valide trouvé');
      return null;
    }
    
    // Identifier l'ordre de sortie - logique améliorée
    let exitOrder = orderGroup.find(o => {
      if (o.internalOrderId === entryOrder.internalOrderId) return false;
      
      // Cas 1: Ordre Close explicite et rempli
      if (o.openClose === 'Close' && o.status === 'Filled' && o.filledQuantity > 0) {
        return true;
      }
      
      // Cas 2: Ordre dans la direction opposée (inversion de position)
      if (o.status === 'Filled' && o.filledQuantity > 0) {
        if ((entryOrder.buySell === 'Buy' && o.buySell === 'Sell') ||
            (entryOrder.buySell === 'Sell' && o.buySell === 'Buy')) {
          return true;
        }
      }
      
      return false;
    });
    
    // Si pas d'exit trouvé, chercher par proximité temporelle
    if (!exitOrder) {
      const entryTime = new Date(entryOrder.entryTime);
      exitOrder = orderGroup.find(o => {
        if (o.internalOrderId === entryOrder.internalOrderId) return false;
        const orderTime = new Date(o.lastActivityTime || o.entryTime);
        return o.status === 'Filled' && 
               o.filledQuantity > 0 && 
               orderTime > entryTime;
      });
    }
    
    // Identifier Stop Loss et Take Profit
    const stopOrder = orderGroup.find(o => 
      o.orderType === 'Stop' || o.orderType === 'Stop Limit'
    );
    
    const limitOrder = orderGroup.find(o => 
      o.orderType === 'Limit' && o.openClose === 'Close'
    );
    
    console.log('Ordres identifiés:', {
      entry: entryOrder ? `${entryOrder.internalOrderId} (${entryOrder.avgFillPrice})` : 'NONE',
      exit: exitOrder ? `${exitOrder.internalOrderId} (${exitOrder.avgFillPrice})` : 'NONE',
      stop: stopOrder ? `${stopOrder.internalOrderId} (${stopOrder.price})` : 'NONE',
      limit: limitOrder ? `${limitOrder.internalOrderId} (${limitOrder.price})` : 'NONE'
    });
    
    // Calculer le P&L
    let pnl = 0;
    if (exitOrder && entryOrder) {
      const symbol = entryOrder.symbol.replace(/\.(COMEX|NYMEX|CBOT|CME)$/, '');
      const pointValue = getPointValue(symbol);
      const isLong = entryOrder.buySell === 'Buy';
      const priceDiff = exitOrder.avgFillPrice - entryOrder.avgFillPrice;
      const multiplier = isLong ? 1 : -1;
      const quantity = Math.min(entryOrder.filledQuantity, exitOrder.filledQuantity);
      
      const pnlBrut = priceDiff * multiplier * pointValue * quantity;
      const baseSymbol = symbol.replace(/[Z,H,M,U]\d+$/, '');
      const commission = (commissions[baseSymbol] || commissions[symbol] || 0) * 2; // Aller-retour
      pnl = pnlBrut - commission;
      
      console.log('Calcul P&L:', {
        entryPrice: entryOrder.avgFillPrice,
        exitPrice: exitOrder.avgFillPrice,
        priceDiff,
        pointValue,
        quantity,
        pnlBrut,
        commission,
        pnlNet: pnl
      });
    }
    
    // Créer le trade
    const trade = {
      date: new Date(entryOrder.entryTime).toISOString(),
      symbol: entryOrder.symbol.replace(/\.(COMEX|NYMEX|CBOT|CME)$/, ''),
      side: entryOrder.buySell === 'Buy' ? 'Long' : 'Short',
      quantity: entryOrder.filledQuantity,
      entry_price: entryOrder.avgFillPrice,
      exit_price: exitOrder ? exitOrder.avgFillPrice : null,
      stop_loss: stopOrder ? stopOrder.price : null,
      take_profit: limitOrder ? limitOrder.price : null,
      pnl: pnl,
      rating: null,
      comment: exitOrder ? 
        `Trade complet (Entry: ${entryOrder.internalOrderId}, Exit: ${exitOrder.internalOrderId})` :
        `⚠️ Trade ouvert - Pas d'exit trouvé (Entry: ${entryOrder.internalOrderId})`,
      grouped: true,
      execution_time: entryOrder.entryTime,
      user_id: currentUser?.id
    };
    
    return trade;
  };

  // Fonction améliorée pour grouper les ordres en trades
  const groupOrdersIntoTrades = (orders) => {
    const trades = [];
    
    console.log('\n=== GROUPEMENT AMÉLIORÉ DES ORDRES ===');
    console.log(`Nombre total d'ordres à traiter: ${orders.length}`);
    
    // Trier les ordres par date et heure
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(a.entryTime) - new Date(b.entryTime)
    );
    
    // Stratégie améliorée : grouper par parentId ou par proximité temporelle
    const processedOrders = new Set();
    
    sortedOrders.forEach(order => {
      if (processedOrders.has(order.internalOrderId)) {
        return; // Déjà traité
      }
      
      // Si c'est un ordre parent ou sans parent
      if (order.parentInternalOrderId === '0' || !order.parentInternalOrderId) {
        const relatedOrders = [order];
        processedOrders.add(order.internalOrderId);
        
        // Trouver tous les ordres liés
        sortedOrders.forEach(relatedOrder => {
          if (relatedOrder.parentInternalOrderId === order.internalOrderId && 
              !processedOrders.has(relatedOrder.internalOrderId)) {
            relatedOrders.push(relatedOrder);
            processedOrders.add(relatedOrder.internalOrderId);
          }
        });
        
        // Chercher aussi les ordres proches temporellement (dans les 5 minutes)
        const orderTime = new Date(order.entryTime);
        sortedOrders.forEach(closeOrder => {
          if (!processedOrders.has(closeOrder.internalOrderId)) {
            const closeTime = new Date(closeOrder.entryTime);
            const timeDiff = Math.abs(closeTime - orderTime) / 1000 / 60; // en minutes
            
            if (timeDiff <= 5 && closeOrder.symbol === order.symbol) {
              // Vérifier si c'est potentiellement un ordre de sortie
              if ((order.openClose === 'Open' && closeOrder.openClose === 'Close') ||
                  (order.buySell !== closeOrder.buySell && closeOrder.status === 'Filled')) {
                relatedOrders.push(closeOrder);
                processedOrders.add(closeOrder.internalOrderId);
              }
            }
          }
        });
        
        // Créer un trade à partir des ordres groupés
        const trade = createTradeFromOrders(relatedOrders);
        if (trade) {
          trades.push(trade);
        }
      }
    });
    
    // Traiter les ordres orphelins restants
    sortedOrders.forEach(order => {
      if (!processedOrders.has(order.internalOrderId) && order.status === 'Filled') {
        console.log(`Ordre orphelin trouvé: ${order.internalOrderId}`);
        const trade = createTradeFromOrders([order]);
        if (trade) {
          trades.push(trade);
        }
      }
    });
    
    console.log(`\n=== RÉSULTAT: ${trades.length} trade(s) créé(s) ===`);
    return trades;
  };

  // Gestion de l'import CSV
  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target.result;
        
        if (!content || content.trim() === '') {
          alert('Le fichier est vide');
          return;
        }

        // Détecter le type de fichier
        const isOrdersFile = content.includes('Entry Time') && 
                           content.includes('Internal Order ID') && 
                           content.includes('Buy/Sell');
        
        if (isOrdersFile) {
          await handleOrdersFileImport(content);
        } else {
          await handleStandardCSVImport(content);
        }
        
      } catch (error) {
        console.error('Erreur import:', error);
        alert(`Erreur lors de l'import: ${error.message}`);
      }
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  // Import de fichier d'ordres Sierra Chart
  const handleOrdersFileImport = async (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      alert('Fichier d\'ordres vide');
      return;
    }

    const orders = [];
    const headers = lines[0].split(',').map(h => h.trim());
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length < 14) continue;
      
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
        parentInternalOrderId: values[13]
      };
      
      orders.push(order);
    }

    // Grouper les ordres en trades avec la logique améliorée
    const trades = groupOrdersIntoTrades(orders);
    
    if (trades.length === 0) {
      alert('Aucun trade complet trouvé dans les ordres');
      return;
    }

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
      
      // Mettre à jour le capital
      const totalPnL = data.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      setCapitalSettings(prev => ({
        ...prev,
        currentCapital: prev.currentCapital + totalPnL
      }));
      
      alert(`${data.length} trade(s) importé(s) avec succès !`);
    }
  };

  // Import CSV standard
  const handleStandardCSVImport = async (csv) => {
    const lines = csv.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      alert('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
      return;
    }

    const separator = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(separator).map(h => h.trim());
    const newTrades = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(separator).map(v => v.trim());
      if (values.length < 3) continue;
      
      const trade = {};
      headers.forEach((header, idx) => {
        trade[header] = values[idx] || '';
      });
      
      const mappedTrade = {
        date: trade.Date || trade.date || new Date().toISOString(),
        symbol: trade.Symbol || trade.symbol || 'ES',
        side: trade.Side || trade.side || 'Long',
        quantity: parseInt(trade.Quantity || trade.quantity || '1') || 1,
        entry_price: parseFloat(trade.EntryPrice || trade.entry_price || '0') || 0,
        exit_price: parseFloat(trade.ExitPrice || trade.exit_price || '0') || 0,
        stop_loss: parseFloat(trade.StopLoss || trade.stop_loss || '0') || null,
        take_profit: parseFloat(trade.TakeProfit || trade.take_profit || '0') || null,
        pnl: parseFloat(trade.PnL || trade.pnl || '0') || 0,
        rating: null,
        comment: trade.Comment || trade.comment || '',
        grouped: false,
        execution_time: new Date().toISOString(),
        user_id: currentUser?.id
      };
      
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
      
      const totalPnL = data.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      setCapitalSettings(prev => ({
        ...prev,
        currentCapital: prev.currentCapital + totalPnL
      }));
      
      alert(`${data.length} trades importés avec succès !`);
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

  // Supprimer un trade individuel
  const deleteTrade = async (tradeId) => {
    try {
      const trade = trades.find(t => t.id === tradeId);
      
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      // Mettre à jour localement
      setTrades(prev => prev.filter(t => t.id !== tradeId));
      
      // Mettre à jour le capital
      if (trade) {
        setCapitalSettings(prev => ({
          ...prev,
          currentCapital: prev.currentCapital - (trade.pnl || 0)
        }));
      }
      
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur suppression trade:', error);
    }
  };

  // Recalculer le capital
  const recalculateCapital = (allTrades) => {
    const totalPnL = allTrades.reduce((sum, trade) => sum + (parseFloat(trade.pnl) || 0), 0);
    setCapitalSettings(prev => ({
      ...prev,
      currentCapital: prev.initialCapital + totalPnL
    }));
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
    if (journalEntries.length >= 30) newAchievements.push({ id: 'writer30', name: 'Écrivain', icon: '✍️', desc: '30 entrées journal' });
    
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

  // Fonctions helper pour le calendrier et les métriques
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
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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
      `${t.date},${t.symbol},${t.side},${t.quantity},${t.entry_price},${t.stop_loss || ''},${t.take_profit || ''},${t.exit_price || ''},${t.pnl},${commissions[t.symbol] || 0}`
    ).join('\n');
    
    const blob = new Blob([`Date,Symbol,Side,Qty,Entry,SL,TP,Exit,P&L,Commission\n${csvContent}`], 
      { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades_fiscal_${new Date().getFullYear()}.csv`;
    a.click();
  };

  // Fonction pour obtenir les données de P&L journalier
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
      .slice(-30);

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
      cumR: 0
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
  }

  // Application principale - SUITE DU CODE DANS LA PROCHAINE PARTIE
// Application principale
  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-colors`}>
      {/* Header avec logo */}
      <header className={`${cardClass} border-b ${borderClass} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900">TM</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold">TopMove Trading</h1>
              <p className="text-xs opacity-70">
                {currentUser?.email?.split('@')[0]} • {userRole === 'teacher' ? '👨‍🏫 Formateur' : '📚 Élève'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Achievements rapides */}
            <div className="hidden md:flex gap-1">
              {achievements.slice(0, 3).map(a => (
                <span key={a.id} className="text-xl" title={a.desc}>
                  {a.icon}
                </span>
              ))}
            </div>
            
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-700"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <label className="cursor-pointer p-2 rounded-lg hover:bg-gray-700">
              <Upload size={20} />
              <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
            </label>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-700 text-red-400"
              title="Déconnexion"
            >
              <LogIn size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Alerte de risque */}
      {showRiskAlert && (
        <div className="fixed top-20 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle />
            <span>Attention: Exposition > {riskLimit}%!</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`${cardClass} border-b ${borderClass} px-4 py-2`}>
        <div className="flex gap-2 overflow-x-auto">
          {['dashboard', 'calendar', 'trades', 'metrics', 'psychology', 'journal', 'calculator', 'chat', 'achievements', 'settings'].map(view => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                currentView === view ? 'bg-blue-500 text-white' : 'hover:bg-gray-700'
              }`}
            >
              {view === 'dashboard' && '📊 Tableau de bord'}
              {view === 'calendar' && '📅 Calendrier'}
              {view === 'trades' && '💹 Trades'}
              {view === 'metrics' && '📈 Métriques'}
              {view === 'psychology' && '🧠 Psychologie'}
              {view === 'journal' && '📝 Journal'}
              {view === 'calculator' && '🧮 Calculateur'}
              {view === 'chat' && '💬 Discussion'}
              {view === 'achievements' && '🎖️ Succès'}
              {view === 'settings' && '⚙️ Paramètres'}
            </button>
          ))}
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="p-4">
        {/* Dashboard */}
        {currentView === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Message de motivation personnalisé */}
            {userRole === 'student' && (
              <div className={`${cardClass} p-6 rounded-xl border ${borderClass} lg:col-span-3`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Votre Progression Personnelle</h3>
                    <p className="text-sm opacity-70">
                      Concentrez-vous sur votre processus et votre amélioration continue. 
                      Chaque trade est une opportunité d'apprentissage.
                    </p>
                  </div>
                  <Target className="text-blue-500" size={32} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">{trades.filter(t => t.pnl > 0).length}</p>
                    <p className="text-xs opacity-70">Trades gagnants</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">{trades.filter(t => t.rating).length}</p>
                    <p className="text-xs opacity-70">Trades analysés</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-500">{journalEntries.length}</p>
                    <p className="text-xs opacity-70">Notes journal</p>
                  </div>
                </div>
              </div>
            )}

            {/* Vue professeur - Stats globales */}
            {userRole === 'teacher' && (
              <div className={`${cardClass} p-6 rounded-xl border ${borderClass} lg:col-span-3`}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users /> Statistiques de la Classe
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs opacity-70">Élèves actifs</p>
                    <p className="text-xl font-bold">47</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Trades moyens/élève</p>
                    <p className="text-xl font-bold">156</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Taux d'analyse</p>
                    <p className="text-xl font-bold text-green-500">78%</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Messages chat/jour</p>
                    <p className="text-xl font-bold">234</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cartes métriques standards */}
            <div className={`${cardClass} p-6 rounded-xl border ${borderClass}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm opacity-70">P&L Total</h3>
                <DollarSign className="opacity-50" size={20} />
              </div>
              <p className={`text-2xl font-bold ${metrics.totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${metrics.totalPL.toFixed(2)}
              </p>
              <div className="mt-2 h-1 bg-gray-700 rounded">
                <div 
                  className={`h-1 rounded ${metrics.totalPL >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(metrics.totalPL) / objectives.monthly * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className={`${cardClass} p-6 rounded-xl border ${borderClass}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm opacity-70">Win Rate</h3>
                <Percent className="opacity-50" size={20} />
              </div>
              <p className="text-2xl font-bold">{metrics.winRate.toFixed(1)}%</p>
              <div className="mt-2 flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`flex-1 h-2 rounded ${
                    i < Math.floor(metrics.winRate / 10) ? 'bg-green-500' : 'bg-gray-700'
                  }`} />
                ))}
              </div>
            </div>

            <div className={`${cardClass} p-6 rounded-xl border ${borderClass}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm opacity-70">R:R Moyen</h3>
                <Target className="opacity-50" size={20} />
              </div>
              <p className="text-2xl font-bold">{metrics.avgRR.toFixed(2)}</p>
              <p className="text-xs opacity-70 mt-1">
                Profit Factor: {metrics.profitFactor.toFixed(2)}
              </p>
            </div>

            <div className={`${cardClass} p-6 rounded-xl border ${borderClass}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm opacity-70">Trades</h3>
                <Hash className="opacity-50" size={20} />
              </div>
              <p className="text-2xl font-bold">{metrics.totalTrades}</p>
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className="text-green-500">W: {trades.filter(t => t.pnl > 0).length}</span>
                <span className="text-red-500">L: {trades.filter(t => t.pnl < 0).length}</span>
              </div>
            </div>

            <div className={`${cardClass} p-6 rounded-xl border ${borderClass}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm opacity-70">Max Drawdown</h3>
                <TrendingDown className="opacity-50" size={20} />
              </div>
              <p className="text-2xl font-bold text-red-500">
                -${metrics.maxDrawdown.toFixed(2)}
              </p>
            </div>

            <div className={`${cardClass} p-6 rounded-xl border ${borderClass}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm opacity-70">Expectancy</h3>
                <Activity className="opacity-50" size={20} />
              </div>
              <p className={`text-2xl font-bold ${metrics.expectancy >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${metrics.expectancy.toFixed(2)}
              </p>
            </div>

            {/* Graphique P&L journalier amélioré avec auto-scaling */}
            <div className={`${cardClass} p-6 rounded-xl border ${borderClass} md:col-span-2 lg:col-span-3`}>
              <h3 className="text-sm opacity-70 mb-4">P&L Journalier (30 derniers jours)</h3>
              <div className="h-48 overflow-hidden">
                <div className="h-full flex items-end justify-between gap-1">
                  {trades.length > 0 ? (() => {
                    const dailyData = getDailyPLData();
                    const maxAbsPL = Math.max(...dailyData.map(([, pl]) => Math.abs(pl)));
                    
                    return dailyData.map(([date, pl], idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1 max-w-[30px]">
                        <div
                          className={`w-full ${pl >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-t min-h-[2px]`}
                          style={{ 
                            height: maxAbsPL > 0 ? `${Math.max((Math.abs(pl) / maxAbsPL) * 90, 2)}%` : '2px',
                            maxHeight: '160px'
                          }}
                          title={`${date}: ${pl.toFixed(2)}`}
                        />
                        <span className="text-xs mt-2 opacity-70 transform rotate-45 origin-left whitespace-nowrap">
                          {date}
                        </span>
                      </div>
                    ));
                  })() : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      Importez des trades pour voir le graphique
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nouveau graphique R */}
            <div className={`${cardClass} p-6 rounded-xl border ${borderClass} md:col-span-2 lg:col-span-3`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm opacity-70">Évolution en R</h3>
                <div className="flex gap-2 text-xs">
                  <input
                    type="date"
                    value={chartDateRange.start}
                    onChange={(e) => setChartDateRange(prev => ({...prev, start: e.target.value}))}
                    className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  />
                  <input
                    type="date"
                    value={chartDateRange.end}
                    onChange={(e) => setChartDateRange(prev => ({...prev, end: e.target.value}))}
                    className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  />
                </div>
              </div>
              <div className="h-48 relative">
                {trades.length > 0 ? (() => {
                  const rData = getRData();
                  if (rData.length === 0) return <div className="w-full h-full flex items-center justify-center text-gray-500">Aucune donnée dans la période sélectionnée</div>;
                  
                  const maxR = Math.max(...rData.map(d => Math.abs(d.cumR)));
                  const minR = Math.min(...rData.map(d => d.cumR));
                  
                  return (
                    <svg className="w-full h-full">
                      {/* Ligne zéro */}
                      <line 
                        x1="0" 
                        y1="50%" 
                        x2="100%" 
                        y2="50%" 
                        stroke="#6B7280" 
                        strokeWidth="1" 
                        strokeDasharray="5,5"
                      />
                      {/* Courbe R */}
                      <polyline
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        points={rData.map((d, i) => {
                          const x = (i / (rData.length - 1)) * 100;
                          const y = maxR > 0 ? (1 - (d.cumR - minR) / (maxR - minR)) * 100 : 50;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                      {/* Points */}
                      {rData.map((d, i) => {
                        const x = (i / (rData.length - 1)) * 100;
                        const y = maxR > 0 ? (1 - (d.cumR - minR) / (maxR - minR)) * 100 : 50;
                        return (
                          <circle
                            key={i}
                            cx={`${x}%`}
                            cy={`${y}%`}
                            r="3"
                            fill={d.cumR >= 0 ? "#10B981" : "#EF4444"}
                          >
                            <title>{`${d.date}: ${d.cumR.toFixed(2)}R`}</title>
                          </circle>
                        );
                      })}
                    </svg>
                  );
                })() : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Importez des trades pour voir l'évolution en R
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs opacity-70 text-center">
                Risque journalier: {capitalSettings.dailyRiskDollar ? `$${capitalSettings.dailyRiskDollar}` : `${capitalSettings.dailyRiskPercent}% ($${(capitalSettings.initialCapital * capitalSettings.dailyRiskPercent / 100).toFixed(0)})`}
              </div>
            </div>

            {/* Nouveau graphique d'évolution du capital */}
            <div className={`${cardClass} p-6 rounded-xl border ${borderClass} md:col-span-2 lg:col-span-3`}>
              <h3 className="text-sm opacity-70 mb-4">Évolution du Capital</h3>
              <div className="h-48 relative">
                {trades.length > 0 ? (() => {
                  const capitalData = getCapitalData();
                  if (capitalData.length === 0) return <div className="w-full h-full flex items-center justify-center text-gray-500">Aucune donnée dans la période sélectionnée</div>;
                  
                  const maxCapital = Math.max(...capitalData.map(d => d.capital));
                  const minCapital = Math.min(...capitalData.map(d => d.capital));
                  const initialCap = capitalSettings.initialCapital;
                  
                  return (
                    <svg className="w-full h-full">
                      {/* Ligne de capital initial */}
                      <line 
                        x1="0" 
                        y1={`${(1 - (initialCap - minCapital) / (maxCapital - minCapital)) * 100}%`}
                        x2="100%" 
                        y2={`${(1 - (initialCap - minCapital) / (maxCapital - minCapital)) * 100}%`}
                        stroke="#6B7280" 
                        strokeWidth="1" 
                        strokeDasharray="5,5"
                      />
                      {/* Courbe capital */}
                      <polyline
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        points={capitalData.map((d, i) => {
                          const x = (i / (capitalData.length - 1)) * 100;
                          const y = (1 - (d.capital - minCapital) / (maxCapital - minCapital)) * 100;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                      {/* Points */}
                      {capitalData.map((d, i) => {
                        const x = (i / (capitalData.length - 1)) * 100;
                        const y = (1 - (d.capital - minCapital) / (maxCapital - minCapital)) * 100;
                        return (
                          <circle
                            key={i}
                            cx={`${x}%`}
                            cy={`${y}%`}
                            r="3"
                            fill={d.capital >= initialCap ? "#10B981" : "#EF4444"}
                          >
                            <title>{`${d.date}: $${d.capital.toFixed(2)}`}</title>
                          </circle>
                        );
                      })}
                    </svg>
                  );
                })() : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Importez des trades pour voir l'évolution du capital
                  </div>
                )}
              </div>
              <div className="mt-2 flex justify-between text-xs opacity-70">
                <span>Capital initial: ${capitalSettings.initialCapital.toLocaleString()}</span>
                <span>Capital actuel: ${capitalSettings.currentCapital.toLocaleString()}</span>
              </div>
            </div>

            <div className={`${cardClass} p-6 rounded-xl border ${borderClass} md:col-span-2 lg:col-span-3`}>
              <h3 className="text-sm opacity-70 mb-4">Analyse des Séries</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs opacity-70">Plus longue série de gains</p>
                  <p className="text-xl font-bold text-green-500">{metrics.winStreak}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Plus longue série de pertes</p>
                  <p className="text-xl font-bold text-red-500">{metrics.lossStreak}</p>
                </div>
              </div>
            </div>
          </div>
        )}
{/* Trades avec suppression et ajout manuel */}
        {currentView === 'trades' && (
          <div className={`${cardClass} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Historique des Trades</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddTradeModal(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                >
                  <Plus size={16} /> Ajouter un trade
                </button>
                {trades.length > 0 && (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Tout supprimer
                  </button>
                )}
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
                      <tr key={trade.id} className={`border-b ${borderClass} ${
                        !trade.exit_price ? 'bg-yellow-500/10' : ''
                      }`}>
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
                            className={`w-20 px-1 py-1 text-xs rounded ${
                              !trade.exit_price ? 'bg-yellow-500/20 border border-yellow-500' : isDark ? 'bg-gray-700' : 'bg-gray-100'
                            }`}
                            placeholder="Exit"
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
                            placeholder="Commentaire..."
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

        {/* Metrics */}
        {currentView === 'metrics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${cardClass} p-6 rounded-xl border ${borderClass}`}>
              <h3 className="text-lg font-bold mb-4">Comparaison Mensuelle</h3>
              <div className="space-y-2">
                {(() => {
                  const months = {};
                  trades.forEach(t => {
                    const month = new Date(t.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                    if (!months[month]) months[month] = 0;
                    months[month] += parseFloat(t.pnl || 0);
                  });
                  
                  return Object.entries(months).length > 0 ? Object.entries(months).map(([month, pl]) => (
                    <div key={month} className="flex items-center justify-between">
                      <span className="text-sm">{month}</span>
                      <span className={`font-bold ${pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${pl.toFixed(2)}
                      </span>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center">Importez des trades pour voir les statistiques</p>
                  );
                })()}
              </div>
            </div>

            <div className={`${cardClass} p-6 rounded-xl border ${borderClass}`}>
              <h3 className="text-lg font-bold mb-4">Corrélation État Mental</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>État Bon</span>
                    <span className="text-green-500">+$450 avg</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded">
                    <div className="h-2 bg-green-500 rounded" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>État Neutre</span>
                    <span className="text-yellow-500">+$120 avg</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded">
                    <div className="h-2 bg-yellow-500 rounded" style={{ width: '45%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>État Mauvais</span>
                    <span className="text-red-500">-$280 avg</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded">
                    <div className="h-2 bg-red-500 rounded" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        {currentView === 'settings' && (
          <div className={`${cardClass} rounded-xl p-6 max-w-2xl mx-auto`}>
            <h2 className="text-xl font-bold mb-6">Paramètres</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Commissions par symbole</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium opacity-70 mb-2">📈 Indices</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['ES', 'NQ', 'YM', 'RTY', 'MES', 'MNQ', 'MYM', 'M2K'].map(symbol => (
                        <div key={symbol} className="flex items-center gap-1">
                          <label className={`text-xs w-10 ${symbol.startsWith('M') ? 'text-blue-400' : ''}`}>
                            {symbol}:
                          </label>
                          <input
                            type="number"
                            value={commissions[symbol]}
                            onChange={(e) => setCommissions(prev => ({
                              ...prev,
                              [symbol]: parseFloat(e.target.value)
                            }))}
                            className={`flex-1 p-1 text-sm rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                            step="0.1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium opacity-70 mb-2">🥇 Métaux</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['GC', 'SI', 'HG', 'PL', 'MGC', 'SIL', 'QO'].map(symbol => (
                        <div key={symbol} className="flex items-center gap-1">
                          <label className={`text-xs w-10 ${['MGC', 'SIL', 'QO'].includes(symbol) ? 'text-yellow-400' : ''}`}>
                            {symbol}:
                          </label>
                          <input
                            type="number"
                            value={commissions[symbol]}
                            onChange={(e) => setCommissions(prev => ({
                              ...prev,
                              [symbol]: parseFloat(e.target.value)
                            }))}
                            className={`flex-1 p-1 text-sm rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                            step="0.1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Objectifs P&L</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm w-24">Journalier:</label>
                    <input
                      type="number"
                      value={objectives.daily}
                      onChange={(e) => setObjectives(prev => ({
                        ...prev,
                        daily: parseFloat(e.target.value)
                      }))}
                      className={`flex-1 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm w-24">Hebdomadaire:</label>
                    <input
                      type="number"
                      value={objectives.weekly}
                      onChange={(e) => setObjectives(prev => ({
                        ...prev,
                        weekly: parseFloat(e.target.value)
                      }))}
                      className={`flex-1 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm w-24">Mensuel:</label>
                    <input
                      type="number"
                      value={objectives.monthly}
                      onChange={(e) => setObjectives(prev => ({
                        ...prev,
                        monthly: parseFloat(e.target.value)
                      }))}
                      className={`flex-1 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Gestion du Capital</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm w-32">Capital initial ($):</label>
                    <input
                      type="number"
                      value={capitalSettings.initialCapital}
                      onChange={(e) => setCapitalSettings(prev => ({
                        ...prev,
                        initialCapital: parseFloat(e.target.value) || 0
                      }))}
                      className={`flex-1 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm w-32">Capital actuel ($):</label>
                    <input
                      type="number"
                      value={capitalSettings.currentCapital}
                      onChange={(e) => setCapitalSettings(prev => ({
                        ...prev,
                        currentCapital: parseFloat(e.target.value) || 0
                      }))}
                      className={`flex-1 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    />
                    <button
                      onClick={() => recalculateCapital(trades)}
                      className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                      title="Recalculer basé sur tous les trades"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm w-32">Risque journalier (%):</label>
                    <input
                      type="number"
                      value={capitalSettings.dailyRiskPercent}
                      onChange={(e) => {
                        const percent = parseFloat(e.target.value) || 0;
                        setCapitalSettings(prev => ({
                          ...prev,
                          dailyRiskPercent: percent,
                          dailyRiskDollar: prev.initialCapital * percent / 100
                        }));
                      }}
                      className={`w-20 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                      step="0.1"
                    />
                    <span className="text-sm opacity-70">
                      = ${(capitalSettings.initialCapital * capitalSettings.dailyRiskPercent / 100).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm w-32">Risque journalier ($):</label>
                    <input
                      type="number"
                      value={capitalSettings.dailyRiskDollar}
                      onChange={(e) => {
                        const dollar = parseFloat(e.target.value) || 0;
                        setCapitalSettings(prev => ({
                          ...prev,
                          dailyRiskDollar: dollar,
                          dailyRiskPercent: prev.initialCapital > 0 ? (dollar / prev.initialCapital) * 100 : 0
                        }));
                      }}
                      className={`flex-1 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    saveSettings();
                    alert('Paramètres sauvegardés !');
                  }}
                  className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  💾 Sauvegarder les paramètres
                </button>
                <button
                  onClick={exportFiscal}
                  className="flex-1 py-2 bg-green-500 rounded hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Export Fiscal
                </button>
                <button 
                  onClick={() => alert('Synchronisation avec Google Drive en cours de développement')}
                  className="flex-1 py-2 bg-blue-500 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Cloud size={20} />
                  Sync Drive
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Autres vues (Calendar, Psychology, Journal, Calculator, Chat, Achievements) - Vous pouvez les ajouter si nécessaire */}
        
      </main>
    </div>
  );
};

export default TradingJournalSupabase;
