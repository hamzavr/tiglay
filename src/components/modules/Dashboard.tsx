import React from 'react';
import { useEffect } from 'react';
import { Package, Users, UserCheck, TrendingUp, AlertTriangle, Clock, ArrowRight, CheckCircle, Circle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { salesAPI, productsAPI, suppliersAPI, clientsAPI, documentsAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import StatsCard from '../ui/StatsCard';
import Card from '../ui/Card';

const Dashboard: React.FC = () => {
  const { t, isRTL } = useLanguage();
  
  const { data: salesStats, execute: fetchSalesStats } = useApi(salesAPI.getStats);
  const { data: products, execute: fetchProducts } = useApi(productsAPI.getAll);
  const { data: suppliers, execute: fetchSuppliers } = useApi(suppliersAPI.getAll);
  const { data: clients, execute: fetchClients } = useApi(clientsAPI.getAll);
  const { data: workflowStats, execute: fetchWorkflowStats } = useApi(documentsAPI.getWorkflowStats);

  useEffect(() => {
    fetchSalesStats();
    fetchProducts({ lowStock: true });
    fetchSuppliers();
    fetchClients();
    fetchWorkflowStats();
  }, []);

  const workflowSteps = [
    { id: 1, name: t('purchaseOrder'), status: 'completed', count: workflowStats?.purchaseOrders || 0 },
    { id: 2, name: t('goodsReception'), status: 'completed', count: workflowStats?.receptionSlips || 0 },
    { id: 3, name: t('stockIn'), status: 'completed', count: workflowStats?.stockEntries || 0 },
    { id: 4, name: t('salesOrder'), status: 'inProgress', count: workflowStats?.salesOrders || 0 },
    { id: 5, name: t('deliveryNote'), status: 'pending', count: workflowStats?.deliveryNotes || 0 },
    { id: 6, name: t('invoice'), status: 'pending', count: workflowStats?.invoices || 0 }
  ];

  const recentSales = salesStats?.recentSales || [];
  const stockAlerts = products?.filter((p: any) => p.stock <= p.minStock) || [];

  return (
    <div className="space-y-6">
      {/* Workflow Overview */}
      <Card title={t('workflow')}>
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                  step.status === 'completed' 
                    ? 'bg-green-100 border-green-500 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : step.status === 'inProgress'
                    ? 'bg-blue-100 border-blue-500 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{step.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{step.count} {t('documents')}</p>
                </div>
              </div>
              {index < workflowSteps.length - 1 && (
                <ArrowRight className={`w-6 h-6 text-gray-300 dark:text-gray-600 mx-4 ${isRTL ? 'rotate-180' : ''}`} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('todaySales')}
          value={`${salesStats?.todaySales || 0} DH`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          trend={12}
        />
        <StatsCard
          title={t('totalProducts')}
          value={products?.length || 0}
          icon={<Package className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title={t('totalSuppliers')}
          value={suppliers?.length || 0}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />
        <StatsCard
          title={t('totalClients')}
          value={clients?.length || 0}
          icon={<UserCheck className="w-6 h-6" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card title={t('recentSales')} action={
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            {t('viewWorkflow')}
          </button>
        }>
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Sale #{sale.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {sale.Client?.name || 'Walk-in Customer'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">{sale.total} DH</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(sale.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No recent sales
              </p>
            )}
          </div>
        </Card>

        {/* Stock Alerts */}
        <Card title={t('stockAlerts')} action={
          <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
            {t('trackOrder')}
          </button>
        }>
          <div className="space-y-3">
            {stockAlerts.map((alert, index) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('lowStock')}</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-bold rounded bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                  {alert.stock}
                </span>
              </div>
            ))}
            {stockAlerts.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No stock alerts
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;