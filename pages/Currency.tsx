
import React, { useState, useEffect } from 'react';
import { fetchExchangeRates, fetchHistoricalRates } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const AVAILABLE_CURRENCIES = [
  'USD', 'EUR', 'PKR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'BRL', 'MXN'
];

export const Currency: React.FC = () => {
  const [baseCurrency, setBaseCurrency] = useState('EUR');
  const [targetCurrencies, setTargetCurrencies] = useState(['USD', 'PKR', 'GBP']);
  const [amount, setAmount] = useState(1);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const getRates = async () => {
    setLoading(true);
    try {
      const data = await fetchExchangeRates(baseCurrency, targetCurrencies);
      if (data) {
        setRates(data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error(e);
      alert("Failed to fetch live rates from Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getHistory = async () => {
    if (baseCurrency !== 'EUR' && baseCurrency !== 'PKR') return; // Focus on primary corridor
    setLoadingHistory(true);
    try {
      const target = baseCurrency === 'EUR' ? 'PKR' : 'EUR';
      const history = await fetchHistoricalRates(baseCurrency, target);
      if (history && history.length > 0) {
        setHistoricalData(history);
      }
    } catch (e) {
      console.error("History fetch failed", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    getRates();
    getHistory();
  }, [baseCurrency]);

  const toggleTarget = (code: string) => {
    if (targetCurrencies.includes(code)) {
      if (targetCurrencies.length > 1) {
        setTargetCurrencies(targetCurrencies.filter(c => c !== code));
      }
    } else {
      setTargetCurrencies([...targetCurrencies, code]);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto pb-10">
      <header className="px-1">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Currency Intelligence</h2>
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Real-time Global Market Data</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Card */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-7 h-fit">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Base Asset</label>
            <select 
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 font-black outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
            >
              {AVAILABLE_CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Amount</label>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-2xl font-black outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Watchlist</label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_CURRENCIES.filter(c => c !== baseCurrency).map(c => (
                <button
                  key={c}
                  onClick={() => toggleTarget(c)}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                    targetCurrencies.includes(c) 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                      : 'bg-transparent text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={getRates}
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black py-5 rounded-[1.5rem] hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl"
          >
            {loading ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"></div> : '🔄 Sync Live Rates'}
          </button>
        </div>

        {/* Results Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Base</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{amount.toLocaleString()} {baseCurrency}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Last Synced</p>
              <p className="text-xs font-black text-primary">{lastUpdated || 'Never'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {targetCurrencies.map(code => (
              <div key={code} className="bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-primary/20 transition-all">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{code} Value</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {rates[code] ? (rates[code] * amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                    </h3>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">1 {baseCurrency} = {rates[code]?.toFixed(2) || '...'} {code}</p>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="text-7xl font-black text-slate-400">{code[0]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Historical Trend Chart */}
          {(baseCurrency === 'EUR' || targetCurrencies.includes('PKR')) && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
               <div className="flex justify-between items-center mb-2">
                 <div>
                   <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">30D Historical Trend</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">EUR/PKR Market Volatility</p>
                 </div>
                 {loadingHistory && <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>}
               </div>

               <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415522" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} 
                      dy={10}
                    />
                    <YAxis 
                      hide={true} 
                      domain={['auto', 'auto']} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '20px', 
                        border: 'none', 
                        background: '#0f172a', 
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                        fontSize: '12px',
                        color: '#fff'
                      }} 
                      itemStyle={{ color: '#137fec', fontWeight: 900 }}
                      labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#137fec" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: '#137fec', strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
               </div>

               <div className="absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none">
                 <span className="material-symbols-outlined text-[180px]">show_chart</span>
               </div>
            </div>
          )}

          {loading && (
            <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/20 text-primary flex items-center gap-5 animate-fadeIn">
              <div className="size-12 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined fill-1">auto_awesome</span>
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">Hisaab Intelligence Hub</p>
                <p className="text-xs font-bold text-slate-500">Fetching live Google Search grounded exchange rates for maximum precision.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
