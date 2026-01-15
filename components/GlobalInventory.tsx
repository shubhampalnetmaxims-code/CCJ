
import React, { useState, useMemo } from 'react';
import { Part, Machine, Warehouse } from '../types';

interface GlobalInventoryProps {
  parts: Part[];
  machines: Machine[];
  warehouses: Warehouse[];
  onUpdatePart: (p: Part) => void;
  onUpdateMachine: (m: Machine) => void;
}

const GlobalInventory: React.FC<GlobalInventoryProps> = ({ 
  parts, 
  machines, 
  warehouses, 
  onUpdatePart, 
  onUpdateMachine 
}) => {
  const [activeTab, setActiveTab] = useState<'parts' | 'machines'>('parts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('All');
  const [editingThreshold, setEditingThreshold] = useState<{id: string, value: number} | null>(null);
  const [selectedMachineHistory, setSelectedMachineHistory] = useState<Machine | null>(null);

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

  const handleThresholdSave = (part: Part) => {
    if (editingThreshold) {
      onUpdatePart({ ...part, threshold: editingThreshold.value });
      setEditingThreshold(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder={`Filter ${activeTab === 'parts' ? 'parts' : 'machines'} identity...`}
            className="w-full pl-6 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'parts' ? (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Part Identity</th>
                <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">In Stock</th>
                <th className="px-8 py-6 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredParts.map(p => (
                <tr key={p.id} className="hover:bg-indigo-50/10">
                  <td className="px-8 py-5">
                    <p className="font-bold text-gray-900">{p.name}</p>
                    <p className="text-[10px] text-indigo-500 font-mono font-bold">{p.partId}</p>
                  </td>
                  <td className="px-8 py-5 font-black">{p.quantity} Units</td>
                  <td className="px-8 py-5 text-right text-xs text-gray-400 italic max-w-xs truncate">{p.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Model & Identity</th>
                <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Facility</th>
                <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMachines.map(m => (
                <tr key={m.id} className="hover:bg-indigo-50/10 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{m.name}</p>
                       <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${
                         m.intakeType === 'Return' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                       }`}>
                         {m.intakeType || 'Intake'}
                       </span>
                    </div>
                    <p className="text-[10px] text-indigo-500 font-mono font-bold">SN: {m.serialNumber}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-gray-600">{getWarehouseName(m.warehouseId)}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${m.condition === 'New' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{m.condition}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => setSelectedMachineHistory(m)} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Audit Logs</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Enhanced Audit Modal for Global View */}
      {selectedMachineHistory && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-indigo-950/50 backdrop-blur-md" onClick={() => setSelectedMachineHistory(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-[48px] p-10 shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{selectedMachineHistory.name}</h3>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                    selectedMachineHistory.intakeType === 'Return' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>{selectedMachineHistory.intakeType || 'Intake'} Record</span>
                </div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">SN: {selectedMachineHistory.serialNumber}</p>
              </div>
            </div>

            <div className="space-y-6">
               {selectedMachineHistory.notes && (
                  <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100">
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Intake Description / Notes</p>
                    <p className="text-xs font-bold text-slate-700 italic leading-relaxed">"{selectedMachineHistory.notes}"</p>
                  </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Personnel</p>
                     <p className="font-bold text-indigo-900">{selectedMachineHistory.intakeBy || 'System'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date Logged</p>
                     <p className="font-bold text-indigo-900">{selectedMachineHistory.intakeDate ? new Date(selectedMachineHistory.intakeDate).toLocaleDateString() : 'Historical'}</p>
                  </div>
               </div>
            </div>
            
            <button onClick={() => setSelectedMachineHistory(null)} className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black shadow-xl mt-10 active:scale-95 transition-all uppercase tracking-widest text-xs">Exit Audit View</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalInventory;
