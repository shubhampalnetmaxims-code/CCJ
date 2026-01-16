
import React, { useState, useEffect } from 'react';
import { User, StaffMember, StaffRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  staffMembers?: StaffMember[];
  onMobileClick?: () => void;
  onInventoryMobileClick?: () => void;
  onInstallerClick?: () => void;
  isMobileView?: boolean;
  initialRole?: StaffRole;
}

const Login: React.FC<LoginProps> = ({ 
  onLogin, 
  staffMembers = [], 
  onMobileClick, 
  onInventoryMobileClick,
  onInstallerClick,
  isMobileView = false,
  initialRole
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isMobileView && initialRole) {
      if (initialRole === 'Warehouse Manager') {
        setEmail('warehousemanager@gmail.com');
        setPassword('warehouse');
      } else if (initialRole === 'Inventory Manager') {
        setEmail('inventory@gmail.com');
        setPassword('inventory');
      } else if (initialRole === 'Installer') {
        setEmail('installer@gmail.com');
        setPassword('installer');
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
      // Administrator Desktop Logic
      if (email === 'admin@gmail.com' && password === '123456') {
        onLogin({
          email: 'admin@gmail.com',
          name: 'Super Admin',
          role: 'Site Administrator'
        });
        return;
      }

      // Staff Login
      const staffUser = staffMembers.find(s => 
        s.email === email && s.password === password
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
    const isInventoryRole = initialRole === 'Inventory Manager';
    const isInstallerRole = initialRole === 'Installer';
    
    let accentColor = isInventoryRole ? 'indigo-600' : 'emerald-600';
    let ringColor = isInventoryRole ? 'focus:ring-indigo-600' : 'focus:ring-emerald-600';
    let shadowColor = isInventoryRole ? 'shadow-indigo-100' : 'shadow-emerald-100';

    if (isInstallerRole) {
      accentColor = 'amber-500';
      ringColor = 'focus:ring-amber-500';
      shadowColor = 'shadow-amber-100';
    }

    return (
      <div className="h-full flex flex-col bg-white p-8 pt-16 animate-in fade-in duration-500">
        <div className="mb-12 text-center">
          <div className={`w-20 h-20 rounded-[24px] shadow-2xl flex items-center justify-center mb-6 mx-auto bg-${accentColor} ${shadowColor}`}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-[#8b9bb4] text-[10px] font-black tracking-widest uppercase">{initialRole} Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-[#8b9bb4] uppercase tracking-widest pl-1">Login ID</label>
            <input
              type="email"
              required
              className={`w-full px-6 py-4 bg-[#f8fafc] border border-[#f1f5f9] rounded-2xl focus:outline-none focus:ring-2 transition-all text-[15px] font-bold text-[#1e293b] shadow-sm ${ringColor}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2 relative">
            <label className="text-[11px] font-black text-[#8b9bb4] uppercase tracking-widest pl-1">Passkey</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className={`w-full px-6 py-4 bg-[#f8fafc] border border-[#f1f5f9] rounded-2xl focus:outline-none focus:ring-2 transition-all text-[15px] font-bold text-[#1e293b] shadow-sm ${ringColor}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-wider">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-5 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-xl mt-6 active:scale-95 transition-all bg-${accentColor} ${shadowColor}`}
          >
            {loading ? 'Authenticating...' : 'Establish Session'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-3xl shadow-2xl mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Upstate amusements</h1>
          <p className="mt-2 text-indigo-300 font-medium">Administration & Global Oversight</p>
        </div>

        <div className="bg-white p-10 rounded-[48px] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Admin Email</label>
              <input
                type="email"
                required
                className="block w-full px-6 py-4 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-gray-900 font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Master Password</label>
              <input
                type="password"
                required
                className="block w-full px-6 py-4 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-gray-900 font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold text-center">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-lg uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
            >
              {loading ? 'Validating...' : 'Log into Admin'}
            </button>
          </form>
          
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button onClick={onMobileClick} className="flex-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 py-3 rounded-xl border border-emerald-100">Warehouse App</button>
              <button onClick={onInventoryMobileClick} className="flex-1 text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 py-3 rounded-xl border border-indigo-100">Inventory App</button>
            </div>
            <button onClick={onInstallerClick} className="w-full text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 py-3 rounded-xl border border-amber-100">Installer Portal</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;