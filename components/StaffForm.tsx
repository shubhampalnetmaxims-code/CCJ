
import React, { useState, useEffect } from 'react';
import { StaffMember, StaffRole, Warehouse } from '../types';

interface StaffFormProps {
  warehouses: Warehouse[];
  initialData?: StaffMember;
  onAdd: (s: Omit<StaffMember, 'id' | 'createdAt'>) => void;
  onUpdate: (s: StaffMember) => void;
  onCancel: () => void;
}

const StaffForm: React.FC<StaffFormProps> = ({ warehouses, initialData, onAdd, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState<Omit<StaffMember, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    contact: '',
    password: '',
    role: 'Installer',
    assignedWarehouseIds: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        contact: initialData.contact,
        password: initialData.password || '',
        role: initialData.role,
        assignedWarehouseIds: initialData.assignedWarehouseIds
      });
    }
  }, [initialData]);

  const handleRoleChange = (role: StaffRole) => {
    setFormData(prev => ({
      ...prev,
      role,
      assignedWarehouseIds: [] // Reset selection on role change to ensure intentional assignment
    }));
  };

  const toggleWarehouseSelection = (id: string) => {
    setFormData(prev => {
      let nextIds = [...prev.assignedWarehouseIds];
      
      // All roles now support multiple warehouse selection
      if (nextIds.includes(id)) {
        nextIds = nextIds.filter(i => i !== id);
      } else {
        nextIds.push(id);
      }
      
      return { ...prev, assignedWarehouseIds: nextIds };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      onUpdate({ ...initialData, ...formData });
    } else {
      onAdd(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.name}
            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.email}
            onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
            placeholder="john@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Number</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.contact}
            onChange={(e) => setFormData(p => ({ ...p, contact: e.target.value }))}
            placeholder="+1 234 567 890"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
          <input
            type="password"
            required={!initialData}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.password}
            onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
            placeholder="••••••••"
          />
        </div>
        
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">User Type / Role</label>
          <div className="flex flex-wrap gap-2">
            {(['Warehouse Manager', 'Inventory Manager', 'Installer'] as StaffRole[]).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleChange(role)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                  formData.role === role 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                    : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Assign Warehouses (Select Multiple)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-100 rounded-xl bg-gray-50/50">
            {warehouses.map(w => (
              <button
                key={w.id}
                type="button"
                onClick={() => toggleWarehouseSelection(w.id)}
                className={`flex items-center gap-2 p-3 rounded-lg text-sm text-left transition-all border ${
                  formData.assignedWarehouseIds.includes(w.id)
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                    : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                  formData.assignedWarehouseIds.includes(w.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                }`}>
                  {formData.assignedWarehouseIds.includes(w.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {w.name}
              </button>
            ))}
            {warehouses.length === 0 && (
              <div className="col-span-2 p-4 text-center text-xs text-gray-400">
                Please add warehouses first to assign them to staff.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white border border-gray-200 text-gray-600 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all active:scale-[0.99]"
        >
          Discard
        </button>
        <button
          type="submit"
          className="flex-[2] bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.99] shadow-indigo-100"
        >
          {initialData ? 'Update User' : 'Confirm User Setup'}
        </button>
      </div>
    </form>
  );
};

export default StaffForm;
