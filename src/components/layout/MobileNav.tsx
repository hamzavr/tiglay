import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  UserCheck,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'pos', label: t('pos'), icon: ShoppingCart },
    { id: 'inventory', label: t('inventory'), icon: Package },
    { id: 'suppliers', label: t('suppliers'), icon: Users },
    { id: 'clients', label: t('clients'), icon: UserCheck },
    { id: 'documents', label: t('documents'), icon: FileText },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    { id: 'settings', label: t('settings'), icon: Settings }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-1 md:hidden">
      <div className="flex justify-around">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center px-2 py-2 min-w-0 transition-colors ${
                activeTab === item.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1 truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;