
import React, { useState, useMemo } from 'react';
import { Warehouse, Part, Machine, User } from '../types';

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
  readOnly?: boolean;
  currentUser?: User;
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
  readOnly = false,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'parts' | 'machines'>('parts');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalTab, setModalTab] = useState<'details' | 'history'>('details');

  const isAdmin = currentUser?.role === 'Site Administrator';

  // Filter States
  const [partSearch, setPartSearch] = useState('');
  const [machineSearch, setMachineSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState<string>('All');
  const [classFilter, setClassFilter] = useState<string>('All');

  // Filtering Logic
  const filteredParts = useMemo(() => {
    return parts.filter(p => 
      p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
      p.partId.toLowerCase().includes(partSearch.toLowerCase())
    );
  }, [parts, partSearch]);

  const filteredMachines = useMemo(() => {
    return machines.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(machineSearch.toLowerCase()) ||
                           m.serialNumber.toLowerCase().includes(machineSearch.toLowerCase());
      const matchesCondition = conditionFilter === 'All' || m.condition === conditionFilter;
      const matchesClass = classFilter === 'All' || m.class === classFilter;
      return matchesSearch && matchesCondition && matchesClass;
    });
  }, [machines, machineSearch, conditionFilter, classFilter]);

  const handleOpenForm = (item: any = null) => {
    setModalTab('details');
    if (item) {
      setEditingItem(item);
      if (activeTab === 'parts') setPartData({ 
        name: item.name, 
        partId: item.partId, 
        quantity: item.quantity, 
        threshold: item.threshold ?? 0, 
        notes: item.notes || '',
        barcodesScanned: item.barcodesScanned || false,
        countVerified: item.countVerified || false,
        damageLogged: item.damageLogged || false,
        locationCorrect: item.locationCorrect || 'Main Aisle',
        countUpdated: item.countUpdated || false,
        intakeBy: item.intakeBy || 'Administrator',
        intakeDate: item.intakeDate || new Date().toISOString()
      });
      else setMachineData({ 
        name: item.name, 
        serialNumber: item.serialNumber, 
        class: item.class, 
        condition: item.condition,
        notes: item.notes || '',
        intakeType: item.intakeType || 'Intake',
        inspected: item.inspected || false,
        serialReadable: item.serialReadable || false,
        bootsToMenu: item.bootsToMenu || false,
        photosTaken: item.photosTaken || false,
        storedCorrectly: item.storedCorrectly || false,
        serialMatch: item.serialMatch || false,
        stockAdjusted: item.stockAdjusted || false,
        returnStatus: item.returnStatus || 'Re-deploy',
        intakeBy: item.intakeBy || 'Administrator',
        intakeDate: item.intakeDate || item.createdAt || new Date().toISOString()
      });
    } else {
      if (readOnly) return;
      setEditingItem(null);
      setPartData({ 
        name: '', partId: '', quantity: 0, threshold: 0, notes: '',
        barcodesScanned: false, countVerified: false, damageLogged: false, locationCorrect: 'Main Aisle', countUpdated: false,
        intakeBy: currentUser?.name || 'Administrator', intakeDate: new Date().toISOString()
      });
      setMachineData({ 
        name: '', serialNumber: '', class: 'Skill', condition: 'New', notes: '',
        intakeType: 'Intake', inspected: false, serialReadable: false, bootsToMenu: false, photosTaken: false, storedCorrectly: false,
        serialMatch: false, stockAdjusted: false, returnStatus: 'Re-deploy',
        intakeBy: currentUser?.name || 'Administrator', intakeDate: new Date().toISOString()
      });
    }
    setIsFormOpen(true);
  };

  const [partData, setPartData] = useState<Omit<Part, 'id' | 'warehouseId'>>({ 
    name: '', partId: '', quantity: 0, threshold: 0, notes: '',
    barcodesScanned: false, countVerified: false, damageLogged: false, locationCorrect: 'Main Aisle', countUpdated: false,
    intakeBy: '', intakeDate: ''
  });
  
  const [machineData, setMachineData] = useState<Omit<Machine, 'id' | 'warehouseId'>>({ 
    name: '', serialNumber: '', class: 'Skill', condition: 'New', notes: '',
    inspected: false, serialReadable: false, bootsToMenu: false, photosTaken: false, storedCorrectly: false,
    serialMatch: false, stockAdjusted: false, returnStatus: 'Re-deploy',
    intakeBy: '', intakeDate: ''
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-indigo-600 font-bold text-sm mb-4 hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Warehouse Network
          </button>
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">{warehouse.name}</h1>
             <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
               warehouse.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
             }`}>{warehouse.status}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
            <button onClick={() => setActiveTab('parts')} className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'parts' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}>Parts Stock</button>
            <button onClick={() => setActiveTab('machines')} className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'machines' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}>Machines</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {activeTab === 'parts' ? (
          <div className="overflow-x-auto p-2">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Part Identity</th>
                  <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Part Code</th>
                  <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">In Stock</th>
                  <th className="px-8 py-6 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredParts.map(p => (
                  <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-900">{p.name}</div>
                      {p.notes && <div className="text-[10px] text-gray-400 italic truncate max-w-xs">{p.notes}</div>}
                    </td>
                    <td className="px-8 py-5 font-mono text-sm text-indigo-600 font-bold">{p.partId}</td>
                    <td className="px-8 py-5 font-black">{p.quantity} Units</td>
                    <td className="px-8 py-5 text-right space-x-4">
                      <button onClick={() => handleOpenForm(p)} className="text-gray-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest">View History</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMachines.map(m => (
              <div key={m.id} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 group hover:border-indigo-200 transition-all cursor-pointer" onClick={() => handleOpenForm(m)}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${
                      m.intakeType === 'Return' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {m.intakeType || 'Intake'}
                    </span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${m.condition === 'New' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{m.condition}</span>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1">{m.name}</h3>
                <p className="text-xs text-gray-400 font-bold mb-4">SN: {m.serialNumber}</p>
                {m.notes && <p className="text-[10px] text-slate-500 italic line-clamp-2 border-l-2 border-slate-200 pl-2 mb-4">"{m.notes}"</p>}
                <button onClick={(e) => { e.stopPropagation(); handleOpenForm(m); }} className="w-full py-2 bg-white border border-gray-100 rounded-xl font-bold text-[10px] uppercase tracking-widest text-indigo-600">View Audit Logs</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unified History/Audit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[40px] p-10 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
             <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{editingItem?.name || 'Asset Registry'}</h2>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border bg-indigo-50 text-indigo-600 border-indigo-100`}>
                      {activeTab === 'parts' ? 'Part Stock' : (machineData.intakeType || 'Intake')} Record
                    </span>
                  </div>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-2xl">
                  <button type="button" onClick={() => setModalTab('details')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${modalTab === 'details' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>General</button>
                  <button type="button" onClick={() => setModalTab('history')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${modalTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Audit History</button>
                </div>
             </div>

             {modalTab === 'details' ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Notes / Description</p>
                    <p className="text-sm font-medium text-gray-700 leading-relaxed italic">"{activeTab === 'parts' ? (partData.notes || 'No description provided.') : (machineData.notes || 'No description provided.')}"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Personnel</p>
                      <p className="text-sm font-bold text-slate-800">{activeTab === 'parts' ? partData.intakeBy : machineData.intakeBy}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Intake Date</p>
                      <p className="text-sm font-bold text-slate-800">{new Date(activeTab === 'parts' ? (partData.intakeDate || Date.now()) : (machineData.intakeDate || Date.now())).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
             ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 pl-1">Compliance Check Results</p>
                  
                  {((activeTab === 'parts' && partData.intakeBy === 'System Administrator') || (activeTab === 'machines' && machineData.intakeBy === 'System Administrator')) ? (
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
                    <div className="grid grid-cols-1 gap-2">
                      {activeTab === 'machines' ? (
                        (machineData.intakeType === 'Return' ? [
                            { label: "Serial Match Check", key: "serialMatch" },
                            { label: "Damage Inspection", key: "inspected" },
                            { label: "Return Photos", key: "photosTaken" },
                            { label: "Stock Adjusted", key: "stockAdjusted" },
                        ] : [
                            { label: "Visual Inspection", key: "inspected" },
                            { label: "Serial Readability", key: "serialReadable" },
                            { label: "Boot Test", key: "bootsToMenu" },
                            { label: "Photo Evidence", key: "photosTaken" },
                            { label: "Storage Zone", key: "storedCorrectly" },
                        ]).map(item => (
                            <div key={item.key} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-600">{item.label}</span>
                              <span className={`text-[10px] font-black uppercase ${machineData[item.key as keyof typeof machineData] ? 'text-emerald-600' : 'text-red-500'}`}>
                                {machineData[item.key as keyof typeof machineData] ? 'PASS' : 'FAIL'}
                              </span>
                            </div>
                        ))
                      ) : (
                        [
                            { label: "Part Barcodes Scanned", key: "barcodesScanned" },
                            { label: "Count Verified against Shipment", key: "countVerified" },
                            { label: "Damaged/Missing Items Logged", key: "damageLogged" },
                            { label: "Stock Count Updated in System", key: "countUpdated" },
                        ].map(item => (
                            <div key={item.key} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-600">{item.label}</span>
                              <span className={`text-[10px] font-black uppercase ${partData[item.key as keyof typeof partData] ? 'text-emerald-600' : 'text-red-500'}`}>
                                {partData[item.key as keyof typeof partData] ? 'YES' : 'NO'}
                              </span>
                            </div>
                        ))
                      )}
                      {activeTab === 'parts' && (
                          <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mt-2">
                            <span className="text-xs font-bold text-indigo-700 uppercase tracking-tighter">Verified Storage Location</span>
                            <span className="text-[10px] font-black uppercase text-indigo-700">{partData.locationCorrect || 'Unspecified'}</span>
                          </div>
                      )}
                    </div>
                  )}
                </div>
             )}

             <button type="button" onClick={() => setIsFormOpen(false)} className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black shadow-xl mt-10 active:scale-95 transition-all uppercase tracking-widest text-xs">Close Audit File</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseInventoryDetail;
