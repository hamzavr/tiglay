export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  createdAt?: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'cashier';
}

export interface UpdateUserData {
  id: string;
  username?: string;
  email?: string;
  role?: 'admin' | 'manager' | 'cashier';
  isActive?: boolean;
  password?: string;
}

export interface UserPermissions {
  canAccessInventory: boolean;
  canAccessSuppliers: boolean;
  canAccessClients: boolean;
  canAccessDocuments: boolean;
  canAccessWaiting: boolean;
  canAccessReports: boolean;
  canAccessSettings: boolean;
  canManageUsers: boolean;
}

export const ROLE_PERMISSIONS: Record<string, UserPermissions> = {
  admin: {
    canAccessInventory: true,
    canAccessSuppliers: true,
    canAccessClients: true,
    canAccessDocuments: true,
    canAccessWaiting: true,
    canAccessReports: true,
    canAccessSettings: true,
    canManageUsers: true,
  },
  manager: {
    canAccessInventory: true,
    canAccessSuppliers: true,
    canAccessClients: true,
    canAccessDocuments: true,
    canAccessWaiting: true,
    canAccessReports: true,
    canAccessSettings: true,
    canManageUsers: false,
  },
  cashier: {
    canAccessInventory: false,
    canAccessSuppliers: false,
    canAccessClients: true,
    canAccessDocuments: true,
    canAccessWaiting: true,
    canAccessReports: false,
    canAccessSettings: false,
    canManageUsers: false,
  },
};
