import React, { useState, useEffect } from 'react';
import { Search, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Product {
  name: string;
  code: string;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  primeNumber: number;
  location: string;
}

const ProductsList: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Product>({
    name: '',
    code: '',
    unit: 'U',
    buyPrice: 0,
    sellPrice: 0,
    primeNumber: 0,
    location: ''
  });
  const [products, setProducts] = useState<Product[]>([
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
  ]);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les produits depuis localStorage au montage du composant
  useEffect(() => {
    const savedProducts = localStorage.getItem('productsList');
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        setProducts(parsedProducts);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Sauvegarder les produits dans localStorage à chaque modification (seulement après le chargement initial)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('productsList', JSON.stringify(products));
    }
  }, [products, isLoaded]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product.code);
    setEditedProduct({ ...product });
  };

  const handleSave = () => {
    if (editedProduct) {
      setProducts(prev => prev.map(p => 
        p.code === editedProduct.code ? editedProduct : p
      ));
      setEditingProduct(null);
      setEditedProduct(null);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setEditedProduct(null);
  };

  const handleInputChange = (field: keyof Product, value: string | number) => {
    if (editedProduct) {
      setEditedProduct(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setShowAddForm(true);
    setNewProduct({
      name: '',
      code: '',
      unit: 'U',
      buyPrice: 0,
      sellPrice: 0,
      primeNumber: 0,
      location: ''
    });
  };

  const handleSaveNew = () => {
    if (newProduct.name && newProduct.code) {
      // Vérifier si le code existe déjà
      const codeExists = products.some(p => p.code === newProduct.code);
      if (codeExists) {
        alert('Ce code existe déjà. Veuillez choisir un autre code.');
        return;
      }
      
      setProducts(prev => [...prev, newProduct]);
      setIsAddingNew(false);
      setNewProduct({
        name: '',
        code: '',
        unit: 'U',
        buyPrice: 0,
        sellPrice: 0,
        primeNumber: 0,
        location: ''
      });
    } else {
      alert('Veuillez remplir au moins le nom et le code du produit.');
    }
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
    setShowAddForm(false);
    setNewProduct({
      name: '',
      code: '',
      unit: 'U',
      buyPrice: 0,
      sellPrice: 0,
      primeNumber: 0,
      location: ''
    });
  };

  const handleNewProductInputChange = (field: keyof Product, value: string | number) => {
    setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteProduct = (productCode: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      setProducts(prev => prev.filter(p => p.code !== productCode));
    }
  };

  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('productsList')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérer les informations des produits de plomberie
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter à la liste</span>
        </button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Formulaire d'ajout en dehors du tableau */}
      {showAddForm && (
        <Card>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
              Ajouter un nouveau produit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => handleNewProductInputChange('name', e.target.value)}
                  placeholder="Nom du produit"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label>
                <input
                  type="text"
                  value={newProduct.code}
                  onChange={(e) => handleNewProductInputChange('code', e.target.value)}
                  placeholder="Code du produit"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unité</label>
                <select
                  value={newProduct.unit}
                  onChange={(e) => handleNewProductInputChange('unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="M">M</option>
                  <option value="PCS">PCS</option>
                  <option value="KG">KG</option>
                  <option value="L">L</option>
                  <option value="U">U</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix d'achat</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.buyPrice}
                  onChange={(e) => handleNewProductInputChange('buyPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix de vente</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.sellPrice}
                  onChange={(e) => handleNewProductInputChange('sellPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre premier</label>
                <input
                  type="number"
                  value={newProduct.primeNumber}
                  onChange={(e) => handleNewProductInputChange('primeNumber', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emplacement</label>
                <input
                  type="text"
                  value={newProduct.location}
                  onChange={(e) => handleNewProductInputChange('location', e.target.value)}
                  placeholder="Emplacement"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-end">
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveNew}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={handleCancelNew}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('name')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('code')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('unit')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('buyPrice')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sellPrice')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('primeNumber')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('location')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.code} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                    {editingProduct === product.code ? (
                      <input
                        type="text"
                        value={editedProduct?.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      product.name
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-mono">
                    {editingProduct === product.code ? (
                      <input
                        type="text"
                        value={editedProduct?.code || ''}
                        onChange={(e) => handleInputChange('code', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                      />
                    ) : (
                      product.code
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {editingProduct === product.code ? (
                      <select
                        value={editedProduct?.unit || ''}
                        onChange={(e) => handleInputChange('unit', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="M">M</option>
                        <option value="PCS">PCS</option>
                        <option value="KG">KG</option>
                        <option value="L">L</option>
                        <option value="U">U</option>
                      </select>
                    ) : (
                      product.unit
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editingProduct === product.code ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editedProduct?.buyPrice || 0}
                        onChange={(e) => handleInputChange('buyPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      `${product.buyPrice} DH`
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editingProduct === product.code ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editedProduct?.sellPrice || 0}
                        onChange={(e) => handleInputChange('sellPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      `${product.sellPrice} DH`
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {editingProduct === product.code ? (
                      <input
                        type="number"
                        value={editedProduct?.primeNumber || 0}
                        onChange={(e) => handleInputChange('primeNumber', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      product.primeNumber
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {editingProduct === product.code ? (
                      <input
                        type="text"
                        value={editedProduct?.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      product.location
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {editingProduct === product.code ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            title="Enregistrer"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Annuler"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.code)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ProductsList;
