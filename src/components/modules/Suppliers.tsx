import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Phone, Mail, MapPin, Building2, X, FileText, Plus as PlusIcon, Trash2 as TrashIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApi } from '../../hooks/useApi';
import { suppliersAPI, productsAPI } from '../../services/api';
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
  name: string;
  code: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  primeNumber?: number;
}

interface NewProductItem {
  id: string;
  name: string;
  code: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  total: number;
  primeNumber?: number;
}

interface OrderFormData {
  deliveryDate: string;
  notes: string;
  items: OrderItem[];
  newProducts: NewProductItem[];
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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySupplier, setHistorySupplier] = useState<Supplier | null>(null);
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    deliveryDate: '',
    notes: '',
    items: [],
    newProducts: []
  });

  const { data: suppliers = [], loading: suppliersLoading, execute: fetchSuppliers } = useApi(suppliersAPI.getAll);
  const { data: productCatalog = [], execute: fetchProducts } = useApi(productsAPI.getAll);
  const { data: supplierOrders = [], execute: fetchSupplierOrders } = useApi(suppliersAPI.getOrders);
  const { execute: createSupplier } = useApi(suppliersAPI.create);
  const { execute: updateSupplier } = useApi(suppliersAPI.update);
  const { execute: deleteSupplier } = useApi(suppliersAPI.delete);

  // Fonction pour générer un nombre premier basé sur le nom du produit
  const generatePrimeNumber = (productName: string): number => {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    const hash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return primes[hash % primes.length];
  };

  // Liste des produits de plomberie
  const plumbingProducts = [
    { name: 'Tuyau PVC 20mm', code: 'PLO-001', unit: 'M', buyPrice: 12.50, sellPrice: 18.00, primeNumber: 2, location: 'A1-B1' },
    { name: 'Tuyau PVC 25mm', code: 'PLO-002', unit: 'M', buyPrice: 15.00, sellPrice: 22.00, primeNumber: 3, location: 'A1-B2' },
    { name: 'Tuyau PVC 32mm', code: 'PLO-003', unit: 'M', buyPrice: 18.50, sellPrice: 28.00, primeNumber: 5, location: 'A1-B3' },
    { name: 'Tuyau PVC 40mm', code: 'PLO-004', unit: 'M', buyPrice: 22.00, sellPrice: 35.00, primeNumber: 7, location: 'A1-B4' },
    { name: 'Tuyau PVC 50mm', code: 'PLO-005', unit: 'M', buyPrice: 28.00, sellPrice: 45.00, primeNumber: 11, location: 'A1-B5' },
    { name: 'Raccord coude 20mm', code: 'PLO-006', unit: 'PCS', buyPrice: 3.50, sellPrice: 6.00, primeNumber: 13, location: 'A2-B1' },
    { name: 'Raccord coude 25mm', code: 'PLO-007', unit: 'PCS', buyPrice: 4.00, sellPrice: 7.50, primeNumber: 17, location: 'A2-B2' },
    { name: 'Raccord coude 32mm', code: 'PLO-008', unit: 'PCS', buyPrice: 5.50, sellPrice: 9.00, primeNumber: 19, location: 'A2-B3' },
    { name: 'Raccord T 20mm', code: 'PLO-009', unit: 'PCS', buyPrice: 4.50, sellPrice: 8.00, primeNumber: 23, location: 'A2-B4' },
    { name: 'Raccord T 25mm', code: 'PLO-010', unit: 'PCS', buyPrice: 5.00, sellPrice: 9.50, primeNumber: 29, location: 'A2-B5' },
    { name: 'Robinet simple 20mm', code: 'PLO-011', unit: 'PCS', buyPrice: 25.00, sellPrice: 40.00, primeNumber: 31, location: 'A3-B1' },
    { name: 'Robinet simple 25mm', code: 'PLO-012', unit: 'PCS', buyPrice: 30.00, sellPrice: 50.00, primeNumber: 37, location: 'A3-B2' },
    { name: 'Robinet double 20mm', code: 'PLO-013', unit: 'PCS', buyPrice: 45.00, sellPrice: 75.00, primeNumber: 41, location: 'A3-B3' },
    { name: 'Robinet double 25mm', code: 'PLO-014', unit: 'PCS', buyPrice: 55.00, sellPrice: 90.00, primeNumber: 43, location: 'A3-B4' },
    { name: 'Vanne d\'arrêt 20mm', code: 'PLO-015', unit: 'PCS', buyPrice: 35.00, sellPrice: 60.00, primeNumber: 47, location: 'A4-B1' },
    { name: 'Vanne d\'arrêt 25mm', code: 'PLO-016', unit: 'PCS', buyPrice: 42.00, sellPrice: 70.00, primeNumber: 53, location: 'A4-B2' },
    { name: 'Vanne d\'arrêt 32mm', code: 'PLO-017', unit: 'PCS', buyPrice: 50.00, sellPrice: 85.00, primeNumber: 59, location: 'A4-B3' },
    { name: 'Collier de serrage 20mm', code: 'PLO-018', unit: 'PCS', buyPrice: 2.50, sellPrice: 4.50, primeNumber: 61, location: 'A5-B1' },
    { name: 'Collier de serrage 25mm', code: 'PLO-019', unit: 'PCS', buyPrice: 3.00, sellPrice: 5.50, primeNumber: 67, location: 'A5-B2' },
    { name: 'Collier de serrage 32mm', code: 'PLO-020', unit: 'PCS', buyPrice: 3.50, sellPrice: 6.50, primeNumber: 71, location: 'A5-B3' }
  ];

  useEffect(() => {
    fetchSuppliers({ search: searchTerm });
    // Charger le catalogue produits pour suggestions
    fetchProducts({});
  }, [searchTerm]);

  // Ensure suppliers is always an array
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const filteredSuppliers = safeSuppliers;

  // Function to parse items from notes text
  const parseItemsFromNotes = (notes: string): any[] => {
    const items: any[] = [];
    
    // Look for "Produits commandés:" section
    const productsMatch = notes.match(/Produits commandés:\s*([\s\S]*?)(?=Notes:|$)/);
    if (productsMatch) {
      const productsText = productsMatch[1];
      
      // Split by lines and process each product
      const lines = productsText.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        // Look for pattern: • - - productName [Category]: quantity UNIT × price DH = total DH
        const match = line.match(/•\s*-\s*-\s*([^[]+)\s*\[([^\]]+)\]:\s*(\d+(?:\.\d+)?)\s*(\w+)\s*×\s*(\d+(?:\.\d+)?)\s*DH\s*=\s*(\d+(?:\.\d+)?)\s*DH/);
        
        if (match) {
          const [, name, quantity, unit, unitPrice, total] = match;
          items.push({
            name: name.trim(),
            code: '—', // No code available in this format
            quantity: parseFloat(quantity),
            unit: unit.trim(),
            unitPrice: parseFloat(unitPrice),
            total: parseFloat(total)
          });
        }
      });
    }
    
    return items;
  };

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
      notes: '',
      items: [],
      newProducts: []
    });
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedSupplier(null);
    setOrderForm({
      deliveryDate: '',
      notes: '',
      items: [],
      newProducts: []
    });
  };

  const openHistoryModal = (supplier: Supplier) => {
    setHistorySupplier(supplier);
    fetchSupplierOrders(supplier.id);
    setShowHistoryModal(true);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setHistorySupplier(null);
  };

  const addOrderItem = () => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      name: '',
      code: '',
      quantity: 1,
      unit: 'U',
      unitPrice: 0,
      total: 0,
      primeNumber: undefined
    };
    setOrderForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const addNewProductItem = () => {
    const newProduct: NewProductItem = {
      id: `new-product-${Date.now()}`,
      name: '',
      code: '',
      unit: 'U',
      unitPrice: 0,
      quantity: 1,
      total: 0,
      primeNumber: undefined
    };
    setOrderForm(prev => ({
      ...prev,
      newProducts: [...prev.newProducts, newProduct]
    }));
  };


  const removeOrderItem = (itemId: string) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const removeNewProductItem = (itemId: string) => {
    setOrderForm(prev => ({
      ...prev,
      newProducts: prev.newProducts.filter(item => item.id !== itemId)
    }));
  };

  const updateOrderItem = (itemId: string, field: keyof OrderItem, value: any) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          
          // Générer automatiquement les données quand le nom change
          if (field === 'name' && typeof value === 'string' && value.trim()) {
            const foundProduct = plumbingProducts.find(p => p.name.toLowerCase() === value.toLowerCase());
            if (foundProduct) {
              updatedItem.code = foundProduct.code;
              updatedItem.primeNumber = foundProduct.primeNumber;
              updatedItem.unit = foundProduct.unit;
              updatedItem.unitPrice = foundProduct.buyPrice;
            } else {
              updatedItem.primeNumber = generatePrimeNumber(value);
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

  const updateNewProductItem = (itemId: string, field: keyof NewProductItem, value: any) => {
    setOrderForm(prev => ({
      ...prev,
      newProducts: prev.newProducts.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          
          // Générer automatiquement les données quand le nom change
          if (field === 'name' && typeof value === 'string' && value.trim()) {
            const foundProduct = plumbingProducts.find(p => p.name.toLowerCase() === value.toLowerCase());
            if (foundProduct) {
              updatedItem.code = foundProduct.code;
              updatedItem.primeNumber = foundProduct.primeNumber;
              updatedItem.unit = foundProduct.unit;
              updatedItem.unitPrice = foundProduct.buyPrice;
            } else {
              updatedItem.primeNumber = generatePrimeNumber(value);
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

  const getOrderTotal = () => {
    const itemsTotal = orderForm.items.reduce((sum, item) => sum + item.total, 0);
    const newProductsTotal = orderForm.newProducts.reduce((sum, item) => sum + item.total, 0);
    return itemsTotal + newProductsTotal;
  };

  // Suggestions depuis l'inventaire

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
    if (!selectedSupplier || (orderForm.items.length === 0 && orderForm.newProducts.length === 0)) {
      alert('Veuillez ajouter au moins un produit à la commande');
      return;
    }

    try {
      // Créer la commande avec tous les détails
      const orderData = {
        id: `ORDER-${Date.now()}`,
        supplierId: selectedSupplier.id,
        total: getOrderTotal(),
        items: orderForm.items,
        newProducts: orderForm.newProducts,
        deliveryDate: orderForm.deliveryDate,
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
{t('newSupplier')}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openHistoryModal(supplier)}
                >
                  {t('viewOrders')}
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openOrderModal(supplier)}
                >
                  {t('newOrder')}
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
                {editingSupplier ? t('editSupplier') : t('newSupplier')}
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
                  {t('name')} *
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
                  {t('phone')} *
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
                  {t('email')}
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
                  {t('address')}
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
                  {t('taxNumber')}
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
                  {t('cancel')}
                </Button>
                <Button variant="primary" type="submit">
                  {editingSupplier ? t('edit') : t('create')}
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
                {t('newOrder')} - {selectedSupplier.name}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('desiredDeliveryDate')}
                  </label>
                  <input
                    type="date"
                    value={orderForm.deliveryDate}
                    onChange={(e) => setOrderForm({ ...orderForm, deliveryDate: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('orderTotal')}
                  </label>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {getOrderTotal().toLocaleString()} DH
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{t('orderedProducts')}</h4>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<PlusIcon className="w-4 h-4" />}
                      onClick={addOrderItem}
                    >
                      {t('addProduct')}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<PlusIcon className="w-4 h-4" />}
                      onClick={addNewProductItem}
                    >
                      {t('addNewProduct')}
                    </Button>
                  </div>
                </div>

                {orderForm.items.length === 0 && orderForm.newProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('noProductsAdded')}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Produits existants */}
                    {orderForm.items.length > 0 && (
                      <div>
                        <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3">{t('existingProducts')}</h5>
                        <div className="overflow-x-auto">
                          <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('name')}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('code')}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('quantity')}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('primeNumber')}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('unit')}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('unitPrice')}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('total')}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('actions')}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                              {orderForm.items.map((item, index) => (
                                <tr key={item.id}>
                                  <td className="px-3 py-2">
                                    <div className="relative">
                                      <input
                                        list={`supplier-order-product-suggestions-${item.id}`}
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          updateOrderItem(item.id, 'name', val);
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                        placeholder="Nom du produit"
                                      />
                                      <datalist id={`supplier-order-product-suggestions-${item.id}`}>
                                        {plumbingProducts.map((p, index) => (
                                          <option key={index} value={p.name} />
                                        ))}
                                      </datalist>
                                    </div>
                                  </td>
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
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                      min="1"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {item.primeNumber || '-'}
                                    </div>
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
                      </div>
                    )}

                    {/* Nouveaux produits */}
                    {orderForm.newProducts.length > 0 && (
                      <div>
                        <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3">{t('newProducts')}</h5>
                        <div className="overflow-x-auto">
                          <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('name')} *
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('code')} *
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('unit')} *
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('unitPrice')} *
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('quantity')} *
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('primeNumber')}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('total')}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {t('actions')}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                              {orderForm.newProducts.map((item, index) => (
                                <tr key={item.id}>
                                  <td className="px-3 py-2">
                                    <div className="relative">
                                      <input
                                        list={`supplier-new-product-suggestions-${item.id}`}
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          updateNewProductItem(item.id, 'name', val);
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                        placeholder="Nom du produit"
                                        required
                                      />
                                      <datalist id={`supplier-new-product-suggestions-${item.id}`}>
                                        {plumbingProducts.map((p, index) => (
                                          <option key={index} value={p.name} />
                                        ))}
                                      </datalist>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={item.code}
                                      onChange={(e) => updateNewProductItem(item.id, 'code', e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                      placeholder="Code produit"
                                      required
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <select
                                      value={item.unit}
                                      onChange={(e) => updateNewProductItem(item.id, 'unit', e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                      required
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
                                      onChange={(e) => updateNewProductItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                      min="0"
                                      step="0.01"
                                      required
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => updateNewProductItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                      min="1"
                                      required
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {item.primeNumber || '-'}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {item.total.toLocaleString()} DH
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <button
                                      onClick={() => removeNewProductItem(item.id)}
                                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                      title="Supprimer ce nouveau produit"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
{t('notesAndConditions')}
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
                  <span className="text-sm font-medium">{t('automaticDocument')}</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Cette commande générera automatiquement un Bon de commande fournisseur complet avec tous les détails saisis.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeOrderModal}>
{t('cancel')}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleCreateOrder}
                disabled={orderForm.items.length === 0 && orderForm.newProducts.length === 0}
              >
{t('createOrder')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Orders History Modal */}
      {showHistoryModal && historySupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('ordersHistory')} - {historySupplier.name}
              </h3>
              <button
                onClick={closeHistoryModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const allOrders: any[] = Array.isArray(supplierOrders) ? (supplierOrders as any) : [];
              if (allOrders.length === 0) {
                return (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    {t('noOrdersFound')}
                  </div>
                );
              }
              return (
                <div className="space-y-4">
                  {allOrders.map((order) => {
                    // Parse items from JSON if it's a string, otherwise use array
                    let items: any[] = [];
                    if (typeof order.items === 'string') {
                      try {
                        items = JSON.parse(order.items);
                      } catch (e) {
                        console.error('Error parsing items JSON:', e);
                        items = [];
                      }
                    } else if (Array.isArray(order.items)) {
                      items = order.items;
                    }
                    
                    // If no items from items field, try to parse from notes
                    if (items.length === 0 && order.notes) {
                      items = parseItemsFromNotes(order.notes);
                    }
                    
                    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR') : '—';
                    const total = typeof order.amount === 'number' ? order.amount : (Number(order.amount) || 0);
                    const status = order.status || 'draft';
                    const statusColors = {
                      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
                      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
                      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    };
                    return (
                      <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 flex flex-wrap justify-between items-center">
                          <div className="text-sm text-gray-700 dark:text-gray-300">{t('orderNumber')}: <span className="font-medium">{order.number || order.id || '—'}</span></div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">{t('orderDate')}: <span className="font-medium">{dateStr}</span></div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">{t('orderTotal')}: <span className="font-semibold">{total.toLocaleString()} DH</span></div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
                            {status === 'draft' ? t('orderStatusDraft') : 
                             status === 'sent' ? t('orderStatusSent') : 
                             status === 'paid' ? t('orderStatusPaid') : 
                             status === 'cancelled' ? t('orderStatusCancelled') : status}
                          </span>
                        </div>
                        {items.length > 0 ? (
                          <div className="overflow-visible">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-300">
                                  <th className="px-3 py-2 text-left">{t('orderItemName')}</th>
                                  <th className="px-3 py-2 text-left">{t('orderItemCode')}</th>
                                  <th className="px-3 py-2 text-right">{t('orderItemQuantity')}</th>
                                  <th className="px-3 py-2 text-right">{t('orderItemUnit')}</th>
                                  <th className="px-3 py-2 text-right">{t('orderItemUnitPrice')}</th>
                                  <th className="px-3 py-2 text-right">{t('orderItemTotal')}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {items.map((item, idx) => {
                                  const name = item.name || '—';
                                  const code = item.code || '—';
                                  const unit = item.unit || '—';
                                  const qty = typeof item.quantity === 'number' ? item.quantity : (Number(item.quantity) || 0);
                                  const price = typeof item.unitPrice === 'number' ? item.unitPrice : (Number(item.unitPrice) || 0);
                                  const rowTotal = typeof item.total === 'number' ? item.total : (qty * price);
                                  return (
                                    <tr key={idx}>
                                      <td className="px-3 py-2">{name}</td>
                                      <td className="px-3 py-2">{code}</td>
                                      <td className="px-3 py-2 text-right">{qty}</td>
                                      <td className="px-3 py-2 text-right">{unit}</td>
                                      <td className="px-3 py-2 text-right">{price.toLocaleString()} DH</td>
                                      <td className="px-3 py-2 text-right">{rowTotal.toLocaleString()} DH</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                            {t('noOrdersFound')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div className="flex justify-end mt-6">
              <Button variant="secondary" onClick={closeHistoryModal}>
                {t('close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;