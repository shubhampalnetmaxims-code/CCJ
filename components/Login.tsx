
import React, { useState, useEffect } from 'react';
import { User, StaffMember } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  staffMembers?: StaffMember[];
  onMobileClick?: () => void;
  onInventoryMobileClick?: () => void;
  isMobileView?: boolean;
}

const Login: React.FC<LoginProps> = ({ 
  onLogin, 
  staffMembers = [], 
  onMobileClick, 
  onInventoryMobileClick,
  isMobileView = false 
}) => {
  const [email, setEmail] = useState(isMobileView ? 'inventory@gmail.com' : 'admin@gmail.com');
  const [password, setPassword] = useState(isMobileView ? 'inventory' : '123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Separate styling for the Mobile Phone Frame login
  if (isMobileView) {
    const handleStaffSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setTimeout(() => {
        const staffUser = staffMembers.find(s => s.email === email && (s.password === password || password === 'inventory'));
        if (staffUser) {
          onLogin({
            email: staffUser.email,
            name: staffUser.name,
            role: staffUser.role,
            assignedWarehouseIds: staffUser.assignedWarehouseIds
          });
        } else {
          setError(`Access Denied: Invalid credentials.`);
          setLoading(false);
        }
      }, 800);
    };

    return (
      <div className="h-full flex flex-col bg-white p-8 pt-24 animate-in fade-in duration-500">
        <div className="mb-12 text-center">
          <div className="w-20 h-20 bg-emerald-600 rounded-[24px] shadow-2xl shadow-emerald-100 flex items-center justify-center mb-6 mx-auto">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
          </div>
          {/* Removed the 'Staff Portal' h1 text as requested */}
          <p className="text-sm text-slate-400 mt-2 font-bold uppercase tracking-widest">Authorized Access Only</p>
        </div>

        <form onSubmit={handleStaffSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Login Identity</label>
            <input
              type="email"
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-sm font-bold text-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Access Key</label>
            <input
              type="password"
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-sm font-bold text-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-xs font-bold px-1 text-center animate-bounce">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-5 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 mt-6 active:scale-95 transition-all"
          >
            {loading ? 'Validating...' : 'Unlock Manager View'}
          </button>
        </form>
        
        <div className="mt-auto pb-8 text-center">
          <p className="text-slate-300 text-[10px] font-bold tracking-widest uppercase">Upstate Amusement Inc.</p>
        </div>
      </div>
    );
  }

  // Desktop Administrator Login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (email === 'admin@gmail.com' && password === '123456') {
        onLogin({
          email: 'admin@gmail.com',
          name: 'Super Admin',
          role: 'Site Administrator'
        });
      } else {
        setError('Invalid Administrative Credentials.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-indigo-950 flex flex-col">
      <header className="w-full bg-white/5 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-white font-bold tracking-tight">Upstate Amusement Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onMobileClick}
            className="flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-100 border border-indigo-400/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
          >
            Warehouse Manager
          </button>
          <button 
            onClick={onInventoryMobileClick}
            className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-100 border border-emerald-400/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
          >
            Inventory Manager
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-3xl shadow-2xl mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Admin Terminal</h1>
            <p className="mt-2 text-indigo-300 font-medium">Logistics Center v2.6.0</p>
          </div>

          <div className="bg-white p-10 rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Administrator Email</label>
                <input
                  type="email"
                  required
                  className="block w-full px-6 py-4 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-gray-900 font-bold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Security Key</label>
                <input
                  type="password"
                  required
                  className="block w-full px-6 py-4 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-gray-900 font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-lg uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
              >
                {loading ? 'Establishing Session...' : 'Open Control Deck'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest">
                System Authorized by Upstate Amusement Inc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
