
import React, { useState, useEffect } from 'react';
import { Warehouse } from '../types';

interface WarehouseFormProps {
  initialData?: Warehouse;
  onAdd: (w: Omit<Warehouse, 'id' | 'createdAt'>) => void;
  onUpdate: (w: Warehouse) => void;
  onCancel: () => void;
}

const WarehouseForm: React.FC<WarehouseFormProps> = ({ initialData, onAdd, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Warehouse, 'id' | 'createdAt'>>({
    name: '',
    location: '',
    status: 'Active'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        location: initialData.location,
        status: initialData.status
      });
    } else {
      setFormData({
        name: '',
        location: '',
        status: 'Active'
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      onUpdate({
        ...initialData,
        ...formData
      });
    } else {
      onAdd(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Facility Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.name}
            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Central Distribution Hub"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Location Address</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.location}
            onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
            placeholder="e.g. 101 Logistics Ave, Chicago, IL"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Operational Status</label>
          <select
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer transition-all"
            value={formData.status}
            onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Full">At Capacity</option>
          </select>
        </div>
      </div>
      
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white border border-gray-200 text-gray-600 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <button
          type="submit"
          className="flex-[2] bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.99] shadow-indigo-100"
        >
          {initialData ? 'Save Changes' : 'Confirm Registry'}
        </button>
      </div>
    </form>
  );
};

export default WarehouseForm;
