
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Full';
  createdAt: string;
}

export interface Part {
  id: string;
  warehouseId: string;
  name: string;
  partId: string;
  quantity: number;
  threshold?: number;
  notes?: string;
  // Intake audit fields
  barcodesScanned?: boolean;
  countVerified?: boolean;
  damageLogged?: boolean;
  locationCorrect?: string;
  countUpdated?: boolean;
  intakeBy?: string;
  intakeDate?: string;
}

export interface Machine {
  id: string;
  warehouseId: string;
  name: string;
  serialNumber: string;
  class: 'Skill' | 'ATM' | 'Jukebox';
  condition: 'New' | 'Used' | 'Damaged';
  intakeType?: 'Intake' | 'Return';
  notes?: string;
  // Common and Intake checklist fields
  inspected?: boolean;
  serialReadable?: boolean;
  bootsToMenu?: boolean;
  photosTaken?: boolean;
  storedCorrectly?: boolean;
  // Return specific fields
  serialMatch?: boolean;
  stockAdjusted?: boolean;
  returnStatus?: 'Re-deploy' | 'Repair' | 'Retire';
  // History fields
  intakeBy?: string;
  intakeDate?: string;
}

export type WorkOrderStatus = 'New' | 'Pending' | 'Accepted' | 'Completed';
export type Priority = 'Low' | 'Medium' | 'High';

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  assignedToId?: string; // StaffMember ID (Warehouse Manager)
  warehouseId: string;
  createdBy: string;
  createdAt: string;
  priority: Priority;
  history?: string[]; // Log of actions like associated transfers
}

export type StaffRole = 'Warehouse Manager' | 'Inventory Manager' | 'Installer' | 'Site Administrator';

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
  id?: string;
  email: string;
  role: string;
  name: string;
  assignedWarehouseIds?: string[];
}

export type View = 'warehouses' | 'staff' | 'global-inventory' | 'inventory-portal' | 'warehouse-detail';
