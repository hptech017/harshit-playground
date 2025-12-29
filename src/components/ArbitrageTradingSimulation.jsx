import React, { useEffect, useMemo, useRef, useState } from "react";

// --- Constants ---
const SIMULATION_SETTINGS = {
  ASSET_PAIR: '$ALPHA/USD',
  INITIAL_USD: 100000,
  INITIAL_ASSET: 0,
  SPREAD_THRESHOLD_PCT: 0.12, 
  FEE_PERCENT: 0.04,
  DEFAULT_TRADE_SIZE: 5000,
  MAX_TRADE_LOG_ENTRIES: 300,
  MAX_TRADE_HISTORY_ENTRIES: 50,
  MAX_PRICE_HISTORY_POINTS: 300,
  MAX_SPREAD_HISTORY_POINTS: 500,
  SIMULATION_INTERVAL_MS: 300,
  EXECUTION_LATENCY_MAX_MS: 300,
  SLIPPAGE_BUFFER_MIN: 0.0001,
  SLIPPAGE_BUFFER_MAX: 0.0005,
};

// --- Helper Functions ---
function computeMaxSpread(exchanges) {
  let bestSpread = 0;
  for (let i = 0; i < exchanges.length; i++) {
    for (let j = 0; j < exchanges.length; j++) {
      if (i === j) continue;
      const spread = (exchanges[j].price - exchanges[i].price) / exchanges[i].price; 
      if (spread > bestSpread) bestSpread = spread;
    }
  }
  return bestSpread;
}

function Metric({ name, value, subtext = null, highlight = 'text-white' }) {
  return (
    <div className="p-2 sm:p-3 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg text-xs border border-slate-700/50 text-center backdrop-blur-sm hover:border-slate-600 transition-all">
      <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">{name}</div>
      <div className={`mt-1 font-mono ${highlight} ${subtext ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} font-bold`}>{value}</div>
      {subtext && <div className="text-[9px] sm:text-[10px] text-slate-500 mt-1">{subtext}</div>}
    </div>
  );
}

function Sparkline({ data = [], width = 120, height = 28, padding = 2, color = 'currentColor' }) {
  if (!data || data.length < 2) return <svg width={width} height={height} />;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  
  const scaleX = (i) => padding + (i / Math.max(1, data.length - 1)) * (width - padding * 2);
  const scaleY = (v) => padding + (1 - (v - min) / Math.max(1e-9, max - min)) * (height - padding * 2);

  const pathData = data.map((v, i) => 
    `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(2)} ${scaleY(v).toFixed(2)}`
  ).join(' ');

  return (
    <svg width={width} height={height} className="inline-block align-middle">
      <path d={pathData} fill="none" strokeWidth={1.6} strokeOpacity={0.95} stroke={color} />
    </svg>
  );
}

function HistoryChart({ data, width = '100%', height = 150, color = '#4ade80', label, isSpread = false }) {
    if (!data || data.length < 2) return (
      <div className="text-center text-slate-600 h-full flex items-center justify-center text-xs sm:text-sm">
        Awaiting data...
      </div>
    );

    const values = isSpread ? data.map(v => v * 100) : data;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = 10;
    const strokeWidth = 2;
    
    const viewBoxWidth = 1000;
    const viewBoxHeight = 150;

    const scaleX = (i) => (i / Math.max(1, values.length - 1)) * (viewBoxWidth - 2 * padding) + padding;
    const scaleY = (v) => viewBoxHeight - padding - ((v - min) / Math.max(1e-9, range)) * (viewBoxHeight - 2 * padding);
    
    const pathData = values.map((v, i) => 
      `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(2)} ${scaleY(v).toFixed(2)}`
    ).join(' ');

    const lastValue = values[values.length - 1];
    
    return (
        <div className="relative" style={{ height: height }}>
            <div className="absolute top-2 left-2 sm:left-4 text-[10px] sm:text-xs font-semibold text-slate-400">{label}</div>
            <div className="absolute top-2 right-2 sm:right-4 text-sm sm:text-lg font-mono font-bold" style={{ color: color }}>
                {isSpread ? `${lastValue.toFixed(4)}%` : lastValue.toFixed(6)}
            </div>

            <svg width={width} height={height} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="none">
                {[0.25, 0.5, 0.75].map((level, i) => (
                    <line 
                        key={i}
                        x1={padding} 
                        y1={viewBoxHeight - padding - level * (viewBoxHeight - 2 * padding)}
                        x2={viewBoxWidth - padding} 
                        y2={viewBoxHeight - padding - level * (viewBoxHeight - 2 * padding)}
                        stroke="#334155"
                        strokeWidth="0.5"
                        opacity="0.3"
                    />
                ))}
                
                <path d={pathData} fill="none" strokeWidth={strokeWidth} stroke={color} />
                <circle cx={scaleX(values.length - 1)} cy={scaleY(lastValue)} r="3" fill={color} />
            </svg>
        </div>
    );
}

