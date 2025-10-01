import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, AlertTriangle, Package, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApi } from '../../hooks/useApi';
import { productsAPI } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Product {
  id: string;
  name: string;
  nameAr?: string;
  code: string;
  description?: string;
  descriptionAr?: string;
  category: string;
  size?: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  expiryDate?: string;
  arrivalDate?: string;
  totalPurchases: number;
  totalReturns: number;
  image?: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  name: string;
  code: string;
  description: string;
  category: string;
  size: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  expiryDate: string;
  location: string;
  image?: string;
}

const Inventory: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    code: '',
    description: '',
    category: '',
    size: '',
    buyPrice: 0,
    sellPrice: 0,
    stock: 0,
    minStock: 5,
    expiryDate: '',
    location: '',
    image: ''
  });

  const { data: products = [], loading: productsLoading, execute: fetchProducts } = useApi(productsAPI.getAll);
  const { execute: createProduct } = useApi(productsAPI.create);
  const { execute: updateProduct } = useApi(productsAPI.update);
  const { execute: deleteProduct } = useApi(productsAPI.delete);

  useEffect(() => {
    fetchProducts({ search: searchTerm });
  }, [searchTerm]);


  // Vérifier s'il y a des données pré-remplies depuis la page Documents
  useEffect(() => {
    const prefilledData = localStorage.getItem('prefilledProductData');
    if (prefilledData) {
      try {
        const productData = JSON.parse(prefilledData);
        
        // Pré-remplir le formulaire avec les données
        setFormData({
          name: productData.name || '',
          code: productData.code || '',
          description: '',
          category: productData.category || 'Autre',
          size: '',
          buyPrice: productData.unitPrice || 0,
          sellPrice: 0,
          stock: productData.quantity || 0,
          minStock: 5,
          expiryDate: '',
          location: '',
          image: ''
        });
        
        // Ouvrir automatiquement le modal d'ajout
        setIsModalOpen(true);
        
        // Supprimer les données du localStorage après utilisation
        localStorage.removeItem('prefilledProductData');

        // Nettoyer l'URL en gardant la vue actuelle
        history.replaceState(null, '', '/');
      } catch (error) {
        console.error('Erreur lors du parsing des données pré-remplies:', error);
        localStorage.removeItem('prefilledProductData');
      }
    }
  }, []);

  // Écouter l'événement personnalisé pour ouvrir le modal depuis Documents
  useEffect(() => {
    const handleOpenInventoryModal = (event: CustomEvent) => {
      const productData = event.detail.prefilledData;
      
      // Pré-remplir le formulaire avec les données
      setFormData({
        name: productData.name || '',
        code: productData.code || '',
        description: '',
        category: productData.category || 'Autre',
        size: '',
        buyPrice: productData.unitPrice || 0,
        sellPrice: 0,
        stock: productData.quantity || 0,
        minStock: 5,
        expiryDate: '',
        location: '',
        image: ''
      });
      
      // Ouvrir automatiquement le modal d'ajout
      setIsModalOpen(true);
    };

    window.addEventListener('openInventoryModal', handleOpenInventoryModal as EventListener);
    
    return () => {
      window.removeEventListener('openInventoryModal', handleOpenInventoryModal as EventListener);
    };
  }, []);

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  const categories = ['all', 'Ciment', 'Briques', 'Sable', 'Gravier', 'Fer', 'Plomberie', 'Électricité', 'Outillage'];

  const filteredProducts = safeProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isLowStock = (product: Product) => product.stock <= product.minStock;
  const isExpiringSoon = (product: Product) => {
    if (!product.expiryDate || product.expiryDate === 'N/A') return false;
    const expiryDate = new Date(product.expiryDate);
    const today = new Date();
    const sixMonthsFromNow = new Date(today.setMonth(today.getMonth() + 6));
    return expiryDate <= sixMonthsFromNow;
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      category: '',
      size: '',
      buyPrice: 0,
      sellPrice: 0,
      stock: 0,
      minStock: 5,
      expiryDate: '',
      location: '',
      image: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      description: product.description || '',
      category: product.category,
      size: product.size || '',
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      stock: product.stock,
      minStock: product.minStock,
      expiryDate: product.expiryDate || '',
      location: product.location || '',
      image: product.image || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      category: '',
      size: '',
      buyPrice: 0,
      sellPrice: 0,
      stock: 0,
      minStock: 5,
      expiryDate: '',
      location: '',
      image: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.code.trim() || !formData.category.trim()) {
      alert('Name, code, and category are required!');
      return;
    }

    if (formData.buyPrice <= 0 || formData.sellPrice <= 0) {
      alert('Prices must be greater than 0!');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      
      closeModal();
      fetchProducts({ search: searchTerm });

      // Si on vient de la liste d'attente, gérer la suppression ou la mise à jour
      try {
        const removeId = localStorage.getItem('waitingListRemoveId');
        if (removeId) {
          const raw = localStorage.getItem('waitingListProducts');
          const list = raw ? JSON.parse(raw) : [];
          const itemToProcess = list.find((it: any) => it.id === removeId);
          
          if (itemToProcess) {
            // Si le produit a une quantité surplus, on garde seulement la quantité surplus
            if (itemToProcess.surplusQuantity && itemToProcess.surplusQuantity > 0) {
              const updatedItem = {
                ...itemToProcess,
                quantity: itemToProcess.surplusQuantity,
                surplusQuantity: 0,
                flag: 'normal'
              };
              const next = list.map((it: any) => it.id === removeId ? updatedItem : it);
              localStorage.setItem('waitingListProducts', JSON.stringify(next));
              alert('Quantité normale ajoutée à l\'inventaire. Quantité surplus conservée dans la liste d\'attente.');
            } else {
              // Sinon, on supprime complètement l'élément
              const next = Array.isArray(list) ? list.filter((it: any) => it.id !== removeId) : [];
              localStorage.setItem('waitingListProducts', JSON.stringify(next));
              alert('Produit ajouté à l\'inventaire et retiré de la liste d\'attente');
            }
          }
          localStorage.removeItem('waitingListRemoveId');
        }
      } catch (_) {
        // no-op
      }
    } catch (error: any) {
      alert(`Error ${editingProduct ? 'updating' : 'creating'} product: ${error.message}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        fetchProducts({ search: searchTerm });
      } catch (error) {
        alert('Error deleting product');
      }
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalProducts')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{safeProducts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('lowStock')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {safeProducts.filter(isLowStock).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('expiringSoon')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {safeProducts.filter(isExpiringSoon).length}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={openAddModal}>
            Ajouter Produit
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <input
                type="text"
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            title="Filtrer par catégorie"
            aria-label="Filtrer par catégorie"
          >
            <option value="all">Toutes catégories</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('name')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('category')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">État quantité</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('buyPrice')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sellPrice')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('expiration')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('status')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-mono">{product.code}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{product.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{product.category}</td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${
                      isLowStock(product) 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{product.buyPrice} DH</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{product.sellPrice} DH</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{product.expiryDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-1">
                      {isLowStock(product) && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 rounded-full">
                          Stock bas
                        </span>
                      )}
                      {isExpiringSoon(product) && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full">
                          {t('expiringSoon')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Modifier le produit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Supprimer le produit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingProduct ? 'Modifier Produit' : 'Ajouter Produit'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Fermer"
                aria-label="Fermer la modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Nom du produit"
                    required
                  />
                </div>

                {/* Champ image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files && e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64 = String(reader.result || '');
                        handleInputChange('image', base64);
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img src={formData.image} alt="Aperçu" className="h-24 w-24 object-cover rounded border border-gray-200 dark:border-gray-600" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Code produit"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('category')} *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    title="Sélectionner une catégorie"
                    aria-label="Sélectionner une catégorie"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prix d'achat (DH) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.buyPrice}
                    onChange={(e) => handleInputChange('buyPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prix de vente (DH) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.sellPrice}
                    onChange={(e) => handleInputChange('sellPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock actuel
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock minimum
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date d'expiration
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Emplacement
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Rayon A, Étagère 2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Description détaillée du produit"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  {editingProduct ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;