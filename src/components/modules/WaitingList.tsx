import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

type WaitingFlag = 'normal' | 'missing' | 'surplus';

interface WaitingItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  missingQuantity?: number;
  surplusQuantity?: number;
  unit: string;
  unitPrice: number;
  category: string;
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
                <th className="text-left px-4 py-2">{t('category')}</th>
                <th className="text-left px-4 py-2">{t('stateQuantity')}</th>
                <th className="text-left px-4 py-2">{t('missingQuantity')}</th>
                <th className="text-left px-4 py-2">{t('surplusQuantity')}</th>
                <th className="text-left px-4 py-2">{t('unit')}</th>
                <th className="text-left px-4 py-2">{t('unitPrice')}</th>
                <th className="text-left px-4 py-2">{t('totalPrice')}</th>
                <th className="text-left px-4 py-2">{t('quantity')}</th>
                <th className="text-left px-4 py-2">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.code}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.category}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.quantity}</td>
                  <td className="px-4 py-2">
                    <span className={`text-sm font-medium ${
                      item.missingQuantity && item.missingQuantity > 0
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.missingQuantity || 0}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-sm font-medium ${
                      item.surplusQuantity && item.surplusQuantity > 0
                        ? 'text-purple-600 dark:text-purple-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.surplusQuantity || 0}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.unit}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.unitPrice.toLocaleString()} DH</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{(item.quantity * item.unitPrice).toLocaleString()} DH</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.flag === 'missing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' : item.flag === 'surplus' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'}`}>
                      {item.flag === 'missing' ? t('missing') : item.flag === 'surplus' ? t('surplus') : t('normal')}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Vérifier si le produit a une quantité manquante
                          if (item.missingQuantity && item.missingQuantity > 0) {
                            alert(t('cannotAddToInventoryMissing'));
                            return;
                          }
                          
                          // Pour les produits avec quantité surplus, on ajoute seulement la quantité normale
                          // et on garde la quantité surplus dans la liste d'attente
                          if (item.surplusQuantity && item.surplusQuantity > 0) {
                            const confirmAdd = confirm(t('confirmAddNormalQuantity').replace('{surplusQuantity}', item.surplusQuantity.toString()).replace('{quantity}', item.quantity.toString()));
                            if (!confirmAdd) return;
                          }
                          
                          // Pré-remplir les données pour l'inventaire
                          const prefilled = {
                            name: item.name,
                            code: item.code,
                            category: item.category,
                            unitPrice: item.unitPrice,
                            quantity: item.quantity
                          };
                          // Mémoriser l'ID à retirer après ajout
                          localStorage.setItem('waitingListRemoveId', item.id);
                          localStorage.setItem('prefilledProductData', JSON.stringify(prefilled));
                          // Naviguer à l'inventaire
                          window.location.hash = '#inventory';
                        }}
                        disabled={item.missingQuantity && item.missingQuantity > 0}
                        className={`px-2 py-1 text-xs rounded ${
                          item.missingQuantity && item.missingQuantity > 0
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : item.surplusQuantity && item.surplusQuantity > 0
                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {item.surplusQuantity && item.surplusQuantity > 0 ? t('addNormalQuantity') : t('addToInventory')}
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