// --- Main Component ---
export default function ArbitrageTradingSimulation() {
  const [isRunning, setIsRunning] = useState(true);
  const [time, setTime] = useState(0);
  const [exchanges, setExchanges] = useState(() => {
    const basePrice = 1.0;
    return [
      { id: 'BinSim', price: basePrice * 1.0005, volume: 1000, latency: 30 },
      { id: 'CoinX', price: basePrice * 0.9996, volume: 800, latency: 45 },
      { id: 'Zeta', price: basePrice * 1.0018, volume: 1200, latency: 20 },
      { id: 'Omega', price: basePrice * 0.9989, volume: 600, latency: 70 }
    ];
  });
  
  const [wallet, setWallet] = useState({ 
    usd: SIMULATION_SETTINGS.INITIAL_USD, 
    asset: SIMULATION_SETTINGS.INITIAL_ASSET 
  });
  
  const [openTrades, setOpenTrades] = useState([]);
  const [tradeLog, setTradeLog] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalTrades: 0, totalProfit: 0, winRate: 0, successfulTrades: 0 });
  
  const [spreadThreshold, setSpreadThreshold] = useState(SIMULATION_SETTINGS.SPREAD_THRESHOLD_PCT);
  const [tradeSize, setTradeSize] = useState(SIMULATION_SETTINGS.DEFAULT_TRADE_SIZE);
  
  const algorithmMetricsRef = useRef({ 
    cpu: 8.2, 
    mem: 24.5, 
    threads: 6, 
    modelScore: 0.86,
    throughput: 0,
    networkHealth: 0
  });
  
  const [history, setHistory] = useState(() => ({
    time: [],
    prices: {},
    spreads: []
  }));

  useEffect(() => {
    setHistory(h => {
      const prices = {};
      exchanges.forEach(e => { prices[e.id] = [e.price]; });
      return { ...h, prices };
    });
  }, []); 

  useEffect(() => {
    if (!isRunning) return;
    
    const intervalId = setInterval(() => {
      setTime(t => t + 1);
      
      setExchanges(prevExchanges => {
        const baseNoise = (Math.random() - 0.5) * 0.0025;
        return prevExchanges.map((ex, i) => {
          const microNoise = (Math.random() - 0.5) * (0.001 + i * 0.0005);
          const spike = Math.random() < 0.005 ? (Math.random() - 0.5) * 0.03 : 0;
          
          const newPrice = Math.max(0.00001, ex.price * (1 + baseNoise + microNoise + spike));
          const newVolume = Math.max(100, ex.volume * (1 + (Math.random() - 0.5) * 0.15));
          const newLatency = Math.max(5, ex.latency * (1 + (Math.random() - 0.5) * 0.2));
          
          return { 
            ...ex, 
            price: newPrice, 
            volume: Math.round(newVolume), 
            latency: Math.round(newLatency) 
          };
        });
      });

      algorithmMetricsRef.current = {
        cpu: +(12 + Math.random() * 20).toFixed(2),
        mem: +(40 + Math.random() * 80).toFixed(2),
        threads: 8 + Math.floor(Math.random() * 12),
        modelScore: +(0.75 + Math.random() * 0.2).toFixed(3),
        throughput: Math.round(300 + Math.random() * 800),
        networkHealth: +(90 + Math.random() * 9).toFixed(1)
      };

    }, SIMULATION_SETTINGS.SIMULATION_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    setHistory(h => {
      const nextTime = h.time.length === 0 ? 0 : h.time[h.time.length - 1] + 1;
      const prices = { ...h.prices };
      exchanges.forEach(e => {
        prices[e.id] = (prices[e.id] || []).slice(-SIMULATION_SETTINGS.MAX_PRICE_HISTORY_POINTS).concat(e.price);
      });
      
      const maxSpread = computeMaxSpread(exchanges);
      const spreads = (h.spreads || []).slice(-SIMULATION_SETTINGS.MAX_SPREAD_HISTORY_POINTS).concat(maxSpread);
      
      return { 
        time: (h.time || []).slice(-SIMULATION_SETTINGS.MAX_SPREAD_HISTORY_POINTS).concat(nextTime), 
        prices, 
        spreads 
      };
    });

    automaticArbDetector();
  }, [exchanges]); 

  const pushLog = (text, level = 'info') => {
    setTradeLog(l => [{ 
      timestamp: new Date().toLocaleTimeString(), 
      level, 
      text 
    }, ...l].slice(0, SIMULATION_SETTINGS.MAX_TRADE_LOG_ENTRIES));
  };

  const automaticArbDetector = () => {
    const pairs = [];
    for (const buyEx of exchanges) {
      for (const sellEx of exchanges) {
        if (buyEx.id === sellEx.id) continue;
        const diff = (sellEx.price - buyEx.price) / buyEx.price; 
        pairs.push({ buy: buyEx, sell: sellEx, diff });
      }
    }
    pairs.sort((a, b) => b.diff - a.diff);

    const profitableCandidates = pairs.filter(p => p.diff > spreadThreshold);

    profitableCandidates.slice(0, 3).forEach(c => {
      const avgLatency = (c.buy.latency + c.sell.latency) / 2;
      const networkDelay = Math.max(10, Math.round(avgLatency + Math.random() * 30));
      const executionDelay = Math.random() * SIMULATION_SETTINGS.EXECUTION_LATENCY_MAX_MS;
      
      setTimeout(() => {
        executeSimulatedArb(c.buy, c.sell, c.diff, networkDelay);
      }, executionDelay);
    });
  };

  const executeSimulatedArb = (buyEx, sellEx, detectedDiff, latency) => {
    const feePct = SIMULATION_SETTINGS.FEE_PERCENT / 100; 
    const feeTotal = feePct * 2; 
    
    const slippage = SIMULATION_SETTINGS.SLIPPAGE_BUFFER_MIN + Math.random() * (SIMULATION_SETTINGS.SLIPPAGE_BUFFER_MAX - SIMULATION_SETTINGS.SLIPPAGE_BUFFER_MIN);
    
    const netDifference = detectedDiff - feeTotal - slippage;

    if (netDifference <= 0) {
      pushLog(`Trade rejected: ${buyEx.id} → ${sellEx.id}. Net profit negative.`, 'warn');
      return;
    }

    const usdToUse = Math.min(tradeSize, wallet.usd);
    if (usdToUse < 10) {
      pushLog('Insufficient liquidity for trade.', 'error');
      return;
    }

    const execBuyPrice = buyEx.price * (1 + (Math.random() - 0.5) * 0.0005 + 0.0001); 
    const execSellPrice = sellEx.price * (1 + (Math.random() - 0.5) * 0.0005 - 0.0001); 
    
    const assetQuantity = usdToUse / execBuyPrice;
    const grossRevenue = assetQuantity * execSellPrice;
    
    const totalFees = (usdToUse * feePct) + (grossRevenue * feePct);
    const tinyTransferCost = usdToUse * 0.00005;
    
    const profit = grossRevenue - usdToUse - totalFees - tinyTransferCost;

    setWallet(w => ({ 
      ...w, 
      usd: +(w.usd - usdToUse + grossRevenue - totalFees - tinyTransferCost).toFixed(2) 
    }));

    const newTrade = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      buyEx: buyEx.id,
      sellEx: sellEx.id,
      buyPrice: execBuyPrice,
      sellPrice: execSellPrice,
      usd: usdToUse,
      assetQuantity,
      profit,
      latency,
      netPct: netDifference
    };

    setOpenTrades(t => [newTrade, ...t].slice(0, SIMULATION_SETTINGS.MAX_TRADE_HISTORY_ENTRIES));
    
    setGlobalStats(s => {
      const total = s.totalTrades + 1;
      const successful = s.successfulTrades + (profit > 0 ? 1 : 0);
      const totalProfit = +(s.totalProfit + profit).toFixed(2);
      const winRate = +((successful / total) * 100).toFixed(2);
      return { totalTrades: total, totalProfit, winRate, successfulTrades: successful };
    });

    pushLog(`EXEC #${newTrade.id % 1000}: ${buyEx.id}→${sellEx.id} | PnL $${profit.toFixed(2)} | ${latency}ms`, 'success');
  }

  const bestSpread = useMemo(() => computeMaxSpread(exchanges), [exchanges]);
  const avgLatency = useMemo(() => exchanges.reduce((acc, ex) => acc + ex.latency, 0) / exchanges.length, [exchanges]);
  
  const handleReset = () => {
    setExchanges(e => e.map(x => ({ ...x, price: x.price }))); 
    setTradeLog([]);
    setOpenTrades([]);
    setWallet({ usd: SIMULATION_SETTINGS.INITIAL_USD, asset: SIMULATION_SETTINGS.INITIAL_ASSET });
    setGlobalStats({ totalTrades: 0, totalProfit: 0, winRate: 0, successfulTrades: 0 });
    pushLog('System reset complete.', 'info');
  };

  const allPrices = useMemo(() => {
    const prices = {};
    for (const ex of exchanges) {
        prices[ex.id] = history.prices[ex.id] || [];
    }
    return prices;
  }, [exchanges, history.prices]);

  return (
    <div className="min-h-screen p-3 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
      <div className="max-w-full mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-700/50 backdrop-blur-sm">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <h1 className="text-xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Arbitrage Engine
              </h1>
            </div>
            <div className="text-xs sm:text-sm text-rose-300 font-medium flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-rose-500/10 rounded border border-rose-500/20">LIVE</span>
              <span className="text-slate-400">•</span>
              <span>{SIMULATION_SETTINGS.ASSET_PAIR}</span>
            </div>
            <p className="mt-2 text-slate-400 text-xs sm:text-sm max-w-xl hidden sm:block">
              Automated cross-exchange strategy with real-time execution
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
             <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="hidden sm:inline">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isRunning ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {isRunning ? '● ACTIVE' : '⏸ PAUSED'}
                </span>
            </div>
            <button 
              onClick={() => setIsRunning(r => !r)} 
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-lg ${isRunning ? 'bg-amber-600 hover:bg-amber-700 hover:shadow-amber-500/50' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/50'}`}
            >
              {isRunning ? '⏸ Pause' : '▶️ Resume'}
            </button>
          </div>
        </div>
        
        {/* Main Grid */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            
            {/* Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-3 sm:p-4 rounded-xl shadow-2xl border border-slate-700/70 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
                    <HistoryChart 
                        data={allPrices.BinSim} 
                        color="#4ade80" 
                        label={`${SIMULATION_SETTINGS.ASSET_PAIR}`}
                    />
                </div>
                <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-3 sm:p-4 rounded-xl shadow-2xl border border-slate-700/70 backdrop-blur-sm hover:border-pink-500/30 transition-all">
                    <HistoryChart 
                        data={history.spreads} 
                        color="#f472b6" 
                        label="Arb Spread (%)" 
                        isSpread={true}
                    />
                </div>
            </div>

            {/* Exchanges */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-4 sm:p-5 rounded-xl shadow-2xl border border-slate-700/70 backdrop-blur-sm">
                <h2 className="text-base sm:text-lg font-semibold text-slate-200 border-b border-slate-700/50 pb-3 mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-emerald-400 rounded"></span>
                  Live Feeds
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {exchanges.map(ex => {
                    const priceChange = history.prices[ex.id] && history.prices[ex.id].length > 1 
                        ? ex.price - history.prices[ex.id][history.prices[ex.id].length - 2] 
                        : 0;
                    const priceColor = priceChange > 0 ? 'text-lime-400' : priceChange < 0 ? 'text-rose-400' : 'text-white';

                    return (
                        <div key={ex.id} className="p-3 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg border border-slate-700/50 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all group">
                            <div className="text-xs sm:text-sm font-bold text-slate-300 flex justify-between items-center">
                                <span className="group-hover:text-sky-400 transition-colors">{ex.id}</span>
                                <span className={`text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded ${priceChange > 0 ? 'bg-lime-900/50 text-lime-400' : priceChange < 0 ? 'bg-rose-900/50 text-rose-400' : 'bg-slate-700/50'}`}>
                                    {(priceChange * 1000).toFixed(1)}
                                </span>
                            </div>
                            <div className={`text-lg sm:text-xl font-mono ${priceColor} mt-1 transition-colors duration-100`}>{ex.price.toFixed(6)}</div>
                            <div className="mt-2 text-[10px] sm:text-xs flex justify-between text-slate-400">
                                <span>Vol: {(ex.volume/1000).toFixed(1)}K</span>
                                <span className="text-rose-400">{ex.latency}ms</span>
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>

            {/* Matrix - Desktop */}
            <div className="hidden sm:block bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-4 sm:p-5 rounded-xl border border-slate-700/70 backdrop-blur-sm">
                <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-3 border-b border-slate-700/50 pb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-pink-400 rounded"></span>
                  Opportunity Matrix
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 text-xs">
                {exchanges.flatMap((b) => exchanges.map((s) => ({ b, s }))).filter(p => p.b.id !== p.s.id).map((p, i) => {
                  const spread = ((p.s.price - p.b.price) / p.b.price) * 100;
                  const isTradeable = spread > spreadThreshold * 100;
                  const bgColor = isTradeable ? 'bg-rose-900/40 border-rose-600/70 shadow-rose-500/20' : 'bg-slate-900/60 border-slate-700/50';
                  
                  return (
                    <div key={i} className={`p-2 rounded-md ${bgColor} border transition-all text-center hover:scale-105 ${isTradeable ? 'animate-pulse' : ''}`}>
                      <div className="font-bold text-slate-300 text-[9px] sm:text-[10px]">{p.b.id} → {p.s.id}</div>
                      <div className={`mt-1 font-mono text-xs sm:text-sm ${isTradeable ? 'text-rose-400' : 'text-slate-400'}`}>{spread.toFixed(3)}%</div>
                      <div className="text-[8px] sm:text-[9px] opacity-80 text-slate-500">Net {((spread - SIMULATION_SETTINGS.FEE_PERCENT*2) * 100).toFixed(2)}%</div>
                    </div>
                  );
                })}
                </div>
            </div>

            {/* Mobile Top Opportunities */}
            <div className="sm:hidden bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-4 rounded-xl border border-slate-700/70 backdrop-blur-sm">
                <h3 className="text-base font-semibold text-slate-200 mb-3 border-b border-slate-700/50 pb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-pink-400 rounded"></span>
                  Top Opportunities
                </h3>
                <div className="space-y-2">
                {exchanges.flatMap((b) => exchanges.map((s) => ({ b, s }))).filter(p => p.b.id !== p.s.id).map((p, i) => {
                  const spread = ((p.s.price - p.b.price) / p.b.price) * 100;
                  return { ...p, spread, i };
                }).sort((a, b) => b.spread - a.spread).slice(0, 4).map((p) => {
                  const isTradeable = p.spread > spreadThreshold * 100;
                  
                  return (
                    <div key={p.i} className={`p-3 rounded-lg border transition-all ${isTradeable ? 'bg-rose-900/40 border-rose-600/70' : 'bg-slate-800/60 border-slate-700/50'}`}>
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-slate-300 text-sm">{p.b.id} → {p.s.id}</div>
                        <div className={`font-mono text-base ${isTradeable ? 'text-rose-400' : 'text-slate-400'}`}>{p.spread.toFixed(3)}%</div>
                      </div>
                    </div>
                  );
                })}
                </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            
            {/* Wallet */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-4 sm:p-5 rounded-xl shadow-lg border border-slate-700/70 backdrop-blur-sm">
              <h2 className="text-base sm:text-lg font-semibold text-slate-200 border-b border-slate-700/50 pb-3 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-cyan-400 rounded"></span>
                Portfolio
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-400">USD Liquidity</div>
                  <div className="text-2xl sm:text-3xl font-mono text-white">${wallet.usd.toFixed(2).toLocaleString()}</div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-400">Total PnL</div>
                  <div className={`text-xl sm:text-2xl font-mono ${globalStats.totalProfit >= 0 ? 'text-lime-400' : 'text-rose-400'}`}>
                    ${globalStats.totalProfit.toFixed(2).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t border-slate-700/50">
                <Metric name="Executions" value={globalStats.totalTrades} highlight="text-sky-400"/>
                <Metric name="Win Rate" value={`${globalStats.winRate}%`} highlight={globalStats.winRate > 50 ? 'text-lime-400' : 'text-rose-400'}/>
                <Metric name="Volume" value={`${((globalStats.totalTrades * tradeSize)/1000).toFixed(0)}K`} highlight="text-amber-400"/>
              </div>
            </div>
            
            {/* Telemetry */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-4 sm:p-5 rounded-xl shadow-lg border border-slate-700/70 backdrop-blur-sm">
              <h2 className="text-base sm:text-lg font-semibold text-slate-200 border-b border-slate-700/50 pb-3 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-400 rounded"></span>
                System Health
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Metric name="CPU" value={`${algorithmMetricsRef.current.cpu}%`} highlight="text-rose-400" />
                <Metric name="Memory" value={`${algorithmMetricsRef.current.mem}MB`} highlight="text-sky-400" />
                <Metric name="Threads" value={`${algorithmMetricsRef.current.threads}`} highlight="text-white" />
                <Metric name="Throughput" value={`${algorithmMetricsRef.current.throughput} ops`} highlight="text-lime-400" />
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-[10px] sm:text-xs text-slate-400 mb-1">Network ({Math.round(avgLatency)}ms)</div>
                  <div className="w-full bg-slate-800 rounded h-2.5 overflow-hidden">
                    <div style={{ width: `${algorithmMetricsRef.current.networkHealth}%` }} className="h-2.5 bg-lime-500/80 transition-all duration-500"></div>
                  </div>
                </div>
                <div className="w-12 sm:w-16 text-xs sm:text-sm font-mono text-lime-400 text-right">
                  {algorithmMetricsRef.current.networkHealth}%
                </div>
              </div>
            </div>

            {/* Recent Executions */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-4 sm:p-5 rounded-xl shadow-lg border border-slate-700/70 backdrop-blur-sm">
              <h2 className="text-base sm:text-lg font-semibold text-slate-200 border-b border-slate-700/50 pb-3 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-orange-400 rounded"></span>
                Recent Trades ({openTrades.length})
              </h2>
              <div className="max-h-48 sm:max-h-56 overflow-y-auto pr-2 space-y-2">
                {openTrades.length === 0 && <div className="text-xs sm:text-sm text-slate-400 py-3">Awaiting signals...</div>}
                {openTrades.map(t => (
                  <div key={t.id} className="p-2.5 sm:p-3 rounded-lg bg-gradient-to-br from-slate-800/70 to-slate-900/70 border border-slate-700/50 text-xs hover:bg-slate-700/70 transition-all hover:border-slate-600">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-slate-200 text-xs sm:text-sm">{t.buyEx} → {t.sellEx}</div>
                      <div className={`font-mono text-xs sm:text-sm font-bold ${t.profit >= 0 ? 'text-lime-400' : 'text-rose-400'}`}>${t.profit.toFixed(2)}</div>
                    </div>
                    <div className="mt-1 text-[10px] sm:text-[11px] text-slate-400 flex justify-between">
                      <span>Size: ${(t.usd/1000).toFixed(1)}K</span>
                      <span>Net: {(t.netPct * 100).toFixed(3)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls - Mobile Friendly */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-4 sm:p-5 rounded-xl border border-slate-700/70 backdrop-blur-sm">
              <h2 className="text-base sm:text-lg font-semibold text-slate-200 border-b border-slate-700/50 pb-3 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-red-400 rounded"></span>
                Controls
              </h2>
              
              <div className="space-y-3">
                  <div className="text-xs sm:text-sm text-slate-400 font-medium">Trade Config</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] sm:text-[11px] text-slate-500 block mb-1">Threshold (%)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={(spreadThreshold * 100).toFixed(2)} 
                        onChange={e => setSpreadThreshold(Number(e.target.value) / 100)} 
                        className="w-full bg-slate-800 p-2 rounded text-xs font-mono border border-slate-700 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-[11px] text-slate-500 block mb-1">Size ($)</label>
                      <input 
                        type="number" 
                        value={tradeSize} 
                        onChange={e => setTradeSize(Number(e.target.value))} 
                        className="w-full bg-slate-800 p-2 rounded text-xs font-mono border border-slate-700 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                      />
                    </div>
                  </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setWallet(w => ({ ...w, usd: w.usd + 50000 })); pushLog('Injected $50K liquidity.', 'info'); }} 
                    className="p-2.5 sm:p-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs sm:text-sm font-semibold transition-all shadow-lg hover:shadow-emerald-500/50"
                  >
                    💰 Inject
                  </button>
                  <button 
                    onClick={handleReset}
                    className="p-2.5 sm:p-3 rounded-lg bg-red-700 hover:bg-red-600 text-xs sm:text-sm font-semibold transition-all shadow-lg hover:shadow-red-500/50"
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log - Full Width */}
        <div className="mt-4 sm:mt-6 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-4 sm:p-5 rounded-xl border border-slate-700/70 backdrop-blur-sm">
          <h2 className="text-base sm:text-lg font-semibold text-slate-200 border-b border-slate-700/50 pb-3 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-yellow-400 rounded"></span>
            Activity Log
          </h2>
          <div className="max-h-48 sm:max-h-72 overflow-y-auto pr-2 text-[10px] sm:text-xs font-mono">
            {tradeLog.length === 0 && <div className="text-slate-400 py-3">System initializing...</div>}
            {tradeLog.map((l, idx) => {
              let colorClass = 'text-slate-400 bg-slate-800/40';
              if (l.level === 'warn') colorClass = 'text-amber-300 bg-amber-900/20';
              if (l.level === 'error') colorClass = 'text-rose-300 bg-rose-900/20';
              if (l.level === 'success') colorClass = 'text-emerald-300 bg-emerald-900/20';
              
              return (
                <div key={idx} className={`p-2 rounded mb-1 ${colorClass} transition-colors`}>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-sans mr-2">[{l.timestamp}]</span>
                  {l.text}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}