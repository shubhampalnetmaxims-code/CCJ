
import React, { useState } from 'react';
import { User, Warehouse, Part, Machine } from '../types';

interface MobileDashboardProps {
  user: User;
  warehouses: Warehouse[];
  parts: Part[];
  machines: Machine[];
  onUpdatePart: (p: Part) => void;
  onLogout: () => void;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ 
  user, warehouses, parts, machines, onUpdatePart, onLogout 
}) => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'parts' | 'machines'>('parts');

  const assignedWarehouses = warehouses.filter(w => 
    user.assignedWarehouseIds?.includes(w.id)
  );

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);
  const warehouseParts = parts.filter(p => p.warehouseId === selectedWarehouseId);
  const warehouseMachines = machines.filter(m => m.warehouseId === selectedWarehouseId);

  // Helper to handle threshold updates
  const handleThresholdUpdate = (part: Part, newValue: string) => {
    const threshold = parseInt(newValue) || 0;
    onUpdatePart({ ...part, threshold });
  };

  if (selectedWarehouse) {
    return (
      <div className="h-full flex flex-col bg-slate-50 animate-in slide-in-from-right duration-300">
        <header className="px-6 pt-12 pb-6 bg-white border-b border-slate-100 sticky top-0 z-20">
          <button 
            onClick={() => setSelectedWarehouseId(null)}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-xs mb-4 shadow-sm border border-emerald-100 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to List
          </button>
          <h1 className="text-xl font-black text-slate-900 leading-none">{selectedWarehouse.name}</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedWarehouse.location}</p>
        </header>

        <div className="bg-white px-6 py-2 border-b border-slate-100 flex gap-6">
          <button 
            onClick={() => setActiveTab('parts')}
            className={`py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'parts' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'}`}
          >
            Parts ({warehouseParts.length})
          </button>
          <button 
            onClick={() => setActiveTab('machines')}
            className={`py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'machines' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'}`}
          >
            Machines ({warehouseMachines.length})
          </button>
        </div>

        <main className="flex-1 overflow-y-auto px-5 py-6">
          {activeTab === 'parts' ? (
            <div className="space-y-4">
              {warehouseParts.map(p => {
                const isLow = p.threshold !== undefined && p.quantity <= p.threshold;
                return (
                  <div key={p.id} className={`bg-white p-5 rounded-[28px] border transition-all ${isLow ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-black text-slate-900">{p.name}</h3>
                        <p className="text-[10px] font-mono text-emerald-600 font-bold">SKU: {p.partId}</p>
                      </div>
                      <div className={`text-right ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                        <span className="text-2xl font-black">{p.quantity}</span>
                        <span className="text-[10px] uppercase font-black ml-1">In Stock</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Alert Threshold</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          value={p.threshold ?? 0}
                          onChange={(e) => handleThresholdUpdate(p, e.target.value)}
                          className="w-16 px-2 py-1 bg-slate-100 rounded-lg text-center font-black text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    {isLow && (
                      <div className="mt-3 flex items-center gap-1.5 text-amber-600">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[9px] font-black uppercase">Low Stock Warning</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {warehouseMachines.map(m => (
                <div key={m.id} className="bg-white p-5 rounded-[28px] border border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">{m.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{m.class} • SN: {m.serialNumber}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        m.condition === 'New' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {m.condition}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

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
          className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Login
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
            <div 
              key={w.id} 
              onClick={() => setSelectedWarehouseId(w.id)}
              className="bg-white p-5 rounded-[36px] shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.97] transition-all group relative overflow-hidden cursor-pointer"
            >
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
