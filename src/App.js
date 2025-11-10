import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AttachMoney as AttachMoneyIcon,
  ShowChart as ShowChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// Composant principal
function App() {
  // États
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Références
  const fileInputRef = useRef(null);
  
  // Filtres
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    symbol: '',
    minProfit: '',
    maxProfit: '',
    tradeType: 'all' // all, winning, losing
  });

  // Parser pour les fichiers Trade Activity Log (.data)
  const parseTradeActivityLog = async (arrayBuffer) => {
    const trades = [];
    const dataView = new DataView(arrayBuffer);
    let offset = 0;
    
    try {
      // Structure pour stocker les ordres temporaires
      const pendingOrders = new Map();
      const positions = new Map();
      
      while (offset < arrayBuffer.byteLength - 100) {
        try {
          // Lire un chunk de données
          const chunkSize = Math.min(2000, arrayBuffer.byteLength - offset);
          const bytes = new Uint8Array(arrayBuffer.slice(offset, offset + chunkSize));
          const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
          
          // Parser les informations de trading
          const tradeInfo = extractTradeInformation(text, offset, dataView);
          
          if (tradeInfo) {
            if (tradeInfo.type === 'FILL') {
              // Gestion des ordres remplis
              handleFilledOrder(tradeInfo, positions, trades);
            } else if (tradeInfo.type === 'ORDER') {
              // Stocker les ordres en attente
              pendingOrders.set(tradeInfo.orderId, tradeInfo);
            }
          }
          
          // Avancer dans le buffer
          offset += 50;
          
          // Mise à jour de la progression
          const progress = Math.round((offset / arrayBuffer.byteLength) * 100);
          setUploadProgress(progress);
          
        } catch (e) {
          // Continuer même si une partie échoue
          offset += 50;
        }
      }
      
      // Finaliser les positions ouvertes
      positions.forEach((position, symbol) => {
        if (position.quantity !== 0) {
          console.warn(`Position ouverte non fermée pour ${symbol}`);
        }
      });
      
    } catch (error) {
      console.error('Erreur lors du parsing:', error);
      throw new Error('Impossible de parser le fichier Trade Activity Log');
    }
    
    return trades;
  };

  // Extraction des informations de trading depuis le texte
  const extractTradeInformation = (text, offset, dataView) => {
    try {
      const info = {
        timestamp: null,
        symbol: null,
        type: null,
        orderId: null,
        price: null,
        quantity: 1,
        action: null
      };
      
      // Détecter le symbole (MGCZ5, MGC, GC, etc.)
      const symbolMatch = text.match(/(MGC[A-Z]\d+|GC[A-Z]\d+|MGC|GC)\.COMEX/);
      if (symbolMatch) {
        info.symbol = symbolMatch[1];
      }
      
      // Détecter le type d'ordre et l'action
      if (text.includes('Filled')) {
        info.type = 'FILL';
        
        // Détecter si c'est un achat ou une vente
        if (text.includes('Updated Internal Position Quantity to')) {
          const posMatch = text.match(/Updated Internal Position Quantity to (\d+)\. Previous: (\d+)/);
          if (posMatch) {
            const newQty = parseInt(posMatch[1]);
            const prevQty = parseInt(posMatch[2]);
            info.action = newQty > prevQty ? 'BUY' : 'SELL';
            info.quantity = Math.abs(newQty - prevQty);
          }
        }
      } else if (text.includes('New') || text.includes('Order')) {
        info.type = 'ORDER';
      }
      
      // Extraire le prix
      const priceMatch = text.match(/Last:\s*([\d.]+)|@\s*([\d.]+)|Price:\s*([\d.]+)/);
      if (priceMatch) {
        info.price = parseFloat(priceMatch[1] || priceMatch[2] || priceMatch[3]);
      }
      
      // Extraire l'ID de l'ordre
      const orderIdMatch = text.match(/(\d{10})/);
      if (orderIdMatch) {
        info.orderId = orderIdMatch[1];
      }
      
      // Extraire le timestamp (approximatif si non disponible)
      info.timestamp = new Date().toISOString();
      
      return info.symbol ? info : null;
      
    } catch (e) {
      return null;
    }
  };

  // Gestion des ordres remplis
  const handleFilledOrder = (orderInfo, positions, trades) => {
    const symbol = orderInfo.symbol;
    
    if (!positions.has(symbol)) {
      positions.set(symbol, {
        quantity: 0,
        avgPrice: 0,
        trades: []
      });
    }
    
    const position = positions.get(symbol);
    
    if (orderInfo.action === 'BUY') {
      // Ouverture ou ajout à une position
      const totalValue = (position.quantity * position.avgPrice) + (orderInfo.quantity * orderInfo.price);
      position.quantity += orderInfo.quantity;
      position.avgPrice = position.quantity > 0 ? totalValue / position.quantity : 0;
      
      position.trades.push({
        type: 'ENTRY',
        time: orderInfo.timestamp,
        price: orderInfo.price,
        quantity: orderInfo.quantity
      });
      
    } else if (orderInfo.action === 'SELL' && position.quantity > 0) {
      // Fermeture de position
      const exitQuantity = Math.min(orderInfo.quantity, position.quantity);
      const profit = (orderInfo.price - position.avgPrice) * exitQuantity * 10; // $10 par tick pour MGC
      
      trades.push({
        id: `trade_${trades.length + 1}`,
        symbol: symbol,
        entryTime: position.trades[0]?.time || orderInfo.timestamp,
        exitTime: orderInfo.timestamp,
        entryPrice: position.avgPrice,
        exitPrice: orderInfo.price,
        quantity: exitQuantity,
        profit: profit,
        commission: 5.00, // Commission estimée
        netProfit: profit - 5.00,
        duration: calculateDuration(position.trades[0]?.time, orderInfo.timestamp),
        type: profit > 0 ? 'WIN' : 'LOSS',
        ticks: Math.round((orderInfo.price - position.avgPrice) * 10),
        mae: 0, // Maximum Adverse Excursion (à calculer si données disponibles)
        mfe: 0  // Maximum Favorable Excursion (à calculer si données disponibles)
      });
      
      // Réduire la position
      position.quantity -= exitQuantity;
      
      // Réinitialiser si position fermée
      if (position.quantity === 0) {
        position.avgPrice = 0;
        position.trades = [];
      }
    }
  };

  // Parser CSV alternatif
  const parseCSV = (text) => {
    const lines = text.split('\n');
    const headers = lines[0]?.split(',').map(h => h.trim());
    const trades = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      
      if (values.length >= 8) {
        const trade = {
          id: `trade_${i}`,
          symbol: values[0] || 'UNKNOWN',
          entryTime: values[1],
          exitTime: values[2],
          entryPrice: parseFloat(values[3]) || 0,
          exitPrice: parseFloat(values[4]) || 0,
          quantity: parseInt(values[5]) || 1,
          profit: parseFloat(values[6]) || 0,
          commission: parseFloat(values[7]) || 0,
          netProfit: (parseFloat(values[6]) || 0) - (parseFloat(values[7]) || 0),
          type: parseFloat(values[6]) > 0 ? 'WIN' : 'LOSS'
        };
        
        // Calculer des métriques supplémentaires
        trade.ticks = Math.round((trade.exitPrice - trade.entryPrice) * 10);
        trade.duration = calculateDuration(trade.entryTime, trade.exitTime);
        
        trades.push(trade);
      }
    }
    
    return trades;
  };

  // Calcul de la durée d'un trade
  const calculateDuration = (entryTime, exitTime) => {
    try {
      const entry = new Date(entryTime);
      const exit = new Date(exitTime);
      const durationMs = exit - entry;
      
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h ${minutes}min`;
      }
      return `${minutes}min`;
    } catch (e) {
      return 'N/A';
    }
  };

  // Gestion de l'upload de fichier
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0] || event.dataTransfer?.files?.[0];
    
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);
    
    try {
      let parsedTrades = [];
      
      if (file.name.endsWith('.data')) {
        // Fichier binaire Trade Activity Log
        const arrayBuffer = await file.arrayBuffer();
        parsedTrades = await parseTradeActivityLog(arrayBuffer);
        
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        // Fichier CSV ou texte
        const text = await file.text();
        parsedTrades = parseCSV(text);
        
      } else {
        throw new Error('Format de fichier non supporté. Utilisez .data, .csv ou .txt');
      }
      
      if (parsedTrades.length === 0) {
        throw new Error('Aucun trade trouvé dans le fichier');
      }
      
      setTrades(parsedTrades);
      setFilteredTrades(parsedTrades);
      setSuccess(`${parsedTrades.length} trades importés avec succès`);
      
      // Calculer les statistiques
      calculateStatistics(parsedTrades);
      
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement du fichier');
    } finally {
      setLoading(false);
      setUploadProgress(100);
      
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Calcul des statistiques
  const calculateStatistics = (tradesToAnalyze = filteredTrades) => {
    if (tradesToAnalyze.length === 0) {
      setStatistics({});
      return;
    }
    
    const winningTrades = tradesToAnalyze.filter(t => t.profit > 0);
    const losingTrades = tradesToAnalyze.filter(t => t.profit <= 0);
    
    const totalProfit = tradesToAnalyze.reduce((sum, t) => sum + t.profit, 0);
    const totalCommission = tradesToAnalyze.reduce((sum, t) => sum + (t.commission || 0), 0);
    const netProfit = totalProfit - totalCommission;
    
    const totalWins = winningTrades.reduce((sum, t) => sum + t.profit, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
    
    // Calcul du drawdown maximum
    let equity = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;
    const equityCurve = [];
    
    tradesToAnalyze.forEach((trade, index) => {
      equity += trade.profit;
      equityCurve.push(equity);
      
      if (equity > peak) {
        peak = equity;
      }
      
      const drawdown = peak - equity;
      const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;
      
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercent = drawdownPercent;
      }
    });
    
    // Calcul du ratio de Sharpe (simplifié)
    const returns = tradesToAnalyze.map(t => t.profit);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualisé
    
    // Calcul de la séquence de gains/pertes
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    
    tradesToAnalyze.forEach(trade => {
      if (trade.profit > 0) {
        if (currentStreak >= 0) {
          currentStreak++;
          maxWinStreak = Math.max(maxWinStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      } else {
        if (currentStreak <= 0) {
          currentStreak--;
          maxLossStreak = Math.max(maxLossStreak, Math.abs(currentStreak));
        } else {
          currentStreak = -1;
        }
      }
    });
    
    setStatistics({
      totalTrades: tradesToAnalyze.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: tradesToAnalyze.length > 0 ? (winningTrades.length / tradesToAnalyze.length * 100) : 0,
      totalProfit: totalProfit,
      totalCommission: totalCommission,
      netProfit: netProfit,
      avgWin: winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
      avgLoss: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
      avgProfit: tradesToAnalyze.length > 0 ? netProfit / tradesToAnalyze.length : 0,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
      maxDrawdown: maxDrawdown,
      maxDrawdownPercent: maxDrawdownPercent,
      sharpeRatio: sharpeRatio,
      maxWinStreak: maxWinStreak,
      maxLossStreak: maxLossStreak,
      equityCurve: equityCurve
    });
  };

  // Application des filtres
  useEffect(() => {
    let filtered = [...trades];
    
    // Filtre par dates
    if (filters.startDate) {
      filtered = filtered.filter(t => 
        new Date(t.exitTime) >= new Date(filters.startDate)
      );
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(t => 
        new Date(t.exitTime) <= new Date(filters.endDate)
      );
    }
    
    // Filtre par symbole
    if (filters.symbol) {
      filtered = filtered.filter(t => 
        t.symbol.toLowerCase().includes(filters.symbol.toLowerCase())
      );
    }
    
    // Filtre par profit
    if (filters.minProfit !== '') {
      filtered = filtered.filter(t => t.profit >= parseFloat(filters.minProfit));
    }
    
    if (filters.maxProfit !== '') {
      filtered = filtered.filter(t => t.profit <= parseFloat(filters.maxProfit));
    }
    
    // Filtre par type
    if (filters.tradeType === 'winning') {
      filtered = filtered.filter(t => t.profit > 0);
    } else if (filters.tradeType === 'losing') {
      filtered = filtered.filter(t => t.profit <= 0);
    }
    
    setFilteredTrades(filtered);
    calculateStatistics(filtered);
  }, [filters, trades]);

  // Réinitialisation des filtres
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      symbol: '',
      minProfit: '',
      maxProfit: '',
      tradeType: 'all'
    });
  };

  // Export des données
  const exportToCSV = () => {
    if (filteredTrades.length === 0) return;
    
    const headers = ['ID', 'Symbol', 'Entry Time', 'Exit Time', 'Entry Price', 'Exit Price', 'Quantity', 'Profit', 'Type'];
    const csvContent = [
      headers.join(','),
      ...filteredTrades.map(trade => 
        [
          trade.id,
          trade.symbol,
          trade.entryTime,
          trade.exitTime,
          trade.entryPrice,
          trade.exitPrice,
          trade.quantity,
          trade.profit,
          trade.type
        ].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Données pour les graphiques
  const getChartData = () => {
    // Courbe d'équité
    const equityData = {
      labels: filteredTrades.map((_, index) => `Trade ${index + 1}`),
      datasets: [{
        label: 'Équité Cumulée ($)',
        data: statistics.equityCurve || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4
      }]
    };
    
    // Performance mensuelle
    const monthlyPerformance = {};
    filteredTrades.forEach(trade => {
      const month = format(new Date(trade.exitTime), 'yyyy-MM');
      if (!monthlyPerformance[month]) {
        monthlyPerformance[month] = 0;
      }
      monthlyPerformance[month] += trade.profit;
    });
    
    const monthlyData = {
      labels: Object.keys(monthlyPerformance),
      datasets: [{
        label: 'Profit/Perte ($)',
        data: Object.values(monthlyPerformance),
        backgroundColor: Object.values(monthlyPerformance).map(value => 
          value >= 0 ? 'rgba(75, 192, 192, 0.8)' : 'rgba(255, 99, 132, 0.8)'
        )
      }]
    };
    
    // Distribution des profits
    const profitRanges = {
      '< -100$': 0,
      '-100$ à -50$': 0,
      '-50$ à 0$': 0,
      '0$ à 50$': 0,
      '50$ à 100$': 0,
      '> 100$': 0
    };
    
    filteredTrades.forEach(trade => {
      const profit = trade.profit;
      if (profit < -100) profitRanges['< -100$']++;
      else if (profit < -50) profitRanges['-100$ à -50$']++;
      else if (profit < 0) profitRanges['-50$ à 0$']++;
      else if (profit < 50) profitRanges['0$ à 50$']++;
      else if (profit < 100) profitRanges['50$ à 100$']++;
      else profitRanges['> 100$']++;
    });
    
    const distributionData = {
      labels: Object.keys(profitRanges),
      datasets: [{
        label: 'Nombre de trades',
        data: Object.values(profitRanges),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ]
      }]
    };
    
    // Win/Loss ratio
    const winLossData = {
      labels: ['Gains', 'Pertes'],
      datasets: [{
        data: [statistics.winningTrades || 0, statistics.losingTrades || 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ]
      }]
    };
    
    return {
      equity: equityData,
      monthly: monthlyData,
      distribution: distributionData,
      winLoss: winLossData
    };
  };

  const chartData = getChartData();

  // Options des graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* En-tête */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" gutterBottom>
              📊 Journal de Trading
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Analysez vos performances avec les fichiers Trade Activity Log de Sierra Chart
            </Typography>
          </Box>
          <Box>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".data,.csv,.txt"
              onChange={handleFileUpload}
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              Importer Fichier
            </Button>
          </Box>
        </Box>
        
        {loading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" sx={{ mt: 1 }}>
              Chargement... {uploadProgress}%
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Messages d'alerte */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Zone principale */}
      {trades.length > 0 ? (
        <>
          {/* Filtres */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <FilterListIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Filtres</Typography>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Date début"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Date fin"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Symbole"
                  value={filters.symbol}
                  onChange={(e) => setFilters({...filters, symbol: e.target.value})}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.tradeType}
                    label="Type"
                    onChange={(e) => setFilters({...filters, tradeType: e.target.value})}
                  >
                    <MenuItem value="all">Tous</MenuItem>
                    <MenuItem value="winning">Gagnants</MenuItem>
                    <MenuItem value="losing">Perdants</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={resetFilters}
                >
                  Réinitialiser
                </Button>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={exportToCSV}
                >
                  Exporter CSV
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Statistiques */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="caption">
                        TOTAL TRADES
                      </Typography>
                      <Typography variant="h4">
                        {statistics.totalTrades || 0}
                      </Typography>
                    </Box>
                    <BarChartIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="caption">
                        TAUX DE RÉUSSITE
                      </Typography>
                      <Typography variant="h4">
                        {statistics.winRate?.toFixed(1) || 0}%
                      </Typography>
                    </Box>
                    <PieChartIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="caption">
                        PROFIT NET
                      </Typography>
                      <Typography 
                        variant="h4" 
                        color={statistics.netProfit >= 0 ? 'success.main' : 'error.main'}
                      >
                        ${statistics.netProfit?.toFixed(2) || 0}
                      </Typography>
                    </Box>
                    <AttachMoneyIcon sx={{ fontSize: 40, color: statistics.netProfit >= 0 ? 'success.main' : 'error.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="caption">
                        PROFIT FACTOR
                      </Typography>
                      <Typography variant="h4">
                        {isFinite(statistics.profitFactor) ? statistics.profitFactor?.toFixed(2) : '∞'}
                      </Typography>
                    </Box>
                    <ShowChartIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Statistiques détaillées */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="caption">
                    GAIN MOYEN
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    ${statistics.avgWin?.toFixed(2) || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="caption">
                    PERTE MOYENNE
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    -${statistics.avgLoss?.toFixed(2) || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="caption">
                    MAX DRAWDOWN
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    -${statistics.maxDrawdown?.toFixed(2) || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="caption">
                    SHARPE RATIO
                  </Typography>
                  <Typography variant="h6">
                    {statistics.sharpeRatio?.toFixed(2) || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="caption">
                    SÉRIE GAINS MAX
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {statistics.maxWinStreak || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="caption">
                    SÉRIE PERTES MAX
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {statistics.maxLossStreak || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Onglets pour graphiques et tableau */}
          <Paper elevation={2}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Tableau des Trades" icon={<AssessmentIcon />} />
              <Tab label="Courbe d'Équité" icon={<ShowChartIcon />} />
              <Tab label="Performance Mensuelle" icon={<BarChartIcon />} />
              <Tab label="Distribution" icon={<PieChartIcon />} />
            </Tabs>
            
            {/* Tableau des trades */}
            {tabValue === 0 && (
              <Box sx={{ p: 3 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Symbole</TableCell>
                        <TableCell>Entrée</TableCell>
                        <TableCell>Sortie</TableCell>
                        <TableCell align="right">Prix Entrée</TableCell>
                        <TableCell align="right">Prix Sortie</TableCell>
                        <TableCell align="right">Quantité</TableCell>
                        <TableCell align="right">Ticks</TableCell>
                        <TableCell align="right">Profit</TableCell>
                        <TableCell align="right">Commission</TableCell>
                        <TableCell align="right">Net</TableCell>
                        <TableCell>Durée</TableCell>
                        <TableCell>Résultat</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTrades.slice(0, 100).map((trade) => (
                        <TableRow key={trade.id} hover>
                          <TableCell>{trade.id}</TableCell>
                          <TableCell>
                            <Chip label={trade.symbol} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            {format(new Date(trade.entryTime), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </TableCell>
                          <TableCell>
                            {format(new Date(trade.exitTime), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </TableCell>
                          <TableCell align="right">${trade.entryPrice?.toFixed(2)}</TableCell>
                          <TableCell align="right">${trade.exitPrice?.toFixed(2)}</TableCell>
                          <TableCell align="right">{trade.quantity}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={trade.ticks || 0}
                              size="small"
                              color={trade.ticks > 0 ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              color={trade.profit >= 0 ? 'success.main' : 'error.main'}
                              fontWeight="bold"
                            >
                              ${trade.profit?.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            ${trade.commission?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              color={trade.netProfit >= 0 ? 'success.main' : 'error.main'}
                              fontWeight="bold"
                            >
                              ${trade.netProfit?.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>{trade.duration}</TableCell>
                          <TableCell>
                            {trade.type === 'WIN' ? (
                              <CheckCircleIcon color="success" fontSize="small" />
                            ) : (
                              <CancelIcon color="error" fontSize="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {filteredTrades.length > 100 && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                    Affichage des 100 premiers trades sur {filteredTrades.length}
                  </Typography>
                )}
              </Box>
            )}
            
            {/* Courbe d'équité */}
            {tabValue === 1 && (
              <Box sx={{ p: 3, height: 400 }}>
                <Line data={chartData.equity} options={chartOptions} />
              </Box>
            )}
            
            {/* Performance mensuelle */}
            {tabValue === 2 && (
              <Box sx={{ p: 3, height: 400 }}>
                <Bar data={chartData.monthly} options={chartOptions} />
              </Box>
            )}
            
            {/* Distribution des profits */}
            {tabValue === 3 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Distribution des Profits</Typography>
                    <Box sx={{ height: 300 }}>
                      <Bar data={chartData.distribution} options={chartOptions} />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Ratio Gains/Pertes</Typography>
                    <Box sx={{ height: 300 }}>
                      <Pie data={chartData.winLoss} options={chartOptions} />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </>
      ) : (
        /* État initial - Aucun trade */
        <Paper elevation={2} sx={{ p: 8, textAlign: 'center' }}>
          <CloudUploadIcon sx={{ fontSize: 80, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Aucune donnée de trading
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Importez un fichier Trade Activity Log (.data), CSV ou TXT pour commencer l'analyse
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            Importer un fichier
          </Button>
        </Paper>
      )}

      {/* Dialog pour détails du trade */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Détails du Trade
        </DialogTitle>
        <DialogContent>
          {selectedTrade && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Symbole</Typography>
                <Typography variant="body1">{selectedTrade.symbol}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Résultat</Typography>
                <Typography variant="body1" color={selectedTrade.profit >= 0 ? 'success.main' : 'error.main'}>
                  {selectedTrade.type}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Heure d'entrée</Typography>
                <Typography variant="body1">
                  {format(new Date(selectedTrade.entryTime), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Heure de sortie</Typography>
                <Typography variant="body1">
                  {format(new Date(selectedTrade.exitTime), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Prix d'entrée</Typography>
                <Typography variant="body1">${selectedTrade.entryPrice?.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Prix de sortie</Typography>
                <Typography variant="body1">${selectedTrade.exitPrice?.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Profit/Perte</Typography>
                <Typography 
                  variant="h6" 
                  color={selectedTrade.profit >= 0 ? 'success.main' : 'error.main'}
                >
                  ${selectedTrade.profit?.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Durée</Typography>
                <Typography variant="body1">{selectedTrade.duration}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;
