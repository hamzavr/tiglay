import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

type WaitingFlag = 'normal' | 'missing' | 'surplus';

interface WaitingItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  remainingQuantity?: number;
  unit: string;
  unitPrice: number;
  flag: WaitingFlag;
  createdAt: string;
}

const WaitingList: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<WaitingItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('waitingListProducts');
      if (raw) {
        setItems(JSON.parse(raw));
      }
    } catch (_) {
      setItems([]);
    }
  }, []);

  const persist = (next: WaitingItem[]) => {
    setItems(next);
    localStorage.setItem('waitingListProducts', JSON.stringify(next));
  };

  const removeItem = (id: string) => {
    persist(items.filter(i => i.id !== id));
  };

  const clearAll = () => {
    if (confirm(t('confirmClearWaitingList'))) {
      persist([]);
    }
  };

  const totalAmount = items.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('waitingListTitle')}</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {t('total')}: <span className="font-semibold">{totalAmount.toLocaleString()} DH</span>
          </div>
          <button onClick={clearAll} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">{t('clear')}</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-300">
          {t('noProductsInWaitingList')}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="text-left px-4 py-2">{t('name')}</th>
                <th className="text-left px-4 py-2">{t('code')}</th>
                <th className="text-left px-4 py-2">{t('theQuantity')}</th>
                <th className="text-left px-4 py-2">{t('remainingQuantity')}</th>
                <th className="text-left px-4 py-2">{t('unit')}</th>
                <th className="text-left px-4 py-2">{t('unitPrice')}</th>
                <th className="text-left px-4 py-2">{t('totalPrice')}</th>
                <th className="text-left px-4 py-2">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.code}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.quantity}</td>
                  <td className="px-4 py-2">
                    <span className={`text-sm font-medium ${
                      item.remainingQuantity && item.remainingQuantity > 0
                        ? 'text-orange-600 dark:text-orange-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.remainingQuantity ? Math.abs(item.remainingQuantity) : 0}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.unit}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.unitPrice.toLocaleString()} DH</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{(item.quantity * item.unitPrice).toLocaleString()} DH</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Liste des produits de plomberie pour auto-remplissage
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
                          
                          // Trouver le produit correspondant dans la liste
                          const foundProduct = plumbingProducts.find(p => p.name.toLowerCase() === item.name.toLowerCase());
                          
                          // Pré-remplir les données pour l'inventaire
                          const prefilled = {
                            name: item.name,
                            code: foundProduct ? foundProduct.code : item.code,
                            unit: foundProduct ? foundProduct.unit : item.unit,
                            buyPrice: foundProduct ? foundProduct.buyPrice : item.unitPrice,
                            sellPrice: foundProduct ? foundProduct.sellPrice : item.unitPrice * 1.5, // Prix de vente estimé
                            stock: item.quantity,
                            primeNumber: foundProduct ? foundProduct.primeNumber : 2,
                            location: foundProduct ? foundProduct.location : 'A1-B1'
                          };
                          
                          // Mémoriser l'ID à retirer après ajout
                          localStorage.setItem('waitingListRemoveId', item.id);
                          localStorage.setItem('prefilledProductData', JSON.stringify(prefilled));
                          // Naviguer à l'inventaire
                          window.location.hash = '#inventory';
                        }}
                        className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white"
                      >
{t('inventory')}
                      </button>
                      <button
                        onClick={() => {
                          // Logique du bouton Compléter
                          if (item.remainingQuantity && item.remainingQuantity > 0) {
                            const updatedItems = items.map(i => 
                              i.id === item.id 
                                ? { 
                                    ...i, 
                                    quantity: i.quantity + i.remainingQuantity, 
                                    remainingQuantity: 0 
                                  }
                                : i
                            );
                            setItems(updatedItems);
                            
                            // Sauvegarder dans localStorage
                            localStorage.setItem('waitingListProducts', JSON.stringify(updatedItems));
                            
                            alert('Quantité restante ajoutée à "La Quantité"');
                          } else {
                            alert('Aucune quantité restante à compléter');
                          }
                        }}
                        disabled={!item.remainingQuantity || item.remainingQuantity <= 0}
                        className={`px-2 py-1 text-xs rounded ${
                          item.remainingQuantity && item.remainingQuantity > 0
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        }`}
                      >
{t('complete')}
                      </button>
                      <button onClick={() => removeItem(item.id)} className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded">{t('remove')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WaitingList;


