
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchExchangeRates } from '../services/geminiService';

export const LoanRequest: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(1500);
  const [term, setTerm] = useState<number>(6);
  const [pkrRate, setPkrRate] = useState<number>(302.45);
  const [loading, setLoading] = useState(false);

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

  const interestRate = 4.2;
  const interestAmount = amount * (interestRate / 100);
  const totalRepay = amount + interestAmount;
  const monthlyInstallment = totalRepay / term;
  const pkrEquivalent = amount * pkrRate;

  const getTermLabel = (t: number) => {
    if (t === 3) return "Minimal Interest";
    if (t === 6) return "Balanced Term";
    return "Lowest Installment";
  };

  return (
    <div className="animate-fadeIn pb-40">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-extrabold tracking-tight">Loan Request</h1>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[12px] text-primary fill-1">auto_awesome</span>
            <span className="text-[10px] uppercase tracking-widest font-black text-primary">Hisaab Intelligence</span>
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Hero Selection Area */}
      <section className="relative px-2 mb-12">
        <div className="text-center space-y-1 mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Requesting Capital</p>
          <div className="flex items-center justify-center gap-2">
             <span className="text-3xl font-black text-slate-300">€</span>
             <h2 className="text-7xl font-black tracking-tighter text-slate-900 dark:text-white transition-all scale-105">
               {amount.toLocaleString()}
             </h2>
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <p className="text-primary font-black text-[10px] bg-primary/10 px-4 py-1.5 rounded-full uppercase tracking-widest border border-primary/10">
              ≈ {pkrEquivalent.toLocaleString(undefined, { maximumFractionDigits: 0 })} PKR
            </p>
          </div>
        </div>

        <div className="relative pt-8 pb-4">
          {/* Enhanced Track Markers */}
          <div className="absolute top-[42px] left-0 right-0 flex justify-between px-1 opacity-20 pointer-events-none">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-0.5 h-3 bg-slate-400 rounded-full"></div>
            ))}
          </div>
          
          <div className="absolute top-[42px] left-0 right-0 h-2 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div 
            className="absolute top-[42px] left-0 h-2 bg-primary rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(19,127,236,0.3)]"
            style={{ width: `${((amount - 100) / (5000 - 100)) * 100}%` }}
          ></div>
          
          <input 
            type="range"
            min="100"
            max="5000"
            step="100"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="relative w-full h-10 bg-transparent appearance-none cursor-pointer accent-primary z-10 custom-range"
          />
          
          <div className="flex justify-between mt-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <span>Entry €100</span>
            <span className="text-primary font-black">Limit €5,000</span>
          </div>
        </div>
      </section>

      {/* Repayment Period Selection */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5 px-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Repayment Period</h3>
          <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">{term} Months Select</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[3, 6, 12].map((m) => {
             const mInst = (amount + (amount * (interestRate / 100))) / m;
             const isSelected = term === m;
             return (
                <button 
                  key={m}
                  onClick={() => setTerm(m)}
                  className={`flex flex-col items-center justify-center gap-2 py-6 px-2 rounded-[2rem] border-2 transition-all relative group ${
                    isSelected 
                    ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
                  }`}
                >
                  <div className={`size-10 rounded-2xl flex items-center justify-center mb-1 transition-all ${isSelected ? 'bg-primary text-white scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-lg">{m === 3 ? 'speed' : m === 6 ? 'balance' : 'hourglass_top'}</span>
                  </div>
                  <div className="text-center">
                    <span className={`text-sm font-black block ${isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{m} Months</span>
                    <span className={`text-[8px] font-black uppercase tracking-tighter block mt-1 ${isSelected ? 'text-primary/70' : 'text-slate-400'}`}>
                      {getTermLabel(m)}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[7px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg border border-white/20">
                      Active
                    </div>
                  )}
                </button>
             );
          })}
        </div>
      </section>

      {/* AI Strategy Insight Card */}
      <section className="mb-10">
        <div className="bg-slate-900 text-white rounded-[2.5rem] p-7 relative overflow-hidden group border border-white/5 shadow-2xl ai-glow">
          <div className="flex items-start gap-5 relative z-10">
            <div className="size-14 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 backdrop-blur-md">
              <span className="material-symbols-outlined text-primary text-3xl fill-1 animate-pulse">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Strategic Insight</h4>
                <span className="size-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              </div>
              <p className="text-[11px] leading-relaxed font-bold text-slate-300">
                A <span className="text-white font-black">{term} month</span> cycle minimizes risk. Monthly exposure of <span className="text-emerald-400 font-black">€{monthlyInstallment.toFixed(2)}</span> is optimized for your currency buffer, ensuring 98% approval probability.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[120px]">verified_user</span>
          </div>
        </div>
      </section>

      {/* High-Impact Final Summary */}
      <section className="mb-12">
        <div className="bg-white dark:bg-slate-900/60 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Principal</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">€{amount.toLocaleString()}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Interest ({interestRate}%)</p>
              <p className="text-lg font-black text-amber-500">€{interestAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">Total Repayable Amount</p>
            <h3 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
              €{totalRepay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Equated Monthly Installment: €{monthlyInstallment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </section>

      {/* Action Area */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-white dark:from-background-dark via-white/95 dark:via-background-dark/95 to-transparent z-40 no-print">
        <div className="max-w-md mx-auto">
          <button className="w-full bg-primary hover:bg-primary/90 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-primary/40 flex items-center justify-center gap-4 transition-all active:scale-95 group">
            <span className="text-sm uppercase tracking-widest">Authorize Application</span>
            <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">send_money</span>
          </button>
          <p className="text-center text-[9px] mt-5 text-slate-500 font-bold uppercase tracking-[0.2em] opacity-40">
            Powered by MJK.IT Financial Engine
          </p>
        </div>
      </div>

      <style>{`
        .custom-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          background: #137fec;
          cursor: pointer;
          border-radius: 10px;
          border: 4px solid #fff;
          box-shadow: 0 10px 20px rgba(19, 127, 236, 0.3);
          transition: all 0.2s;
        }
        .dark .custom-range::-webkit-slider-thumb {
          border-color: #101922;
        }
        .custom-range::-webkit-slider-thumb:active {
          transform: scale(1.2);
          box-shadow: 0 15px 30px rgba(19, 127, 236, 0.4);
        }
      `}</style>
    </div>
  );
};
