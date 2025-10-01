import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Building, Users, Bell, Globe, Palette, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, CreateUserData, UpdateUserData } from '../../types';
import { userService } from '../../services/userService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import UserManagementModal from './UserManagementModal';

const Settings: React.FC = () => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [users, setUsers] = useState<User[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: 'Droguerie Moderne',
    phone: '+212 5XX XXX XXX',
    address: '123 Rue Mohammed V, Casablanca, Maroc',
    email: 'contact@droguerie.ma',
    taxNumber: '123456789'
  });

  const settingsTabs = [
    { id: 'general', label: t('generalSettings'), icon: SettingsIcon },
    { id: 'company', label: t('companyInfo'), icon: Building },
    ...(hasPermission('canManageUsers') ? [{ id: 'users', label: t('userManagement'), icon: Users }] : []),
    { id: 'notifications', label: t('notifications'), icon: Bell }
  ];

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    if (hasPermission('canManageUsers')) {
      fetchUsers();
    }
  }, [hasPermission]);

  const fetchUsers = async () => {
    try {
      const users = await userService.getUsers();
      setUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setModalMode('create');
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setModalMode('edit');
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await userService.deleteUser(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const handleSaveUser = async (userData: CreateUserData | UpdateUserData) => {
    try {
      if (modalMode === 'create') {
        const newUser = await userService.createUser(userData as CreateUserData);
        setUsers(prev => [...prev, newUser]);
      } else {
        const updatedUser = await userService.updateUser(userData as UpdateUserData);
        setUsers(prev => prev.map(user => 
          user.id === editingUser!.id ? updatedUser : user
        ));
      }
      setIsUserModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const handleEditCompany = () => {
    setIsEditingCompany(true);
  };

  const handleSaveCompany = () => {
    // TODO: Sauvegarder les données de l'entreprise
    console.log('Saving company data:', companyData);
    setIsEditingCompany(false);
  };

  const handleCancelEditCompany = () => {
    setIsEditingCompany(false);
    // Réinitialiser les données si nécessaire
  };

  const handleCompanyDataChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('language')}
          </label>
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                language === 'fr'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Français
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                language === 'ar'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              العربية
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('theme')}
          </label>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-sm text-gray-900 dark:text-white">
              {isDark ? 'Mode sombre' : 'Mode clair'}
            </span>
            <Palette className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('currency')}
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="MAD">Dirham Marocain (MAD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="USD">Dollar US (USD)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('dateFormat')}
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderCompanyInfo = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('companyInformation')}</h3>
        {!isEditingCompany ? (
          <Button variant="primary" onClick={handleEditCompany}>
            {t('edit')}
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={handleCancelEditCompany}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSaveCompany}>
              {t('save')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('name')}
          </label>
          {isEditingCompany ? (
            <input
              type="text"
              value={companyData.name}
              onChange={(e) => handleCompanyDataChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          ) : (
            <div className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
              {companyData.name}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('phone')}
          </label>
          {isEditingCompany ? (
            <input
              type="tel"
              value={companyData.phone}
              onChange={(e) => handleCompanyDataChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          ) : (
            <div className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
              {companyData.phone}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('address')}
          </label>
          {isEditingCompany ? (
            <textarea
              rows={3}
              value={companyData.address}
              onChange={(e) => handleCompanyDataChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          ) : (
            <div className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 min-h-[80px]">
              {companyData.address}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('email')}
          </label>
          {isEditingCompany ? (
            <input
              type="email"
              value={companyData.email}
              onChange={(e) => handleCompanyDataChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          ) : (
            <div className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
              {companyData.email}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('taxNumber')}
          </label>
          {isEditingCompany ? (
            <input
              type="text"
              value={companyData.taxNumber}
              onChange={(e) => handleCompanyDataChange('taxNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          ) : (
            <div className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
              {companyData.taxNumber}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('users')}</h3>
        <Button variant="primary" onClick={handleCreateUser}>
          {t('addUser')}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('username')}</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('email')}</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('role')}</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('lastLogin')}</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('status')}</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{user.username}</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {user.role === 'admin' ? t('administrator') : 
                     user.role === 'manager' ? t('manager') : t('cashier')}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : t('never')}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {user.isActive ? t('active') : t('inactive')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      {t('edit')}
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {t('delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('lowStockAlerts')}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Recevoir des alertes quand le stock est bas</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('expirationAlerts')}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Alertes pour les produits qui expirent bientôt</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'company':
        return renderCompanyInfo();
      case 'users':
        return renderUserManagement();
      case 'notifications':
        return renderNotifications();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings')}</h2>
        <p className="text-gray-600 dark:text-gray-400">Gérer les paramètres du système</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <nav className="space-y-1">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                  >
                    <Icon className={`w-4 h-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card>
            {renderContent()}
          </Card>
        </div>
      </div>

      {/* Modal de gestion des utilisateurs */}
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
        mode={modalMode}
      />
    </div>
  );
};

export default Settings;