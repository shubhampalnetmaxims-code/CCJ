
import React, { useState, useCallback } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WarehouseList from './components/WarehouseList';
import StaffList from './components/StaffList';
import MobileDashboard from './components/MobileDashboard';
import MobileFrame from './components/MobileFrame';
import WarehouseInventoryDetail from './components/WarehouseInventoryDetail';
import { User, View, Warehouse, StaffMember, Part, Machine, StaffRole } from './types';

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

  const [parts, setParts] = useState<Part[]>([
    { id: 'p1', warehouseId: '1', name: 'PCB Mainboard V2', partId: 'PART-001', quantity: 15, threshold: 5 },
    { id: 'p2', warehouseId: '1', name: 'Coin Acceptor Mech', partId: 'PART-002', quantity: 3, threshold: 10 }
  ]);

  const [machines, setMachines] = useState<Machine[]>([
    { id: 'm1', warehouseId: '1', name: 'MegaSkill Deluxe', serialNumber: 'SN-99821', class: 'Skill', condition: 'New' },
    { id: 'm2', warehouseId: '1', name: 'CryptoATM 500', serialNumber: 'SN-11200', class: 'ATM', condition: 'Used' }
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
      assignedWarehouseIds: ['1'],
      createdAt: new Date().toISOString()
    }
  ]);

  const handleLogin = (u: User) => {
    setUser(u);
    if (u.role !== 'Site Administrator') {
      setIsEmulatingMobile(true);
      setCurrentView('inventory-portal');
    } else {
      setIsEmulatingMobile(false);
      setCurrentView('warehouses');
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (!isEmulatingMobile) setCurrentView('warehouses');
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

  // Inventory Handlers
  const addPart = (p: Omit<Part, 'id'>) => setParts(prev => [...prev, { ...p, id: Math.random().toString(36).substr(2, 9) }]);
  const updatePart = (p: Part) => setParts(prev => prev.map(item => item.id === p.id ? p : item));
  const deletePart = (id: string) => setParts(prev => prev.filter(p => p.id !== id));
  
  const addMachine = (m: Omit<Machine, 'id'>) => setMachines(prev => [...prev, { ...m, id: Math.random().toString(36).substr(2, 9) }]);
  const updateMachine = (m: Machine) => setMachines(prev => prev.map(item => item.id === m.id ? m : item));
  const deleteMachine = (id: string) => setMachines(prev => prev.filter(m => m.id !== id));

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
            onUpdatePart={updatePart}
            onAddPart={addPart}
            onAddMachine={addMachine}
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
      />
    );
  }

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentView={currentView} setView={setCurrentView} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          user={user} 
          onMobileClick={() => handleStartEmulation('Warehouse Manager')} 
          onInventoryMobileClick={() => handleStartEmulation('Inventory Manager')}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {currentView === 'warehouses' && (
            <WarehouseList 
              warehouses={warehouses} 
              onAdd={(w) => setWarehouses(prev => [{...w, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString()}, ...prev])} 
              onUpdate={(updated) => setWarehouses(prev => prev.map(w => w.id === updated.id ? updated : w))}
              onDelete={(id) => setWarehouses(current => current.filter(w => w.id !== id))}
              onWarehouseClick={handleWarehouseClick}
            />
          )}
          {currentView === 'staff' && (
            <StaffList 
              staffMembers={staffMembers}
              warehouses={warehouses}
              onAdd={(s) => setStaffMembers(prev => [{...s, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString()}, ...prev])}
              onUpdate={(updated) => setStaffMembers(prev => prev.map(s => s.id === updated.id ? updated : s))}
              onDelete={(id) => setStaffMembers(prev => prev.filter(s => s.id !== id))}
            />
          )}
          {currentView === 'warehouse-detail' && selectedWarehouse && (
            <WarehouseInventoryDetail
              warehouse={selectedWarehouse}
              parts={parts.filter(p => p.warehouseId === selectedWarehouse.id)}
              machines={machines.filter(m => m.warehouseId === selectedWarehouse.id)}
              onAddPart={addPart}
              onUpdatePart={updatePart}
              onDeletePart={deletePart}
              onAddMachine={addMachine}
              onUpdateMachine={updateMachine}
              onDeleteMachine={deleteMachine}
              onBack={() => setCurrentView('warehouses')}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
