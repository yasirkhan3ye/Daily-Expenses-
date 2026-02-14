
import React, { useState, useEffect, Component, ErrorInfo, ReactNode, createContext, useContext } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { Calendar } from './pages/Calendar';
import { Payments } from './pages/Payments';
import { Lend } from './pages/Lend';
import { LoanRequest } from './pages/LoanRequest';
import { Menu } from './pages/Menu';
import { AIStudio } from './pages/AIStudio';
import { Currency } from './pages/Currency';
import { Transaction, LendRecord, UserProfile, Notification } from './types';

// Theme Context for easy access across the app
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

// User Profile Context
interface UserContextType {
  profile: UserProfile;
  updateProfile: (newProfile: UserProfile) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

// Notification Context
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};

// Defining explicit interfaces for ErrorBoundary props and state to solve TS generic inference issues.
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center p-8 text-center bg-background-dark">
          <span className="material-symbols-outlined text-rose-500 text-6xl mb-4">error</span>
          <h2 className="text-xl font-black text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-400 mb-6">Hisaab AI encountered an unexpected error. Don't worry, your data is safe.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/30"
          >
            Refresh Interface
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const initialTransactions: Transaction[] = [
  { id: '1', amount: 5000, category: 'Salary', date: '2023-11-01', type: 'income', description: 'Monthly pay' },
  { id: '2', amount: 1200, category: 'Rent', date: '2023-11-02', type: 'expense', description: 'November Rent' },
];

const initialLendRecords: LendRecord[] = [
  { 
    id: 'l1', 
    personName: 'Ali Khan', 
    amount: 150, 
    currency: 'EUR', 
    exchangeRateAtLending: 305.5, 
    dateLent: '2023-11-20', 
    dueDate: '2023-12-05', 
    status: 'pending', 
    description: 'Laptop repair loan',
    repayments: []
  }
];

const initialProfile: UserProfile = {
  name: 'Yasir khan',
  avatarSeed: 'Aneka'
};

const initialNotifications: Notification[] = [
  { id: '1', title: 'Monthly Report', message: 'Your financial summary for February is ready.', date: '2026-02-01', isRead: false, type: 'info' },
  { id: '2', title: 'Due Date Alert', message: 'Ali Khan\'s loan payment is due in 2 days.', date: '2026-02-15', isRead: false, type: 'alert' },
  { id: '3', title: 'System Updated', message: 'New AI features have been integrated into the dashboard.', date: '2026-02-10', isRead: true, type: 'success' },
];

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hisaab_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('hisaab_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fingemini_txs');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [lendRecords, setLendRecords] = useState<LendRecord[]>(() => {
    const saved = localStorage.getItem('fingemini_lend');
    return saved ? JSON.parse(saved) : initialLendRecords;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('hisaab_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  useEffect(() => {
    localStorage.setItem('hisaab_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('fingemini_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fingemini_lend', JSON.stringify(lendRecords));
  }, [lendRecords]);

  useEffect(() => {
    localStorage.setItem('hisaab_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('hisaab_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const updateProfile = (newProfile: UserProfile) => setProfile(newProfile);

  const addTransaction = (t: Transaction) => setTransactions([...transactions, t]);
  const deleteTransaction = (id: string) => setTransactions(transactions.filter(t => t.id !== id));

  const addLendRecord = (r: LendRecord) => setLendRecords([...lendRecords, r]);
  const updateLendRecord = (updatedRecord: LendRecord) => {
    setLendRecords(lendRecords.map(r => r.id === updatedRecord.id ? updatedRecord : r));
  };
  const deleteLendRecord = (id: string) => setLendRecords(lendRecords.filter(r => r.id !== id));

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const markAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <UserContext.Provider value={{ profile, updateProfile }}>
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
          <ErrorBoundary>
            <HashRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard transactions={transactions} />} />
                  <Route path="/transactions" element={<Transactions transactions={transactions} onAdd={addTransaction} onDelete={deleteTransaction} />} />
                  <Route path="/analytics" element={<Analytics transactions={transactions} />} />
                  <Route path="/lend" element={<Lend lendRecords={lendRecords} onAdd={addLendRecord} onUpdate={updateLendRecord} onDelete={deleteLendRecord} />} />
                  <Route path="/calendar" element={<Calendar transactions={transactions} />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/loan-request" element={<LoanRequest />} />
                  <Route path="/ai-studio" element={<AIStudio />} />
                  <Route path="/currency" element={<Currency />} />
                  <Route path="/menu" element={<Menu />} />
                </Routes>
              </Layout>
            </HashRouter>
          </ErrorBoundary>
        </NotificationContext.Provider>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
