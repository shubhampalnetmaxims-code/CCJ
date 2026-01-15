
import React, { useState, useMemo } from 'react';
import { Part, Machine, Warehouse, User } from '../types';

interface GlobalInventoryProps {
  parts: Part[];
  machines: Machine[];
  warehouses: Warehouse[];
  onUpdatePart: (p: Part) => void;
  onUpdateMachine: (m: Machine) => void;
  onAddPart: (p: Omit<Part, 'id'>) => void;
  onAddMachine: (m: Omit<Machine, 'id'>) => void;
  currentUser?: User;
}

const GlobalInventory: React.FC<GlobalInventoryProps> = ({ 
  parts, 
  machines, 
  warehouses, 
  onUpdatePart, 
  onUpdateMachine,
  onAddPart,
  onAddMachine,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'parts' | 'machines'>('parts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('All');
  const [selectedAuditItem, setSelectedAuditItem] = useState<{ type: 'part' | 'machine', item: any } | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkWarehouseId, setBulkWarehouseId] = useState('');
  const [bulkStep, setBulkStep] = useState<'warehouse' | 'upload'>('warehouse');

  const isAdmin = currentUser?.role === 'Site Administrator';

  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || 'Unknown';

  const filteredParts = useMemo(() => {
    return parts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.partId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWarehouse = selectedWarehouseId === 'All' || p.warehouseId === selectedWarehouseId;
      return matchesSearch && matchesWarehouse;
    });
  }, [parts, searchTerm, selectedWarehouseId]);

  const filteredMachines = useMemo(() => {
    return machines.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWarehouse = selectedWarehouseId === 'All' || m.warehouseId === selectedWarehouseId;
      return matchesSearch && matchesWarehouse;
    });
  }, [machines, searchTerm, selectedWarehouseId]);

  const handleDownloadTemplate = () => {
    if (!bulkWarehouseId) return;
    const headers = activeTab === 'parts' 
      ? "Part Name,Part SKU,Quantity" 
      : "Machine Model,Serial Number,Class(Skill/ATM/Jukebox),Condition(New/Used/Damaged)";
    
    const warehouse = warehouses.find(w => w.id === bulkWarehouseId);
    const filename = `Inventory_Template_${warehouse?.name}_${activeTab}.csv`;
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    setBulkStep('upload');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').slice(1); // Skip header

      lines.forEach(line => {
        const data = line.split(',').map(s => s.trim());
        if (activeTab === 'parts' && data.length >= 3) {
          onAddPart({
            warehouseId: bulkWarehouseId,
            name: data[0],
            partId: data[1],
            quantity: parseInt(data[2]) || 0,
            threshold: 5,
            notes: 'Bulk Excel Import',
            barcodesScanned: true,
            countVerified: true,
            damageLogged: false,
            locationCorrect: 'Bulk Rack',
            countUpdated: true,
            intakeBy: 'System Administrator',
            intakeDate: new Date().toISOString()
          });
        } else if (activeTab === 'machines' && data.length >= 2) {
          onAddMachine({
            warehouseId: bulkWarehouseId,
            name: data[0],
            serialNumber: data[1],
            class: (data[2] as any) || 'Skill',
            condition: (data[3] as any) || 'New',
            intakeType: 'Intake',
            notes: 'Bulk Excel Import',
            inspected: true,
            serialReadable: true,
            bootsToMenu: true,
            photosTaken: true,
            storedCorrectly: true,
            intakeBy: 'System Administrator',
            intakeDate: new Date().toISOString()
          });
        }
      });
      setIsBulkOpen(false);
      setBulkWarehouseId('');
      setBulkStep('warehouse');
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20 px-4 space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Global Inventory Dashboard</h1>
           <p className="text-gray-500 font-medium text-sm">System-wide asset oversight & bulk operations</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           {isAdmin && (
             <button 
                onClick={() => setIsBulkOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Bulk Operations
             </button>
           )}
           <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
             <button 
                onClick={() => setActiveTab('parts')}
                className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'parts' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-indigo-400'}`}
             >
                Parts Stock
             </button>
             <button 
                onClick={() => setActiveTab('machines')}
                className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'machines' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-indigo-400'}`}
             >
                Machine Audit
             </button>
           </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text" 
            placeholder={`Search all ${activeTab}...`}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
           <select
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm appearance-none cursor-pointer"
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
          >
            <option value="All">All Facilities</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Data Section */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
        {activeTab === 'parts' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50/30">
                <tr>
                  <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Part Identity</th>
                  <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Facility</th>
                  <th className="px-8 py-6 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">In Stock</th>
                  <th className="px-8 py-6 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Audit Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredParts.map(p => (
                  <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${p.intakeBy === 'System Administrator' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-transparent'}`} title={p.intakeBy === 'System Administrator' ? 'Admin Bulk Entry' : ''}></div>
                         <div>
                            <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-sm">{p.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono font-bold tracking-tighter uppercase">{p.partId}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span className="font-bold text-[11px] text-gray-500 uppercase tracking-tight">{getWarehouseName(p.warehouseId)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="font-black text-gray-900 text-sm">{p.quantity} <span className="text-[9px] text-gray-400">PCS</span></span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setSelectedAuditItem({ type: 'part', item: p })}
                        className="p-2.5 bg-gray-50 rounded-xl text-gray-300 hover:text-indigo-600 transition-all hover:bg-white border border-transparent hover:border-indigo-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50/30">
                <tr>
                  <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Model & Serial</th>
                  <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Facility</th>
                  <th className="px-8 py-6 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">Class</th>
                  <th className="px-8 py-6 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">Condition</th>
                  <th className="px-8 py-6 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Audit Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMachines.map(m => (
                  <tr key={m.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${m.intakeBy === 'System Administrator' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-transparent'}`} title={m.intakeBy === 'System Administrator' ? 'Admin Bulk Entry' : ''}></div>
                          <div>
                            <div className="flex items-center gap-2">
                               <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors text-sm">{m.name}</p>
                               <span className={`text-[7px] font-black uppercase px-1 py-0.5 rounded border ${m.intakeType === 'Return' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{m.intakeType || 'Intake'}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 font-mono font-bold tracking-tighter uppercase">SN: {m.serialNumber}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span className="font-bold text-[11px] text-gray-500 uppercase tracking-tight">{getWarehouseName(m.warehouseId)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className="px-2 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase">{m.class}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${m.condition === 'New' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{m.condition}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button 
                        onClick={() => setSelectedAuditItem({ type: 'machine', item: m })}
                        className="p-2.5 bg-gray-50 rounded-xl text-gray-300 hover:text-emerald-600 transition-all hover:bg-white border border-transparent hover:border-emerald-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Operations Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-md" onClick={() => { setIsBulkOpen(false); setBulkWarehouseId(''); setBulkStep('warehouse'); }} />
          <div className="relative bg-white w-full max-w-lg rounded-[48px] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Bulk {activeTab} Entry</h2>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Excel / CSV Workflow</p>
                </div>
             </div>

             {bulkStep === 'warehouse' ? (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                   <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">1. Select Target Facility</label>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                         {warehouses.map(w => (
                           <button 
                              key={w.id}
                              onClick={() => setBulkWarehouseId(w.id)}
                              className={`p-4 rounded-2xl border text-left transition-all ${bulkWarehouseId === w.id ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-black' : 'bg-white border-slate-100 text-slate-500 font-bold hover:bg-slate-50'}`}
                           >
                              <div className="flex justify-between items-center">
                                 <span className="text-sm">{w.name}</span>
                                 {bulkWarehouseId === w.id && <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                              </div>
                           </button>
                         ))}
                      </div>
                   </div>
                   <button 
                      disabled={!bulkWarehouseId}
                      onClick={() => setBulkStep('upload')}
                      className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 disabled:opacity-30 disabled:shadow-none transition-all active:scale-95"
                   >
                      Proceed to Data Entry
                   </button>
                </div>
             ) : (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                   <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                      <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">A</span>
                         Download Registry Template
                      </p>
                      <button 
                        onClick={handleDownloadTemplate}
                        className="w-full bg-white border-2 border-indigo-100 text-indigo-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-3"
                      >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                         Download {activeTab} CSV
                      </button>
                   </div>

                   <div className="bg-indigo-900 p-8 rounded-[32px] text-white shadow-2xl">
                      <p className="text-[11px] font-black text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <span className="w-5 h-5 rounded-full bg-white text-indigo-900 flex items-center justify-center text-[10px]">B</span>
                         Upload & Establish Records
                      </p>
                      <label className="relative block group cursor-pointer">
                         <div className="w-full py-8 border-2 border-dashed border-indigo-400 rounded-3xl flex flex-col items-center justify-center group-hover:border-white transition-all bg-indigo-800/50">
                            <svg className="w-10 h-10 text-indigo-300 group-hover:text-white mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 group-hover:text-white">Select Saved Excel/CSV</span>
                         </div>
                         <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                      </label>
                   </div>

                   <button 
                    onClick={() => setBulkStep('warehouse')}
                    className="w-full py-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
                   >
                     Change Target Facility
                   </button>
                </div>
             )}
          </div>
        </div>
      )}

      {/* Audit Modal (Existing) */}
      {selectedAuditItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedAuditItem(null)} />
          <div className="relative bg-white w-full max-w-xl rounded-[48px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">{selectedAuditItem.item.name}</h3>
                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded border ${
                    selectedAuditItem.type === 'machine' 
                      ? (selectedAuditItem.item.intakeType === 'Return' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100')
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    {selectedAuditItem.type === 'machine' ? (selectedAuditItem.item.intakeType || 'Intake') : 'Part Stock'} Audit History
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-black uppercase tracking-widest">
                  {selectedAuditItem.type === 'machine' ? `Serial: ${selectedAuditItem.item.serialNumber}` : `SKU: ${selectedAuditItem.item.partId}`}
                  <span className="mx-2 opacity-30">|</span>
                  {getWarehouseName(selectedAuditItem.item.warehouseId)}
                </p>
              </div>
              <button onClick={() => setSelectedAuditItem(null)} className="text-gray-300 hover:text-gray-900 transition-colors">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-6">
               {selectedAuditItem.item.notes && (
                  <div className="bg-amber-50 p-5 rounded-[32px] border border-amber-100">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5 pl-1">Intake Description / Notes</p>
                    <p className="text-sm font-bold text-slate-700 italic leading-relaxed">"{selectedAuditItem.item.notes}"</p>
                  </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-[28px] border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Logged By</p>
                     <p className="font-black text-indigo-900">{selectedAuditItem.item.intakeBy || 'System Admin'}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-[28px] border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Registry Date</p>
                     <p className="font-black text-indigo-900">{selectedAuditItem.item.intakeDate ? new Date(selectedAuditItem.item.intakeDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Historical Log'}</p>
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Compliance History Audit</p>
                  
                  {selectedAuditItem.item.intakeBy === 'System Administrator' ? (
                     <div className="bg-indigo-50 p-8 rounded-[32px] border border-indigo-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-4">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                       </div>
                       <h4 className="text-lg font-black text-indigo-900 uppercase tracking-tighter">System Pre-verified</h4>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">Administrator Bulk Entry Bypass</p>
                       <p className="text-xs text-indigo-600/70 font-medium mt-4 leading-relaxed max-w-xs">
                         This item was established via the System Administrator bulk registry. Detailed compliance checks were automatically fulfilled by authority.
                       </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5">
                      {selectedAuditItem.type === 'machine' ? (
                         (selectedAuditItem.item.intakeType === 'Return' ? [
                            { label: "Serial Match Check", key: "serialMatch" },
                            { label: "Damage Inspection", key: "inspected" },
                            { label: "Return Photos Taken", key: "photosTaken" },
                            { label: "Stock Adjusted in Registry", key: "stockAdjusted" },
                         ] : [
                            { label: "Visual Condition Inspection", key: "inspected" },
                            { label: "Serial Label Readability", key: "serialReadable" },
                            { label: "Menu Boot Verification", key: "bootsToMenu" },
                            { label: "Asset Photos Logged", key: "photosTaken" },
                            { label: "Correct Storage Zone Placement", key: "storedCorrectly" },
                         ]).map(item => (
                            <div key={item.key} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                               <span className="text-sm font-bold text-gray-600">{item.label}</span>
                               <div className="flex items-center gap-2">
                                 <span className={`text-[10px] font-black uppercase ${selectedAuditItem.item[item.key] ? 'text-emerald-600' : 'text-red-500'}`}>
                                   {selectedAuditItem.item[item.key] ? 'PASS' : 'FAIL'}
                                 </span>
                                 {selectedAuditItem.item[item.key] ? (
                                   <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                 ) : (
                                   <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                 )}
                               </div>
                            </div>
                         ))
                      ) : (
                         [
                            { label: "Part Barcodes Scanned", key: "barcodesScanned" },
                            { label: "Count Verified against Shipping Manifest", key: "countVerified" },
                            { label: "Arrival Damage Logged", key: "damageLogged" },
                            { label: "Stock Level Updated Globally", key: "countUpdated" },
                         ].map(item => (
                            <div key={item.key} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                               <span className="text-sm font-bold text-gray-600">{item.label}</span>
                               <div className="flex items-center gap-2">
                                 <span className={`text-[10px] font-black uppercase ${selectedAuditItem.item[item.key] ? 'text-indigo-600' : 'text-red-500'}`}>
                                   {selectedAuditItem.item[item.key] ? 'YES' : 'NO'}
                                 </span>
                                 {selectedAuditItem.item[item.key] ? (
                                   <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                 ) : (
                                   <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                 )}
                               </div>
                            </div>
                         ))
                      )}
                    </div>
                  )}
               </div>
            </div>
            
            <button 
              onClick={() => setSelectedAuditItem(null)} 
              className="w-full bg-gray-900 text-white py-5 rounded-[28px] font-black shadow-2xl mt-12 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs"
            >
              Exit Global Audit Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalInventory;
