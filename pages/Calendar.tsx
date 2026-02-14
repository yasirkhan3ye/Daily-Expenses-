
import React, { useState } from 'react';
import { Transaction } from '../types';

interface CalendarProps {
  transactions: Transaction[];
}

export const Calendar: React.FC<CalendarProps> = ({ transactions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const getDayTransactions = (day: number) => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getDate() === day && 
             d.getMonth() === currentDate.getMonth() && 
             d.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">
            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
          </h2>
          <p className="opacity-80">Track your daily cashflow</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">◀</button>
          <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">▶</button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-4 text-center text-xs font-bold text-gray-400 uppercase">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {padding.map(p => <div key={`pad-${p}`} className="h-32 border-b border-r border-gray-50 bg-gray-50/50"></div>)}
        {days.map(day => {
          const dayTx = getDayTransactions(day);
          const hasIncome = dayTx.some(t => t.type === 'income');
          const hasExpense = dayTx.some(t => t.type === 'expense');

          return (
            <div key={day} className="h-32 border-b border-r border-gray-50 p-2 hover:bg-blue-50 transition-colors group relative">
              <span className="text-sm font-semibold text-gray-400 group-hover:text-blue-600">{day}</span>
              <div className="mt-2 space-y-1">
                {hasIncome && <div className="h-1.5 w-full bg-green-400 rounded-full"></div>}
                {hasExpense && <div className="h-1.5 w-full bg-rose-400 rounded-full"></div>}
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/90 p-2 flex flex-col justify-center items-center pointer-events-none transition-opacity">
                <p className="text-[10px] font-bold text-blue-600">{dayTx.length} items</p>
                <p className="text-[10px] font-bold text-gray-800">
                  €{dayTx.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
