
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
    const destWHName = warehouses.find(w => w.id === transferData.destWH)?.name || 'Target Warehouse';
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
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Warehouse</p>
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
          <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-0.5">Maintenance Log</p>
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
                      Assigning to warehouse: {assignedWarehouses[0]?.name || warehouses[0]?.name}
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
                  const warehouse = warehouses.find(w => w.id === wo.warehouseId);
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
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{warehouse?.name}</p>
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
            <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Warehouses</h2>
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

  /**
   * Renders the Intake workflow for recording new or returned assets.
   * Handles warehouse selection, asset type, and detailed form entry with compliance checks.
   */
  const renderIntake = () => {
    if (isInventoryManager || isInstaller) return renderInstallerPlaceholder("Intake Portal", "Warehouse Access Required");

    if (intakeStep === 'success') {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Record Established</h2>
          <p className="text-sm text-slate-400 font-medium mt-2">The asset has been successfully registered in the facility database.</p>
          <button onClick={resetIntake} className="mt-10 w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100">Finish Intake</button>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-bottom duration-500">
        <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-100 sticky top-0 z-20">
          <h2 className="text-xl font-black text-[#0f172a] tracking-tight uppercase">Asset Intake</h2>
          <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">Registry Workflow</p>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-6 pb-32">
          {intakeStep === 'warehouse' && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Select Arrival Facility</h3>
              {assignedWarehouses.map(w => (
                <button key={w.id} onClick={() => { setIntakeWarehouseId(w.id); setIntakeStep('type'); }} className="w-full p-5 bg-white border border-slate-100 rounded-[28px] text-left font-bold text-slate-800 shadow-sm active:scale-95 transition-all flex items-center justify-between">
                  <span>{w.name}</span>
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
          )}

          {intakeStep === 'type' && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">What are you logging?</h3>
              <button onClick={() => { setIntakeType('machine'); setIntakeStep('subtype'); }} className="w-full p-6 bg-white border border-slate-100 rounded-[32px] text-left shadow-sm active:scale-95 transition-all">
                <p className="font-black text-slate-800 uppercase text-sm">Full Machine</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Skill, ATM, or Jukebox Unit</p>
              </button>
              <button onClick={() => { setIntakeType('part'); setIntakeStep('form'); }} className="w-full p-6 bg-white border border-slate-100 rounded-[32px] text-left shadow-sm active:scale-95 transition-all">
                <p className="font-black text-slate-800 uppercase text-sm">Component / Parts</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Boards, Motors, Bill Validators</p>
              </button>
            </div>
          )}

          {intakeStep === 'subtype' && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Intake Reason</h3>
              <button onClick={() => { setMachineSubtype('Intake'); setIntakeStep('form'); }} className="w-full p-6 bg-white border border-slate-100 rounded-[32px] text-left shadow-sm active:scale-95 transition-all">
                <p className="font-black text-slate-800 uppercase text-sm">New Stock Arrival</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Direct from Manufacturer/Purchase</p>
              </button>
              <button onClick={() => { setMachineSubtype('Return'); setIntakeStep('form'); }} className="w-full p-6 bg-white border border-slate-100 rounded-[32px] text-left shadow-sm active:scale-95 transition-all">
                <p className="font-black text-slate-800 uppercase text-sm">Venue Return</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Machine back from field operation</p>
              </button>
            </div>
          )}

          {intakeStep === 'form' && intakeType === 'machine' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                <input type="text" placeholder="Model Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" value={intakeMachineData.name} onChange={e => setIntakeMachineData({...intakeMachineData, name: e.target.value})} />
                <input type="text" placeholder="Serial Number" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" value={intakeMachineData.serialNumber} onChange={e => setIntakeMachineData({...intakeMachineData, serialNumber: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                  <select className="px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[10px] uppercase" value={intakeMachineData.class} onChange={e => setIntakeMachineData({...intakeMachineData, class: e.target.value as any})}>
                    <option value="Skill">Skill</option>
                    <option value="ATM">ATM</option>
                    <option value="Jukebox">Jukebox</option>
                  </select>
                  <select className="px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[10px] uppercase" value={intakeMachineData.condition} onChange={e => setIntakeMachineData({...intakeMachineData, condition: e.target.value as any})}>
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Compliance Checklist</h3>
                {['inspected', 'serialReadable', 'bootsToMenu', 'photosTaken', 'storedCorrectly'].map(key => (
                  <button key={key} onClick={() => setIntakeMachineData({...intakeMachineData, [key]: !intakeMachineData[key as keyof typeof intakeMachineData]})} className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${intakeMachineData[key as keyof typeof intakeMachineData] ? 'bg-emerald-600 border-emerald-600' : 'border-slate-200'}`}>
                      {intakeMachineData[key as keyof typeof intakeMachineData] && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </button>
                ))}
              </div>

              <button onClick={handleCompleteIntake} className="w-full py-5 bg-emerald-600 text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 mt-4">Confirm Machine Intake</button>
            </div>
          )}

          {intakeStep === 'form' && intakeType === 'part' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                <input type="text" placeholder="Part Description" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" value={intakePartData.name} onChange={e => setIntakePartData({...intakePartData, name: e.target.value})} />
                <input type="text" placeholder="Part SKU / ID" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" value={intakePartData.partId} onChange={e => setIntakePartData({...intakePartData, partId: e.target.value})} />
                <input type="number" placeholder="Quantity" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" value={intakePartData.quantity || ''} onChange={e => setIntakePartData({...intakePartData, quantity: parseInt(e.target.value) || 0})} />
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Part Audit Checks</h3>
                {['barcodesScanned', 'countVerified', 'damageLogged', 'countUpdated'].map(key => (
                  <button key={key} onClick={() => setIntakePartData({...intakePartData, [key]: !intakePartData[key as keyof typeof intakePartData]})} className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${intakePartData[key as keyof typeof intakePartData] ? 'bg-emerald-600 border-emerald-600' : 'border-slate-200'}`}>
                      {intakePartData[key as keyof typeof intakePartData] && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </button>
                ))}
              </div>

              <button onClick={handleCompleteIntake} className="w-full py-5 bg-emerald-600 text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 mt-4">Complete Part Batch</button>
            </div>
          )}
        </main>
      </div>
    );
  };

  /**
   * Renders the Outward workflow for asset movements and transfers.
   * Handles multi-item transfers between warehouses with work order linking.
   */
  const renderOutward = () => {
    if (isInstaller) return renderInstallerPlaceholder("Outward Tasks", "Dispatch Queue");

    if (outwardSubView === 'success') {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Transfer Manifest Sent</h2>
          <p className="text-sm text-slate-400 font-medium mt-2">Asset location data updated. Receiving warehouse notified.</p>
          <button onClick={resetTransfer} className="mt-10 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100">Finish</button>
        </div>
      );
    }

    if (outwardSubView === 'selection') {
      return (
        <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-bottom duration-500">
          <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-100 sticky top-0 z-20">
            <h2 className="text-xl font-black text-[#0f172a] tracking-tight uppercase">Outward Logs</h2>
            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-0.5">Asset Movements</p>
          </header>
          <main className="flex-1 overflow-y-auto px-5 py-6 space-y-4 pb-32">
            <button onClick={() => { setOutwardSubView('transfer'); setTransferStep('workorder_link'); }} className="w-full p-6 bg-white border border-slate-100 rounded-[32px] text-left shadow-sm active:scale-95 transition-all">
              <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </div>
              <p className="font-black text-slate-800 uppercase text-sm">Warehouse Transfer</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Move stock between internal facilities</p>
            </button>

            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 pt-6">Recent Movements</h3>
            <div className="space-y-3">
               {movedAssets.slice(0, 10).map(item => (
                 <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex items-center justify-between">
                    <div>
                       <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                       <p className="text-[8px] text-slate-400 font-black uppercase">{item.type === 'part' ? (item as any).partId : (item as any).serialNumber}</p>
                    </div>
                    <span className="text-[7px] font-black text-indigo-500 uppercase px-2 py-1 bg-indigo-50 rounded-lg tracking-widest">Moved</span>
                 </div>
               ))}
            </div>
          </main>
        </div>
      );
    }

    if (outwardSubView === 'transfer') {
      return (
        <div className="h-full flex flex-col bg-[#fcfdfe] animate-in slide-in-from-right duration-300">
          <header className="px-5 pt-12 pb-5 bg-white border-b border-slate-100 sticky top-0 z-20">
             <div className="flex items-center gap-3">
                <button onClick={() => setOutwardSubView('selection')} className="p-2 -ml-2 text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
                <div>
                   <h2 className="text-lg font-black text-[#0f172a] uppercase leading-none">Transfer Setup</h2>
                   <p className="text-[9px] text-indigo-600 font-black uppercase tracking-widest mt-1">Step: {transferStep.replace('_', ' ')}</p>
                </div>
             </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 py-6 pb-32">
             {transferStep === 'workorder_link' && (
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Link Service Order?</h3>
                  <button onClick={() => setTransferStep('source')} className="w-full p-5 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 mb-2 italic">Skip / No Link</button>
                  {workOrders.filter(wo => wo.status !== 'Completed').map(wo => (
                    <button key={wo.id} onClick={() => { setTransferData({...transferData, linkedWorkOrderId: wo.id}); setTransferStep('source'); }} className="w-full p-5 bg-white border border-slate-100 rounded-[28px] text-left shadow-sm active:scale-95 transition-all">
                       <p className="font-black text-slate-800 uppercase text-[11px] mb-1">{wo.title}</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase">ID: {wo.id}</p>
                    </button>
                  ))}
               </div>
             )}

             {transferStep === 'source' && (
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Select Source Facility</h3>
                  {assignedWarehouses.map(w => (
                    <button key={w.id} onClick={() => { setTransferData({...transferData, sourceWH: w.id}); setTransferStep('category'); }} className="w-full p-5 bg-white border border-slate-100 rounded-[28px] text-left font-bold text-slate-800 shadow-sm active:scale-95 transition-all">
                      {w.name}
                    </button>
                  ))}
               </div>
             )}

             {transferStep === 'category' && (
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</h3>
                  <button onClick={() => { setTransferData({...transferData, category: 'parts', selectedItems: new Map()}); setTransferStep('items'); }} className="w-full p-6 bg-white border border-slate-100 rounded-[32px] text-left shadow-sm active:scale-95 transition-all">
                    <p className="font-black text-slate-800 uppercase text-sm">Spare Parts</p>
                  </button>
                  <button onClick={() => { setTransferData({...transferData, category: 'machines', selectedItems: new Map()}); setTransferStep('items'); }} className="w-full p-6 bg-white border border-slate-100 rounded-[32px] text-left shadow-sm active:scale-95 transition-all">
                    <p className="font-black text-slate-800 uppercase text-sm">Full Machines</p>
                  </button>
               </div>
             )}

             {transferStep === 'items' && (
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Pick Items to Move</h3>
                  {(transferData.category === 'parts' 
                    ? parts.filter(p => p.warehouseId === transferData.sourceWH)
                    : machines.filter(m => m.warehouseId === transferData.sourceWH)
                  ).map(item => (
                    <button key={item.id} onClick={() => toggleTransferItem(item.id)} className={`w-full p-5 border rounded-[28px] text-left shadow-sm transition-all flex items-center justify-between ${transferData.selectedItems.has(item.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
                       <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                       {transferData.selectedItems.has(item.id) && <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                    </button>
                  ))}
                  <button disabled={transferData.selectedItems.size === 0} onClick={() => setTransferStep(transferData.category === 'parts' ? 'quantities' : 'destination')} className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black text-[11px] uppercase tracking-widest mt-4 disabled:opacity-30">Next</button>
               </div>
             )}

             {transferStep === 'quantities' && (
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Set Quantities</h3>
                  {[...transferData.selectedItems.keys()].map(id => {
                    const part = parts.find(p => p.id === id);
                    return (
                      <div key={id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between">
                         <span className="font-bold text-xs text-slate-800">{part?.name}</span>
                         <input type="number" className="w-20 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-black text-center" value={transferData.selectedItems.get(id)} onChange={e => updateTransferQty(id, parseInt(e.target.value) || 1)} />
                      </div>
                    );
                  })}
                  <button onClick={() => setTransferStep('destination')} className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black text-[11px] uppercase tracking-widest mt-4">Set Destination</button>
               </div>
             )}

             {transferStep === 'destination' && (
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Warehouse</h3>
                  {warehouses.filter(w => w.id !== transferData.sourceWH).map(w => (
                    <button key={w.id} onClick={() => { setTransferData({...transferData, destWH: w.id}); setTransferStep('notes'); }} className="w-full p-5 bg-white border border-slate-100 rounded-[28px] text-left font-bold text-slate-800 shadow-sm active:scale-95 transition-all">
                      {w.name}
                    </button>
                  ))}
               </div>
             )}

             {transferStep === 'notes' && (
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Manifest Notes</h3>
                  <textarea placeholder="Reason for transfer, handling instructions..." className="w-full px-6 py-5 bg-white border border-slate-100 rounded-[32px] font-bold text-sm outline-none shadow-sm resize-none" rows={4} value={transferData.notes} onChange={e => setTransferData({...transferData, notes: e.target.value})} />
                  <button onClick={() => setTransferStep('summary')} className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black text-[11px] uppercase tracking-widest mt-4 shadow-lg shadow-indigo-100">Review Summary</button>
               </div>
             )}

             {transferStep === 'summary' && (
                <div className="space-y-6">
                   <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Items To Transfer</p>
                         <div className="space-y-1">
                            {[...transferData.selectedItems.entries()].map(([id, qty]) => {
                               const item = transferData.category === 'parts' ? parts.find(p => p.id === id) : machines.find(m => m.id === id);
                               return <p key={id} className="text-xs font-black text-slate-800 tracking-tight">{qty}x {item?.name}</p>;
                            })}
                         </div>
                      </div>
                      <div className="pt-2 flex items-center gap-3">
                         <div className="flex-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Source</p>
                            <p className="text-xs font-bold text-slate-800">{warehouses.find(w => w.id === transferData.sourceWH)?.name}</p>
                         </div>
                         <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                         <div className="flex-1 text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination</p>
                            <p className="text-xs font-bold text-slate-800">{warehouses.find(w => w.id === transferData.destWH)?.name}</p>
                         </div>
                      </div>
                   </div>
                   <button onClick={handleTransferSubmit} className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100">Authorize Transfer</button>
                </div>
             )}
          </main>
        </div>
      );
    }

    return null;
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
          <span className="text-[7px] font-black uppercase tracking-tighter">{isInstaller ? 'Global Stock' : 'Warehouses'}</span>
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
