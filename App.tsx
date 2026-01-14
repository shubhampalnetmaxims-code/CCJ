
import React, { useState, useCallback } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WarehouseList from './components/WarehouseList';
import StaffList from './components/StaffList';
import MobileDashboard from './components/MobileDashboard';
import MobileFrame from './components/MobileFrame';
import { User, View, Warehouse, StaffMember } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('warehouses');
  const [isEmulatingMobile, setIsEmulatingMobile] = useState(false);
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: '1',
      name: 'Global Hub Alpha',
      location: 'New Jersey, USA',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Pacific Logistics',
      location: 'Oakland, CA',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Northeast Depot',
      location: 'Buffalo, NY',
      status: 'Full',
      createdAt: new Date().toISOString()
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
    }
  ]);

  const handleLogin = (u: User) => {
    setUser(u);
    // If we are emulating, we stay in the emulation but show the portal
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
    // If we were emulating a staff role, stay in mobile frame but show login
    if (!isEmulatingMobile) {
      setCurrentView('warehouses');
    }
  };

  const handleStartEmulation = () => {
    setUser(null); // Log out current admin to show mobile login
    setIsEmulatingMobile(true);
  };

  const handleExitEmulation = () => {
    setIsEmulatingMobile(false);
    setUser(null); // Reset to main login
  };

  // -------------------------------------------------------------------------
  // MOBILE EMULATION MODE
  // -------------------------------------------------------------------------
  if (isEmulatingMobile) {
    return (
      <MobileFrame onExit={handleExitEmulation}>
        {!user ? (
          <Login 
            onLogin={handleLogin} 
            staffMembers={staffMembers}
            isMobileView={true}
          />
        ) : (
          <MobileDashboard 
            user={user} 
            warehouses={warehouses} 
            onLogout={handleLogout} 
          />
        )}
      </MobileFrame>
    );
  }

  // -------------------------------------------------------------------------
  // MAIN ADMIN DASHBOARD
  // -------------------------------------------------------------------------
  if (!user) {
    return (
      <Login 
        onLogin={handleLogin} 
        staffMembers={staffMembers}
        onMobileClick={handleStartEmulation} 
        onInventoryMobileClick={handleStartEmulation}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentView={currentView} setView={setCurrentView} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          user={user} 
          onMobileClick={handleStartEmulation} 
          onInventoryMobileClick={handleStartEmulation}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {currentView === 'warehouses' && (
            <WarehouseList 
              warehouses={warehouses} 
              onAdd={(w) => setWarehouses(prev => [{...w, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString()}, ...prev])} 
              onUpdate={(updated) => setWarehouses(prev => prev.map(w => w.id === updated.id ? updated : w))}
              onDelete={(id) => setWarehouses(current => current.filter(w => w.id !== id))}
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
        </main>
      </div>
    </div>
  );
};

export default App;
