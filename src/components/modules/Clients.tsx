import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Phone, Mail, MapPin, User, X, FileText, Plus as PlusIcon, Trash2 as TrashIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApi } from '../../hooks/useApi';
import { clientsAPI, productsAPI, salesAPI } from '../../services/api';
import documentWorkflowService from '../../services/documentWorkflow';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Client {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

interface ClientFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface SaleItem {
  id: string;
  name: string;
  code: string;
  productId?: string;
  quantity: number;
  unit: string;
  lastUnitPrice?: number;
  unitPrice: number;
  total: number;
}

interface SaleFormData {
  deliveryDate: string;
  notes: string;
  items: SaleItem[];
}

const Clients: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);
  const [saleForm, setSaleForm] = useState<SaleFormData>({
    deliveryDate: '',
    notes: '',
    items: []
  });
  const { data: productList = [], execute: fetchProducts } = useApi(productsAPI.getAll);
  const { data: salesList = [], execute: fetchSales } = useApi(salesAPI.getAll);
  const { execute: createSale } = useApi(salesAPI.create);
  const [openSuggestFor, setOpenSuggestFor] = useState<string | null>(null);
  const [suggestionPosition, setSuggestionPosition] = useState<{top: number, left: number, width: number}>({top: 0, left: 0, width: 0});

  // (Datalist natif utilisé pour les suggestions du champ Nom)

  const { data: clients = [], loading: clientsLoading, execute: fetchClients } = useApi(clientsAPI.getAll);
  const { execute: createClient } = useApi(clientsAPI.create);
  const { execute: updateClient } = useApi(clientsAPI.update);
  const { execute: deleteClient } = useApi(clientsAPI.delete);

  useEffect(() => {
    fetchClients({ search: searchTerm });
  }, [searchTerm]);

  // Ensure clients is always an array
  const safeClients = Array.isArray(clients) ? clients : [];
  const filteredClients = safeClients;

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({ name: '', phone: '', email: '', address: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      address: client.address || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({ name: '', phone: '', email: '', address: '' });
  };

  const openSaleModal = (client: Client) => {
    setSelectedClient(client);
    setSaleForm({
      deliveryDate: '',
      notes: '',
      items: []
    });
    fetchProducts({});
    fetchSales({});
    setShowSaleModal(true);
  };

  const openHistoryModal = (client: Client) => {
    setHistoryClient(client);
    fetchSales({});
    setShowHistoryModal(true);
  };

  const closeSaleModal = () => {
    setShowSaleModal(false);
    setSelectedClient(null);
    setSaleForm({
      deliveryDate: '',
      notes: '',
      items: []
    });
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setHistoryClient(null);
  };

  const addSaleItem = () => {
    const newItem: SaleItem = {
      id: `item-${Date.now()}`,
      name: '',
      code: '',
      productId: undefined,
      quantity: 1,
      unit: 'U',
      lastUnitPrice: undefined,
      unitPrice: 0,
      total: 0
    };
    setSaleForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeSaleItem = (itemId: string) => {
    setSaleForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateSaleItem = (itemId: string, field: keyof SaleItem, value: any) => {
    setSaleForm(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value } as SaleItem;
          // Auto-remplissage quand le nom change
          if (field === 'name') {
            const list: any[] = Array.isArray(productList) ? (productList as any) : [];
            const found = list.find((p) => p.name?.toLowerCase() === String(value).toLowerCase());
            // Chercher dernier prix pour ce client
            const salesArr: any[] = Array.isArray(salesList) ? (salesList as any) : [];
            let lastPrice: number | undefined = undefined;
            let lastCode: string | undefined = undefined;
            if (selectedClient && salesArr.length > 0) {
              // Parcourir ventes par ordre récent
              for (const sale of salesArr) {
                if (sale.Client?.id === selectedClient.id || sale.clientId === selectedClient.id) {
                  const items = Array.isArray(sale.SaleItems) ? sale.SaleItems : sale.items || [];
                  for (const si of items) {
                    const prod = si.Product || si.product;
                    const prodName = prod?.name?.toLowerCase();
                    const prodCode = prod?.code;
                    if (prodName === String(value).toLowerCase()) {
                      if (typeof si.price === 'number') lastPrice = si.price;
                      lastCode = prodCode;
                      break;
                    }
                  }
                  if (lastPrice !== undefined) break;
                }
              }
            }
            if (found) {
              updatedItem.code = lastCode || found.code || updatedItem.code;
              updatedItem.productId = found.id;
              updatedItem.lastUnitPrice = lastPrice !== undefined ? lastPrice : undefined;
            } else {
              updatedItem.lastUnitPrice = undefined;
              updatedItem.productId = undefined;
              const nameStr = String(value || '').trim();
              if (nameStr) {
                const prefix = nameStr.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0,3) || 'PRD';
                const suffix = Math.floor(100 + Math.random()*900).toString();
                updatedItem.code = `${prefix}-${suffix}`;
              }
            }
          }
          // Auto-remplissage quand le code change
          if (field === 'code') {
            const list: any[] = Array.isArray(productList) ? (productList as any) : [];
            const found = list.find((p) => String(p.code || '').toLowerCase() === String(value || '').toLowerCase());
            // Chercher dernier prix pour ce client
            const salesArr: any[] = Array.isArray(salesList) ? (salesList as any) : [];
            let lastPrice: number | undefined = undefined;
            if (selectedClient && salesArr.length > 0 && found) {
              for (const sale of salesArr) {
                if (sale.Client?.id === selectedClient.id || sale.clientId === selectedClient.id) {
                  const items = Array.isArray(sale.SaleItems) ? sale.SaleItems : sale.items || [];
                  for (const si of items) {
                    const prod = si.Product || si.product;
                    const prodCode = prod?.code;
                    if (String(prodCode || '').toLowerCase() === String(value || '').toLowerCase()) {
                      if (typeof si.price === 'number') lastPrice = si.price;
                      break;
                    }
                  }
                  if (lastPrice !== undefined) break;
                }
              }
            }
            if (found) {
              updatedItem.name = found.name || updatedItem.name;
              updatedItem.productId = found.id;
              updatedItem.lastUnitPrice = lastPrice !== undefined ? lastPrice : undefined;
            } else {
              updatedItem.productId = undefined;
              updatedItem.lastUnitPrice = undefined;
            }
          }
          // Recalculer le total
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const getSaleTotal = () => {
    return saleForm.items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Nom et téléphone sont obligatoires !');
      return;
    }

    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
      } else {
        await createClient(formData);
      }
      
      closeModal();
      fetchClients({ search: searchTerm });
    } catch (error: any) {
      alert(`Erreur lors de ${editingClient ? 'la modification' : 'la création'} du client: ${error.message}`);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await deleteClient(clientId);
        fetchClients({ search: searchTerm });
      } catch (error: any) {
        alert('Erreur lors de la suppression du client');
      }
    }
  };

  const handleCreateSale = async () => {
    if (!selectedClient || saleForm.items.length === 0) {
      alert('Veuillez ajouter au moins un produit à la vente');
      return;
    }

    try {
      // Créer la vente avec tous les détails
      // Transformer les items pour l'API backend (id=productId, price, quantity)
      const catalog: any[] = Array.isArray(productList) ? (productList as any) : [];
      const payloadItems = saleForm.items.map((it) => {
        const byCode = catalog.find((p) => String(p.code || '').toLowerCase() === String(it.code || '').toLowerCase());
        const byName = catalog.find((p) => String(p.name || '').toLowerCase() === String((it as any).name || '').toLowerCase());
        const product = byCode || byName;
        return {
          id: it.productId || product?.id,
          quantity: it.quantity,
          price: it.unitPrice,
        };
      });

      // Valider que tous les produits existent pour créer la vente côté backend
      if (payloadItems.some((pi) => !pi.id)) {
        alert('Un ou plusieurs produits sélectionnés n\'existent pas dans le catalogue. Veuillez choisir dans les suggestions.');
        return;
      }

      const saleData = {
        id: `SALE-${Date.now()}`,
        clientId: selectedClient.id,
        total: getSaleTotal(),
        items: payloadItems,
        deliveryDate: saleForm.deliveryDate,
        notes: saleForm.notes
      };

      // Persister la vente côté backend
      await createSale(saleData as any);

      // Rafraîchir la liste des ventes pour que l'historique se mette à jour
      await fetchSales({});

      // Créer automatiquement tous les documents client
      const documents = await documentWorkflowService.createCustomerSaleDocuments(saleData);

      alert(`Vente créée avec succès ! ${documents.length} documents générés automatiquement.`);
      closeSaleModal();
      
    } catch (error) {
      console.error('Erreur lors de la création de la vente:', error);
      alert('Erreur lors de la création de la vente');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('clients')}</h2>
          <p className="text-gray-600 dark:text-gray-400">Gérer vos clients et leurs informations</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openAddModal}>
          Nouveau Client
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          />
        </div>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    client.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {client.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => openEditModal(client)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Modifier le client"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Supprimer le client"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-400`} />
                  {client.phone}
                </div>
                {client.email && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Mail className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-400`} />
                    {client.email}
                  </div>
                )}

      
                <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-400 mt-0.5 flex-shrink-0`} />
                  <span>{client.address || 'Aucune adresse'}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Créé le: {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => openHistoryModal(client)}>
                  Historique
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openSaleModal(client)}
                >
                  Nouvelle Vente
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!clientsLoading && filteredClients.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Aucun client trouvé</p>
          </div>
        </Card>
      )}

      {/* Add/Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingClient ? 'Modifier le client' : 'Nouveau client'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adresse
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={closeModal}>
                  Annuler
                </Button>
                <Button variant="primary" type="submit">
                  {editingClient ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Sales History Modal */}
      {showHistoryModal && historyClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Historique des ventes - {historyClient.name}
              </h3>
              <button
                onClick={closeHistoryModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const allSales: any[] = Array.isArray(salesList) ? (salesList as any) : [];
              const clientId = historyClient.id;
              const clientSales = allSales.filter((s) => s.Client?.id === clientId || s.clientId === clientId);
              if (clientSales.length === 0) {
                return (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    Aucun historique trouvé pour ce client.
                  </div>
                );
              }
              return (
                <div className="space-y-4">
                  {clientSales.map((sale) => {
                    const items: any[] = Array.isArray(sale.SaleItems) ? sale.SaleItems : (Array.isArray(sale.items) ? sale.items : []);
                    const dateStr = sale.createdAt ? new Date(sale.createdAt).toLocaleString('fr-FR') : (sale.date ? new Date(sale.date).toLocaleString('fr-FR') : '—');
                    const total = typeof sale.total === 'number' ? sale.total : (Number(sale.total) || 0);
                    return (
                      <div key={sale.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 flex flex-wrap justify-between items-center">
                          <div className="text-sm text-gray-700 dark:text-gray-300">Vente: <span className="font-medium">{sale.id || '—'}</span></div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">Date: <span className="font-medium">{dateStr}</span></div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">Total: <span className="font-semibold">{total.toLocaleString()} DH</span></div>
                        </div>
                        <div className="overflow-visible">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-300">
                                <th className="px-3 py-2 text-left">Nom</th>
                                <th className="px-3 py-2 text-left">Code</th>
                                <th className="px-3 py-2 text-left">Unité</th>
                                <th className="px-3 py-2 text-right">Quantité</th>
                                <th className="px-3 py-2 text-right">Prix U.</th>
                                <th className="px-3 py-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {items.map((si, idx) => {
                                const prod = si.Product || si.product || {};
                                const name = prod.name || si.name || '—';
                                const code = prod.code || si.code || '—';
                                const unit = si.unit || prod.unit || '—';
                                const qty = typeof si.quantity === 'number' ? si.quantity : (Number(si.quantity) || 0);
                                const price = typeof si.price === 'number' ? si.price : (Number(si.price) || 0);
                                const rowTotal = typeof si.total === 'number' ? si.total : (qty * price);
                                return (
                                  <tr key={idx}>
                                    <td className="px-3 py-2">{name}</td>
                                    <td className="px-3 py-2">{code}</td>
                                    <td className="px-3 py-2">{unit}</td>
                                    <td className="px-3 py-2 text-right">{qty}</td>
                                    <td className="px-3 py-2 text-right">{price.toLocaleString()} DH</td>
                                    <td className="px-3 py-2 text-right">{rowTotal.toLocaleString()} DH</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div className="flex justify-end mt-6">
              <Button variant="secondary" onClick={closeHistoryModal}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Sale Modal */}
      {showSaleModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nouvelle Vente - {selectedClient.name}
              </h3>
              <button
                onClick={closeSaleModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Sale Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de livraison souhaitée
                  </label>
                  <input
                    type="date"
                    value={saleForm.deliveryDate}
                    onChange={(e) => setSaleForm({ ...saleForm, deliveryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    
                  />
                </div>

                

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total de la vente
                  </label>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {getSaleTotal().toLocaleString()} DH
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="relative z-40">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Produits vendus</h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<PlusIcon className="w-4 h-4" />}
                    onClick={addSaleItem}
                  >
                    {t('addProduct')}
                  </Button>
                </div>

                {saleForm.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('noProductsAdded')}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Nom
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Unité
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Quantité
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Dernier prix Unitaire payé
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Prix Unitaire
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                        {saleForm.items.map((item, index) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2">
                              <input
                                list="client-sale-product-suggestions"
                                type="text"
                                value={(item as any).name || ''}
                                onChange={(e) => updateSaleItem(item.id, 'name', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                placeholder="Nom du produit"
                                autoComplete="off"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.code}
                                onChange={(e) => updateSaleItem(item.id, 'code', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                placeholder="Code produit"
                              />
                            </td>
                            
                            <td className="px-3 py-2">
                              <select
                                value={item.unit}
                                onChange={(e) => updateSaleItem(item.id, 'unit', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                              >
                                <option value="U">U</option>
                                <option value="KG">KG</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="PCS">PCS</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateSaleItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                min="1"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={typeof (item as any).lastUnitPrice === 'number' ? `${(item as any).lastUnitPrice}` : ''}
                                readOnly
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-100 dark:bg-gray-500 text-gray-700 dark:text-gray-200"
                                placeholder="—"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateSaleItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.total.toLocaleString()} DH
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => removeSaleItem(item.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                title="Supprimer ce produit"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <datalist id="client-sale-product-suggestions">
                      {(Array.isArray(productList) ? (productList as any) : []).map((p: any) => (
                        <option key={p.id} value={p.name} />
                      ))}
                    </datalist>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optionnel)
                </label>
                <textarea
                  value={saleForm.notes}
                  onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  placeholder="Notes importantes..."
                />
              </div>

              {/* Info Box */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center text-green-800 dark:text-green-200">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Documents automatiques</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                  Cette vente générera automatiquement un Bon de commande client, un Bon de livraison et une Facture avec tous les détails saisis.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeSaleModal}>
                Annuler
              </Button>
              <Button 
                variant="primary" 
                onClick={handleCreateSale}
                disabled={saleForm.items.length === 0}
              >
                Créer Vente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;