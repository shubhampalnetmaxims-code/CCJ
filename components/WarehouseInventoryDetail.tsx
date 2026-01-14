
import React, { useState } from 'react';
import { Warehouse, Part, Machine } from '../types';

interface Props {
  warehouse: Warehouse;
  parts: Part[];
  machines: Machine[];
  onAddPart: (p: Omit<Part, 'id'>) => void;
  onUpdatePart: (p: Part) => void;
  onDeletePart: (id: string) => void;
  onAddMachine: (m: Omit<Machine, 'id'>) => void;
  onUpdateMachine: (m: Machine) => void;
  onDeleteMachine: (id: string) => void;
  onBack: () => void;
}

const WarehouseInventoryDetail: React.FC<Props> = ({
  warehouse,
  parts,
  machines,
  onAddPart,
  onUpdatePart,
  onDeletePart,
  onAddMachine,
  onUpdateMachine,
  onDeleteMachine,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'parts' | 'machines'>('parts');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [partData, setPartData] = useState<Omit<Part, 'id' | 'warehouseId'>>({ name: '', partId: '', quantity: 0, threshold: 0 });
  const [machineData, setMachineData] = useState<Omit<Machine, 'id' | 'warehouseId'>>({ 
    name: '', serialNumber: '', class: 'Skill', condition: 'New' 
  });

  const handleOpenForm = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      if (activeTab === 'parts') setPartData({ name: item.name, partId: item.partId, quantity: item.quantity, threshold: item.threshold ?? 0 });
      else setMachineData({ name: item.name, serialNumber: item.serialNumber, class: item.class, condition: item.condition });
    } else {
      setEditingItem(null);
      setPartData({ name: '', partId: '', quantity: 0, threshold: 0 });
      setMachineData({ name: '', serialNumber: '', class: 'Skill', condition: 'New' });
    }
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'parts') {
      if (editingItem) onUpdatePart({ ...editingItem, ...partData });
      else onAddPart({ ...partData, warehouseId: warehouse.id });
    } else {
      if (editingItem) onUpdateMachine({ ...editingItem, ...machineData });
      else onAddMachine({ ...machineData, warehouseId: warehouse.id });
    }
    setIsFormOpen(false);
  };

  const handleExcelSim = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv, .xlsx';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        alert(`Simulating bulk upload for "${file.name}"... Parsing rows into inventory.`);
        onAddPart({ name: 'Imported Bearing X', partId: 'IMP-900', quantity: 100, threshold: 10, warehouseId: warehouse.id });
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-indigo-600 font-bold text-sm mb-4 hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Network
          </button>
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-black text-gray-900 tracking-tight">{warehouse.name}</h1>
             <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
               warehouse.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
             }`}>{warehouse.status}</span>
          </div>
          <p className="text-gray-500 font-medium">{warehouse.location}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExcelSim}
            className="bg-white border border-gray-200 text-gray-600 px-5 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Bulk Upload
          </button>
          <button
            onClick={() => handleOpenForm()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add {activeTab === 'parts' ? 'Part' : 'Machine'}
          </button>
        </div>
      </div>

      {/* Segmented Controller */}
      <div className="bg-gray-100 p-1.5 rounded-3xl inline-flex gap-1 shadow-inner">
        <button
          onClick={() => setActiveTab('parts')}
          className={`px-8 py-3 rounded-[20px] font-black text-sm transition-all ${activeTab === 'parts' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Part Inventory
        </button>
        <button
          onClick={() => setActiveTab('machines')}
          className={`px-8 py-3 rounded-[20px] font-black text-sm transition-all ${activeTab === 'machines' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Machine Inventory
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {activeTab === 'parts' ? (
          <div className="overflow-x-auto p-2">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Part Identity</th>
                  <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Part Code</th>
                  <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">In Stock</th>
                  <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Threshold</th>
                  <th className="px-8 py-6 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {parts.map(p => {
                  const isLow = p.threshold !== undefined && p.quantity <= p.threshold;
                  return (
                    <tr key={p.id} className={`transition-colors ${isLow ? 'bg-amber-50/40 hover:bg-amber-50/60' : 'hover:bg-indigo-50/30'}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{p.name}</span>
                          {isLow && (
                             <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded-md animate-pulse">Low Stock</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-sm text-indigo-600 font-bold bg-indigo-50/30 rounded-lg">{p.partId}</td>
                      <td className="px-8 py-5">
                        <span className={`font-black ${isLow ? 'text-amber-600' : 'text-gray-600'}`}>{p.quantity} Units</span>
                      </td>
                      <td className="px-8 py-5 text-gray-400 font-bold text-sm">{p.threshold ?? 0}</td>
                      <td className="px-8 py-5 text-right space-x-4">
                        <button onClick={() => handleOpenForm(p)} className="text-gray-400 hover:text-indigo-600 font-bold">Edit</button>
                        <button onClick={() => onDeletePart(p.id)} className="text-gray-400 hover:text-red-500 font-bold transition-colors">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
            {machines.map(m => (
              <div key={m.id} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 group hover:border-indigo-200 transition-all hover:shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${m.condition === 'New' ? 'bg-green-100 text-green-600' : m.condition === 'Damaged' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {m.class === 'ATM' ? (
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      ) : m.class === 'Jukebox' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      )}
                    </svg>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{m.class} Class</span>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${m.condition === 'New' ? 'text-green-600' : 'text-orange-600'}`}>{m.condition}</p>
                  </div>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1">{m.name}</h3>
                <p className="text-xs text-gray-400 font-bold mb-6">SN: <span className="text-indigo-600">{m.serialNumber}</span></p>
                
                <div className="flex gap-2">
                  <button onClick={() => handleOpenForm(m)} className="flex-1 py-3 bg-white border border-gray-100 rounded-xl font-bold text-sm text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-all">Edit</button>
                  <button onClick={() => onDeleteMachine(m.id)} className="flex-1 py-3 bg-white border border-gray-100 rounded-xl font-bold text-sm text-gray-400 hover:text-red-500 transition-all">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asset Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <form 
            onSubmit={handleSave}
            className="relative bg-white w-full max-w-xl rounded-[48px] p-10 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <h2 className="text-2xl font-black text-gray-900 mb-8">{editingItem ? 'Edit' : 'Register New'} {activeTab === 'parts' ? 'Part' : 'Machine'}</h2>
            
            <div className="space-y-6">
              {activeTab === 'parts' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Part Common Name</label>
                    <input type="text" required value={partData.name} onChange={e => setPartData({...partData, name: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Part ID / SKU</label>
                      <input type="text" required value={partData.partId} onChange={e => setPartData({...partData, partId: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Quantity</label>
                      <input type="number" required value={partData.quantity} onChange={e => setPartData({...partData, quantity: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Minimum Threshold</label>
                    <input type="number" required value={partData.threshold} onChange={e => setPartData({...partData, threshold: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold" />
                    <p className="text-[10px] text-gray-400 mt-1 pl-1 italic">Triggers visual alerts when stock falls to or below this level.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Machine Model Name</label>
                    <input type="text" required value={machineData.name} onChange={e => setMachineData({...machineData, name: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Serial Number</label>
                    <input type="text" required value={machineData.serialNumber} onChange={e => setMachineData({...machineData, serialNumber: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Asset Class</label>
                      <select value={machineData.class} onChange={e => setMachineData({...machineData, class: e.target.value as any})} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold">
                        <option value="Skill">Skill Game</option>
                        <option value="ATM">ATM Terminal</option>
                        <option value="Jukebox">Jukebox</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Condition</label>
                      <select value={machineData.condition} onChange={e => setMachineData({...machineData, condition: e.target.value as any})} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold">
                        <option value="New">New / Mint</option>
                        <option value="Used">Used / Functional</option>
                        <option value="Damaged">Requires Repair</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4 mt-10">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)} 
                className="flex-1 py-5 border border-gray-200 rounded-3xl font-black text-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <button type="submit" className="flex-2 bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]">
                {editingItem ? 'Save Updates' : 'Confirm Registration'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WarehouseInventoryDetail;
