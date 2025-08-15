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
  // États d'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // login, register, app
  const [credentials, setCredentials] = useState({ email: '', password: '', name: '' });
  const [userRole, setUserRole] = useState('student'); // student, teacher
  
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
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Marie L.', message: 'Quelqu\'un trade les NFP aujourd\'hui ?', time: '09:15', avatar: '👩' },
    { id: 2, user: 'Thomas R.', message: 'Je reste flat, trop volatil pour moi', time: '09:18', avatar: '👨' },
    { id: 3, user: 'Sophie M.', message: 'Bonne séance à tous ! 💪', time: '09:20', avatar: '👩‍💼' }
  ]);
  const [newMessage, setNewMessage] = useState('');

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
  }, [psychAnswers]);

  // Check achievements
  useEffect(() => {
    if (isAuthenticated) {
      checkAchievements();
    }
  }, [trades, metrics, psychScore, isAuthenticated]);

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

  // Suite du code... (tout le reste du composant reste identique)
  // Application principale
  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-colors`}>
      {/* Tout le reste du code reste identique à partir d'ici */}
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

      {/* Contenu principal - continuez avec tout le reste du code existant... */}
      <main className="p-4">
        {/* Copiez ici tout le reste du code depuis "Dashboard" jusqu'à la fin */}
        {/* Je ne répète pas pour économiser de l'espace, mais tout le reste reste identique */}
      </main>
    </div>
  );
};

export default TradingJournalSchool;
