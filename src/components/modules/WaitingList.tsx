import React, { useEffect, useState } from 'react';

type WaitingFlag = 'normal' | 'missing' | 'surplus';

interface WaitingItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  category: string;
  flag: WaitingFlag;
  createdAt: string;
}

const WaitingList: React.FC = () => {
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
    if (confirm('Vider toute la liste d’attente ?')) {
      persist([]);
    }
  };

  const totalAmount = items.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Liste d’attente des produits</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Total: <span className="font-semibold">{totalAmount.toLocaleString()} DH</span>
          </div>
          <button onClick={clearAll} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">Vider</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-300">
          Aucun produit dans la liste d’attente pour le moment.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="text-left px-4 py-2">Nom</th>
                <th className="text-left px-4 py-2">Code</th>
                <th className="text-left px-4 py-2">Catégorie</th>
                <th className="text-left px-4 py-2">État quantité</th>
                <th className="text-left px-4 py-2">Unité</th>
                <th className="text-left px-4 py-2">Prix unitaire</th>
                <th className="text-left px-4 py-2">Total</th>
                <th className="text-left px-4 py-2">Quantité</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.code}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.category}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.quantity}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.unit}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.unitPrice.toLocaleString()} DH</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{(item.quantity * item.unitPrice).toLocaleString()} DH</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.flag === 'missing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' : item.flag === 'surplus' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'}`}>
                      {item.flag === 'missing' ? 'Manquante' : item.flag === 'surplus' ? 'Surplus' : 'Normale'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
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
                        className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        Ajouter à l'inventaire
                      </button>
                      <button onClick={() => removeItem(item.id)} className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded">Supprimer</button>
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


