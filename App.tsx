
import React, { useState } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WarehouseList from './components/WarehouseList';
import StaffList from './components/StaffList';
import MobileDashboard from './components/MobileDashboard';
import MobileFrame from './components/MobileFrame';
import WarehouseInventoryDetail from './components/WarehouseInventoryDetail';
import GlobalInventory from './components/GlobalInventory';
import { User, View, Warehouse, StaffMember, Part, Machine, StaffRole, WorkOrder } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('warehouses');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [isEmulatingMobile, setIsEmulatingMobile] = useState(false);
  const [emulationRole, setEmulationRole] = useState<StaffRole | null>(null);
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    { id: '1', name: 'Global Hub Alpha', location: 'New Jersey, USA', status: 'Active', createdAt: new Date().toISOString() },
    { id: '2', name: 'Pacific Logistics', location: 'Oakland, CA', status: 'Active', createdAt: new Date().toISOString() },
    { id: '3', name: 'Northeast Depot', location: 'Buffalo, NY', status: 'Full', createdAt: new Date().toISOString() }
  ]);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: 'wo-1',
      title: 'Monthly Inventory Audit',
      description: 'Perform full scan of all Skill machines in Bay A.',
      status: 'Accepted',
      priority: 'Medium',
      warehouseId: '1',
      assignedToId: 'whm-1',
      createdBy: 'John Inventory',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'wo-new-1',
      title: 'Bay C Lighting Repair',
      description: 'The overhead LEDs in the back storage area are flickering. Requires immediate attention.',
      status: 'New',
      priority: 'High',
      warehouseId: '1',
      createdBy: 'Sarah Warehouse',
      createdAt: new Date().toISOString()
    },
    {
      id: 'wo-new-2',
      title: 'ATM Paper Jam - Facility 2',
      description: 'The primary ATM unit is reporting a persistent paper jam in the receipt dispenser.',
      status: 'New',
      priority: 'Medium',
      warehouseId: '2',
      createdBy: 'John Inventory',
      createdAt: new Date().toISOString()
    },
    {
      id: 'wo-new-3',
      title: 'HVAC Filter Replacement',
      description: 'Standard maintenance required for the cooling units in the server room.',
      status: 'New',
      priority: 'Low',
      warehouseId: '1',
      createdBy: 'Sarah Warehouse',
      createdAt: new Date().toISOString()
    }
  ]);

  const [parts, setParts] = useState<Part[]>([
    // Dummy Data with Transfer History
    { 
      id: 'p-trans-1', 
      warehouseId: '1', 
      name: 'LCD Controller Hub', 
      partId: 'CTRL-99X', 
      quantity: 12, 
      threshold: 5, 
      notes: `[SYSTEM] Item established in Registry.\n[TRANSFER IN] 12 units from Pacific Logistics on ${new Date(Date.now() - 172800000).toLocaleDateString()}. Note: Surplus stock rebalancing.`, 
      intakeBy: 'John Inventory', 
      intakeDate: new Date(Date.now() - 172800000).toISOString(),
      barcodesScanned: true, 
      countVerified: true, 
      countUpdated: true 
    },
    { id: 'adm-p1', warehouseId: '1', name: 'High-Torque Stepper Motor', partId: 'ADM-MOT-01', quantity: 50, threshold: 10, notes: 'Initial system load', intakeBy: 'System Administrator', intakeDate: new Date().toISOString(), barcodesScanned: true, countVerified: true, countUpdated: true },
    { id: 'adm-p2', warehouseId: '2', name: 'Solid State Relay 40A', partId: 'ADM-SSR-40', quantity: 100, threshold: 20, notes: 'Bulk warehouse provision', intakeBy: 'System Administrator', intakeDate: new Date().toISOString(), barcodesScanned: true, countVerified: true, countUpdated: true },
    { id: 'adm-p3', warehouseId: '3', name: 'Industrial Wi-Fi Antenna', partId: 'ADM-WIF-ANT', quantity: 30, threshold: 5, notes: 'Standard kit inventory', intakeBy: 'System Administrator', intakeDate: new Date().toISOString(), barcodesScanned: true, countVerified: true, countUpdated: true },
    { id: 'p1-1', warehouseId: '1', name: 'PCB Mainboard V2', partId: 'PART-001', quantity: 15, threshold: 5, notes: 'Standard inventory', intakeBy: 'Sarah Warehouse', barcodesScanned: true, countVerified: true, countUpdated: true },
    { id: 'p1-2', warehouseId: '1', name: 'Coin Acceptor Mech', partId: 'PART-002', quantity: 3, threshold: 10, notes: 'Low stock - reorder pending', intakeBy: 'Sarah Warehouse', damageLogged: false, barcodesScanned: true },
    { id: 'p1-3', warehouseId: '1', name: 'Bill Validator Gen3', partId: 'BV-300', quantity: 12, threshold: 4, notes: 'Batch received Friday', intakeBy: 'Sarah Warehouse', countVerified: true, countUpdated: true },
    { id: 'p2-1', warehouseId: '2', name: 'Display Panel 4K', partId: 'DISP-09', quantity: 8, threshold: 2, notes: 'Fragile handling required', intakeBy: 'John Inventory', barcodesScanned: true, countVerified: true },
    { id: 'p2-2', warehouseId: '2', name: 'Touch Overlay 27"', partId: 'TO-27', quantity: 5, threshold: 2, intakeBy: 'John Inventory' },
    { id: 'p3-1', warehouseId: '3', name: 'Thermal Printer', partId: 'TP-500', quantity: 22, threshold: 5, notes: 'Standard fit for ATMs', intakeBy: 'Sarah Warehouse', countVerified: true, countUpdated: true },
    { id: 'p3-2', warehouseId: '3', name: 'Hopper Motor', partId: 'MOT-HP', quantity: 4, threshold: 5, notes: 'Critical item - running low', intakeBy: 'Sarah Warehouse' }
  ]);

  const [machines, setMachines] = useState<Machine[]>([
    { 
      id: 'm-trans-1', 
      warehouseId: '2', 
      name: 'Quantum Arcade V4', 
      serialNumber: 'SN-TRANS-888', 
      class: 'Skill', 
      condition: 'Used', 
      intakeType: 'Intake',
      inspected: true, 
      serialReadable: true, 
      bootsToMenu: true, 
      photosTaken: true, 
      storedCorrectly: true,
      intakeBy: 'Sarah Warehouse', 
      intakeDate: new Date(Date.now() - 259200000).toISOString(), 
      notes: `[SYSTEM] New machine established in Global Hub Alpha.\n[LOCATION TRANSFER] Moved from Global Hub Alpha to Pacific Logistics on ${new Date(Date.now() - 86400000).toLocaleDateString()}. Note: Relocated for specific venue request.`
    },
    { id: 'adm-m1', warehouseId: '1', name: 'Titan Skill Terminal', serialNumber: 'ADM-TS-900', class: 'Skill', condition: 'New', intakeType: 'Intake', inspected: true, serialReadable: true, bootsToMenu: true, photosTaken: true, storedCorrectly: true, intakeBy: 'System Administrator', intakeDate: new Date().toISOString(), notes: 'Global registry initialization' },
    { id: 'adm-m2', warehouseId: '2', name: 'Vault-Secure ATM', serialNumber: 'ADM-VS-44', class: 'ATM', condition: 'New', intakeType: 'Intake', inspected: true, serialReadable: true, bootsToMenu: true, photosTaken: true, storedCorrectly: true, intakeBy: 'System Administrator', intakeDate: new Date().toISOString(), notes: 'Bulk deployment asset' },
    { id: 'adm-m3', warehouseId: '3', name: 'Fusion Jukebox Elite', serialNumber: 'ADM-FJE-77', class: 'Jukebox', condition: 'New', intakeType: 'Intake', inspected: true, serialReadable: true, bootsToMenu: true, photosTaken: true, storedCorrectly: true, intakeBy: 'System Administrator', intakeDate: new Date().toISOString(), notes: 'Central inventory setup' },
    { 
      id: 'm1-1', warehouseId: '1', name: 'MegaSkill Deluxe', serialNumber: 'SN-99821', class: 'Skill', condition: 'New', intakeType: 'Intake',
      inspected: true, serialReadable: true, bootsToMenu: true, photosTaken: true, storedCorrectly: true,
      intakeBy: 'Sarah Warehouse', intakeDate: new Date(Date.now() - 86400000 * 5).toISOString(), notes: 'Brand new unit, clear inspection.'
    },
    { 
      id: 'm1-2', warehouseId: '1', name: 'CryptoATM 500', serialNumber: 'SN-11200', class: 'ATM', condition: 'Used', intakeType: 'Return',
      serialMatch: true, inspected: true, photosTaken: true, stockAdjusted: true, returnStatus: 'Repair',
      intakeBy: 'John Inventory', intakeDate: new Date(Date.now() - 86400000).toISOString(), notes: 'Returned from venue with screen flicker.'
    }
  ]);

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: 'inv-1',
      name: 'John Inventory',
      email: 'inventory@gmail.com',
      contact: '555-0199',
      password: 'inventory',
      role: 'Inventory Manager',
      assignedWarehouseIds: ['1', '2', '3'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'whm-1',
      name: 'Sarah Warehouse',
      email: 'warehousemanager@gmail.com',
      contact: '555-0200',
      password: 'warehouse',
      role: 'Warehouse Manager',
      assignedWarehouseIds: ['1', '2', '3'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'inst-1',
      name: 'Installer User',
      email: 'installer@gmail.com',
      contact: '555-0300',
      password: 'installer',
      role: 'Installer',
      assignedWarehouseIds: ['1'],
      createdAt: new Date().toISOString()
    }
  ]);

  const handleLogin = (u: User) => {
    // Attach real ID if it was a staff member
    const staff = staffMembers.find(s => s.email === u.email);
    const userWithId = staff ? { ...u, id: staff.id } : u;
    
    setUser(userWithId);
    if (u.role === 'Warehouse Manager' || u.role === 'Inventory Manager' || u.role === 'Installer') {
      setIsEmulatingMobile(true);
      setCurrentView('inventory-portal');
    } else {
      setIsEmulatingMobile(false);
      setCurrentView('warehouses');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsEmulatingMobile(false);
    setCurrentView('warehouses');
  };

  const handleStartEmulation = (role: StaffRole) => {
    setUser(null);
    setEmulationRole(role);
    setIsEmulatingMobile(true);
  };

  const handleExitEmulation = () => {
    setIsEmulatingMobile(false);
    setEmulationRole(null);
    setUser(null);
  };

  const handleWarehouseClick = (id: string) => {
    setSelectedWarehouseId(id);
    setCurrentView('warehouse-detail');
  };

  const updatePart = (p: Part) => setParts(prev => prev.map(item => item.id === p.id ? p : item));
  const updateMachine = (m: Machine) => setMachines(prev => prev.map(item => item.id === m.id ? m : item));
  const addPart = (p: Omit<Part, 'id'>) => setParts(prev => [...prev, { ...p, id: Math.random().toString(36).substr(2, 9) }]);
  const addMachine = (m: Omit<Machine, 'id'>) => setMachines(prev => [...prev, { ...m, id: Math.random().toString(36).substr(2, 9) }]);

  const addWorkOrder = (wo: Omit<WorkOrder, 'id' | 'createdAt'>) => {
    setWorkOrders(prev => [...prev, {
      ...wo,
      id: 'wo-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    }]);
  };

  const updateWorkOrder = (wo: WorkOrder) => {
    setWorkOrders(prev => prev.map(item => item.id === wo.id ? wo : item));
  };

  const handleTransferPart = (fromWH: string, toWH: string, partId: string, qty: number, notes: string) => {
    setParts(current => {
      const sourcePart = current.find(p => p.id === partId);
      if (!sourcePart) return current;

      const fromWHName = warehouses.find(w => w.id === fromWH)?.name;
      const toWHName = warehouses.find(w => w.id === toWH)?.name;

      const nextParts = current.map(p => {
        if (p.id === partId) {
          const log = `\n[TRANSFER OUT] ${qty} units to ${toWHName} on ${new Date().toLocaleDateString()}. Note: ${notes}`;
          return { 
            ...p, 
            quantity: p.quantity - qty,
            notes: (p.notes || '') + log
          };
        }
        return p;
      });

      const destPartIndex = nextParts.findIndex(p => p.warehouseId === toWH && p.partId === sourcePart.partId);
      if (destPartIndex > -1) {
        const log = `\n[TRANSFER IN] ${qty} units from ${fromWHName} on ${new Date().toLocaleDateString()}. Note: ${notes}`;
        nextParts[destPartIndex] = {
          ...nextParts[destPartIndex],
          quantity: nextParts[destPartIndex].quantity + qty,
          notes: (nextParts[destPartIndex].notes || '') + log
        };
        return [...nextParts];
      } else {
        return [...nextParts, {
          ...sourcePart,
          id: Math.random().toString(36).substr(2, 9),
          warehouseId: toWH,
          quantity: qty,
          notes: `[TRANSFER INITIAL] Establishing stock via transfer from ${fromWHName} on ${new Date().toLocaleDateString()}. Note: ${notes}`,
          intakeBy: user?.name || 'System'
        }];
      }
    });
  };

  const handleTransferMachine = (toWH: string, machineId: string, notes: string) => {
    setMachines(current => current.map(m => {
      if (m.id === machineId) {
        const fromWHName = warehouses.find(w => w.id === m.warehouseId)?.name;
        const toWHName = warehouses.find(w => w.id === toWH)?.name;
        const log = `\n[LOCATION TRANSFER] Moved from ${fromWHName} to ${toWHName} on ${new Date().toLocaleDateString()}. Note: ${notes}`;
        return { 
          ...m, 
          warehouseId: toWH,
          notes: (m.notes || '') + log
        };
      }
      return m;
    }));
  };

  if (isEmulatingMobile) {
    return (
      <MobileFrame onExit={handleExitEmulation}>
        {!user ? (
          <Login 
            onLogin={handleLogin} 
            staffMembers={staffMembers} 
            isMobileView={true} 
            initialRole={emulationRole || undefined}
          />
        ) : (
          <MobileDashboard 
            user={user} 
            warehouses={warehouses} 
            parts={parts}
            machines={machines}
            workOrders={workOrders}
            staffMembers={staffMembers}
            onUpdatePart={updatePart}
            onAddPart={addPart}
            onAddMachine={addMachine}
            onAddWorkOrder={addWorkOrder}
            onUpdateWorkOrder={updateWorkOrder}
            onTransferPart={handleTransferPart}
            onTransferMachine={handleTransferMachine}
            onLogout={handleLogout} 
          />
        )}
      </MobileFrame>
    );
  }

  if (!user) {
    return (
      <Login 
        onLogin={handleLogin} 
        staffMembers={staffMembers}
        onMobileClick={() => handleStartEmulation('Warehouse Manager')} 
        onInventoryMobileClick={() => handleStartEmulation('Inventory Manager')}
        onInstallerClick={() => handleStartEmulation('Installer')}
      />
    );
  }

  const isAdmin = user.role === 'Site Administrator';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        onLogout={handleLogout} 
        isAdmin={isAdmin}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          user={user} 
          onMobileClick={() => handleStartEmulation('Warehouse Manager')} 
          onInventoryMobileClick={() => handleStartEmulation('Inventory Manager')}
          onInstallerClick={() => handleStartEmulation('Installer')}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {currentView === 'warehouses' && (
            <WarehouseList 
              warehouses={warehouses.filter(w => isAdmin)} 
              onAdd={(w) => setWarehouses(prev => [{...w, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString()}, ...prev])} 
              onUpdate={(updated) => setWarehouses(prev => prev.map(w => w.id === updated.id ? updated : w))}
              onDelete={(id) => setWarehouses(current => current.filter(w => w.id !== id))}
              onWarehouseClick={handleWarehouseClick}
            />
          )}
          {currentView === 'global-inventory' && (
            <GlobalInventory 
              parts={parts}
              machines={machines}
              warehouses={warehouses}
              onUpdatePart={updatePart}
              onUpdateMachine={updateMachine}
              onAddPart={addPart}
              onAddMachine={addMachine}
              currentUser={user}
            />
          )}
          {currentView === 'staff' && isAdmin && (
            <StaffList 
              staffMembers={staffMembers}
              warehouses={warehouses}
              onAdd={(s) => setStaffMembers(prev => [{...s, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString()}, ...prev])}
              onUpdate={(updated) => setStaffMembers(prev => prev.map(s => s.id === updated.id ? updated : s))}
              onDelete={(id) => setStaffMembers(prev => prev.filter(s => s.id !== id))}
            />
          )}
          {currentView === 'warehouse-detail' && selectedWarehouseId && (
            <WarehouseInventoryDetail
              warehouse={warehouses.find(w => w.id === selectedWarehouseId)!}
              parts={parts.filter(p => p.warehouseId === selectedWarehouseId)}
              machines={machines.filter(m => m.warehouseId === selectedWarehouseId)}
              onAddPart={(p) => addPart({ ...p, warehouseId: selectedWarehouseId })}
              onUpdatePart={updatePart}
              onDeletePart={(id) => setParts(prev => prev.filter(p => p.id !== id))}
              onAddMachine={(m) => addMachine({ ...m, warehouseId: selectedWarehouseId })}
              onUpdateMachine={updateMachine}
              onDeleteMachine={(id) => setMachines(prev => prev.filter(m => m.id !== id))}
              onBack={() => setCurrentView('warehouses')}
              currentUser={user}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
