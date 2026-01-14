
import React, { useState } from 'react';
import { Warehouse } from '../types';
import WarehouseForm from './WarehouseForm';
import ConfirmModal from './ConfirmModal';

interface WarehouseListProps {
  warehouses: Warehouse[];
  onAdd: (w: Omit<Warehouse, 'id' | 'createdAt'>) => void;
  onUpdate: (w: Warehouse) => void;
  onDelete: (id: string) => void;
}

const WarehouseList: React.FC<WarehouseListProps> = ({ warehouses, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (w: Warehouse) => {
    setEditingWarehouse(w);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setEditingWarehouse(null);
    setIsFormOpen(!isFormOpen);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingWarehouse(null);
  };

  const initiateDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const warehouseToDelete = warehouses.find(w => w.id === deleteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Inventory</h1>
          <p className="text-gray-500 text-sm">Monitor and manage facilities in your network</p>
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isFormOpen && !editingWarehouse ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
          </svg>
          {isFormOpen && !editingWarehouse ? 'Cancel' : 'Register New Warehouse'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={editingWarehouse ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"} />
            </svg>
            {editingWarehouse ? 'Edit Warehouse Details' : 'Registration Form'}
          </h2>
          <WarehouseForm 
            initialData={editingWarehouse || undefined}
            onAdd={(w) => {
              onAdd(w);
              handleCloseForm();
            }} 
            onUpdate={(w) => {
              onUpdate(w);
              handleCloseForm();
            }}
            onCancel={handleCloseForm}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Facility Name</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Location</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {warehouses.map((w) => (
                <tr key={w.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{w.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 uppercase font-medium">UID: {w.id}</div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{w.location}</div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                      w.status === 'Active' ? 'bg-green-100 text-green-700' :
                      w.status === 'Full' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      type="button"
                      onClick={() => handleEdit(w)}
                      className="text-indigo-500 hover:text-indigo-700 font-bold transition-colors"
                    >
                      Edit
                    </button>
                    <span className="mx-3 text-gray-200">|</span>
                    <button 
                      type="button"
                      onClick={() => initiateDelete(w.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {warehouses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-gray-500 italic font-medium">
                    No warehouses registered in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!deleteId}
        title="Delete Warehouse"
        message={`Are you sure you want to permanently delete "${warehouseToDelete?.name}"? This will also remove it from any staff member assignments.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default WarehouseList;
