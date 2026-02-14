
import React, { useState, useEffect } from 'react';
import { LendRecord, LendStatus, CurrencyType, Repayment } from '../types';
import { fetchExchangeRates } from '../services/geminiService';

interface LendProps {
  lendRecords: LendRecord[];
  onAdd: (record: LendRecord) => void;
  onUpdate: (record: LendRecord) => void;
  onDelete: (id: string) => void;
}

export const Lend: React.FC<LendProps> = ({ lendRecords, onAdd, onUpdate, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [fetchingRate, setFetchingRate] = useState(false);
  const [currentPkrRate, setCurrentPkrRate] = useState<number>(300);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [repaymentModal, setRepaymentModal] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    personName: '',
    amount: '',
    currency: 'EUR' as CurrencyType,
    dateLent: new Date().toISOString().split('T')[0],
    dueDate: '',
    description: ''
  });

  const [repayData, setRepayData] = useState({
    amount: '',
    currency: 'EUR' as CurrencyType,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const getRate = async () => {
      setFetchingRate(true);
      try {
        const data = await fetchExchangeRates('EUR', ['PKR']);
        if (data && data.PKR) {
          setCurrentPkrRate(data.PKR);
        }
      } catch (e) {
        console.error("Failed to fetch rate", e);
      } finally {
        setFetchingRate(false);
      }
    };
    getRate();
  }, [showAdd, repaymentModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      personName: formData.personName,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      exchangeRateAtLending: currentPkrRate,
      dateLent: formData.dateLent,
      dueDate: formData.dueDate,
      status: 'pending',
      description: formData.description,
      repayments: []
    });
    setFormData({ personName: '', amount: '', currency: 'EUR', dateLent: new Date().toISOString().split('T')[0], dueDate: '', description: '' });
    setShowAdd(false);
  };

  const handleAddRepayment = (e: React.FormEvent) => {
    e.preventDefault();
    const record = lendRecords.find(r => r.id === repaymentModal);
    if (!record) return;

    const newRepayment: Repayment = {
      id: Math.random().toString(36).substr(2, 9),
      amount: parseFloat(repayData.amount),
      currency: repayData.currency,
      exchangeRateAtRepayment: currentPkrRate,
      date: repayData.date
    };

    const updatedRecord = {
      ...record,
      repayments: [...record.repayments, newRepayment]
    };

    const totalRepaidNormalized = calculateTotalRepaid(updatedRecord);
    if (totalRepaidNormalized >= record.amount) {
      updatedRecord.status = 'returned';
    } else if (totalRepaidNormalized > 0) {
      updatedRecord.status = 'partial';
    }

    onUpdate(updatedRecord);
    setRepaymentModal(null);
    setRepayData({ amount: '', currency: 'EUR', date: new Date().toISOString().split('T')[0] });
  };

  const calculateTotalRepaid = (record: LendRecord): number => {
    return record.repayments.reduce((sum, rep) => {
      if (rep.currency === record.currency) {
        return sum + rep.amount;
      } else {
        if (record.currency === 'EUR') {
          return sum + (rep.amount / rep.exchangeRateAtRepayment);
        } else {
          return sum + (rep.amount * rep.exchangeRateAtRepayment);
        }
      }
    }, 0);
  };

  const isOverdue = (date: string) => new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Lending & Returns</h2>
          {/* Subtitle removed per request */}
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
        >
          {showAdd ? 'Close' : '+ Record New Loan'}
        </button>
      </header>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl animate-fadeIn space-y-6">
          <div className="flex justify-between items-center border-b dark:border-slate-800 pb-4">
            <h4 className="text-xl font-black">New Loan Entry</h4>
            <div className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest">
              Live Rate: 1€ = {currentPkrRate.toFixed(2)} ₨
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Recipient Name</label>
              <input required type="text" value={formData.personName} onChange={e => setFormData({...formData, personName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white" placeholder="Name" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Loan Value</label>
              <div className="flex gap-2">
                <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="flex-1 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20 font-black text-slate-900 dark:text-white" placeholder="Amount" />
                <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value as CurrencyType})} className="bg-primary text-white rounded-2xl px-4 font-black">
                  <option value="EUR">EUR</option>
                  <option value="PKR">PKR</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Date Lent</label>
              <input required type="date" value={formData.dateLent} onChange={e => setFormData({...formData, dateLent: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 outline-none text-slate-900 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Return Date</label>
              <input required type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 outline-none text-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Notes</label>
            <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 outline-none text-slate-900 dark:text-white" placeholder="Purpose of loan" />
          </div>
          <button type="submit" disabled={fetchingRate} className="w-full bg-primary text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-95 transition-all">
            Confirm Entry
          </button>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/30 border-b dark:border-slate-800">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {lendRecords.map(record => {
                const totalRepaid = calculateTotalRepaid(record);
                const remaining = Math.max(0, record.amount - totalRepaid);
                const progress = (totalRepaid / record.amount) * 100;
                const overdue = record.status !== 'returned' && isOverdue(record.dueDate);

                return (
                  <React.Fragment key={record.id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-sm text-slate-900 dark:text-white">{record.personName}</span>
                          <span className={`text-[9px] font-bold uppercase ${overdue ? 'text-rose-500' : 'text-slate-400'}`}>
                            Due {record.dueDate}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col text-[10px]">
                            <span className="font-bold text-slate-400 uppercase">Paid: {record.currency === 'EUR' ? '€' : '₨'}{totalRepaid.toFixed(0)}</span>
                            <span className={`font-black uppercase ${remaining > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                              Left: {record.currency === 'EUR' ? '€' : '₨'}{remaining.toFixed(0)}
                            </span>
                          </div>
                          {/* Vertical Progress Bar */}
                          <div className="w-1.5 h-10 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end">
                            <div 
                              className={`w-full transition-all duration-700 ${remaining > 0 ? 'bg-primary' : 'bg-emerald-500'}`} 
                              style={{ height: `${Math.min(100, progress)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 max-w-[150px]">
                        <p className="text-[10px] font-bold text-slate-500 uppercase leading-tight truncate">
                          {record.description || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-6 text-right space-x-2">
                        <button 
                          onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                          className={`size-8 rounded-lg flex items-center justify-center transition-all ${expandedRow === record.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary'}`}
                        >
                          <span className="material-symbols-outlined text-sm">history</span>
                        </button>
                        {record.status !== 'returned' && (
                          <button 
                            onClick={() => setRepaymentModal(record.id)}
                            className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                          >
                            Return
                          </button>
                        )}
                        <button onClick={() => onDelete(record.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </td>
                    </tr>
                    {expandedRow === record.id && (
                      <tr className="bg-slate-50/50 dark:bg-slate-800/10">
                        <td colSpan={4} className="px-8 py-6">
                          <div className="space-y-4 animate-fadeIn">
                             <h5 className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Repayment Timeline</h5>
                             {record.repayments.length === 0 ? (
                               <p className="text-[10px] text-slate-400 font-bold italic">No history found.</p>
                             ) : (
                               <div className="grid grid-cols-1 gap-3">
                                 {record.repayments.map(rep => (
                                   <div key={rep.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
                                      <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                          <span className="material-symbols-outlined text-sm">check_circle</span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-xs font-black">{rep.currency === 'EUR' ? '€' : '₨'}{rep.amount.toLocaleString()}</span>
                                          <span className="text-[8px] font-black text-slate-400 uppercase">{rep.date}</span>
                                        </div>
                                      </div>
                                      {rep.currency !== record.currency && (
                                        <div className="text-right">
                                          <span className="text-[9px] font-bold text-slate-400 uppercase">Valued at Rate: {rep.exchangeRateAtRepayment}</span>
                                        </div>
                                      )}
                                   </div>
                                 ))}
                               </div>
                             )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {repaymentModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-fadeIn border border-slate-100 dark:border-slate-800">
            <h4 className="text-xl font-black mb-1">Add Repayment</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 tracking-widest">Update Loan Portfolio</p>
            <form onSubmit={handleAddRepayment} className="space-y-5">
              <div className="flex gap-2">
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  value={repayData.amount} 
                  onChange={e => setRepayData({...repayData, amount: e.target.value})} 
                  className="flex-1 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 font-black text-slate-900 dark:text-white" 
                  placeholder="0.00" 
                />
                <select value={repayData.currency} onChange={e => setRepayData({...repayData, currency: e.target.value as CurrencyType})} className="bg-emerald-500 text-white rounded-2xl px-4 font-black">
                  <option value="EUR">EUR</option>
                  <option value="PKR">PKR</option>
                </select>
              </div>
              <input required type="date" value={repayData.date} onChange={e => setRepayData({...repayData, date: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 outline-none text-slate-900 dark:text-white" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setRepaymentModal(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-400 font-black py-4 rounded-2xl active:scale-95 transition-all text-[10px] uppercase">Cancel</button>
                <button type="submit" disabled={fetchingRate} className="flex-1 bg-emerald-500 text-white font-black py-4 rounded-2xl active:scale-95 transition-all text-[10px] uppercase shadow-lg shadow-emerald-500/20">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
