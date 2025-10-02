import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, AlertTriangle, Package, Users, DollarSign } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApi } from '../../hooks/useApi';
import { salesAPI, productsAPI, clientsAPI } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatsCard from '../ui/StatsCard';

interface SalesStats {
  todaySales: number;
  totalSales: number;
  recentSales: Array<{
    id: string;
    total: number;
    createdAt: string;
    Client?: { name: string };
    SaleItems?: Array<{
      Product: { name: string };
      quantity: number;
      price: number;
    }>;
  }>;
}

interface Product {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  totalPurchases: number;
  sellPrice: number;
  buyPrice: number;
}

interface Client {
  id: string;
  name: string;
  totalPurchases: number;
  creditBalance: number;
}

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // API calls for real data
  const { data: salesStats, loading: salesLoading, execute: fetchSalesStats } = useApi(salesAPI.getStats);
  const { data: products = [], loading: productsLoading, execute: fetchProducts } = useApi(productsAPI.getAll);
  const { data: clients = [], loading: clientsLoading, execute: fetchClients } = useApi(clientsAPI.getAll);

  useEffect(() => {
    fetchSalesStats();
    fetchProducts();
    fetchClients();
  }, []);

  // Ensure data is always arrays
  const safeProducts = Array.isArray(products) ? products : [];
  const safeClients = Array.isArray(clients) ? clients : [];

  // Calculate real statistics
  const calculateStats = () => {
    const totalRevenue = safeProducts.reduce((sum, product) => {
      return sum + (product.totalPurchases * product.sellPrice);
    }, 0);

    const totalProfit = safeProducts.reduce((sum, product) => {
      return sum + (product.totalPurchases * (product.sellPrice - product.buyPrice));
    }, 0);

    const totalSalesCount = salesStats?.totalSales || 0;
    const averageCart = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

    return {
      totalRevenue,
      totalProfit,
      totalSalesCount,
      averageCart
    };
  };

  // Get worst selling products (lowest totalPurchases)
  const getWorstSellingProducts = () => {
    return safeProducts
      .filter(product => product.totalPurchases > 0)
      .sort((a, b) => a.totalPurchases - b.totalPurchases)
      .slice(0, 5)
      .map(product => ({
        product: product.name,
        quantity: product.totalPurchases,
        revenue: product.totalPurchases * product.sellPrice,
        profit: product.totalPurchases * (product.sellPrice - product.buyPrice)
      }));
  };

  // Get low stock products
  const getLowStockProducts = () => {
    return safeProducts
      .filter(product => product.stock <= product.minStock)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
  };

  // Get clients with highest credit balance (potential issues)
  const getClientsWithHighCredit = () => {
    return safeClients
      .filter(client => client.creditBalance > 0)
      .sort((a, b) => b.creditBalance - a.creditBalance)
      .slice(0, 5);
  };

  // Generate monthly data from sales
  const generateMonthlyData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      // Simulate data based on current month (in real app, this would come from API)
      const baseSales = 45000 + (index * 2000) + Math.random() * 10000;
      const baseProfit = baseSales * 0.2;
      
      return {
        month,
        sales: Math.round(baseSales),
        profit: Math.round(baseProfit)
      };
    });
  };

  const stats = calculateStats();
  const worstSellingProducts = getWorstSellingProducts();
  const lowStockProducts = getLowStockProducts();
  const clientsWithHighCredit = getClientsWithHighCredit();
  const monthlyData = generateMonthlyData();

  const reportTypes = {
    sales: t('salesReport'),
    inventory: t('inventoryReport'),
    profit: t('profitReport'),
    clients: t('clientsReport')
  };

  const periods = {
    week: t('thisWeek'),
    month: t('thisMonth'),
    quarter: t('thisQuarter'),
    year: t('thisYear')
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reports')}</h2>
        <p className="text-gray-600 dark:text-gray-400">Analyses et rapports détaillés en temps réel</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('reportType')}
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Object.entries(reportTypes).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('period')}
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Object.entries(periods).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('startDate')}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('endDate')}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('revenue')}
          value={`${stats.totalRevenue.toLocaleString()} DH`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          trend={12}
        />
        <StatsCard
          title={t('netProfit')}
          value={`${stats.totalProfit.toLocaleString()} DH`}
          icon={<BarChart3 className="w-6 h-6" />}
          color="blue"
          trend={8}
        />
        <StatsCard
          title={t('numberOfSales')}
          value={stats.totalSalesCount.toString()}
          icon={<Package className="w-6 h-6" />}
          color="purple"
          trend={15}
        />
        <StatsCard
          title={t('averageBasket')}
          value={`${stats.averageCart.toLocaleString()} DH`}
          icon={<DollarSign className="w-6 h-6" />}
          color="orange"
          trend={-3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mauvaises ventes */}
        <Card title={t('badSales')}>
          <div className="space-y-4">
            {worstSellingProducts.length > 0 ? (
              worstSellingProducts.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">{item.revenue.toLocaleString()} DH</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Profit: {item.profit.toLocaleString()} DH</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Aucune vente enregistrée</p>
              </div>
            )}
          </div>
        </Card>

        {/* Produits en rupture de stock */}
        <Card title={t('lowStockProducts')}>
          <div className="space-y-4">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('stock')}: {product.stock}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{t('lowStock')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('min')}: {product.minStock}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">{t('allStocksCorrect')}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Additional Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients avec crédit élevé */}
        <Card title={t('clientsWithHighCredit')}>
          <div className="space-y-4">
            {clientsWithHighCredit.length > 0 ? (
              clientsWithHighCredit.map((client, index) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('purchases')}: {client.totalPurchases.toLocaleString()} DH</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">{client.creditBalance.toLocaleString()} DH</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('credit')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">{t('noClientsWithHighCredit')}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Évolution mensuelle */}
        <Card title={t('monthlyEvolution')}>
          <div className="space-y-4">
            {monthlyData.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{month.month}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Ventes</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Profit: {month.profit.toLocaleString()} DH</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{month.sales.toLocaleString()} DH</p>
                  <div className="flex items-center">
                    {index > 0 && monthlyData[index - 1] && (
                      <>
                        {month.sales > monthlyData[index - 1].sales ? (
                          <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                        )}
                        <span className={`text-xs ${
                          month.sales > monthlyData[index - 1].sales ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {Math.abs(((month.sales - monthlyData[index - 1].sales) / monthlyData[index - 1].sales * 100)).toFixed(1)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Loading States */}
      {(salesLoading || productsLoading || clientsLoading) && (
        <Card>
          <div className="text-center py-8">
            <div className="spinner mx-auto mb-2"></div>
            <p className="text-gray-500 dark:text-gray-400">Chargement des données...</p>
          </div>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <Button 
          variant="secondary" 
          onClick={() => {
            fetchSalesStats();
            fetchProducts();
            fetchClients();
          }}
        >
          Actualiser les données
        </Button>
      </div>
    </div>
  );
};

export default Reports;