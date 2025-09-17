import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Phone, Mail, MapPin, Building2, X, FileText, Plus as PlusIcon, Trash2 as TrashIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApi } from '../../hooks/useApi';
import { suppliersAPI } from '../../services/api';
import documentWorkflowService from '../../services/documentWorkflow';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Supplier {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  taxNumber?: string;
  isActive: boolean;
  createdAt: string;
  Products?: Array<{ id: string; name: string }>;
}

interface SupplierFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
}

interface OrderItem {
  id: string;
  code: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface OrderFormData {
  deliveryDate: string;
  paymentTerms: string;
  notes: string;
  items: OrderItem[];
}

const Suppliers: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: ''
  });
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    deliveryDate: '',
    paymentTerms: '30 jours',
    notes: '',
    items: []
  });

  const { data: suppliers = [], loading: suppliersLoading, execute: fetchSuppliers } = useApi(suppliersAPI.getAll);
  const { execute: createSupplier } = useApi(suppliersAPI.create);
  const { execute: updateSupplier } = useApi(suppliersAPI.update);
  const { execute: deleteSupplier } = useApi(suppliersAPI.delete);

  useEffect(() => {
    fetchSuppliers({ search: searchTerm });
  }, [searchTerm]);

  // Ensure suppliers is always an array
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const filteredSuppliers = safeSuppliers;

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({ name: '', phone: '', email: '', address: '', taxNumber: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address || '',
      taxNumber: supplier.taxNumber || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    setFormData({ name: '', phone: '', email: '', address: '', taxNumber: '' });
  };

  const openOrderModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setOrderForm({
      deliveryDate: '',
      paymentTerms: '30 jours',
      notes: '',
      items: []
    });
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedSupplier(null);
    setOrderForm({
      deliveryDate: '',
      paymentTerms: '30 jours',
      notes: '',
      items: []
    });
  };

  const addOrderItem = () => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      code: '',
      description: '',
      quantity: 1,
      unit: 'U',
      unitPrice: 0,
      total: 0
    };
    setOrderForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeOrderItem = (itemId: string) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateOrderItem = (itemId: string, field: keyof OrderItem, value: any) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
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

  const getOrderTotal = () => {
    return orderForm.items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Nom et téléphone sont obligatoires !');
      return;
    }

    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, formData);
      } else {
        await createSupplier(formData);
      }
      
      closeModal();
      fetchSuppliers({ search: searchTerm });
    } catch (error: any) {
      alert(`Erreur lors de ${editingSupplier ? 'la modification' : 'la création'} du fournisseur: ${error.message}`);
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        await deleteSupplier(supplierId);
        fetchSuppliers({ search: searchTerm });
      } catch (error: any) {
        alert('Erreur lors de la suppression du fournisseur');
      }
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedSupplier || orderForm.items.length === 0) {
      alert('Veuillez ajouter au moins un produit à la commande');
      return;
    }

    if (!orderForm.deliveryDate) {
      alert('Veuillez spécifier une date de livraison');
      return;
    }

    try {
      // Créer la commande avec tous les détails
      const orderData = {
        id: `ORDER-${Date.now()}`,
        supplierId: selectedSupplier.id,
        total: getOrderTotal(),
        items: orderForm.items,
        deliveryDate: orderForm.deliveryDate,
        paymentTerms: orderForm.paymentTerms,
        notes: orderForm.notes
      };

      // Créer automatiquement le bon de commande fournisseur
      const document = await documentWorkflowService.createSupplierPurchaseOrder(orderData);

      alert(`Commande créée avec succès ! Bon de commande fournisseur généré automatiquement.`);
      closeOrderModal();
      
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      alert('Erreur lors de la création de la commande');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('suppliers')}</h2>
          <p className="text-gray-600 dark:text-gray-400">Gérer vos fournisseurs et leurs informations</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openAddModal}>
          Nouveau Fournisseur
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
          <input
            type="text"
            placeholder="Rechercher un fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          />
        </div>
      </Card>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{supplier.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    supplier.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {supplier.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => openEditModal(supplier)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Modifier le fournisseur"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteSupplier(supplier.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Supprimer le fournisseur"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-400`} />
                  {supplier.phone}
                </div>
                {supplier.email && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Mail className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-400`} />
                    {supplier.email}
                  </div>
                )}
                <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-400 mt-0.5 flex-shrink-0`} />
                  <span>{supplier.address || 'Aucune adresse'}</span>
                </div>
                {supplier.taxNumber && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Building2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-400`} />
                    <span>N° TVA: {supplier.taxNumber}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Créé le: {new Date(supplier.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  {supplier.Products && supplier.Products.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {supplier.Products.length} produit(s) fourni(s)
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm" className="flex-1">
                  Voir Commandes
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openOrderModal(supplier)}
                >
                  Nouvelle Commande
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!suppliersLoading && filteredSuppliers.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Aucun fournisseur trouvé</p>
          </div>
        </Card>
      )}

      {/* Add/Edit Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Numéro de TVA
                </label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={closeModal}>
                  Annuler
                </Button>
                <Button variant="primary" type="submit">
                  {editingSupplier ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showOrderModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nouvelle Commande - {selectedSupplier.name}
              </h3>
              <button
                onClick={closeOrderModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de livraison souhaitée *
                  </label>
                  <input
                    type="date"
                    value={orderForm.deliveryDate}
                    onChange={(e) => setOrderForm({ ...orderForm, deliveryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Conditions de paiement
                  </label>
                  <select
                    value={orderForm.paymentTerms}
                    onChange={(e) => setOrderForm({ ...orderForm, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Comptant">Comptant</option>
                    <option value="30 jours">30 jours</option>
                    <option value="60 jours">60 jours</option>
                    <option value="90 jours">90 jours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total de la commande
                  </label>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {getOrderTotal().toLocaleString()} DH
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Produits commandés</h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<PlusIcon className="w-4 h-4" />}
                    onClick={addOrderItem}
                  >
                    {t('addProduct')}
                  </Button>
                </div>

                {orderForm.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('noProductsAdded')}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Quantité
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Unité
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
                        {orderForm.items.map((item, index) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.code}
                                onChange={(e) => updateOrderItem(item.id, 'code', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                placeholder="Code produit"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateOrderItem(item.id, 'description', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                placeholder="Description du produit"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                min="1"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={item.unit}
                                onChange={(e) => updateOrderItem(item.id, 'unit', e.target.value)}
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
                                value={item.unitPrice}
                                onChange={(e) => updateOrderItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
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
                                onClick={() => removeOrderItem(item.id)}
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
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes et conditions (optionnel)
                </label>
                <textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  placeholder="Spécifications techniques, conditions de livraison, notes importantes..."
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center text-blue-800 dark:text-blue-200">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Document automatique</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Cette commande générera automatiquement un Bon de commande fournisseur complet avec tous les détails saisis.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeOrderModal}>
                Annuler
              </Button>
              <Button 
                variant="primary" 
                onClick={handleCreateOrder}
                disabled={orderForm.items.length === 0 || !orderForm.deliveryDate}
              >
                Créer Commande
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;