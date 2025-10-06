import React from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  UserCheck,
  FileText,
  Clock,
  BarChart3,
  Settings,
  List
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { t, isRTL } = useLanguage();
  const { hasPermission } = useAuth();

  const allMenuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, permission: null },
    { id: 'inventory', label: t('inventory'), icon: Package, permission: 'canAccessInventory' },
    { id: 'products-list', label: t('productsList'), icon: List, permission: 'canAccessInventory' },
    { id: 'suppliers', label: t('suppliers'), icon: Users, permission: 'canAccessSuppliers' },
    { id: 'clients', label: t('clients'), icon: UserCheck, permission: 'canAccessClients' },
    { id: 'documents', label: t('documents'), icon: FileText, permission: 'canAccessDocuments' },
    { id: 'waiting', label: t('waitingList'), icon: Clock, permission: 'canAccessWaiting' },
    { id: 'reports', label: t('reports'), icon: BarChart3, permission: 'canAccessReports' },
    { id: 'settings', label: t('settings'), icon: Settings, permission: 'canAccessSettings' }
  ];

  const menuItems = allMenuItems.filter(item => 
    !item.permission || hasPermission(item.permission as any)
  );

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg h-full border-r border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          {t('companyName')}
        </h1>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-3 border-blue-600'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${isRTL ? 'flex-row-reverse text-right border-l-3 border-r-0' : ''}`}
            >
              <Icon className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;