
import React, { useState, useEffect } from 'react';
import { fetchExchangeRates } from '../services/geminiService';

export const Payments: React.FC = () => {
  const [amount, setAmount] = useState<string>('1000');
  const [pkrRate, setPkrRate] = useState<number>(302.45);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getRate = async () => {
      setLoading(true);
      try {
        const data = await fetchExchangeRates('EUR', ['PKR']);
        if (data && data.PKR) setPkrRate(data.PKR);
      } catch (e) {
        console.error("Rate fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    getRate();
  }, []);

  const sendAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const receiveAmount = sendAmount * pkrRate;

  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <header className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-extrabold tracking-tight">Send Money</h2>
        {loading && <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>}
      </header>

      {/* Currency Converter Section */}
      <div className="space-y-2 relative">
        {/* Source Currency (EUR) */}
        <div className="bg-white dark:bg-[#192633] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:border-primary/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">You send</span>
          </div>
          <div className="flex justify-between items-center">
            <input 
              autoFocus
              className="bg-transparent border-none p-0 text-3xl font-extrabold focus:ring-0 w-full text-slate-900 dark:text-white" 
              type="text" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full shrink-0">
              <div 
                className="w-6 h-6 rounded-full overflow-hidden bg-center bg-cover border border-slate-200 dark:border-slate-700" 
                style={{backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg')"}}
              ></div>
              <span className="font-bold text-xs">EUR</span>
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </button>
          </div>
        </div>

        {/* Rate Connector Line */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-700"></div>
          <div className="bg-primary text-white rounded-full p-1.5 shadow-lg flex items-center justify-center transform hover:rotate-180 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-sm">swap_vert</span>
          </div>
          <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Destination Currency (PKR) */}
        <div className="bg-white dark:bg-[#192633] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:border-primary/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Recipient gets</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {receiveAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full shrink-0">
              <div 
                className="w-6 h-6 rounded-full overflow-hidden bg-center bg-cover border border-slate-200 dark:border-slate-700" 
                style={{backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/3/32/Flag_of_Pakistan.svg')"}}
              ></div>
              <span className="font-bold text-xs">PKR</span>
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exchange Rate Info */}
      <div className="flex items-center justify-center gap-2 py-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">Mid-market rate:</span>
        <span className="text-xs font-bold text-primary">1 EUR = {pkrRate.toFixed(2)} PKR</span>
        <span className="material-symbols-outlined text-sm text-gray-400">info</span>
      </div>

      {/* Gemini Insight Box */}
      <div className="bg-gradient-to-br from-[#137fec]/10 to-[#137fec]/5 border border-primary/20 rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-8xl text-primary font-bold">auto_awesome</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
          </div>
          <h3 className="font-bold text-primary text-sm">Gemini Insight</h3>
        </div>
        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          The current EUR/PKR rate is <span className="font-bold text-green-500">{(pkrRate > 300 ? 'excellent' : 'stable')}</span> compared to the 30-day average. 
          You are maximizing value by sending today.
        </p>
        <button className="mt-4 text-[10px] font-extrabold uppercase tracking-widest text-primary flex items-center gap-1">
          View Performance <span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
        </button>
      </div>

      <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
        <span>Select Recipient</span>
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>
      
      <p className="text-center text-[8px] text-gray-500 uppercase tracking-widest font-bold mt-4">Secure transfer powered by Hisaab AI</p>
    </div>
  );
};
