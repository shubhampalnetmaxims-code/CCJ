
import React, { useState } from 'react';
import { StaffMember, Warehouse } from '../types';
import StaffForm from './StaffForm';

interface StaffListProps {
  staffMembers: StaffMember[];
  warehouses: Warehouse[];
  onAdd: (s: Omit<StaffMember, 'id' | 'createdAt'>) => void;
  onUpdate: (s: StaffMember) => void;
  onDelete: (id: string) => void;
}

const StaffList: React.FC<StaffListProps> = ({ staffMembers, warehouses, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const handleEdit = (s: StaffMember) => {
    setEditingStaff(s);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setEditingStaff(null);
    setIsFormOpen(!isFormOpen);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStaff(null);
  };

  const getAssignedNames = (ids: string[]) => {
    if (ids.length === 0) return 'None';
    return warehouses
      .filter(w => ids.includes(w.id))
      .map(w => w.name)
      .join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm">Add and manage warehouse staff accounts</p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isFormOpen && !editingStaff ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
          </svg>
          {isFormOpen && !editingStaff ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {editingStaff ? 'Edit User Details' : 'New User Setup'}
          </h2>
          <StaffForm 
            warehouses={warehouses}
            initialData={editingStaff || undefined}
            onAdd={(s) => {
              onAdd(s);
              handleCloseForm();
            }} 
            onUpdate={(s) => {
              onUpdate(s);
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
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">User Details</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Assignments</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {staffMembers.map((s) => (
                <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.email} | {s.contact}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-indigo-100 text-indigo-700">
                      {s.role}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm text-gray-600 max-w-xs truncate" title={getAssignedNames(s.assignedWarehouseIds)}>
                      {getAssignedNames(s.assignedWarehouseIds)}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(s)}
                      className="text-indigo-500 hover:text-indigo-700 font-bold transition-colors"
                    >
                      Edit
                    </button>
                    <span className="mx-3 text-gray-200">|</span>
                    <button 
                      onClick={() => onDelete(s.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {staffMembers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-gray-500 italic">
                    No users registered in the system yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffList;
