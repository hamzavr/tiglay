import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

type WaitingFlag = 'normal' | 'missing' | 'surplus';

interface WaitingItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  missingQuantity?: number;
  surplusQuantity?: number;
  flag: WaitingFlag;
  createdAt: string;
  documentId?: string; // ID du document source
  supplierId?: string; // ID du fournisseur
}

const WaitingList: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<WaitingItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('waitingListProducts');
      let currentItems: WaitingItem[] = [];
      
      if (raw) {
        const parsedItems = JSON.parse(raw);
        // Migration des anciens items vers la nouvelle structure
        const migratedItems = parsedItems.map((item: any) => ({
          ...item,
          buyPrice: item.buyPrice || item.unitPrice || 0,
          sellPrice: item.sellPrice || (item.unitPrice ? item.unitPrice * 1.5 : 0),
          missingQuantity: item.missingQuantity || 0,
          surplusQuantity: item.surplusQuantity || 0,
          // Supprimer les anciens champs
          unitPrice: undefined,
          remainingQuantity: undefined
        }));
        currentItems = migratedItems;
        setItems(migratedItems);
      }
      
       // Vérifier s'il y a des données pré-remplies
       const prefilledData = localStorage.getItem('waitingListPrefilledData');
       if (prefilledData) {
         const data = JSON.parse(prefilledData);
         
         // Vérifier si le produit existe déjà dans la liste d'attente
         const existingItem = currentItems.find(item => item.code === data.code);
         
         if (existingItem) {
           // Vérifier si les données ont vraiment changé
           const hasChanges = 
             existingItem.quantity !== data.quantity ||
             existingItem.unit !== data.unit ||
             existingItem.buyPrice !== data.buyPrice ||
             existingItem.sellPrice !== data.sellPrice ||
             existingItem.missingQuantity !== data.missingQuantity ||
             existingItem.surplusQuantity !== data.surplusQuantity;

           // Mettre à jour le produit existant
           const updatedItems = currentItems.map(item => 
             item.id === existingItem.id 
               ? {
                   ...item,
                   quantity: data.quantity,
                   unit: data.unit,
                   buyPrice: data.buyPrice,
                   sellPrice: data.sellPrice,
                   missingQuantity: data.missingQuantity,
                   surplusQuantity: data.surplusQuantity,
                   documentId: data.documentId, // Mettre à jour l'ID du document
                   supplierId: data.supplierId, // Mettre à jour l'ID du fournisseur
                   updatedAt: new Date().toISOString()
                 }
               : item
           );
           setItems(updatedItems);
           localStorage.setItem('waitingListProducts', JSON.stringify(updatedItems));
           
           if (hasChanges) {
             if (data.isUpdate) {
               alert('Produit modifié dans la liste d\'attente');
             } else {
               alert('Produit mis à jour dans la liste d\'attente');
             }
           } else {
             alert('Produit déjà présent dans la liste d\'attente (aucune modification)');
           }
         } else {
           // Créer un nouveau produit
           const newItem: WaitingItem = {
             id: `item-${Date.now()}`,
             name: data.name,
             code: data.code,
             quantity: data.quantity,
             unit: data.unit,
             buyPrice: data.buyPrice,
             sellPrice: data.sellPrice,
             missingQuantity: data.missingQuantity,
             surplusQuantity: data.surplusQuantity,
             flag: 'normal',
             createdAt: new Date().toISOString(),
             documentId: data.documentId, // Inclure l'ID du document
             supplierId: data.supplierId // Inclure l'ID du fournisseur
           };
           
           const updatedItems = [...currentItems, newItem];
           setItems(updatedItems);
           localStorage.setItem('waitingListProducts', JSON.stringify(updatedItems));
           alert('Produit ajouté à la liste d\'attente');
         }
         
         localStorage.removeItem('waitingListPrefilledData');
      }
    } catch (_) {
      setItems([]);
    }
  }, []);

  const persist = (next: WaitingItem[]) => {
    setItems(next);
    localStorage.setItem('waitingListProducts', JSON.stringify(next));
  };

  // Sauvegarder les items dans localStorage quand ils changent
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('waitingListProducts', JSON.stringify(items));
    }
  }, [items]);

  // Gérer les données pré-remplies qui arrivent après le chargement initial
  useEffect(() => {
    const handlePrefilledData = () => {
      const prefilledData = localStorage.getItem('waitingListPrefilledData');
      if (prefilledData) {
        try {
          const data = JSON.parse(prefilledData);
          
          // Vérifier si le produit existe déjà dans la liste d'attente
          const existingItem = items.find(item => item.code === data.code);
          
          if (existingItem) {
            // Vérifier si les données ont vraiment changé
            const hasChanges = 
              existingItem.quantity !== data.quantity ||
              existingItem.unit !== data.unit ||
              existingItem.buyPrice !== data.buyPrice ||
              existingItem.sellPrice !== data.sellPrice ||
              existingItem.missingQuantity !== data.missingQuantity ||
              existingItem.surplusQuantity !== data.surplusQuantity;

            // Mettre à jour le produit existant
            const updatedItems = items.map(item => 
              item.id === existingItem.id 
                ? {
                    ...item,
                    quantity: data.quantity,
                    unit: data.unit,
                    buyPrice: data.buyPrice,
                    sellPrice: data.sellPrice,
                    missingQuantity: data.missingQuantity,
                    surplusQuantity: data.surplusQuantity,
                    documentId: data.documentId, // Mettre à jour l'ID du document
                    supplierId: data.supplierId, // Mettre à jour l'ID du fournisseur
                    updatedAt: new Date().toISOString()
                  }
                : item
            );
            setItems(updatedItems);
            
            if (hasChanges) {
              if (data.isUpdate) {
                alert('Produit modifié dans la liste d\'attente');
              } else {
                alert('Produit mis à jour dans la liste d\'attente');
              }
            } else {
              alert('Produit déjà présent dans la liste d\'attente (aucune modification)');
            }
          } else {
            // Créer un nouveau produit
            const newItem: WaitingItem = {
              id: `item-${Date.now()}`,
              name: data.name,
              code: data.code,
              quantity: data.quantity,
              unit: data.unit,
              buyPrice: data.buyPrice,
              sellPrice: data.sellPrice,
              missingQuantity: data.missingQuantity,
              surplusQuantity: data.surplusQuantity,
              flag: 'normal',
              createdAt: new Date().toISOString(),
              documentId: data.documentId, // Inclure l'ID du document
              supplierId: data.supplierId // Inclure l'ID du fournisseur
            };
            
            setItems(prev => [...prev, newItem]);
            alert('Produit ajouté à la liste d\'attente');
          }
          
          localStorage.removeItem('waitingListPrefilledData');
        } catch (error) {
          console.error('Erreur lors du traitement des données pré-remplies:', error);
          localStorage.removeItem('waitingListPrefilledData');
        }
      }
    };

    // Vérifier immédiatement
    handlePrefilledData();

    // Écouter les changements de localStorage
    const interval = setInterval(handlePrefilledData, 100);
    
    return () => clearInterval(interval);
  }, [items]);

  const removeItem = (id: string) => {
    persist(items.filter(i => i.id !== id));
  };

  const clearAll = () => {
    if (confirm(t('confirmClearWaitingList'))) {
      persist([]);
    }
  };

  const totalAmount = items.reduce((sum, it) => sum + (it.quantity * (it.sellPrice || 0)), 0);

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
                <th className="text-left px-4 py-2">{t('unit')}</th>
                <th className="text-left px-4 py-2">Prix de vente</th>
                <th className="text-left px-4 py-2">Quantité Manquante</th>
                <th className="text-left px-4 py-2">Quantité Surplus</th>
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
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{item.unit}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{(item.sellPrice || 0).toLocaleString()} DH</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={item.missingQuantity || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const updatedItems = items.map(i => 
                          i.id === item.id 
                            ? { ...i, missingQuantity: value, surplusQuantity: value > 0 ? 0 : i.surplusQuantity }
                            : i
                        );
                        persist(updatedItems);
                      }}
                      placeholder="0"
                      min="0"
                      className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={item.surplusQuantity || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const updatedItems = items.map(i => 
                          i.id === item.id 
                            ? { ...i, surplusQuantity: value, missingQuantity: value > 0 ? 0 : i.missingQuantity }
                            : i
                        );
                        persist(updatedItems);
                      }}
                      placeholder="0"
                      min="0"
                      className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{(item.quantity * (item.sellPrice || 0)).toLocaleString()} DH</td>
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
                            buyPrice: item.buyPrice, // Utiliser le prix unitaire du document (Bon de commande fournisseur)
                            sellPrice: foundProduct ? foundProduct.sellPrice : item.sellPrice, // Prix de vente estimé
                            stock: item.quantity,
                            missingQuantity: item.missingQuantity || 0,
                            surplusQuantity: item.surplusQuantity || 0,
                            primeNumber: foundProduct ? foundProduct.primeNumber : 2,
                            location: foundProduct ? foundProduct.location : 'A1-B1',
                            supplierId: item.supplierId // Inclure l'ID du fournisseur
                          };
                          
                          // Mémoriser l'ID à retirer après ajout
                          localStorage.setItem('waitingListRemoveId', item.id);
                          localStorage.setItem('prefilledProductData', JSON.stringify(prefilled));
                          // Déclencher un événement pour changer d'onglet
                          window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'inventory' }));
                        }}
                        className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white"
                      >
{t('inventory')}
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


