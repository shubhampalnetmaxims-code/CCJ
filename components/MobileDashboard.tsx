
import React, { useState } from 'react';
import { User, Warehouse, Part, Machine } from '../types';

interface MobileDashboardProps {
  user: User;
  warehouses: Warehouse[];
  parts: Part[];
  machines: Machine[];
  onUpdatePart: (p: Part) => void;
  onAddPart: (p: Omit<Part, 'id'>) => void;
  onAddMachine: (m: Omit<Machine, 'id'>) => void;
  onLogout: () => void;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ 
  user, warehouses, parts, machines, onUpdatePart, onAddPart, onAddMachine, onLogout 
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'inventory' | 'intake' | 'profile' | 'settings'>('inventory');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [activeInventoryTab, setActiveInventoryTab] = useState<'parts' | 'machines'>('parts');
  
  // Intake Sub-views
  const [intakeView, setIntakeView] = useState<'selection' | 'part-form' | 'machine-form'>('selection');

  const assignedWarehouses = warehouses.filter(w => 
    user.assignedWarehouseIds?.includes(w.id)
  );

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);
  const warehouseParts = parts.filter(p => p.warehouseId === selectedWarehouseId);
  const warehouseMachines = machines.filter(m => m.warehouseId === selectedWarehouseId);

  // Intake Form States
  const [intakeWarehouseId, setIntakeWarehouseId] = useState(assignedWarehouses[0]?.id || '');
  const [partData, setPartData] = useState({ name: '', partId: '', quantity: 0, threshold: 0 });
  const [machineData, setMachineData] = useState({ name: '', serialNumber: '', class: 'Skill' as const, condition: 'New' as const });

  const handlePartIntake = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPart({ ...partData, warehouseId: intakeWarehouseId });
    alert('Part successfully registered to inventory.');
    setIntakeView('selection');
    setPartData({ name: '', partId: '', quantity: 0, threshold: 0 });
  };

  const handleMachineIntake = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMachine({ ...machineData, warehouseId: intakeWarehouseId });
    alert('Machine asset registered successfully.');
    setIntakeView('selection');
    setMachineData({ name: '', serialNumber: '', class: 'Skill', condition: 'New' });
  };

  const renderInventory = () => {
    if (selectedWarehouse) {
      return (
        <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-right duration-300">
          <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-100 sticky top-0 z-20">
            <button 
              onClick={() => setSelectedWarehouseId(null)}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-wider mb-4 border border-emerald-100 active:scale-95 transition-all"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <h1 className="text-lg font-black text-[#0f172a] leading-tight">{selectedWarehouse.name}</h1>
            <p className="text-[9px] text-[#64748b] font-bold uppercase tracking-widest mt-0.5">{selectedWarehouse.location}</p>
          </header>

          <div className="bg-white px-5 py-0 border-b border-slate-100 flex gap-6">
            <button 
              onClick={() => setActiveInventoryTab('parts')}
              className={`py-3 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${activeInventoryTab === 'parts' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'}`}
            >
              Inventory ({warehouseParts.length})
            </button>
            <button 
              onClick={() => setActiveInventoryTab('machines')}
              className={`py-3 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${activeInventoryTab === 'machines' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'}`}
            >
              Machines ({warehouseMachines.length})
            </button>
          </div>

          <main className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {activeInventoryTab === 'parts' ? (
              warehouseParts.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#0f172a] text-sm">{p.name}</h3>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">SKU: {p.partId}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-[#0f172a]">{p.quantity}</span>
                    <span className="text-[8px] font-black ml-1 text-slate-400 uppercase">PCS</span>
                  </div>
                </div>
              ))
            ) : (
              warehouseMachines.map(m => (
                <div key={m.id} className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-[#0f172a] text-sm">{m.name}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{m.class} • SN: {m.serialNumber}</p>
                </div>
              ))
            )}
          </main>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-right duration-500">
        <header className="px-5 pt-12 pb-4 bg-white flex items-center justify-between sticky top-0 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#009e60] rounded-full flex items-center justify-center text-white font-black text-base shadow-lg shadow-emerald-100 border-2 border-white">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-[9px] text-[#009e60] font-black uppercase tracking-widest leading-none mb-0.5">{user.role}</p>
              <p className="text-[11px] text-[#0f172a] font-bold leading-none">{user.name}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-white text-[#475569] px-3.5 py-1.5 rounded-full font-black text-[9px] uppercase tracking-wider shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-slate-100 active:scale-95 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Logout
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Facilities</h2>
            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider mt-0.5">Assigned Locations ({assignedWarehouses.length})</p>
          </div>
          <div className="space-y-4">
            {assignedWarehouses.map(w => (
              <div 
                key={w.id} 
                onClick={() => setSelectedWarehouseId(w.id)}
                className="bg-white rounded-[28px] shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-[#f1f5f9] flex items-center gap-4 p-4 active:scale-[0.98] transition-all group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#009e60]" />
                <div className="w-12 h-12 rounded-2xl bg-[#f0fdf4] flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-[#009e60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#0f172a] text-base leading-tight">{w.name}</h3>
                  <p className="text-[10px] text-[#94a3b8] font-semibold mt-0.5">{w.location}</p>
                  <div className="mt-1.5 flex">
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest text-[#009e60] bg-[#f0fdf4] border border-emerald-100">ACTIVE</span>
                  </div>
                </div>
                <div className="text-[#cbd5e1] group-hover:text-[#009e60] transition-colors shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  };

  const renderIntake = () => {
    if (intakeView === 'selection') {
      return (
        <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-right duration-300">
          <header className="px-5 pt-12 pb-6 bg-white sticky top-0 z-20">
            <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Inventory Intake</h2>
            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider mt-0.5">Register new arrivals</p>
          </header>
          
          <main className="flex-1 px-5 py-6 space-y-6">
            <button 
              onClick={() => setIntakeView('part-form')}
              className="w-full bg-white p-6 rounded-[32px] shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-[#f1f5f9] flex items-center gap-5 active:scale-[0.98] transition-all"
            >
              <div className="w-16 h-16 rounded-[22px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-black text-[#0f172a] text-lg">Parts Intake</h3>
                <p className="text-[11px] text-[#64748b] font-bold uppercase tracking-wide mt-0.5">Add hardware & spares</p>
              </div>
            </button>

            <button 
              onClick={() => setIntakeView('machine-form')}
              className="w-full bg-white p-6 rounded-[32px] shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-[#f1f5f9] flex items-center gap-5 active:scale-[0.98] transition-all"
            >
              <div className="w-16 h-16 rounded-[22px] bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-black text-[#0f172a] text-lg">Machine Intake</h3>
                <p className="text-[11px] text-[#64748b] font-bold uppercase tracking-wide mt-0.5">Add gaming or ATM assets</p>
              </div>
            </button>
          </main>
        </div>
      );
    }

    if (intakeView === 'part-form') {
      return (
        <div className="h-full flex flex-col bg-white animate-in slide-in-from-right duration-300">
          <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-50 sticky top-0 z-20">
            <button 
              onClick={() => setIntakeView('selection')}
              className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-3"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <h2 className="text-xl font-black text-[#0f172a]">New Parts Intake</h2>
          </header>
          <form onSubmit={handlePartIntake} className="flex-1 overflow-y-auto px-5 py-6 space-y-5 pb-12">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest pl-1">Target Facility</label>
              <select 
                value={intakeWarehouseId} 
                onChange={e => setIntakeWarehouseId(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {assignedWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest pl-1">Part Common Name</label>
              <input type="text" required value={partData.name} onChange={e => setPartData({...partData, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest pl-1">Part ID / SKU</label>
              <input type="text" required value={partData.partId} onChange={e => setPartData({...partData, partId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest pl-1">Initial Qty</label>
                <input type="number" required value={partData.quantity} onChange={e => setPartData({...partData, quantity: parseInt(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest pl-1">Low Alert</label>
                <input type="number" required value={partData.threshold} onChange={e => setPartData({...partData, threshold: parseInt(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
            <button type="submit" className="w-full bg-[#009e60] text-white py-5 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 mt-4 active:scale-95 transition-all">
              Add to Inventory
            </button>
          </form>
        </div>
      );
    }

    if (intakeView === 'machine-form') {
      return (
        <div className="h-full flex flex-col bg-white animate-in slide-in-from-right duration-300">
          <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-50 sticky top-0 z-20">
            <button 
              onClick={() => setIntakeView('selection')}
              className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-3"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <h2 className="text-xl font-black text-[#0f172a]">Machine Asset Intake</h2>
          </header>
          <form onSubmit={handleMachineIntake} className="flex-1 overflow-y-auto px-5 py-6 space-y-5 pb-12">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest pl-1">Assigned Facility</label>
              <select 
                value={intakeWarehouseId} 
                onChange={e => setIntakeWarehouseId(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {assignedWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest pl-1">Model Name</label>
              <input type="text" required value={machineData.name} onChange={e => setMachineData({...machineData, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest pl-1">Serial Number</label>
              <input type="text" required value={machineData.serialNumber} onChange={e => setMachineData({...machineData, serialNumber: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest pl-1">Asset Class</label>
                <select value={machineData.class} onChange={e => setMachineData({...machineData, class: e.target.value as any})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="Skill">Skill Game</option>
                  <option value="ATM">ATM Terminal</option>
                  <option value="Jukebox">Jukebox</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest pl-1">Condition</label>
                <select value={machineData.condition} onChange={e => setMachineData({...machineData, condition: e.target.value as any})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 mt-4 active:scale-95 transition-all">
              Register Machine
            </button>
          </form>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-full flex flex-col bg-[#fcfdfe]">
      <div className="flex-1 relative overflow-hidden">
        {activeMainTab === 'inventory' && renderInventory()}
        {activeMainTab === 'intake' && renderIntake()}
        {activeMainTab === 'profile' && (
          <div className="h-full flex items-center justify-center p-8 text-center bg-white">
            <div>
              <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl text-slate-400 font-bold border-4 border-white shadow-lg">
                {user.name.charAt(0)}
              </div>
              <h3 className="text-xl font-black text-slate-800">{user.name}</h3>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">{user.role}</p>
              <div className="p-4 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                System Access Profile
              </div>
            </div>
          </div>
        )}
        {activeMainTab === 'settings' && (
          <div className="h-full flex items-center justify-center p-8 text-center bg-white">
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Configuration Settings Locked</p>
          </div>
        )}
      </div>

      <nav className="px-8 py-4 bg-white border-t border-[#f1f5f9] flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.03)] shrink-0 pb-7 z-30">
        <button 
          onClick={() => setActiveMainTab('inventory')}
          className={`flex flex-col items-center gap-1 transition-all ${activeMainTab === 'inventory' ? 'text-[#009e60]' : 'text-[#94a3b8]'}`}
        >
          <svg className="w-5 h-5" fill={activeMainTab === 'inventory' ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-[7px] font-black uppercase tracking-tighter">Facilities</span>
        </button>
        
        <button 
          onClick={() => {
            setActiveMainTab('intake');
            setIntakeView('selection');
          }}
          className={`flex flex-col items-center gap-1 transition-all ${activeMainTab === 'intake' ? 'text-[#009e60]' : 'text-[#94a3b8]'}`}
        >
          <svg className="w-5 h-5" fill={activeMainTab === 'intake' ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[7px] font-black uppercase tracking-tighter">Intake</span>
        </button>

        <button 
          onClick={() => setActiveMainTab('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${activeMainTab === 'profile' ? 'text-[#009e60]' : 'text-[#94a3b8]'}`}
        >
          <svg className="w-5 h-5" fill={activeMainTab === 'profile' ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[7px] font-black uppercase tracking-tighter">Profile</span>
        </button>

        <button 
          onClick={() => setActiveMainTab('settings')}
          className={`flex flex-col items-center gap-1 transition-all ${activeMainTab === 'settings' ? 'text-[#009e60]' : 'text-[#94a3b8]'}`}
        >
          <svg className="w-5 h-5" fill={activeMainTab === 'settings' ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          <span className="text-[7px] font-black uppercase tracking-tighter">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default MobileDashboard;
