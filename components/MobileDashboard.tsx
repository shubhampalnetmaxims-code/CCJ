
import React, { useState, useMemo } from 'react';
import { User, Warehouse, Part, Machine, WorkOrder, StaffMember, WorkOrderStatus, Priority } from '../types';

interface MobileDashboardProps {
  user: User;
  warehouses: Warehouse[];
  parts: Part[];
  machines: Machine[];
  workOrders: WorkOrder[];
  staffMembers: StaffMember[];
  onUpdatePart: (p: Part) => void;
  onAddPart: (p: Omit<Part, 'id'>) => void;
  onAddMachine: (m: Omit<Machine, 'id'>) => void;
  onAddWorkOrder: (wo: Omit<WorkOrder, 'id' | 'createdAt'>) => void;
  onUpdateWorkOrder: (wo: WorkOrder) => void;
  onTransferPart?: (fromWH: string, toWH: string, partId: string, qty: number, notes: string) => void;
  onTransferMachine?: (toWH: string, machineId: string, notes: string) => void;
  onLogout: () => void;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ 
  user, warehouses, parts, machines, workOrders, staffMembers,
  onUpdatePart, onAddPart, onAddMachine, onAddWorkOrder, onUpdateWorkOrder,
  onTransferPart, onTransferMachine, onLogout 
}) => {
  const isInventoryManager = user.role === 'Inventory Manager';
  const isWarehouseManager = user.role === 'Warehouse Manager';
  const isInstaller = user.role === 'Installer';
  const isManager = isInventoryManager || isWarehouseManager;
  
  const [activeMainTab, setActiveMainTab] = useState<'inventory' | 'intake' | 'outward' | 'global' | 'workorder'>('inventory');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [activeInventoryTab, setActiveInventoryTab] = useState<'parts' | 'machines'>('parts');
  const [editingThreshold, setEditingThreshold] = useState<{ id: string, value: number } | null>(null);
  const [selectedAuditItem, setSelectedAuditItem] = useState<{ type: 'part' | 'machine', item: any } | null>(null);

  // Work Order States
  const [isCreatingWorkOrder, setIsCreatingWorkOrder] = useState(false);
  const [newWOTitle, setNewWOTitle] = useState('');
  const [newWODesc, setNewWODesc] = useState('');
  const [newWOPriority, setNewWOPriority] = useState<Priority>('Medium');
  const [newWOAssignedId, setNewWOAssignedId] = useState('');

  // Intake Flow States
  const [intakeStep, setIntakeStep] = useState<'warehouse' | 'type' | 'subtype' | 'form' | 'success'>('warehouse');
  const [intakeWarehouseId, setIntakeWarehouseId] = useState<string | null>(null);
  const [intakeType, setIntakeType] = useState<'machine' | 'part' | null>(null);
  const [machineSubtype, setMachineSubtype] = useState<'Intake' | 'Return' | null>(null);

  // Outward Sub-view State
  const [outwardSubView, setOutwardSubView] = useState<'selection' | 'dispatch' | 'transfer' | 'request' | 'success'>('selection');
  const [transferStep, setTransferStep] = useState<'workorder_link' | 'source' | 'category' | 'items' | 'quantities' | 'destination' | 'notes' | 'summary'>('workorder_link');
  const [outwardSearch, setOutwardSearch] = useState('');
  
  // Multi-Transfer Flow Data
  const [transferData, setTransferData] = useState({
    sourceWH: '',
    category: 'parts' as 'parts' | 'machines',
    selectedItems: new Map<string, number>(), // Map of ID -> Quantity
    destWH: '',
    notes: '',
    linkedWorkOrderId: ''
  });

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

  // Inventory Manager Outward Log Filter
  const movedAssets = useMemo(() => {
    const p = parts.filter(item => 
      item.notes?.includes('[TRANSFER') || item.notes?.includes('[DISPATCH')
    ).map(item => ({ ...item, type: 'part' as const }));
    
    const m = machines.filter(item => 
      item.notes?.includes('[TRANSFER') || item.notes?.includes('[LOCATION TRANSFER]') || item.notes?.includes('[DISPATCH')
    ).map(item => ({ ...item, type: 'machine' as const }));

    return [...p, ...m].filter(item => 
      item.name.toLowerCase().includes(outwardSearch.toLowerCase()) ||
      (item.type === 'part' ? (item as any).partId : (item as any).serialNumber).toLowerCase().includes(outwardSearch.toLowerCase())
    );
  }, [parts, machines, outwardSearch]);

  const handleCreateWO = () => {
    const facilityId = user.assignedWarehouseIds?.[0] || '1';
    onAddWorkOrder({
      title: newWOTitle,
      description: newWODesc,
      status: 'New',
      priority: newWOPriority,
      warehouseId: facilityId,
      assignedToId: newWOAssignedId || undefined,
      createdBy: user.name
    });
    setNewWOTitle('');
    setNewWODesc('');
    setNewWOAssignedId('');
    setIsCreatingWorkOrder(false);
  };

  const handleUpdateWOStatus = (wo: WorkOrder, newStatus: WorkOrderStatus) => {
    const updatedWO = { ...wo, status: newStatus };
    if (newStatus === 'Accepted' && isInstaller && !wo.assignedToId) {
      updatedWO.assignedToId = user.id;
    }
    onUpdateWorkOrder(updatedWO);
  };

  const handleAssignWO = (wo: WorkOrder, staffId: string) => {
    onUpdateWorkOrder({ ...wo, assignedToId: staffId || undefined });
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

  const handleSaveThreshold = () => {
    if (!editingThreshold) return;
    const partToUpdate = parts.find(p => p.id === editingThreshold.id);
    if (partToUpdate) {
      onUpdatePart({
        ...partToUpdate,
        threshold: editingThreshold.value
      });
    }
    setEditingThreshold(null);
  };

  const handleTransferSubmit = () => {
    const destWHName = warehouses.find(w => w.id === transferData.destWH)?.name || 'Target Facility';
    const actionLogs: string[] = [];

    transferData.selectedItems.forEach((qty, itemId) => {
      const itemObj = transferData.category === 'parts' 
        ? parts.find(p => p.id === itemId)
        : machines.find(m => m.id === itemId);
      
      const itemName = itemObj?.name || 'Asset';
      actionLogs.push(`Transfer of ${qty} ${transferData.category === 'parts' ? 'units of ' : ''}${itemName} to ${destWHName}`);

      if (transferData.category === 'parts') {
        onTransferPart?.(transferData.sourceWH, transferData.destWH, itemId, qty, transferData.notes);
      } else {
        onTransferMachine?.(transferData.destWH, itemId, transferData.notes);
      }
    });

    if (transferData.linkedWorkOrderId) {
      const wo = workOrders.find(w => w.id === transferData.linkedWorkOrderId);
      if (wo) {
        const timestamp = new Date().toLocaleString();
        const nextHistory = [...(wo.history || []), ...actionLogs.map(log => `[${timestamp}] ${log}`)];
        onUpdateWorkOrder({ ...wo, history: nextHistory });
      }
    }

    setOutwardSubView('success');
  };

  const toggleTransferItem = (id: string) => {
    const next = new Map(transferData.selectedItems);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.set(id, 1);
    }
    setTransferData({ ...transferData, selectedItems: next });
  };

  const updateTransferQty = (id: string, qty: number) => {
    const next = new Map(transferData.selectedItems);
    next.set(id, qty);
    setTransferData({ ...transferData, selectedItems: next });
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

  const resetTransfer = () => {
    setOutwardSubView('selection');
    setTransferStep('workorder_link');
    setTransferData({ sourceWH: '', category: 'parts', selectedItems: new Map(), destWH: '', notes: '', linkedWorkOrderId: '' });
  };

  const renderHistoryModal = () => {
    if (!selectedAuditItem) return null;
    const { item, type } = selectedAuditItem;
    return (
      <div className="fixed inset-0 z-[140] flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
        <header className="px-5 pt-12 pb-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-black text-[#0f172a] tracking-tight uppercase truncate max-w-[200px]">{item.name}</h2>
            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-0.5">Audit Registry</p>
          </div>
          <button onClick={() => setSelectedAuditItem(null)} className="p-2 text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <main className="flex-1 overflow-y-auto px-5 py-6 space-y-6 pb-24">
          <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-4">
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Identity</p>
                <p className="text-sm font-bold text-slate-800">{type === 'part' ? item.partId : item.serialNumber}</p>
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Facility</p>
                <p className="text-sm font-bold text-slate-800">{warehouses.find(w => w.id === item.warehouseId)?.name}</p>
             </div>
             {item.notes && (
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Operational Notes</p>
                  <p className="text-xs font-medium text-slate-500 italic leading-relaxed">"{item.notes}"</p>
               </div>
             )}
          </div>

          <div className="space-y-3">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Compliance Checks</h3>
             {(type === 'machine' ? (
                item.intakeType === 'Return' ? [
                  { label: "Serial Match", key: "serialMatch" },
                  { label: "Inspection", key: "inspected" },
                  { label: "Photos Logged", key: "photosTaken" },
                  { label: "Stock Sync", key: "stockAdjusted" },
                ] : [
                  { label: "Visual Scan", key: "inspected" },
                  { label: "Serial Read", key: "serialReadable" },
                  { label: "Boot Test", key: "bootsToMenu" },
                  { label: "Photo Evidence", key: "photosTaken" },
                  { label: "Zoning", key: "storedCorrectly" },
                ]
             ) : [
                { label: "SKU Scanned", key: "barcodesScanned" },
                { label: "Quantity Verify", key: "countVerified" },
                { label: "Damage Log", key: "damageLogged" },
                { label: "System Update", key: "countUpdated" },
             ]).map(check => (
                <div key={check.key} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                   <span className="text-xs font-bold text-slate-600">{check.label}</span>
                   <span className={`text-[10px] font-black uppercase ${item[check.key] ? 'text-emerald-600' : 'text-red-500'}`}>
                      {item[check.key] ? 'PASS' : 'FAIL'}
                   </span>
                </div>
             ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
             <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Personnel</p>
                <p className="text-[10px] font-black text-indigo-900 truncate">{item.intakeBy || 'System'}</p>
             </div>
             <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Logged Date</p>
                <p className="text-[10px] font-black text-indigo-900">{item.intakeDate ? new Date(item.intakeDate).toLocaleDateString() : 'N/A'}</p>
             </div>
          </div>
        </main>
      </div>
    );
  };

  const renderThresholdModal = () => {
    if (!editingThreshold) return null;
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm" onClick={() => setEditingThreshold(null)} />
        <div className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4 text-center">Set Stock Alert</h3>
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl mb-6">
            <button 
              onClick={() => setEditingThreshold({ ...editingThreshold, value: Math.max(0, editingThreshold.value - 1) })}
              className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
            </button>
            <span className="text-2xl font-black text-indigo-600">{editingThreshold.value}</span>
            <button 
              onClick={() => setEditingThreshold({ ...editingThreshold, value: editingThreshold.value + 1 })}
              className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditingThreshold(null)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
            <button onClick={handleSaveThreshold} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100">Save Threshold</button>
          </div>
        </div>
      </div>
    );
  };

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
          The {title} management module is currently under development.
        </p>
        <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Awaiting Beta release</span>
        </div>
      </main>
    </div>
  );

  const renderWorkOrders = () => {
    const assignableStaff = staffMembers.filter(s => s.role === 'Warehouse Manager' || s.role === 'Installer');
    
    return (
      <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-bottom duration-500">
        <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-100 sticky top-0 z-20">
          <h2 className="text-xl font-black text-[#0f172a] tracking-tight uppercase">Service Orders</h2>
          <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-0.5">Facility Maintenance Log</p>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-6 space-y-4 pb-32">
          {isManager && !isCreatingWorkOrder && (
            <button 
              onClick={() => setIsCreatingWorkOrder(true)}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 mb-6 active:scale-95 transition-all"
            >
              + Create New Order
            </button>
          )}

          {isCreatingWorkOrder ? (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                      Assigning to facility: {assignedWarehouses[0]?.name || warehouses[0]?.name}
                   </p>
                </div>
                <input 
                  type="text" placeholder="Order Title"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newWOTitle} onChange={e => setNewWOTitle(e.target.value)}
                />
                <textarea 
                  placeholder="Problem Description" rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  value={newWODesc} onChange={e => setNewWODesc(e.target.value)}
                />
                <div className="grid grid-cols-1 gap-3">
                  <select 
                    className="px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[10px] uppercase w-full"
                    value={newWOPriority} onChange={e => setNewWOPriority(e.target.value as Priority)}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
                <div className="pt-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Assign Personnel (Optional)</label>
                  <select 
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[10px] uppercase"
                    value={newWOAssignedId} onChange={e => setNewWOAssignedId(e.target.value)}
                  >
                    <option value="">Auto-Assign Later</option>
                    {assignableStaff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role === 'Installer' ? 'INST' : 'WHM'})</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsCreatingWorkOrder(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
                <button onClick={handleCreateWO} disabled={!newWOTitle} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase disabled:opacity-30 shadow-lg shadow-emerald-100">Establish Registry</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {workOrders.length === 0 ? (
                <div className="py-20 text-center opacity-30">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  <p className="font-bold">No active service records</p>
                </div>
              ) : (
                workOrders.map(wo => {
                  const facility = warehouses.find(w => w.id === wo.warehouseId);
                  const assignee = staffMembers.find(s => s.id === wo.assignedToId);
                  const isAssignedToMe = user.id === wo.assignedToId;

                  return (
                    <div key={wo.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm space-y-3 animate-in fade-in">
                       <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full mb-1 inline-block ${
                              wo.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                            }`}>{wo.priority} Priority</span>
                            <h3 className="font-black text-[#0f172a] text-sm uppercase leading-tight">{wo.title}</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{facility?.name}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-xl ${
                               wo.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                               wo.status === 'Accepted' ? 'bg-indigo-50 text-indigo-600' : 
                               wo.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 
                               wo.status === 'New' ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 text-slate-400'
                             }`}>{wo.status}</span>
                             
                             {isManager && (
                               <select 
                                 className="text-[8px] font-black uppercase bg-slate-50 border border-slate-100 rounded-lg px-1.5 py-1 outline-none"
                                 value={wo.status}
                                 onChange={(e) => handleUpdateWOStatus(wo, e.target.value as WorkOrderStatus)}
                               >
                                 <option value="New">New</option>
                                 <option value="Pending">Pending</option>
                                 <option value="Accepted">Accepted</option>
                                 <option value="Completed">Completed</option>
                               </select>
                             )}
                          </div>
                       </div>
                       
                       <p className="text-xs text-slate-500 font-medium leading-relaxed">{wo.description}</p>
                       
                       {wo.history && wo.history.length > 0 && (
                          <div className="bg-slate-50 rounded-2xl p-4 mt-2">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                                Activity History
                             </p>
                             <div className="space-y-2">
                                {wo.history.map((log, i) => (
                                   <p key={i} className="text-[9px] font-bold text-slate-600 leading-tight border-l-2 border-slate-200 pl-2">
                                      {log}
                                   </p>
                                ))}
                             </div>
                          </div>
                       )}

                       <div className="pt-3 flex items-center justify-between border-t border-slate-50">
                          <div className="flex items-center gap-2 max-w-[50%]">
                             <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                                {assignee?.name.charAt(0) || '?'}
                             </div>
                             {isManager ? (
                               <select 
                                 className="text-[9px] font-black text-slate-400 uppercase bg-transparent outline-none w-full"
                                 value={wo.assignedToId || ''}
                                 onChange={(e) => handleAssignWO(wo, e.target.value)}
                                >
                                 <option value="">Unassigned</option>
                                 {assignableStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                               </select>
                             ) : (
                               <span className="text-[9px] font-black text-slate-400 uppercase truncate">
                                  {assignee?.name || 'Unassigned'}
                               </span>
                             )}
                          </div>
                          
                          {isInstaller && (
                             <div className="flex gap-2">
                                {wo.status === 'New' && (
                                   <button onClick={() => handleUpdateWOStatus(wo, 'Accepted')} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-black text-[9px] uppercase shadow-sm">Accept Task</button>
                                )}
                                {wo.status === 'Accepted' && isAssignedToMe && (
                                   <button onClick={() => handleUpdateWOStatus(wo, 'Completed')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-black text-[9px] uppercase shadow-sm">Mark Done</button>
                                )}
                             </div>
                          )}
                       </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </main>
      </div>
    );
  };

  const renderOutward = () => {
    if (isInstaller) return renderInstallerPlaceholder("Installer Tasks", "Field Deployment");
    
    if (isInventoryManager) {
      return (
        <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-bottom duration-500">
          <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-100 sticky top-0 z-20">
            <h2 className="text-xl font-black text-[#0f172a] tracking-tight uppercase">Outward Shipment Log</h2>
            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-0.5">Dispatched & Transferred Records</p>
            <div className="mt-4 relative">
               <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-300">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </span>
               <input 
                 type="text" 
                 placeholder="Search movement log..." 
                 value={outwardSearch}
                 onChange={(e) => setOutwardSearch(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
               />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 py-6 space-y-4 pb-32">
             {movedAssets.length === 0 ? (
               <div className="py-20 text-center opacity-40">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  <p className="text-sm font-bold text-slate-500">No outward records found</p>
               </div>
             ) : (
               movedAssets.map(item => (
                 <div 
                   key={item.id} 
                   onClick={() => setSelectedAuditItem({ type: item.type, item })}
                   className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
                 >
                   <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.type === 'part' ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.type === 'part' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {item.type === 'part' ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                      )}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h3 className="font-black text-[#0f172a] text-sm truncate uppercase tracking-tight">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[9px] font-bold text-slate-400 uppercase">{item.type === 'part' ? (item as any).partId : (item as any).serialNumber}</span>
                         <span className="w-1 h-1 bg-slate-200 rounded-full" />
                         <span className="text-[9px] font-black text-indigo-500 uppercase">{warehouses.find(w => w.id === item.warehouseId)?.name}</span>
                      </div>
                   </div>
                   <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end text-emerald-600">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                         <span className="text-[8px] font-black uppercase">Moved</span>
                      </div>
                      <p className="text-[10px] font-black text-[#0f172a] mt-0.5">{item.type === 'part' ? (item as any).quantity : '1'} <span className="text-[7px] text-slate-400">UNIT</span></p>
                   </div>
                 </div>
               ))
             )}
          </main>
        </div>
      );
    }

    if (outwardSubView === 'success') {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center px-8 bg-white animate-in zoom-in-95 duration-300">
           <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
              <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
           </div>
           <h3 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">Bulk Dispatch Complete</h3>
           <p className="text-slate-500 text-sm font-medium mt-2">All selected items have been logged and moved.</p>
           <button 
            onClick={resetTransfer}
            className="mt-12 w-full bg-slate-900 text-white py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
           >
             Finish Session
           </button>
        </div>
      );
    }

    if (outwardSubView === 'transfer') {
      const sourceWHObj = warehouses.find(w => w.id === transferData.sourceWH);
      const destWHObj = warehouses.find(w => w.id === transferData.destWH);
      const availableItems = transferData.category === 'parts' 
        ? parts.filter(p => p.warehouseId === transferData.sourceWH)
        : machines.filter(m => m.warehouseId === transferData.sourceWH);

      // Only show Accepted WOs assigned to this user
      const myAcceptedWorkOrders = workOrders.filter(wo => 
        wo.assignedToId === user.id && wo.status === 'Accepted'
      );

      return (
        <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-right duration-300">
           <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-100 sticky top-0 z-20">
              <div className="flex justify-between items-center mb-2">
                <button onClick={() => {
                   if (transferStep === 'workorder_link') setOutwardSubView('selection');
                   else if (transferStep === 'source') setTransferStep('workorder_link');
                   else if (transferStep === 'category') setTransferStep('source');
                   else if (transferStep === 'items') setTransferStep('category');
                   else if (transferStep === 'quantities') setTransferStep('items');
                   else if (transferStep === 'destination') setTransferStep(transferData.category === 'parts' ? 'quantities' : 'items');
                   else if (transferStep === 'notes') setTransferStep('destination');
                   else if (transferStep === 'summary') setTransferStep('notes');
                }} className="text-indigo-600 font-black text-[10px] uppercase flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg> Back
                </button>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Multi-Item Transfer</span>
              </div>
              <h2 className="text-xl font-black text-[#0f172a] tracking-tight uppercase">
                {transferStep === 'workorder_link' && 'Link Activity'}
                {transferStep === 'source' && 'Select Source'}
                {transferStep === 'category' && 'Asset Category'}
                {transferStep === 'items' && 'Select Assets'}
                {transferStep === 'quantities' && 'Review Quantities'}
                {transferStep === 'destination' && 'Select Destination'}
                {transferStep === 'notes' && 'Shipping Notes'}
                {transferStep === 'summary' && 'Review Dispatch'}
              </h2>
              <div className="mt-4 flex gap-1">
                {['workorder_link', 'source', 'items', 'destination', 'summary'].map((s, idx) => (
                  <div key={idx} className={`h-1 flex-1 rounded-full ${['workorder_link','source','category','items','quantities','destination','notes','summary'].indexOf(transferStep) >= ['workorder_link','source','items','destination','summary'].indexOf(s) ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                ))}
              </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 py-6 pb-24">
             {transferStep === 'workorder_link' && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                  <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100">
                    <h3 className="text-sm font-black text-indigo-900 uppercase tracking-tight mb-2">Relate to Order</h3>
                    <p className="text-xs text-indigo-600/70 font-medium leading-relaxed">
                      Please select the active service order this transfer is associated with.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {myAcceptedWorkOrders.length > 0 ? (
                      myAcceptedWorkOrders.map(wo => (
                        <button 
                          key={wo.id}
                          onClick={() => { setTransferData({...transferData, linkedWorkOrderId: wo.id}); setTransferStep('source'); }}
                          className={`w-full p-5 rounded-[28px] border text-left transition-all active:scale-[0.98] ${transferData.linkedWorkOrderId === wo.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-800'}`}
                        >
                           <div className="flex justify-between items-start">
                              <span className="font-bold text-sm uppercase tracking-tight">{wo.title}</span>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${transferData.linkedWorkOrderId === wo.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>{wo.priority}</span>
                           </div>
                           <p className={`text-[10px] font-medium mt-1 ${transferData.linkedWorkOrderId === wo.id ? 'text-indigo-100' : 'text-slate-400'}`}>{warehouses.find(w => w.id === wo.warehouseId)?.name}</p>
                        </button>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-400">
                         <p className="text-xs font-bold italic">No accepted orders assigned to you.</p>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => { setTransferData({...transferData, linkedWorkOrderId: ''}); setTransferStep('source'); }}
                      className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-colors"
                    >
                       Continue without Work Order
                    </button>
                  </div>
                </div>
             )}

             {transferStep === 'source' && (
               <div className="space-y-3">
                 {assignedWarehouses.map(w => (
                   <button 
                    key={w.id}
                    onClick={() => { setTransferData({...transferData, sourceWH: w.id}); setTransferStep('category'); }}
                    className="w-full bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all"
                   >
                     <div className="text-left">
                       <p className="font-bold text-[#0f172a]">{w.name}</p>
                       <p className="text-[10px] text-slate-400 font-bold">From current facility</p>
                     </div>
                     <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                   </button>
                 ))}
               </div>
             )}

             {transferStep === 'category' && (
               <div className="grid grid-cols-1 gap-4">
                 <button 
                  onClick={() => { setTransferData({...transferData, category: 'parts', selectedItems: new Map()}); setTransferStep('items'); }}
                  className="bg-white border-2 border-slate-100 p-8 rounded-[40px] flex flex-col items-center gap-3 active:scale-95 shadow-sm"
                 >
                   <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                   </div>
                   <span className="font-black text-xs uppercase tracking-widest text-slate-800">Parts Registry</span>
                 </button>
                 <button 
                  onClick={() => { setTransferData({...transferData, category: 'machines', selectedItems: new Map()}); setTransferStep('items'); }}
                  className="bg-white border-2 border-slate-100 p-8 rounded-[40px] flex flex-col items-center gap-3 active:scale-95 shadow-sm"
                 >
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                   </div>
                   <span className="font-black text-xs uppercase tracking-widest text-slate-800">Machine Units</span>
                 </button>
               </div>
             )}

             {transferStep === 'items' && (
               <div className="space-y-3">
                 <div className="flex justify-between items-center mb-2 px-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Items for Batch</p>
                   <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{transferData.selectedItems.size} Selected</span>
                 </div>
                 {availableItems.map(item => {
                   const isSelected = transferData.selectedItems.has(item.id);
                   return (
                     <button 
                      key={item.id}
                      onClick={() => toggleTransferItem(item.id)}
                      className={`w-full p-4 rounded-[24px] border transition-all flex items-center justify-between active:scale-95 shadow-sm ${
                        isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'
                      }`}
                     >
                       <div className="text-left flex items-center gap-3">
                         <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-slate-50'}`}>
                           {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                         </div>
                         <div>
                           <p className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-[#0f172a]'}`}>{item.name}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase">{transferData.category === 'parts' ? (item as Part).partId : (item as Machine).serialNumber}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <span className={`text-[10px] font-black ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                           {transferData.category === 'parts' ? `${(item as Part).quantity} Available` : (item as Machine).condition}
                         </span>
                       </div>
                     </button>
                   );
                 })}
                 
                 <div className="pt-8 pb-12 sticky bottom-0">
                   <button 
                    disabled={transferData.selectedItems.size === 0}
                    onClick={() => setTransferStep(transferData.category === 'parts' ? 'quantities' : 'destination')}
                    className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 disabled:opacity-30 disabled:shadow-none"
                   >
                     Confirm Selection
                   </button>
                 </div>
               </div>
             )}

             {transferStep === 'quantities' && (
               <div className="space-y-4 animate-in zoom-in-95 duration-300 pb-24">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Adjust Transfer Quantities</p>
                 {Array.from(transferData.selectedItems.entries()).map(([itemId, qty]) => {
                   const partObj = parts.find(p => p.id === itemId);
                   if (!partObj) return null;
                   return (
                     <div key={itemId} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                       <div className="flex justify-between items-start">
                         <div>
                           <p className="font-black text-sm text-[#0f172a]">{partObj.name}</p>
                           <p className="text-[10px] font-bold text-slate-400">Available: {partObj.quantity}</p>
                         </div>
                         <button onClick={() => toggleTransferItem(itemId)} className="text-red-400">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                       </div>
                       <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl">
                          <button 
                            onClick={() => updateTransferQty(itemId, Math.max(1, qty - 1))}
                            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                          </button>
                          <span className="text-2xl font-black text-indigo-600">{qty}</span>
                          <button 
                            onClick={() => updateTransferQty(itemId, Math.min(partObj.quantity, qty + 1))}
                            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                          </button>
                       </div>
                     </div>
                   );
                 })}
                 
                 <button 
                    onClick={() => setTransferStep('destination')}
                    className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100"
                  >
                    Lock Quantities
                  </button>
               </div>
             )}

             {transferStep === 'destination' && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-4">Target Receiving Facility</p>
                  {warehouses.filter(w => w.id !== transferData.sourceWH).map(w => (
                    <button 
                      key={w.id}
                      onClick={() => { setTransferData({...transferData, destWH: w.id}); setTransferStep('notes'); }}
                      className="w-full bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all"
                    >
                      <div className="text-left">
                        <p className="font-bold text-[#0f172a]">{w.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{w.location}</p>
                      </div>
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ))}
                </div>
             )}

             {transferStep === 'notes' && (
               <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
                  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Transfer Reason / Logs</label>
                    <textarea 
                      placeholder="Reason for multi-item movement..."
                      rows={6}
                      className="w-full bg-transparent font-bold text-sm outline-none resize-none placeholder:text-slate-200"
                      value={transferData.notes}
                      onChange={e => setTransferData({...transferData, notes: e.target.value})}
                    />
                  </div>
                  <button 
                    onClick={() => setTransferStep('summary')}
                    className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100"
                  >
                    Review Batch Manifest
                  </button>
               </div>
             )}

             {transferStep === 'summary' && (
               <div className="space-y-6 animate-in zoom-in-95 duration-300 pb-24">
                  <div className="bg-indigo-900 rounded-[40px] p-8 text-white shadow-2xl">
                     <div className="flex items-center gap-4 w-full mb-8">
                        <div className="flex-1 text-center">
                           <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">Source</p>
                           <p className="text-xs font-black truncate">{sourceWHObj?.name}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center">
                           <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                        <div className="flex-1 text-center">
                           <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">Dest</p>
                           <p className="text-xs font-black truncate">{destWHObj?.name}</p>
                        </div>
                     </div>
                     
                     <div className="space-y-3">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center">Batch Manifest</p>
                        {Array.from(transferData.selectedItems.entries()).map(([itemId, qty]) => {
                          const itemObj = transferData.category === 'parts' 
                            ? parts.find(p => p.id === itemId)
                            : machines.find(m => m.id === itemId);
                          return (
                            <div key={itemId} className="flex justify-between items-center py-2 border-b border-indigo-800/50 last:border-0">
                               <div className="max-w-[70%]">
                                  <p className="text-xs font-black uppercase truncate">{itemObj?.name}</p>
                                  <p className="text-[9px] text-indigo-300 font-bold uppercase">{transferData.category === 'parts' ? (itemObj as Part)?.partId : (itemObj as Machine)?.serialNumber}</p>
                               </div>
                               <span className="text-sm font-black bg-indigo-800 px-3 py-1 rounded-lg">x{qty}</span>
                            </div>
                          );
                        })}
                     </div>
                  </div>

                  {transferData.linkedWorkOrderId && (
                    <div className="p-6 bg-indigo-50 rounded-[32px] border border-indigo-100">
                       <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Linked Work Order</p>
                       <p className="text-xs font-black text-indigo-900 truncate">
                          {workOrders.find(wo => wo.id === transferData.linkedWorkOrderId)?.title}
                       </p>
                    </div>
                  )}

                  {transferData.notes && (
                    <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100">
                       <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Global Audit Note</p>
                       <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{transferData.notes}"</p>
                    </div>
                  )}

                  <button 
                    onClick={handleTransferSubmit}
                    className="w-full bg-emerald-600 text-white py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 active:scale-95 transition-all mt-4"
                  >
                    Authorize Movement
                  </button>
               </div>
             )}
          </main>
        </div>
      );
    }

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
          </button>

          <button 
            onClick={() => { setOutwardSubView('transfer'); setTransferStep('workorder_link'); }}
            className="w-full bg-white border-2 border-slate-50 p-6 rounded-[32px] flex items-center gap-5 active:scale-95 transition-all shadow-sm group"
          >
            <div className="w-14 h-14 bg-emerald-500 rounded-[22px] flex items-center justify-center text-white shadow-lg shadow-emerald-100 group-hover:-rotate-6 transition-transform">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
               </svg>
            </div>
            <div className="text-left">
              <span className="block font-black text-sm uppercase tracking-tight text-slate-800">2. Bulk Transfer</span>
              <span className="block text-[9px] font-bold text-emerald-600 uppercase mt-0.5">Facility Rebalancing</span>
            </div>
          </button>

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
          </button>

          <div className="mt-8 flex items-center gap-2 px-6 py-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none">Multi-select enabled for batching</span>
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
                  onClick={() => setSelectedAuditItem({ type: 'part', item: p })}
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
                  onClick={() => setSelectedAuditItem({ type: 'machine', item: m })}
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
                <div 
                  key={p.id} 
                  onClick={() => setSelectedAuditItem({ type: 'part', item: p })}
                  className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-95 transition-all"
                >
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
                      {isLow && <span className="text-[7px] font-black text-red-500 uppercase tracking-widest">Low Stock</span>}
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
                onClick={() => setSelectedAuditItem({ type: 'machine', item: m })}
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

  return (
    <div className="h-full flex flex-col bg-[#fcfdfe]">
      <div className="flex-1 relative overflow-hidden">
        {activeMainTab === 'inventory' && renderInventory()}
        {activeMainTab === 'intake' && renderIntake()}
        {activeMainTab === 'outward' && renderOutward()}
        {activeMainTab === 'global' && isInventoryManager && renderGlobalStock()}
        {activeMainTab === 'workorder' && renderWorkOrders()}
        {renderHistoryModal()}
        {renderThresholdModal()}
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
          onClick={() => setActiveMainTab('workorder')}
          className={`flex flex-col items-center gap-1 transition-all ${getNavColorClass('workorder')}`}
        >
          <svg className="w-5 h-5" fill={activeMainTab === 'workorder' ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="text-[7px] font-black uppercase tracking-tighter">Orders</span>
        </button>
      </nav>
    </div>
  );
};

export default MobileDashboard;
