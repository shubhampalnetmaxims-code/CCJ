
import React from 'react';
import { User, Warehouse } from '../types';

interface InventoryPortalProps {
  user: User;
  warehouses: Warehouse[];
  onLogout: () => void;
}

const InventoryPortal: React.FC<InventoryPortalProps> = ({ user, warehouses, onLogout }) => {
  const assignedWarehouses = warehouses.filter(w => 
    user.assignedWarehouseIds?.includes(w.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">Inventory Portal</h1>
            <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mt-1">Authorized View</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{user.name}</p>
            <button 
              onClick={onLogout}
              className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-white shadow-sm">
            <span className="text-emerald-700 font-bold uppercase">{user.name.charAt(0)}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900">Assigned Facilities</h2>
          <p className="text-gray-500 mt-1 font-medium">You have access to {assignedWarehouses.length} warehouse{assignedWarehouses.length !== 1 ? 's' : ''}</p>
        </div>

        {assignedWarehouses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedWarehouses.map(w => (
              <div key={w.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${
                    w.status === 'Active' ? 'bg-green-50 text-green-600' :
                    w.status === 'Full' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-600'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                    w.status === 'Active' ? 'bg-green-100 text-green-700' :
                    w.status === 'Full' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {w.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">{w.name}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {w.location}
                </div>

                <button className="w-full bg-gray-50 text-gray-600 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition-all active:scale-[0.98]">
                  Open Inventory Management
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">No Warehouses Assigned</h3>
            <p className="text-gray-400 max-w-xs mx-auto mt-2">Please contact the system administrator to assign facilities to your account.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default InventoryPortal;
