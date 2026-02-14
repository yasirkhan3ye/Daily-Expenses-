
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../App';

export const Menu: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUser();
  const [showEdit, setShowEdit] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempSeed, setTempSeed] = useState(profile.avatarSeed);

  const handleSaveProfile = () => {
    updateProfile({ name: tempName, avatarSeed: tempSeed });
    setShowEdit(false);
  };

  const menuGroups = [
    {
      title: "Financial Intelligence",
      items: [
        { icon: 'calendar_month', label: 'Cashflow Planner', sub: 'Predictive calendar', path: '/calendar', color: 'text-indigo-500' },
      ]
    },
    {
      title: "Transactions & Credit",
      items: [
        { icon: 'history', label: 'History & Lending', sub: 'Manage IOUs', path: '/lend', color: 'text-slate-400' },
      ]
    }
  ];

  const avatarOptions = ['Felix', 'Aneka', 'Casper', 'Sasha', 'Willow', 'Cookie', 'Misty', 'Pepper', 'Zoe', 'Cuddles'];

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <header className="px-1">
        <h2 className="text-2xl font-black tracking-tighter">Account Menu</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Control Center</p>
      </header>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-5">
        <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden shrink-0">
          <img 
            className="w-full h-full object-cover" 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}`} 
            alt="User" 
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">{profile.name}</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Premium Member • ID: #8821</p>
        </div>
        <button 
          onClick={() => setShowEdit(true)}
          className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined text-xl">edit</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black">Edit Personal Profile</h3>
              <button onClick={() => setShowEdit(false)} className="text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="size-24 rounded-[2rem] bg-primary/10 border-2 border-primary/20 overflow-hidden">
                <img 
                  className="w-full h-full object-cover" 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tempSeed}`} 
                  alt="Preview" 
                />
              </div>
              
              <div className="w-full space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Display Name</label>
                <input 
                  type="text" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-6 py-4 font-black outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
                />
              </div>

              <div className="w-full space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Avatar Seed</label>
                <div className="grid grid-cols-5 gap-2">
                  {avatarOptions.map(seed => (
                    <button
                      key={seed}
                      onClick={() => setTempSeed(seed)}
                      className={`size-12 rounded-xl border-2 transition-all flex items-center justify-center bg-slate-50 dark:bg-slate-800 overflow-hidden ${tempSeed === seed ? 'border-primary shadow-lg shadow-primary/20' : 'border-transparent opacity-60'}`}
                    >
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={seed} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveProfile}
              className="w-full bg-primary text-white font-black py-5 rounded-[2rem] shadow-xl shadow-primary/30 active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      )}

      {/* Menu Sections */}
      {menuGroups.map((group, idx) => (
        <section key={idx} className="space-y-3">
          <h4 className="px-1 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{group.title}</h4>
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            {group.items.map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-b last:border-0 border-slate-50 dark:border-slate-800 group`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${item.color} group-active:scale-90 transition-transform`}>
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{item.label}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.sub}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-sm group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
              </button>
            ))}
          </div>
        </section>
      ))}

      <p className="text-center text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] pt-10">
        powered by MJK.IT
      </p>
    </div>
  );
};
