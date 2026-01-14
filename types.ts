
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Full';
  createdAt: string;
}

export type StaffRole = 'Warehouse Manager' | 'Inventory Manager' | 'Installer';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  contact: string;
  password?: string;
  role: StaffRole;
  assignedWarehouseIds: string[];
  createdAt: string;
}

export interface User {
  email: string;
  role: string;
  name: string;
  assignedWarehouseIds?: string[]; // Specifically for Staff roles
}

export type View = 'warehouses' | 'staff' | 'mobile' | 'inventory-mobile' | 'inventory-portal';
