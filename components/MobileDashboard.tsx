
import React from 'react';
import { User, Warehouse } from '../types';

interface MobileDashboardProps {
  user: User;
  warehouses: Warehouse[];
  onLogout: () => void;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ user, warehouses, onLogout }) => {
  const assignedWarehouses = warehouses.filter(w => 
    user.assignedWarehouseIds?.includes(w.id)
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-in slide-in-from-right duration-500">
      {/* Mobile App Bar */}
      <header className="px-6 pt-12 pb-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-100">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none">Dashboard</h1>
            <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.15em] mt-1">{user.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-xl"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 overflow-y-auto px-5 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Facilities</h2>
            <p className="text-sm text-slate-500 font-medium">Assigned Locations ({assignedWarehouses.length})</p>
          </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 gap-4">
          {assignedWarehouses.map(w => (
            <div key={w.id} className="bg-white p-5 rounded-[36px] shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.97] transition-all group relative overflow-hidden">
              {/* Subtle accent line */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                w.status === 'Active' ? 'bg-emerald-500' :
                w.status === 'Full' ? 'bg-orange-500' : 'bg-slate-300'
              }`} />
              
              <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 ${
                w.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                w.status === 'Full' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-600'
              }`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="font-black text-slate-900 truncate text-[16px]">{w.name}</h3>
                <p className="text-[11px] text-slate-400 font-bold truncate mt-0.5">{w.location}</p>
                <div className="flex items-center gap-2 mt-2">
                   <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                    w.status === 'Active' ? 'text-emerald-700 bg-emerald-50' : 'text-orange-700 bg-orange-50'
                  }`}>{w.status}</span>
                </div>
              </div>
              
              <div className="text-slate-200 group-hover:text-emerald-500 transition-colors shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {assignedWarehouses.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[11px]">No Assigned Nodes</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <footer className="px-10 py-6 bg-white border-t border-slate-100 flex items-center justify-between pb-10 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <button className="text-emerald-600 flex flex-col items-center gap-1 group">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-[8px] font-black uppercase tracking-tighter">Facilities</span>
        </button>
        <button className="text-slate-300 flex flex-col items-center gap-1 hover:text-emerald-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[8px] font-black uppercase tracking-tighter">Profile</span>
        </button>
        <button className="text-slate-300 flex flex-col items-center gap-1 hover:text-emerald-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[8px] font-black uppercase tracking-tighter">Settings</span>
        </button>
      </footer>
    </div>
  );
};

export default MobileDashboard;
