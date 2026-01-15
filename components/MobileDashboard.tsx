
import React, { useState, useMemo } from 'react';
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
  const isInventoryManager = user.role === 'Inventory Manager';
  const isInstaller = user.role === 'Installer';
  
  const [activeMainTab, setActiveMainTab] = useState<'inventory' | 'intake' | 'outward' | 'global' | 'profile'>('inventory');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [activeInventoryTab, setActiveInventoryTab] = useState<'parts' | 'machines'>('parts');
  const [selectedMachineHistory, setSelectedMachineHistory] = useState<Machine | null>(null);
  const [selectedPartHistory, setSelectedPartHistory] = useState<Part | null>(null);
  const [editingThreshold, setEditingThreshold] = useState<{ id: string, value: number } | null>(null);

  // Intake Flow States
  const [intakeStep, setIntakeStep] = useState<'warehouse' | 'type' | 'subtype' | 'form' | 'success'>('warehouse');
  const [intakeWarehouseId, setIntakeWarehouseId] = useState<string | null>(null);
  const [intakeType, setIntakeType] = useState<'machine' | 'part' | null>(null);
  const [machineSubtype, setMachineSubtype] = useState<'Intake' | 'Return' | null>(null);

  // Outward Sub-view State
  const [outwardSubView, setOutwardSubView] = useState<'selection' | 'dispatch' | 'transfer' | 'request'>('selection');

  const [intakeMachineData, setIntakeMachineData] = useState<Omit<Machine, 'id' | 'warehouseId'>>({
    name: '', serialNumber: '', class: 'Skill', condition: 'New', notes: '',
    inspected: false, serialReadable: false, bootsToMenu: false, photosTaken: false, storedCorrectly: false,
    serialMatch: false, stockAdjusted: false, returnStatus: 'Re-deploy'
  });
  const [intakePartData, setIntakePartData] = useState<Omit<Part, 'id' | 'warehouseId'>>({
    name: '', partId: '', quantity: 0, notes: '',
    barcodesScanned: false, countVerified: false, damageLogged: false, locationCorrect: 'Main Aisle', countUpdated: false
  });

  const assignedWarehouses = warehouses.filter(w => 
    user.assignedWarehouseIds?.includes(w.id)
  );

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);
  const warehouseParts = parts.filter(p => p.warehouseId === selectedWarehouseId);
  const warehouseMachines = machines.filter(m => m.warehouseId === selectedWarehouseId);

  // Global Filter States
  const [globalSearch, setGlobalSearch] = useState('');

  const filteredGlobalParts = useMemo(() => {
    return parts.filter(p => 
      p.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
      p.partId.toLowerCase().includes(globalSearch.toLowerCase())
    );
  }, [parts, globalSearch]);

  const filteredGlobalMachines = useMemo(() => {
    return machines.filter(m => 
      m.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
      m.serialNumber.toLowerCase().includes(globalSearch.toLowerCase())
    );
  }, [machines, globalSearch]);

  const handleThresholdSave = (part: Part) => {
    if (editingThreshold) {
      onUpdatePart({ ...part, threshold: editingThreshold.value });
      setEditingThreshold(null);
    }
  };

  const handleCompleteIntake = () => {
    if (!intakeWarehouseId || isInventoryManager || isInstaller) return;

    if (intakeType === 'machine') {
      onAddMachine({
        ...intakeMachineData,
        intakeType: machineSubtype!,
        warehouseId: intakeWarehouseId,
        intakeBy: user.name,
        intakeDate: new Date().toISOString()
      });
    } else {
      onAddPart({
        ...intakePartData,
        warehouseId: intakeWarehouseId,
        intakeBy: user.name,
        intakeDate: new Date().toISOString()
      });
    }
    setIntakeStep('success');
  };

  const resetIntake = () => {
    setIntakeStep('warehouse');
    setIntakeWarehouseId(null);
    setIntakeType(null);
    setMachineSubtype(null);
    setIntakeMachineData({
      name: '', serialNumber: '', class: 'Skill', condition: 'New', notes: '',
      inspected: false, serialReadable: false, bootsToMenu: false, photosTaken: false, storedCorrectly: false,
      serialMatch: false, stockAdjusted: false, returnStatus: 'Re-deploy'
    });
    setIntakePartData({ 
      name: '', partId: '', quantity: 0, notes: '',
      barcodesScanned: false, countVerified: false, damageLogged: false, locationCorrect: 'Main Aisle', countUpdated: false
    });
  };

  // Helper for Installer Under Development screen
  const renderInstallerPlaceholder = (title: string, subtitle: string) => (
    <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-bottom duration-500">
      <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-100 sticky top-0 z-20">
        <h2 className="text-xl font-black text-[#0f172a] tracking-tight uppercase">{title}</h2>
        <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mt-0.5">{subtitle}</p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-32">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Portal Under Design</h3>
        <p className="text-sm text-slate-400 font-medium mt-2 leading-relaxed">
          The Installer-specific task management module is currently under development.
        </p>
        <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Awaiting Beta release</span>
        </div>
      </main>
    </div>
  );

  const renderOutward = () => {
    if (isInstaller) return renderInstallerPlaceholder("Installer Tasks", "Field Deployment");
    
    if (outwardSubView !== 'selection') {
      return (
        <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-right duration-300">
           <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-100 sticky top-0 z-20">
              <button onClick={() => setOutwardSubView('selection')} className="text-indigo-600 font-black text-[10px] uppercase mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg> Back to Selection
              </button>
              <h2 className="text-xl font-black text-[#0f172a] tracking-tight uppercase">{outwardSubView} Pending</h2>
          </header>
          <main className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-32">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">System Updating</h3>
            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest leading-relaxed">
              Sub-module under development
            </p>
          </main>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-bottom duration-500">
        <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-100 sticky top-0 z-20">
          <h2 className="text-xl font-black text-[#0f172a] tracking-tight uppercase">Outward Shipment</h2>
          <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-0.5">Logistics & Release</p>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-6 space-y-4 pb-32">
          <div className="mb-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Operational Type</h3>
          </div>

          {/* Option 1: Dispatch */}
          <button 
            onClick={() => setOutwardSubView('dispatch')}
            className="w-full bg-white border-2 border-slate-50 p-6 rounded-[32px] flex items-center gap-5 active:scale-95 transition-all shadow-sm group"
          >
            <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
               </svg>
            </div>
            <div className="text-left">
              <span className="block font-black text-sm uppercase tracking-tight text-slate-800">1. Dispatch</span>
              <span className="block text-[9px] font-bold text-indigo-500 uppercase mt-0.5">Handoff to Installer</span>
            </div>
            <div className="ml-auto text-slate-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </div>
          </button>

          {/* Option 2: Transfer */}
          <button 
            onClick={() => setOutwardSubView('transfer')}
            className="w-full bg-white border-2 border-slate-50 p-6 rounded-[32px] flex items-center gap-5 active:scale-95 transition-all shadow-sm group"
          >
            <div className="w-14 h-14 bg-emerald-500 rounded-[22px] flex items-center justify-center text-white shadow-lg shadow-emerald-100 group-hover:-rotate-6 transition-transform">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
               </svg>
            </div>
            <div className="text-left">
              <span className="block font-black text-sm uppercase tracking-tight text-slate-800">2. Transfer</span>
              <span className="block text-[9px] font-bold text-emerald-600 uppercase mt-0.5">Facility Move</span>
            </div>
            <div className="ml-auto text-slate-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </div>
          </button>

          {/* Option 3: Request */}
          <button 
            onClick={() => setOutwardSubView('request')}
            className="w-full bg-white border-2 border-slate-50 p-6 rounded-[32px] flex items-center gap-5 active:scale-95 transition-all shadow-sm group"
          >
            <div className="w-14 h-14 bg-amber-500 rounded-[22px] flex items-center justify-center text-white shadow-lg shadow-amber-100 group-hover:scale-110 transition-transform">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
            </div>
            <div className="text-left">
              <span className="block font-black text-sm uppercase tracking-tight text-slate-800">3. Request</span>
              <span className="block text-[9px] font-bold text-amber-600 uppercase mt-0.5">Stock Replenishment</span>
            </div>
            <div className="ml-auto text-slate-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </div>
          </button>

          <div className="mt-8 flex items-center gap-2 px-6 py-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none">Modules scheduled for release</span>
          </div>
        </main>
      </div>
    );
  };

  const renderIntake = () => {
    if (isInventoryManager || isInstaller) return renderInstallerPlaceholder("Inventory Intake", "Asset Log");
    
    return (
      <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-bottom duration-500">
        <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-100 sticky top-0 z-20">
          <h2 className="text-xl font-black text-[#0f172a] tracking-tight uppercase">Intake Operations</h2>
          <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">Asset Registration</p>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-6 pb-32">
          {intakeStep === 'warehouse' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-sm font-black text-[#0f172a] mb-4 pl-1 uppercase tracking-tight">1. Select Facility</h3>
              {assignedWarehouses.map(w => (
                <button
                  key={w.id}
                  onClick={() => { setIntakeWarehouseId(w.id); setIntakeStep('type'); }}
                  className="w-full bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all"
                >
                  <div className="text-left">
                    <p className="font-bold text-[#0f172a]">{w.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{w.location}</p>
                  </div>
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {intakeStep === 'type' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
              <button onClick={() => setIntakeStep('warehouse')} className="text-emerald-600 font-black text-[10px] uppercase mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg> Back
              </button>
              <h3 className="text-sm font-black text-[#0f172a] mb-4 pl-1 uppercase tracking-tight">2. Select Category</h3>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => { setIntakeType('machine'); setIntakeStep('subtype'); }}
                  className="bg-emerald-600 text-white p-6 rounded-[32px] shadow-xl shadow-emerald-100 flex flex-col items-center gap-3 active:scale-95 transition-all"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                  <span className="font-black text-xs uppercase tracking-widest">Machine Asset</span>
                </button>
                <button 
                  onClick={() => { setIntakeType('part'); setIntakeStep('form'); }}
                  className="bg-white text-slate-800 border-2 border-slate-100 p-6 rounded-[32px] shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all"
                >
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  <span className="font-black text-xs uppercase tracking-widest text-slate-500">Stock (Parts)</span>
                </button>
              </div>
            </div>
          )}

          {intakeStep === 'subtype' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
               <button onClick={() => setIntakeStep('type')} className="text-emerald-600 font-black text-[10px] uppercase mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg> Back
              </button>
              <h3 className="text-sm font-black text-[#0f172a] mb-4 pl-1 uppercase tracking-tight">3. Operation Type</h3>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => { setMachineSubtype('Intake'); setIntakeStep('form'); }}
                  className="bg-white border-2 border-slate-100 p-6 rounded-[32px] flex items-center justify-between active:scale-95 transition-all group"
                >
                  <div className="text-left">
                    <span className="block font-black text-xs uppercase tracking-widest text-slate-700">Machine Intake</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Registering New Assets</span>
                  </div>
                  <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  </div>
                </button>
                <button 
                  onClick={() => { setMachineSubtype('Return'); setIntakeStep('form'); }}
                  className="bg-white border-2 border-slate-100 p-6 rounded-[32px] flex items-center justify-between active:scale-95 transition-all"
                >
                  <div className="text-left">
                    <span className="block font-black text-xs uppercase tracking-widest text-slate-700">Machine Return</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Returning From Field</span>
                  </div>
                  <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                  </div>
                </button>
              </div>
            </div>
          )}

          {intakeStep === 'form' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300 pb-20">
              <button onClick={() => intakeType === 'machine' ? setIntakeStep('subtype') : setIntakeStep('type')} className="text-emerald-600 font-black text-[10px] uppercase mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg> Back
              </button>
              
              {intakeType === 'machine' ? (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Machine Model</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MegaSkill Pro"
                      className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                      value={intakeMachineData.name}
                      onChange={e => setIntakeMachineData({...intakeMachineData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Serial Number</label>
                    <input 
                      type="text" 
                      placeholder="Scan or Enter SN"
                      className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                      value={intakeMachineData.serialNumber}
                      onChange={e => setIntakeMachineData({...intakeMachineData, serialNumber: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Class</label>
                      <select 
                        className="w-full px-4 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-xs appearance-none"
                        value={intakeMachineData.class}
                        onChange={e => setIntakeMachineData({...intakeMachineData, class: e.target.value as any})}
                      >
                        <option value="Skill">Skill Game</option>
                        <option value="ATM">ATM</option>
                        <option value="Jukebox">Jukebox</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Condition</label>
                      <select 
                        className="w-full px-4 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-xs appearance-none"
                        value={intakeMachineData.condition}
                        onChange={e => setIntakeMachineData({...intakeMachineData, condition: e.target.value as any})}
                      >
                        <option value="New">New</option>
                        <option value="Used">Used</option>
                        <option value="Damaged">Damaged</option>
                      </select>
                    </div>
                  </div>

                  {machineSubtype === 'Return' && (
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mark New Status</label>
                        <select 
                          className="w-full px-4 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-xs appearance-none"
                          value={intakeMachineData.returnStatus}
                          onChange={e => setIntakeMachineData({...intakeMachineData, returnStatus: e.target.value as any})}
                        >
                          <option value="Re-deploy">Re-deploy</option>
                          <option value="Repair">Repair</option>
                          <option value="Retire">Retire</option>
                        </select>
                      </div>
                  )}

                  <div className="pt-4 space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      {machineSubtype === 'Intake' ? 'Intake Checklist' : 'Return Audit Checklist'}
                    </h4>
                    
                    {(machineSubtype === 'Intake' ? [
                      { label: "Physical Damage Inspection", key: "inspected" },
                      { label: "Serial Label Readability", key: "serialReadable" },
                      { label: "Successful Boot to Menu", key: "bootsToMenu" },
                      { label: "Verification Photos Taken", key: "photosTaken" },
                      { label: "Correct Storage Placement", key: "storedCorrectly" },
                    ] : [
                      { label: "Did machine match expected serial?", key: "serialMatch" },
                      { label: "Was it inspected for damage?", key: "inspected" },
                      { label: "Were photos taken to document return?", key: "photosTaken" },
                      { label: "Was warehouse stock level adjusted?", key: "stockAdjusted" },
                    ]).map(item => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setIntakeMachineData({
                          ...intakeMachineData, 
                          [item.key]: !intakeMachineData[item.key as keyof typeof intakeMachineData]
                        })}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          intakeMachineData[item.key as keyof typeof intakeMachineData]
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                            : 'bg-white border-slate-100 text-slate-400 font-medium'
                        }`}
                      >
                        <span className="text-xs">{item.label}</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          intakeMachineData[item.key as keyof typeof intakeMachineData] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                        }`}>
                          {intakeMachineData[item.key as keyof typeof intakeMachineData] && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Intake Notes / Description</label>
                    <textarea 
                      placeholder="Add any specific observations or details..."
                      rows={3}
                      className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm resize-none"
                      value={intakeMachineData.notes}
                      onChange={e => setIntakeMachineData({...intakeMachineData, notes: e.target.value})}
                    />
                  </div>

                  <button 
                    onClick={handleCompleteIntake}
                    className="w-full bg-emerald-600 text-white py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 mt-6 active:scale-95 transition-all"
                  >
                    Finish Registration
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                   <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Part Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Cash Cassette V3"
                      className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                      value={intakePartData.name}
                      onChange={e => setIntakePartData({...intakePartData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Part ID / SKU</label>
                    <input 
                      type="text" 
                      placeholder="Scan Part Code"
                      className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                      value={intakePartData.partId}
                      onChange={e => setIntakePartData({...intakePartData, partId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Quantity Added</label>
                    <input 
                      type="number" 
                      placeholder="Quantity"
                      className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                      value={intakePartData.quantity}
                      onChange={e => setIntakePartData({...intakePartData, quantity: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div className="pt-4 space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Compliance Checklist</h4>
                    {[
                      { label: "Part barcodes scanned and matched?", key: "barcodesScanned" },
                      { label: "Count verified against shipment?", key: "countVerified" },
                      { label: "Any damaged/missing items logged?", key: "damageLogged" },
                      { label: "Stock count updated in system?", key: "countUpdated" },
                    ].map(item => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setIntakePartData({
                          ...intakePartData, 
                          [item.key]: !intakePartData[item.key as keyof typeof intakePartData]
                        })}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          intakePartData[item.key as keyof typeof intakePartData]
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                            : 'bg-white border-slate-100 text-slate-400 font-medium'
                        }`}
                      >
                        <span className="text-xs">{item.label}</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          intakePartData[item.key as keyof typeof intakePartData] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                        }`}>
                          {intakePartData[item.key as keyof typeof intakePartData] && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                      </button>
                    ))}

                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Restock Location</label>
                      <select 
                        className="w-full px-4 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-xs appearance-none shadow-sm"
                        value={intakePartData.locationCorrect}
                        onChange={e => setIntakePartData({...intakePartData, locationCorrect: e.target.value})}
                      >
                        <option value="Main Aisle">Main Aisle</option>
                        <option value="Overflow Bin">Overflow Bin</option>
                        <option value="Secured Locker">Secured Locker</option>
                        <option value="Dispatch Rack">Dispatch Rack</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Stock Notes / Description</label>
                    <textarea 
                      placeholder="e.g. Received from Supplier X, minor box damage..."
                      rows={3}
                      className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm resize-none"
                      value={intakePartData.notes}
                      onChange={e => setIntakePartData({...intakePartData, notes: e.target.value})}
                    />
                  </div>
                  <button 
                    onClick={handleCompleteIntake}
                    className="w-full bg-emerald-600 text-white py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 mt-10 active:scale-95 transition-all"
                  >
                    Confirm Stock Update
                  </button>
                </div>
              )}
            </div>
          )}

          {intakeStep === 'success' && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-in zoom-in-95 duration-300 py-12">
               <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8 animate-bounce mx-auto">
                  <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
               </div>
               <h3 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">Record Established</h3>
               <p className="text-slate-500 text-sm font-medium mt-2">Inventory updated successfully.</p>
               <button 
                onClick={resetIntake}
                className="mt-12 w-full bg-slate-900 text-white py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
               >
                 Another Intake
               </button>
               <button 
                onClick={() => { resetIntake(); setActiveMainTab('inventory'); }}
                className="mt-4 text-emerald-600 font-black text-[10px] uppercase tracking-widest"
               >
                 Return to Facilities
               </button>
            </div>
          )}
        </main>
      </div>
    );
  };

  const renderInventory = () => {
    if (isInstaller) return renderInstallerPlaceholder("Inventory Viewer", "Global Stock");
    
    if (selectedWarehouse) {
      return (
        <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-right duration-300">
          <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-100 sticky top-0 z-20">
            <button 
              onClick={() => setSelectedWarehouseId(null)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-wider mb-4 border active:scale-95 transition-all ${
                isInventoryManager ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}
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
              className={`py-3 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${
                activeInventoryTab === 'parts' 
                ? (isInventoryManager ? 'border-indigo-500 text-indigo-600' : 'border-emerald-500 text-emerald-600') 
                : 'border-transparent text-slate-400'
              }`}
            >
              Parts ({warehouseParts.length})
            </button>
            <button 
              onClick={() => setActiveInventoryTab('machines')}
              className={`py-3 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${
                activeInventoryTab === 'machines' 
                ? (isInventoryManager ? 'border-indigo-500 text-indigo-600' : 'border-emerald-500 text-emerald-600') 
                : 'border-transparent text-slate-400'
              }`}
            >
              Machines ({warehouseMachines.length})
            </button>
          </div>

          <main className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-32">
            {activeInventoryTab === 'parts' ? (
              warehouseParts.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedPartHistory(p)}
                  className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div>
                    <h3 className="font-bold text-[#0f172a] text-sm">{p.name}</h3>
                    <p className={`text-[9px] font-bold uppercase tracking-tighter ${isInventoryManager ? 'text-indigo-500' : 'text-emerald-600'}`}>SKU: {p.partId}</p>
                    {isInventoryManager && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingThreshold({ id: p.id, value: p.threshold || 0 }); }}
                        className="mt-1 text-[8px] font-black text-indigo-500 uppercase tracking-widest underline decoration-indigo-200"
                      >
                        Set Alert: {p.threshold || 0}
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-[#0f172a]">{p.quantity}</span>
                    <span className="text-[8px] font-black ml-1 text-slate-400 uppercase">PCS</span>
                  </div>
                </div>
              ))
            ) : (
              warehouseMachines.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => setSelectedMachineHistory(m)}
                  className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#0f172a] text-sm">{m.name}</h3>
                        <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${
                          m.intakeType === 'Return' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {m.intakeType || 'Intake'}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{m.class} • SN: {m.serialNumber}</p>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      m.condition === 'New' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {m.condition}
                    </span>
                  </div>
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base shadow-lg border-2 border-white ${isInventoryManager ? 'bg-indigo-600 shadow-indigo-100' : 'bg-[#009e60] shadow-emerald-100'}`}>
              {user.name.charAt(0)}
            </div>
            <div>
              <p className={`text-[9px] font-black uppercase tracking-widest leading-none mb-0.5 ${isInventoryManager ? 'text-indigo-600' : 'text-[#009e60]'}`}>{user.role}</p>
              <p className="text-[11px] text-[#0f172a] font-bold leading-none">{user.name}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-white text-[#475569] px-3.5 py-1.5 rounded-full font-black text-[9px] uppercase tracking-wider shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-slate-100 active:scale-95 transition-all"
          >
            Logout
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-6 pb-24">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Facilities</h2>
            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider mt-0.5">Locations Assigned ({assignedWarehouses.length})</p>
          </div>
          <div className="space-y-4">
            {assignedWarehouses.map(w => (
              <div 
                key={w.id} 
                onClick={() => setSelectedWarehouseId(w.id)}
                className="bg-white rounded-[28px] shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-[#f1f5f9] flex items-center gap-4 p-4 active:scale-[0.98] transition-all group relative overflow-hidden cursor-pointer"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${isInventoryManager ? 'bg-indigo-600' : 'bg-[#009e60]'}`} />
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isInventoryManager ? 'bg-indigo-50 text-indigo-600' : 'bg-[#f0fdf4] text-[#009e60]'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#0f172a] text-base leading-tight">{w.name}</h3>
                  <p className="text-[10px] text-[#94a3b8] font-semibold mt-0.5">{w.location}</p>
                </div>
                <div className="text-[#cbd5e1] group-hover:text-indigo-600 transition-colors shrink-0">
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

  const renderGlobalStock = () => {
    return (
      <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-bottom duration-500">
        <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-100 sticky top-0 z-20">
          <h2 className="text-xl font-black text-[#0f172a] tracking-tight uppercase">Audit & Thresholds</h2>
          <div className="mt-3 relative">
            <input 
              type="text" 
              placeholder="Search all stock..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-5 space-y-6 pb-24">
          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Parts Registry</h3>
            {filteredGlobalParts.map(p => {
              const isLow = p.threshold !== undefined && p.quantity <= p.threshold;
              return (
                <div key={p.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between" onClick={() => setSelectedPartHistory(p)}>
                  <div>
                    <h4 className="font-bold text-[#0f172a] text-sm">{p.name}</h4>
                    <p className="text-[8px] text-slate-400 font-black uppercase">SKU: {p.partId} • {warehouses.find(w => w.id === p.warehouseId)?.name}</p>
                    {isInventoryManager && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingThreshold({ id: p.id, value: p.threshold || 0 }); }}
                        className="mt-1 text-[8px] font-black text-indigo-500 uppercase tracking-widest underline decoration-indigo-200"
                      >
                        Edit Threshold ({p.threshold || 0})
                      </button>
                    )}
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-sm font-black ${isLow ? 'text-red-500' : 'text-[#0f172a]'}`}>{p.quantity} Units</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Machine Audit</h3>
            {filteredGlobalMachines.map(m => (
              <div 
                key={m.id} 
                onClick={() => setSelectedMachineHistory(m)}
                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-95 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#0f172a] text-sm">{m.name}</h4>
                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${
                      m.intakeType === 'Return' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {m.intakeType || 'Intake'}
                    </span>
                  </div>
                  <p className="text-[8px] text-slate-400 font-black uppercase">SN: {m.serialNumber} • {m.class}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                    m.condition === 'New' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                  }`}>{m.condition}</span>
                  <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>
    );
  };

  const getNavColorClass = (tab: string) => {
    if (activeMainTab !== tab) return 'text-[#94a3b8]';
    if (isInstaller) return 'text-amber-500';
    if (isInventoryManager) return 'text-indigo-600';
    return 'text-[#009e60]';
  };

  const getProfileIconClass = () => {
    if (isInstaller) return 'bg-amber-500 shadow-amber-100';
    if (isInventoryManager) return 'bg-indigo-600 shadow-indigo-100';
    return 'bg-emerald-600 shadow-emerald-100';
  };

  return (
    <div className="h-full flex flex-col bg-[#fcfdfe]">
      <div className="flex-1 relative overflow-hidden">
        {activeMainTab === 'inventory' && renderInventory()}
        {activeMainTab === 'intake' && renderIntake()}
        {activeMainTab === 'outward' && renderOutward()}
        {activeMainTab === 'global' && isInventoryManager && renderGlobalStock()}
        {activeMainTab === 'profile' && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl text-white font-bold border-4 border-white shadow-xl mb-6 ${getProfileIconClass()}`}>
              {user.name.charAt(0)}
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{user.name}</h3>
            <p className={`text-xs font-black uppercase tracking-widest mt-1 ${isInstaller ? 'text-amber-600' : (isInventoryManager ? 'text-indigo-500' : 'text-emerald-600')}`}>{user.role}</p>
            <button 
              onClick={onLogout}
              className="mt-12 w-full max-w-[200px] py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-500 transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>

      <nav className="px-8 py-4 bg-white border-t border-[#f1f5f9] flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.03)] shrink-0 pb-7 z-30">
        <button 
          onClick={() => setActiveMainTab('inventory')}
          className={`flex flex-col items-center gap-1 transition-all ${getNavColorClass('inventory')}`}
        >
          <svg className="w-5 h-5" fill={activeMainTab === 'inventory' ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-[7px] font-black uppercase tracking-tighter">{isInstaller ? 'Global Stock' : 'Facilities'}</span>
        </button>
        
        {isInventoryManager ? (
          <button 
            onClick={() => setActiveMainTab('global')}
            className={`flex flex-col items-center gap-1 transition-all ${getNavColorClass('global')}`}
          >
            <svg className="w-5 h-5" fill={activeMainTab === 'global' ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-[7px] font-black uppercase tracking-tighter">Global</span>
          </button>
        ) : (
          <button 
            onClick={() => { setActiveMainTab('intake'); setIntakeStep('warehouse'); }}
            className={`flex flex-col items-center gap-1 transition-all ${getNavColorClass('intake')}`}
          >
            <svg className="w-5 h-5" fill={activeMainTab === 'intake' ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[7px] font-black uppercase tracking-tighter">{isInstaller ? 'Assigned' : 'Intake'}</span>
          </button>
        )}

        <button 
          onClick={() => { setActiveMainTab('outward'); setOutwardSubView('selection'); }}
          className={`flex flex-col items-center gap-1 transition-all ${getNavColorClass('outward')}`}
        >
          <svg className="w-5 h-5" fill={activeMainTab === 'outward' ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span className="text-[7px] font-black uppercase tracking-tighter">{isInstaller ? 'Tasks' : 'Outward'}</span>
        </button>

        <button 
          onClick={() => setActiveMainTab('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${getNavColorClass('profile')}`}
        >
          <svg className="w-5 h-5" fill={activeMainTab === 'profile' ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[7px] font-black uppercase tracking-tighter">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default MobileDashboard;
