import React, { useState } from 'react';
import { useEffect } from 'react';
import { Search, Plus, Minus, ShoppingCart, Trash2, CreditCard, Banknote, Clock } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { productsAPI, salesAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Product {
  id: string;
  name: string;
  sellPrice: number;
  stock: number;
  code: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const POS: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'card' | 'credit' | 'partial'>('cash');
  const [loading, setLoading] = useState(false);

  const { 
    data: products = [], 
    loading: productsLoading, 
    execute: fetchProducts 
  } = useApi(productsAPI.getAll);

  useEffect(() => {
    fetchProducts({ search: searchTerm });
  }, [searchTerm]);
  const filteredProducts = products || [];

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.sellPrice * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const saleData = {
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.sellPrice
        })),
        paymentMethod: selectedPayment,
        total: getTotalAmount()
      };

      await salesAPI.create(saleData);
      alert(`${t('checkout')} successful! Total: ${getTotalAmount().toFixed(2)} DH`);
      setCart([]);
    } catch (error: any) {
      alert('Checkout failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-4">
        <Card title={t('products')}>
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {productsLoading && (
              <div className="col-span-2 text-center py-8">
                <div className="spinner mx-auto mb-2"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
              </div>
            )}
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors border border-gray-200 dark:border-gray-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{product.code}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{product.sellPrice} DH</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('stock')}: {product.stock}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cart Section */}
      <div className="space-y-4">
        <Card 
          title={
            <div className="flex items-center">
              <ShoppingCart className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('cart')} ({cart.length})
            </div>
          }
        >
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.sellPrice} DH</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('cart')} vide</p>
            )}
          </div>
        </Card>

        {/* Payment Methods */}
        {cart.length > 0 && (
          <>
            <Card title="Mode de paiement">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedPayment('cash')}
                  className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center ${
                    selectedPayment === 'cash'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Banknote className="w-5 h-5 mb-1" />
                  <span className="text-xs">{t('cash')}</span>
                </button>
                <button
                  onClick={() => setSelectedPayment('card')}
                  className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center ${
                    selectedPayment === 'card'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1" />
                  <span className="text-xs">{t('card')}</span>
                </button>
                <button
                  onClick={() => setSelectedPayment('credit')}
                  className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center ${
                    selectedPayment === 'credit'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Clock className="w-5 h-5 mb-1" />
                  <span className="text-xs">{t('credit')}</span>
                </button>
                <button
                  onClick={() => setSelectedPayment('partial')}
                  className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center ${
                    selectedPayment === 'partial'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="w-5 h-5 mb-1 flex items-center justify-center text-xs font-bold">%</div>
                  <span className="text-xs">{t('partial')}</span>
                </button>
              </div>
            </Card>

            <Card>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">{t('total')}:</span>
                  <span className="text-blue-600 dark:text-blue-400">{getTotalAmount().toFixed(2)} DH</span>
                </div>
                <Button 
                  variant="success" 
                  size="lg" 
                  className="w-full" 
                  onClick={handleCheckout}
                 disabled={loading || cart.length === 0}
                  icon={<ShoppingCart className="w-5 h-5" />}
                >
                  {loading ? 'Processing...' : t('checkout')}
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default POS;