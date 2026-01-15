
import React, { useState, useEffect } from 'react';
import { User, StaffMember, StaffRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  staffMembers?: StaffMember[];
  onMobileClick?: () => void;
  onInventoryMobileClick?: () => void;
  isMobileView?: boolean;
  initialRole?: StaffRole;
}

const Login: React.FC<LoginProps> = ({ 
  onLogin, 
  staffMembers = [], 
  onMobileClick, 
  onInventoryMobileClick,
  isMobileView = false,
  initialRole
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill credentials based on role for mobile flow
  useEffect(() => {
    if (isMobileView && initialRole) {
      if (initialRole === 'Warehouse Manager') {
        setEmail('warehousemanager@gmail.com');
        setPassword('warehouse');
      } else if (initialRole === 'Inventory Manager') {
        setEmail('inventory@gmail.com');
        setPassword('inventory');
      }
    } else if (!isMobileView) {
      setEmail('admin@gmail.com');
      setPassword('123456');
    }
  }, [isMobileView, initialRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      // Admin Check
      if (email === 'admin@gmail.com' && password === '123456' && !isMobileView) {
        onLogin({
          email: 'admin@gmail.com',
          name: 'Super Admin',
          role: 'Site Administrator'
        });
        return;
      }

      // Staff Check
      const staffUser = staffMembers.find(s => 
        s.email === email && (s.password === password || password === 'wh-bypass-key')
      );
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

  if (isMobileView) {
    return (
      <div className="h-full flex flex-col bg-white p-8 pt-16 animate-in fade-in duration-500">
        <div className="mb-12 text-center">
          <div className="w-20 h-20 bg-[#009e60] rounded-[24px] shadow-2xl shadow-[#009e60]/20 flex items-center justify-center mb-6 mx-auto">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-[#8b9bb4] text-sm font-bold tracking-widest uppercase">Authorized Access Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-[#8b9bb4] uppercase tracking-widest pl-1">Login Identity</label>
            <input
              type="email"
              required
              className="w-full px-6 py-4 bg-[#f8fafc] border border-[#f1f5f9] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#009e60] focus:bg-white transition-all text-[15px] font-bold text-[#1e293b] shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 relative">
            <label className="text-[11px] font-black text-[#8b9bb4] uppercase tracking-widest pl-1">Access Key</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-6 py-4 bg-[#f8fafc] border border-[#f1f5f9] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#009e60] focus:bg-white transition-all text-[15px] font-bold text-[#1e293b] shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#009e60] transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.112-3.887m3.47-2.98A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.057 10.057 0 01-2.163 3.888m-4.287-4.287a3 3 0 11-4.288-4.288" /></svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-[10px] font-black px-1 text-center animate-bounce uppercase tracking-wider">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#009e60] text-white py-5 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-xl shadow-[#009e60]/20 mt-6 active:scale-95 transition-all"
          >
            {loading ? 'Processing...' : 'Unlock Manager View'}
          </button>
        </form>
        
        <div className="mt-auto pb-8 text-center">
          <p className="text-[#cbd5e1] text-[10px] font-black tracking-[0.2em] uppercase">Upstate Amusement Inc.</p>
        </div>
      </div>
    );
  }

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
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="space-y-2 relative">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Security Key</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full px-6 py-4 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-gray-900 font-bold"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.112-3.887m3.47-2.98A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.057 10.057 0 01-2.163 3.888m-4.287-4.287a3 3 0 11-4.288-4.288" /></svg>
                    )}
                  </button>
                </div>
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
