
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme, useUser, useNotifications } from '../App';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { profile } = useUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 no-print">
        <div 
          onClick={() => navigate('/menu')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 overflow-hidden group-hover:scale-105 transition-transform">
            <img 
              className="w-full h-full object-cover" 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}`} 
              alt="User" 
            />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Hisaab AI</p>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{profile.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            aria-label="Toggle Theme"
          >
            <span className="material-symbols-outlined text-2xl">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-background-light dark:border-background-dark animate-pulse"></span>
            )}
          </button>
        </div>
      </header>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="fixed top-20 right-4 z-[100] w-80 max-h-[80vh] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-fadeIn flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-black text-xs uppercase tracking-widest">Notifications</h3>
            <button 
              onClick={markAllAsRead}
              className="text-[10px] font-black text-primary uppercase"
            >
              Clear All
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => markAsRead(n.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all ${n.isRead ? 'opacity-60 grayscale' : 'bg-slate-50 dark:bg-slate-800/50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                    n.type === 'alert' ? 'bg-rose-100 text-rose-500' : 
                    n.type === 'success' ? 'bg-emerald-100 text-emerald-500' : 'bg-primary/10 text-primary'
                  }`}>
                    <span className="material-symbols-outlined text-sm">{n.type === 'alert' ? 'warning' : n.type === 'success' ? 'check' : 'info'}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black">{n.title}</h4>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                    <p className="text-[8px] font-black text-slate-400 mt-2 uppercase">{n.date}</p>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="py-10 text-center text-slate-400 font-black text-[10px] uppercase">
                No notifications
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowNotifications(false)}
            className="p-4 text-center font-black text-[10px] uppercase text-slate-400 hover:text-primary transition-colors"
          >
            Close Panel
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-28">
        <div className="max-w-md mx-auto px-4 pt-6">
          {children}
        </div>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-4 no-print">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined font-bold">home</span>
            <span className="text-[10px] font-bold">Home</span>
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined font-bold">account_balance_wallet</span>
            <span className="text-[10px] font-bold">Assets</span>
          </NavLink>
          
          <div className="relative -mt-12">
            <NavLink to="/analytics" className="size-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center border-4 border-background-light dark:border-background-dark active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-3xl font-black">auto_awesome</span>
            </NavLink>
          </div>

          <NavLink to="/lend" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined font-bold">swap_horiz</span>
            <span className="text-[10px] font-bold">Returns</span>
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined font-bold">grid_view</span>
            <span className="text-[10px] font-bold">Menu</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
