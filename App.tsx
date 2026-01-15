
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
    // Warehouse 1
    { id: 'p1-1', warehouseId: '1', name: 'PCB Mainboard V2', partId: 'PART-001', quantity: 15, threshold: 5, notes: 'Standard inventory', intakeBy: 'Sarah Warehouse', barcodesScanned: true, countVerified: true, countUpdated: true },
    { id: 'p1-2', warehouseId: '1', name: 'Coin Acceptor Mech', partId: 'PART-002', quantity: 3, threshold: 10, notes: 'Low stock - reorder pending', intakeBy: 'Sarah Warehouse', damageLogged: false, barcodesScanned: true },
    { id: 'p1-3', warehouseId: '1', name: 'Bill Validator Gen3', partId: 'BV-300', quantity: 12, threshold: 4, notes: 'Batch received Friday', intakeBy: 'Sarah Warehouse', countVerified: true, countUpdated: true },
    { id: 'p1-4', warehouseId: '1', name: 'Power Supply 500W', partId: 'PSU-500', quantity: 8, threshold: 2, intakeBy: 'John Inventory' },
    { id: 'p1-5', warehouseId: '1', name: 'Security Lock Set', partId: 'LOCK-01', quantity: 25, threshold: 10, notes: 'Bulk shipment', intakeBy: 'John Inventory' },
    
    // Warehouse 2
    { id: 'p2-1', warehouseId: '2', name: 'Display Panel 4K', partId: 'DISP-09', quantity: 8, threshold: 2, notes: 'Fragile handling required', intakeBy: 'John Inventory', barcodesScanned: true, countVerified: true },
    { id: 'p2-2', warehouseId: '2', name: 'Touch Overlay 27"', partId: 'TO-27', quantity: 5, threshold: 2, intakeBy: 'John Inventory' },
    { id: 'p2-3', warehouseId: '2', name: 'RGB LED Controller', partId: 'RGB-CTRL', quantity: 20, threshold: 5, notes: 'Universal compatibility', intakeBy: 'John Inventory' },
    { id: 'p2-4', warehouseId: '2', name: 'Audio Amp V4', partId: 'AMP-04', quantity: 10, threshold: 3, intakeBy: 'John Inventory' },
    { id: 'p2-5', warehouseId: '2', name: 'Internal Wi-Fi Card', partId: 'WIFI-MOD', quantity: 18, threshold: 5, intakeBy: 'John Inventory' },

    // Warehouse 3
    { id: 'p3-1', warehouseId: '3', name: 'Thermal Printer', partId: 'TP-500', quantity: 22, threshold: 5, notes: 'Standard fit for ATMs', intakeBy: 'Sarah Warehouse', countVerified: true, countUpdated: true },
    { id: 'p3-2', warehouseId: '3', name: 'Hopper Motor', partId: 'MOT-HP', quantity: 4, threshold: 5, notes: 'Critical item - running low', intakeBy: 'Sarah Warehouse' },
    { id: 'p3-3', warehouseId: '3', name: 'EMV Card Reader', partId: 'CR-EMV', quantity: 14, threshold: 4, intakeBy: 'Sarah Warehouse' },
    { id: 'p3-4', warehouseId: '3', name: 'Cooling Fan 120mm', partId: 'FAN-120', quantity: 40, threshold: 10, intakeBy: 'Sarah Warehouse' },
    { id: 'p3-5', warehouseId: '3', name: 'NVRAM Module', partId: 'NV-RAM', quantity: 9, threshold: 3, notes: 'Sensitive electronics', intakeBy: 'Sarah Warehouse' }
  ]);

  const [machines, setMachines] = useState<Machine[]>([
    // Warehouse 1
    { 
      id: 'm1-1', warehouseId: '1', name: 'MegaSkill Deluxe', serialNumber: 'SN-99821', class: 'Skill', condition: 'New', intakeType: 'Intake',
      inspected: true, serialReadable: true, bootsToMenu: true, photosTaken: true, storedCorrectly: true,
      intakeBy: 'Sarah Warehouse', intakeDate: new Date(Date.now() - 86400000 * 5).toISOString(), notes: 'Brand new unit, clear inspection.'
    },
    { 
      id: 'm1-2', warehouseId: '1', name: 'CryptoATM 500', serialNumber: 'SN-11200', class: 'ATM', condition: 'Used', intakeType: 'Return',
      serialMatch: true, inspected: true, photosTaken: true, stockAdjusted: true, returnStatus: 'Repair',
      intakeBy: 'John Inventory', intakeDate: new Date(Date.now() - 86400000).toISOString(), notes: 'Returned from venue with screen flicker.'
    },
    { 
      id: 'm1-3', warehouseId: '1', name: 'SkillShot 3000', serialNumber: 'SN-SH30-1', class: 'Skill', condition: 'New', intakeType: 'Intake',
      inspected: true, serialReadable: true, bootsToMenu: true, photosTaken: true, storedCorrectly: true,
      intakeBy: 'Sarah Warehouse', intakeDate: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    { 
      id: 'm1-4', warehouseId: '1', name: 'JukeBox Pro', serialNumber: 'SN-JP-99', class: 'Jukebox', condition: 'New', intakeType: 'Intake',
      inspected: true, serialReadable: true, bootsToMenu: true, photosTaken: true, storedCorrectly: true,
      intakeBy: 'Sarah Warehouse', intakeDate: new Date(Date.now() - 86400000 * 8).toISOString()
    },
    { 
      id: 'm1-5', warehouseId: '1', name: 'ATM Mini-Vault', serialNumber: 'SN-AV-001', class: 'ATM', condition: 'Used', intakeType: 'Return',
      serialMatch: true, inspected: false, photosTaken: true, stockAdjusted: true, returnStatus: 'Retire',
      intakeBy: 'John Inventory', intakeDate: new Date(Date.now() - 86400000 * 3).toISOString(), notes: 'Heavily damaged during transport, parts only.'
    },

    // Warehouse 2
    { 
      id: 'm2-1', warehouseId: '2', name: 'VegasSlots X10', serialNumber: 'SN-VS-101', class: 'Skill', condition: 'New', intakeType: 'Intake',
      inspected: true, serialReadable: true, bootsToMenu: true, photosTaken: true, storedCorrectly: true,
      intakeBy: 'John Inventory', intakeDate: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    { 
      id: 'm2-2', warehouseId: '2', name: 'NeoATM Future', serialNumber: 'SN-NEO-55', class: 'ATM', condition: 'New', intakeType: 'Intake',
      inspected: true, serialReadable: true, bootsToMenu: true, photosTaken: true, storedCorrectly: true,
      intakeBy: 'John Inventory', intakeDate: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    { 
      id: 'm2-3', warehouseId: '2', name: 'RetroJuke Classic', serialNumber: 'SN-RJ-77', class: 'Jukebox', condition: 'Used', intakeType: 'Return',
      serialMatch: true, inspected: true, photosTaken: true, stockAdjusted: true, returnStatus: 'Re-deploy',
      intakeBy: 'John Inventory', intakeDate: new Date(Date.now() - 86400000 * 2).toISOString(), notes: 'Routine swap, unit is fully functional.'
    },
    { 
      id: 'm2-4', warehouseId: '2', name: 'SkillMaster 2', serialNumber: 'SN-SM2-12', class: 'Skill', condition: 'New', intakeType: 'Intake',
      inspected: true, serialReadable: true, bootsToMenu: true, photosTaken: true, storedCorrectly: true,
      intakeBy: 'John Inventory', intakeDate: new Date(Date.now() - 86400000 * 15).toISOString()
    },
    { 
      id: 'm2-5', warehouseId: '2', name: 'CoinPusher Plus', serialNumber: 'SN-CPP-01', class: 'Skill', condition: 'Damaged', intakeType: 'Return',
      serialMatch: true, inspected: true, photosTaken: true, stockAdjusted: true, returnStatus: 'Repair',
      intakeBy: 'John Inventory', intakeDate: new Date(Date.now() - 86400000 * 1).toISOString(), notes: 'Glass breakage during relocation.'
    },

    // Warehouse 3
    { 
      id: 'm3-1', warehouseId: '3', name: 'AlphaJuke Elite', serialNumber: 'SN-AJE-00', class: 'Jukebox', condition: 'New', intakeType: 'Intake',
      inspected: true, serialReadable: true, bootsToMenu: true, photosTaken: true, storedCorrectly: true,
      intakeBy: 'Sarah Warehouse', intakeDate: new Date(Date.now() - 86400000 * 20).toISOString()
    },
    { 
      id: 'm3-2', warehouseId: '3', name: 'BetaATM Secure', serialNumber: 'SN-BAS-22', class: 'ATM', condition: 'New', intakeType: 'Intake',
      inspected: true, serialReadable: true, bootsToMenu: true, photosTaken: true, storedCorrectly: true,
      intakeBy: 'Sarah Warehouse', intakeDate: new Date(Date.now() - 86400000 * 12).toISOString()
    },
    { 
      id: 'm3-3', warehouseId: '3', name: 'GammaSkill Pro', serialNumber: 'SN-GSP-88', class: 'Skill', condition: 'New', intakeType: 'Intake',
      inspected: true, serialReadable: true, bootsToMenu: true, photosTaken: true, storedCorrectly: true,
      intakeBy: 'Sarah Warehouse', intakeDate: new Date(Date.now() - 86400000 * 6).toISOString()
    },
    { 
      id: 'm3-4', warehouseId: '3', name: 'DeltaPusher XL', serialNumber: 'SN-DPXL-05', class: 'Skill', condition: 'Used', intakeType: 'Return',
      serialMatch: true, inspected: true, photosTaken: true, stockAdjusted: true, returnStatus: 'Re-deploy',
      intakeBy: 'Sarah Warehouse', intakeDate: new Date(Date.now() - 86400000 * 2).toISOString(), notes: 'Excellent condition after 1 year in field.'
    },
    { 
      id: 'm3-5', warehouseId: '3', name: 'EpsilonSlot Lite', serialNumber: 'SN-ESL-14', class: 'Skill', condition: 'Damaged', intakeType: 'Return',
      serialMatch: false, inspected: true, photosTaken: true, stockAdjusted: true, returnStatus: 'Repair',
      intakeBy: 'Sarah Warehouse', intakeDate: new Date(Date.now() - 86400000 * 5).toISOString(), notes: 'Serial number tag missing but identified via internal software.'
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
    setUser(u);
    // All mobile roles go to emulation
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
        onInstallerClick={() => handleStartEmulation('Installer')}
      />
    );
  }

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);
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
          {currentView === 'warehouse-detail' && selectedWarehouse && (
            <WarehouseInventoryDetail
              warehouse={selectedWarehouse}
              parts={parts.filter(p => p.warehouseId === selectedWarehouse.id)}
              machines={machines.filter(m => m.warehouseId === selectedWarehouse.id)}
              onAddPart={(p) => addPart({ ...p, warehouseId: selectedWarehouse.id })}
              onUpdatePart={updatePart}
              onDeletePart={(id) => setParts(prev => prev.filter(p => p.id !== id))}
              onAddMachine={(m) => addMachine({ ...m, warehouseId: selectedWarehouse.id })}
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
