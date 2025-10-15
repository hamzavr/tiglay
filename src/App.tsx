import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginForm from './components/auth/LoginForm';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import Dashboard from './components/modules/Dashboard';
import Inventory from './components/modules/Inventory';
import Suppliers from './components/modules/Suppliers';
import Clients from './components/modules/Clients';
import Documents from './components/modules/Documents';
import Reports from './components/modules/Reports';
import Settings from './components/modules/Settings';
import WaitingList from './components/modules/WaitingList';
import ProductsList from './components/modules/ProductsList';

function AppContent() {
  const { user, loading, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Charger l'onglet actif depuis localStorage au démarrage
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab && ['dashboard', 'inventory', 'products-list', 'suppliers', 'clients', 'documents', 'waiting', 'reports', 'settings'].includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  // Sauvegarder l'onglet actif dans localStorage
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Écouter les événements de navigation
  useEffect(() => {
    const handleNavigateToTab = (event: CustomEvent) => {
      const tab = event.detail;
      if (['dashboard', 'inventory', 'products-list', 'suppliers', 'clients', 'documents', 'waiting', 'reports', 'settings'].includes(tab)) {
        setActiveTab(tab);
      }
    };

    window.addEventListener('navigateToTab', handleNavigateToTab as EventListener);
    
    return () => {
      window.removeEventListener('navigateToTab', handleNavigateToTab as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return hasPermission('canAccessInventory') ? <Inventory /> : <div className="text-center py-8"><p className="text-gray-500">Accès refusé</p></div>;
      case 'products-list':
        return hasPermission('canAccessInventory') ? <ProductsList /> : <div className="text-center py-8"><p className="text-gray-500">Accès refusé</p></div>;
      case 'suppliers':
        return hasPermission('canAccessSuppliers') ? <Suppliers /> : <div className="text-center py-8"><p className="text-gray-500">Accès refusé</p></div>;
      case 'clients':
        return hasPermission('canAccessClients') ? <Clients /> : <div className="text-center py-8"><p className="text-gray-500">Accès refusé</p></div>;
      case 'documents':
        return hasPermission('canAccessDocuments') ? <Documents /> : <div className="text-center py-8"><p className="text-gray-500">Accès refusé</p></div>;
      case 'waiting':
        return hasPermission('canAccessWaiting') ? <WaitingList /> : <div className="text-center py-8"><p className="text-gray-500">Accès refusé</p></div>;
      case 'reports':
        return hasPermission('canAccessReports') ? <Reports /> : <div className="text-center py-8"><p className="text-gray-500">Accès refusé</p></div>;
      case 'settings':
        return hasPermission('canAccessSettings') ? <Settings /> : <div className="text-center py-8"><p className="text-gray-500">Accès refusé</p></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Desktop Layout */}
          <div className="hidden md:flex h-screen">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-6">
                {renderContent()}
              </main>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <Header />
            <main className="pb-16 p-4">
              {renderContent()}
            </main>
            <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;