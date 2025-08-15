import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, BarChart3, Settings, Moon, Sun, Upload, AlertTriangle, Target, Brain, BookOpen, Calculator, Download, Cloud, ChevronLeft, ChevronRight, Star, MessageSquare, DollarSign, Percent, Hash, Activity, PieChart, LineChart, Shield, CheckCircle, XCircle, AlertCircle, Users, Trophy, Award, Lock, LogIn, UserPlus, Eye, EyeOff, School, Send } from 'lucide-react';

// Configuration de l'application
const APP_CONFIG = {
  appName: "TopMove Trading Journal",
  appUrl: "https://app.topmovetrading.fr",
  mainSite: "https://topmovetrading.fr",
  supportEmail: "support@topmovetrading.fr",
  version: "1.0.0"
};

const TradingJournalSchool = () => {
  // États d'authentification avec localStorage pour persister
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState('login');
  const [credentials, setCredentials] = useState({ email: '', password: '', name: '' });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'student';
  });
  
  // États principaux avec persistance localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [currentView, setCurrentView] = useState('dashboard');
  const [trades, setTrades] = useState(() => {
    const saved = localStorage.getItem('trades');
    return saved ? JSON.parse(saved) : [];
  });
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
  const [journalEntries, setJournalEntries] = useState(() => {
    const saved = localStorage.getItem('journalEntries');
    return saved ? JSON.parse(saved) : [];
  });
  const [objectives, setObjectives] = useState({ daily: 500, weekly: 2000, monthly: 8000 });
  const [riskLimit, setRiskLimit] = useState(2);
  const [showRiskAlert, setShowRiskAlert] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Marie L.', message: 'Quelqu\'un trade les NFP aujourd\'hui ?', time: '09:15', avatar: '👩' },
    { id: 2, user: 'Thomas R.', message: 'Je reste flat, trop volatil pour moi', time: '09:18', avatar: '👨' },
    { id: 3, user: 'Sophie M.', message: 'Bonne séance à tous ! 💪', time: '09:20', avatar: '👩‍💼' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Sauvegarder les données importantes dans localStorage
  useEffect(() => {
    localStorage.setItem('trades', JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('userRole', userRole);
    }
  }, [isAuthenticated, currentUser, userRole]);

  // Questions psychologiques
  const psychQuestions = [
    { id: 'fatigue', question: 'Êtes-vous fatigué ?', reversed: true },
    { id: 'emotion', question: 'Vous sentez-vous bien émotionnellement ?' },
    { id: 'focus', question: 'Êtes-vous concentré ?' },
    { id: 'stress', question: 'Êtes-vous stressé ?', reversed: true },
    { id: 'confidence', question: 'Êtes-vous confiant ?' }
  ];

  // Métriques de trading
  const metrics = useMemo(() => {
    if (trades.length === 0) return {
      totalPL: 0, winRate: 0, avgRR: 0, profitFactor: 0,
      maxDrawdown: 0, avgWin: 0, avgLoss: 0, totalTrades: 0,
      winStreak: 0, lossStreak: 0, expectancy: 0
    };

    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const totalPL = trades.reduce((sum, t) => sum + t.pnl, 0);
    
    let cumulative = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    trades.forEach(t => {
      cumulative += t.pnl;
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

    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length) : 0;
    const winRate = (wins.length / trades.length) * 100;
    const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;
    const profitFactor = losses.length > 0 ? 
      wins.reduce((sum, t) => sum + t.pnl, 0) / Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0)) : 0;
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

  // Fonction pour envoyer un message dans le chat
  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: currentUser?.name || 'Vous',
        message: newMessage,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        avatar: '🧑‍💼',
        isOwn: true
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulation de réponses automatiques
      if (newMessage.toLowerCase().includes('aide') || newMessage.toLowerCase().includes('help')) {
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: Date.now() + 1,
            user: 'Assistant TopMove',
            message: 'N\'hésitez pas à poser vos questions ! La communauté est là pour vous aider. 🤝',
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            avatar: '🤖'
          }]);
        }, 1000);
      }
    }
  };

  // Calcul du score psychologique
  useEffect(() => {
    const answers = Object.values(psychAnswers);
    if (answers.length === psychQuestions.length) {
      const score = answers.reduce((a, b) => a + b, 0) / answers.length;
      setPsychScore(score);
    }
  }, [psychAnswers, psychQuestions.length]);

  // Check achievements
  useEffect(() => {
    if (isAuthenticated) {
      checkAchievements();
    }
    // eslint-disable-next-line
  }, [trades, psychScore, isAuthenticated, journalEntries, chatMessages]);

  // Gestion de l'authentification
  const handleAuth = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      // Simulation de connexion
      if (credentials.email && credentials.password) {
        setIsAuthenticated(true);
        setCurrentUser({ 
          name: credentials.email.split('@')[0], 
          email: credentials.email,
          role: credentials.email.includes('topmove') ? 'teacher' : 'student'
        });
        setUserRole(credentials.email.includes('topmove') ? 'teacher' : 'student');
      }
    } else {
      // Simulation d'inscription
      if (credentials.email && credentials.password && credentials.name) {
        setIsAuthenticated(true);
        setCurrentUser({ 
          name: credentials.name, 
          email: credentials.email,
          role: 'student'
        });
        setUserRole('student');
      }
    }
  };

  // Gestion de l'import CSV
  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const newTrades = lines.slice(1).filter(line => line.trim()).map((line, idx) => {
          const values = line.split(',');
          const trade = {};
          headers.forEach((header, i) => {
            trade[header.trim()] = values[i]?.trim();
          });
          
          return {
            id: Date.now() + idx,
            date: new Date(trade.Date || Date.now()),
            symbol: trade.Symbol || 'ES',
            side: trade.Side || 'Long',
            quantity: parseInt(trade.Quantity) || 1,
            entryPrice: parseFloat(trade.EntryPrice) || 0,
            exitPrice: parseFloat(trade.ExitPrice) || 0,
            pnl: parseFloat(trade.PnL) || Math.random() * 1000 - 500,
            rating: null,
            comment: '',
            grouped: false,
            executionTime: trade.ExecutionTime || new Date().toISOString()
          };
        });

        const grouped = newTrades.reduce((acc, trade) => {
          const key = trade.executionTime;
          if (!acc[key]) acc[key] = [];
          acc[key].push(trade);
          return acc;
        }, {});

        Object.values(grouped).forEach(group => {
          if (group.length > 1) {
            group.forEach(t => t.grouped = true);
          }
        });

        setTrades(prev => [...prev, ...newTrades]);
        checkRiskExposure(newTrades);
      };
      reader.readAsText(file);
    }
  };

  const checkRiskExposure = (tradesToCheck) => {
    const openTrades = tradesToCheck.filter(t => !t.exitPrice);
    const exposure = openTrades.reduce((sum, t) => sum + Math.abs(t.quantity * t.entryPrice), 0);
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
      .reduce((sum, t) => sum + t.pnl, 0);
  };

  const getWeekPL = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return trades
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate >= weekStart && tDate <= weekEnd;
      })
      .reduce((sum, t) => sum + t.pnl, 0);
  };

  const exportFiscal = () => {
    const csvContent = trades.map(t => 
      `${t.date},${t.symbol},${t.side},${t.quantity},${t.entryPrice},${t.exitPrice},${t.pnl},${commissions[t.symbol] || 0}`
    ).join('\n');
    
    const blob = new Blob([`Date,Symbol,Side,Qty,Entry,Exit,P&L,Commission\n${csvContent}`], 
      { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades_fiscal_${new Date().getFullYear()}.csv`;
    a.click();
  };

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

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
              className="w-full py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-lg hover:opacity-90 transition"
            >
              {authMode === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-sm text-blue-400 hover:underline"
            >
              {authMode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
            <p className="text-xs text-center">
              📚 Réservé aux élèves de TopMove Trading
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                {currentUser?.name} • {userRole === 'teacher' ? '👨‍🏫 Formateur' : '📚 Élève'}
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
              onClick={() => {
                setIsAuthenticated(false);
                setCurrentUser(null);
                setTrades([]);
                localStorage.clear();
              }}
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

      {/* Score psychologique */}
      {psychScore !== null && (
        <div className={`fixed top-20 left-4 ${cardClass} p-4 rounded-lg shadow-lg z-40`}>
          <div className="flex items-center gap-3">
            <Brain className={psychScore > 3 ? 'text-green-500' : psychScore > 2 ? 'text-yellow-500' : 'text-red-500'} />
            <div>
              <p className="text-sm opacity-70">État mental</p>
              <p className="font-bold">
                {psychScore > 3 ? 'Bon' : psychScore > 2 ? 'Neutre' : 'Mauvais'}
              </p>
            </div>
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

            <div className={`${cardClass} p-6 rounded-xl border ${borderClass} md:col-span-2 lg:col-span-3`}>
              <h3 className="text-sm opacity-70 mb-4">Courbe de P&L</h3>
              <div className="h-48 flex items-end gap-1">
                {trades.length > 0 ? trades.slice(-30).map((trade, idx) => {
                  const cumPL = trades.slice(0, trades.indexOf(trade) + 1)
                    .reduce((sum, t) => sum + t.pnl, 0);
                  return (
                    <div
                      key={idx}
                      className={`flex-1 ${cumPL >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-t`}
                      style={{ height: `${Math.abs(cumPL) / Math.max(...trades.map(t => Math.abs(t.pnl))) * 100}%` }}
                    />
                  );
                }) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Importez des trades pour voir le graphique
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat */}
        {currentView === 'chat' && (
          <div className={`${cardClass} rounded-xl p-4 max-w-4xl mx-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="text-blue-500" />
                Espace Discussion TopMove
              </h2>
              <div className="flex items-center gap-2 text-sm opacity-70">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>12 élèves en ligne</span>
              </div>
            </div>

            {/* Zone de messages */}
            <div className={`h-96 overflow-y-auto p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg mb-4`}>
              <div className="space-y-3">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${msg.isOwn ? 'order-2' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!msg.isOwn && <span className="text-xl">{msg.avatar}</span>}
                        <span className="text-xs opacity-70">
                          {msg.user} • {msg.time}
                        </span>
                        {msg.isOwn && <span className="text-xl">{msg.avatar}</span>}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        msg.isOwn 
                          ? 'bg-blue-500 text-white' 
                          : msg.user === 'Assistant TopMove'
                          ? 'bg-yellow-500/20 border border-yellow-500'
                          : isDark ? 'bg-gray-800' : 'bg-white'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone d'envoi */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                placeholder="Tapez votre message..."
              />
              <button
                onClick={sendMessage}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                Envoyer
              </button>
            </div>

            {/* Règles du chat */}
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
              <p className="text-xs">
                💡 <strong>Règles de la communauté :</strong> Respectez les autres traders • Partagez vos analyses • 
                Pas de conseils financiers • Entraide et bienveillance
              </p>
            </div>
          </div>
        )}

        {/* Achievements */}
        {currentView === 'achievements' && (
          <div className={`${cardClass} rounded-xl p-6`}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Award className="text-yellow-500" />
              Votre Progression Personnelle
            </h2>
            
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg">
              <p className="text-sm">
                🌟 <strong>Philosophie TopMove :</strong> Le succès en trading ne se mesure pas par rapport aux autres, 
                mais par votre amélioration constante et votre discipline personnelle. Chaque badge représente un pas vers la maîtrise.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${borderClass} text-center hover:scale-105 transition`}
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <p className="font-bold text-sm">{achievement.name}</p>
                  <p className="text-xs opacity-70 mt-1">{achievement.desc}</p>
                </div>
              ))}
              
              {/* Achievements verrouillés */}
              {[...Array(Math.max(0, 9 - achievements.length))].map((_, idx) => (
                <div
                  key={`locked-${idx}`}
                  className="p-4 rounded-lg border border-gray-700 text-center opacity-30"
                >
                  <div className="text-4xl mb-2">🔒</div>
                  <p className="font-bold text-sm">À découvrir</p>
                  <p className="text-xs opacity-70 mt-1">Continuez votre progression</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg">
              <h3 className="font-bold mb-3">Prochain Objectif Personnel</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">📊 100 trades analysés</span>
                    <span className="text-sm font-bold">{trades.filter(t => t.rating).length}/100</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded">
                    <div 
                      className="h-2 bg-blue-500 rounded transition-all"
                      style={{ width: `${Math.min((trades.filter(t => t.rating).length / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">📝 30 entrées journal</span>
                    <span className="text-sm font-bold">{journalEntries.length}/30</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded">
                    <div 
                      className="h-2 bg-green-500 rounded transition-all"
                      style={{ width: `${Math.min((journalEntries.length / 30) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">💬 Participer aux discussions</span>
                    <span className="text-sm font-bold">{chatMessages.filter(m => m.isOwn).length}/10</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded">
                    <div 
                      className="h-2 bg-purple-500 rounded transition-all"
                      style={{ width: `${Math.min((chatMessages.filter(m => m.isOwn).length / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendrier */}
        {currentView === 'calendar' && (
          <div className={`${cardClass} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setCurrentDate(newDate);
                  }}
                  className="p-2 hover:bg-gray-700 rounded"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-bold">
                  {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setCurrentDate(newDate);
                  }}
                  className="p-2 hover:bg-gray-700 rounded"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCalendarView('month')}
                  className={`px-3 py-1 rounded ${calendarView === 'month' ? 'bg-blue-500' : 'hover:bg-gray-700'}`}
                >
                  Mois
                </button>
                <button
                  onClick={() => setCalendarView('week')}
                  className={`px-3 py-1 rounded ${calendarView === 'week' ? 'bg-blue-500' : 'hover:bg-gray-700'}`}
                >
                  Semaine
                </button>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="text-center text-xs opacity-70 py-2">
                  {day}
                </div>
              ))}
              <div className="text-center text-xs opacity-70 py-2">P&L Sem.</div>

              {(() => {
                const days = generateCalendar();
                const weeks = [];
                for (let i = 0; i < days.length; i += 7) {
                  weeks.push(days.slice(i, i + 7));
                }
                
                return weeks.map((week, weekIdx) => (
                  <React.Fragment key={weekIdx}>
                    {week.map(day => {
                      const dayPL = getDayPL(day);
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                      
                      return (
                        <div
                          key={day.toISOString()}
                          className={`p-2 rounded ${
                            isCurrentMonth ? '' : 'opacity-30'
                          } ${
                            dayPL > 0 ? 'bg-green-500/20 border border-green-500' :
                            dayPL < 0 ? 'bg-red-500/20 border border-red-500' :
                            `border ${borderClass}`
                          }`}
                        >
                          <div className="text-xs opacity-70">{day.getDate()}</div>
                          {dayPL !== 0 && (
                            <div className={`text-xs font-bold ${dayPL > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              ${dayPL.toFixed(0)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="p-2 rounded bg-blue-500/20 border border-blue-500">
                      <div className="text-xs font-bold text-blue-500">
                        ${getWeekPL(week[0]).toFixed(0)}
                      </div>
                    </div>
                  </React.Fragment>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Trades */}
        {currentView === 'trades' && (
          <div className={`${cardClass} rounded-xl p-4`}>
            <h2 className="text-xl font-bold mb-4">Historique des Trades</h2>
            {trades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Symbol</th>
                      <th className="text-left p-2">Side</th>
                      <th className="text-left p-2">Qty</th>
                      <th className="text-left p-2">P&L</th>
                      <th className="text-left p-2">Note</th>
                      <th className="text-left p-2">Commentaire</th>
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
                        <td className={`p-2 text-sm font-bold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ${trade.pnl.toFixed(2)}
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(star => (
                              <button
                                key={star}
                                onClick={() => {
                                  const updated = trades.map(t => 
                                    t.id === trade.id ? {...t, rating: star} : t
                                  );
                                  setTrades(updated);
                                }}
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
                            onChange={(e) => {
                              const updated = trades.map(t => 
                                t.id === trade.id ? {...t, comment: e.target.value} : t
                              );
                              setTrades(updated);
                            }}
                            className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-sm`}
                            placeholder="Ajouter un commentaire..."
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Upload size={48} className="mx-auto mb-4 opacity-50" />
                <p>Aucun trade importé</p>
                <p className="text-sm mt-2">Utilisez le bouton d'import CSV dans l'en-tête</p>
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
                    months[month] += t.pnl;
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
              <h3 className="text-lg font-bold mb-4">Distribution P&L</h3>
              <div className="h-32 flex items-end gap-1">
                {trades.length > 0 ? (() => {
                  const ranges = [
                    { min: -1000, max: -500 },
                    { min: -500, max: -250 },
                    { min: -250, max: -100 },
                    { min: -100, max: 0 },
                    { min: 0, max: 100 },
                    { min: 100, max: 250 },
                    { min: 250, max: 500 },
                    { min: 500, max: 1000 }
                  ];
                  
                  return ranges.map((range, idx) => {
                    const count = trades.filter(t => t.pnl >= range.min && t.pnl < range.max).length;
                    const maxCount = Math.max(...ranges.map(r => 
                      trades.filter(t => t.pnl >= r.min && t.pnl < r.max).length
                    ));
                    
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div
                          className={`w-full ${range.max <= 0 ? 'bg-red-500' : 'bg-green-500'} rounded-t`}
                          style={{ height: count > 0 && maxCount > 0 ? `${(count / maxCount) * 100}%` : '2px' }}
                        />
                        <span className="text-xs mt-1 rotate-45">{range.min}</span>
                      </div>
                    );
                  });
                })() : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Pas de données
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Psychology */}
        {currentView === 'psychology' && (
          <div className={`${cardClass} rounded-xl p-6 max-w-2xl mx-auto`}>
            <h2 className="text-xl font-bold mb-6">Évaluation Psychologique</h2>
            
            <div className="space-y-4">
              {psychQuestions.map(q => (
                <div key={q.id} className="space-y-2">
                  <p className="text-sm">{q.question}</p>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(value => {
                      const actualValue = q.reversed ? 6 - value : value;
                      return (
                        <button
                          key={value}
                          onClick={() => setPsychAnswers(prev => ({...prev, [q.id]: actualValue}))}
                          className={`flex-1 py-2 rounded ${
                            psychAnswers[q.id] === actualValue ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          {value === 1 ? '😟' : value === 2 ? '😐' : value === 3 ? '😊' : value === 4 ? '😄' : '🚀'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {psychScore !== null && (
              <div className="mt-6 p-4 rounded-lg bg-gray-700">
                <div className="flex items-center justify-between">
                  <span>Score Global:</span>
                  <div className="flex items-center gap-2">
                    {psychScore > 3 ? <CheckCircle className="text-green-500" /> :
                     psychScore > 2 ? <AlertCircle className="text-yellow-500" /> :
                     <XCircle className="text-red-500" />}
                    <span className={`text-xl font-bold ${
                      psychScore > 3 ? 'text-green-500' : 
                      psychScore > 2 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {psychScore > 3 ? 'BON' : psychScore > 2 ? 'NEUTRE' : 'MAUVAIS'}
                    </span>
                  </div>
                </div>
                {psychScore <= 2 && (
                  <p className="text-sm text-red-400 mt-2">
                    ⚠️ Il est recommandé de ne pas trader dans cet état mental
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Journal */}
        {currentView === 'journal' && (
          <div className={`${cardClass} rounded-xl p-6 max-w-2xl mx-auto`}>
            <h2 className="text-xl font-bold mb-4">Journal Personnel</h2>
            
            <div className="space-y-4">
              <div>
                <textarea
                  className={`w-full p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  rows="4"
                  placeholder="Écrivez vos réflexions du jour..."
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      setJournalEntries(prev => [...prev, {
                        date: new Date(),
                        content: e.target.value,
                        id: Date.now()
                      }]);
                      e.target.value = '';
                    }
                  }}
                />
              </div>

              <div className="space-y-3">
                {journalEntries.length > 0 ? journalEntries.slice(-5).reverse().map(entry => (
                  <div key={entry.id} className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-xs opacity-70 mb-1">
                      {new Date(entry.date).toLocaleString('fr-FR')}
                    </p>
                    <p className="text-sm">{entry.content}</p>
                  </div>
                )) : (
                  <p className="text-center text-gray-500">Aucune entrée dans le journal</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Calculator */}
        {currentView === 'calculator' && (
          <div className={`${cardClass} rounded-xl p-6 max-w-md mx-auto`}>
            <h2 className="text-xl font-bold mb-4">Calculateur de Position</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm opacity-70">Capital du compte</label>
                <input
                  type="number"
                  className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  placeholder="100000"
                  id="accountSize"
                />
              </div>
              
              <div>
                <label className="text-sm opacity-70">Risque par trade (%)</label>
                <input
                  type="number"
                  className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  placeholder="1"
                  id="riskPercent"
                />
              </div>
              
              <div>
                <label className="text-sm opacity-70">Stop Loss (points)</label>
                <input
                  type="number"
                  className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  placeholder="10"
                  id="stopLoss"
                />
              </div>
              
              <button
                onClick={() => {
                  const account = parseFloat(document.getElementById('accountSize').value) || 100000;
                  const risk = parseFloat(document.getElementById('riskPercent').value) || 1;
                  const stop = parseFloat(document.getElementById('stopLoss').value) || 10;
                  const position = calculatePositionSize(account, risk, stop);
                  document.getElementById('positionResult').textContent = position;
                }}
                className="w-full py-2 bg-blue-500 rounded hover:bg-blue-600"
              >
                Calculer
              </button>
              
              <div className="p-4 bg-gray-700 rounded">
                <p className="text-sm opacity-70">Taille de position recommandée:</p>
                <p className="text-2xl font-bold" id="positionResult">-</p>
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

                  <div>
                    <h4 className="text-sm font-medium opacity-70 mb-2">⚡ Énergie</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['CL', 'NG', 'RB', 'HO', 'QM', 'QG'].map(symbol => (
                        <div key={symbol} className="flex items-center gap-1">
                          <label className={`text-xs w-10 ${['QM', 'QG'].includes(symbol) ? 'text-orange-400' : ''}`}>
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
                    <h4 className="text-sm font-medium opacity-70 mb-2">💱 Devises</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['6E', '6J', '6B', '6C', '6A', '6S'].map(symbol => (
                        <div key={symbol} className="flex items-center gap-1">
                          <label className="text-xs w-10">{symbol}:</label>
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
                <h3 className="text-lg font-semibold mb-3">Gestion du Risque</h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm">Alerte si exposition ></label>
                  <input
                    type="number"
                    value={riskLimit}
                    onChange={(e) => setRiskLimit(parseFloat(e.target.value))}
                    className={`w-20 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    step="0.5"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={exportFiscal}
                  className="flex-1 py-2 bg-green-500 rounded hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Export Fiscal
                </button>
                <button className="flex-1 py-2 bg-blue-500 rounded hover:bg-blue-600 flex items-center justify-center gap-2">
                  <Cloud size={20} />
                  Sync Drive
                </button>
              </div>
            </div>
          </div>
        )}
        
      </main>
    </div>
  );
};

export default TradingJournalSchool;
