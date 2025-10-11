import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Plus, X, CheckCircle, Circle, Clock, AlertCircle, Filter, Search, Edit, Trash2, Save, Calendar, User, Package, Truck, Receipt, FileCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApi } from '../../hooks/useApi';
import { documentsAPI, suppliersAPI, clientsAPI, productsAPI } from '../../services/api';
import PDFGenerator from '../../services/pdfGenerator';
import companyConfig from '../../config/company';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Document {
  id: string;
  type: 'supplier_purchase_order' | 'reception_slip' | 'stock_entry' | 'customer_sales_order' | 'delivery_note' | 'invoice';
  number: string;
  createdAt: string;
  Client?: { id: string; name: string };
  Supplier?: { id: string; name: string };
  amount: number | string; // Allow both number and string to handle API inconsistencies
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  workflowStep: number;
  linkedDocuments?: string[];
  notes?: string;
  items?: Array<{
    id: string;
    code: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
}

interface DocumentFormData {
  type: string;
  clientId?: string;
  supplierId?: string;
  amount: number;
  status: string;
  notes: string;
  deliveryDate?: string;
  items: Array<{
    id: string;
    code: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  enteredQuantities?: Record<string, number>;
}

interface Client {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

const Documents: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState<DocumentFormData>({
    type: '',
    clientId: '',
    supplierId: '',
    amount: 0,
    status: 'draft',
    notes: '',
    items: [],
    enteredQuantities: {}
  });

  // Fetch documents from API
  const { data: documents, loading: documentsLoading, error: documentsError, execute: fetchDocuments } = useApi(documentsAPI.getAll);
  const { data: productCatalog = [], execute: fetchProducts } = useApi(productsAPI.getAll);
  const { data: clients, execute: fetchClients } = useApi(clientsAPI.getAll);
  const { data: suppliers, execute: fetchSuppliers } = useApi(suppliersAPI.getAll);
  const { execute: createDocument } = useApi(documentsAPI.create);
  const { execute: updateDocument } = useApi(documentsAPI.update);
  const { execute: deleteDocument } = useApi(documentsAPI.delete);

  // Load data on component mount
  useEffect(() => {
    fetchDocuments();
    fetchClients();
    fetchSuppliers();
    fetchProducts({});
  }, []);

  // Debug: Log documents when they are loaded
  useEffect(() => {
    if (documents) {
      console.log('Documents loaded:', documents);
      const customerOrders = documents.filter(doc => doc.type === 'customer_sales_order');
      console.log('Customer orders:', customerOrders);
      customerOrders.forEach(order => {
        console.log(`Order ${order.number} items:`, order.items);
        console.log(`Order ${order.number} Client:`, order.Client);
        console.log(`Order ${order.number} clientId:`, order.clientId);
      });
      
      // Debug all documents for Client/Supplier relations
      documents.forEach(doc => {
        console.log(`Document ${doc.number} (${doc.type}):`, {
          clientId: doc.clientId,
          supplierId: doc.supplierId,
          Client: doc.Client,
          Supplier: doc.Supplier
        });
      });
    }
  }, [documents]);

  const documentTypes = {
    all: t('allDocuments'),
    supplier_purchase_order: t('supplierPurchaseOrder'),
    reception_slip: t('receptionSlip'),
    stock_entry: t('stockEntry'),
    customer_sales_order: t('customerSalesOrder'),
    delivery_note: t('deliveryNote'),
    invoice: t('invoiceDoc')
  };

  const manualDocumentTypes = {
    reception_slip: t('receptionSlip'),
    stock_entry: t('stockEntry')
  };

  const allDocumentTypes = {
    supplier_purchase_order: t('supplierPurchaseOrder'),
    reception_slip: t('receptionSlip'),
    stock_entry: t('stockEntry'),
    customer_sales_order: t('customerSalesOrder'),
    delivery_note: t('deliveryNote'),
    invoice: t('invoiceDoc')
  };

  const statusTypes = {
    all: t('allStatuses'),
    draft: t('draft'),
    sent: t('sent'),
    paid: t('paid'),
    cancelled: t('cancelled')
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'supplier_purchase_order':
        return <Package className="w-4 h-4" />;
      case 'reception_slip':
        return <Truck className="w-4 h-4" />;
      case 'stock_entry':
        return <Package className="w-4 h-4" />;
      case 'customer_sales_order':
        return <Receipt className="w-4 h-4" />;
      case 'delivery_note':
        return <Truck className="w-4 h-4" />;
      case 'invoice':
        return <FileCheck className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'supplier_purchase_order':
        return 'text-blue-600 dark:text-blue-400';
      case 'reception_slip':
        return 'text-green-600 dark:text-green-400';
      case 'stock_entry':
        return 'text-purple-600 dark:text-purple-400';
      case 'customer_sales_order':
        return 'text-orange-600 dark:text-orange-400';
      case 'delivery_note':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'invoice':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Helper function to safely parse amount values
  const parseAmount = (amount: number | string): number => {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') return parseFloat(amount) || 0;
    return 0;
  };

  const filteredDocuments = (documents || []).filter(doc => {
    const matchesSearch = doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.Client?.name && doc.Client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (doc.Supplier?.name && doc.Supplier.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Document management functions
  const openAddModal = () => {
    setEditingDocument(null);
    setFormData({
      type: '',
      clientId: '',
      supplierId: '',
      amount: 0,
      status: 'draft',
      notes: '',
      items: [],
      enteredQuantities: {}
    });
    setIsModalOpen(true);
  };

  const openEditModal = (document: Document) => {
    console.log('Opening edit modal for document:', document);
    console.log('Document items for editing:', document.items);
    setEditingDocument(document);
    
    // Charger les quantités entrées sauvegardées
    let savedEnteredQuantities = {};
    if (document.type === 'supplier_purchase_order') {
      try {
        const saved = localStorage.getItem(`enteredQuantities_${document.id}`);
        if (saved) {
          savedEnteredQuantities = JSON.parse(saved);
        }
      } catch (e) {
        console.error('Error loading saved entered quantities:', e);
      }
    }
    
    setFormData({
      type: document.type,
      clientId: document.Client?.id || '',
      supplierId: document.Supplier?.id || '',
      amount: document.amount,
      status: document.status,
      notes: document.notes || '',
      items: document.items || [],
      enteredQuantities: savedEnteredQuantities
    });
    setIsModalOpen(true);
  };

  const openViewModal = (document: Document) => {
    console.log('Opening view modal for document:', document);
    console.log('Document items:', document.items);
    setViewingDocument(document);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDocument(null);
    setFormData({
      type: '',
      clientId: '',
      supplierId: '',
      amount: 0,
      status: 'draft',
      notes: '',
      items: []
    });
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingDocument(null);
  };

  const addDocumentItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      code: '',
      description: '',
      quantity: 1,
      unit: 'U',
      unitPrice: 0,
      total: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeDocumentItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateDocumentItem = (itemId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const getFormTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  // Fonction pour calculer le total des produits dans les notes d'un bon de commande fournisseur
  const getSupplierOrderTotal = () => {
    if (!formData.notes || formData.type !== 'supplier_purchase_order') {
      return 0;
    }
    
    const lines = formData.notes.split('\n');
    const productsStartIndex = lines.findIndex(line => line.includes('Produits commandés:'));
    const notesStartIndex = lines.findIndex(line => line.includes('Notes:'));
    
    if (productsStartIndex === -1) return 0;
    
    const products = lines.slice(productsStartIndex + 1, notesStartIndex).filter(line => line.trim().startsWith('•'));
    
    return products.reduce((total, product) => {
      // Utiliser une regex pour extraire le total directement
      const totalMatch = product.match(/=\s*([\d.]+)\s*DH/);
      const productTotal = totalMatch ? parseFloat(totalMatch[1]) : 0;
      return total + productTotal;
    }, 0);
  };

  // Fonction pour recalculer et mettre à jour le total et les informations des produits
  const updateProductInfo = (productIndex: number, field: string, value: any) => {
    const lines = formData.notes.split('\n');
    const productsStartIndex = lines.findIndex(line => line.includes('Produits commandés:'));
    const notesStartIndex = lines.findIndex(line => line.includes('Notes:'));
    
    if (productsStartIndex === -1 || notesStartIndex === -1) return;
    
    const products = lines.slice(productsStartIndex + 1, notesStartIndex).filter(line => line.trim().startsWith('•'));
    if (productIndex >= products.length) return;

    const product = products[productIndex];
    const nameCodeCategoryMatch = product.match(/•\s*(.+?):/);
    if (!nameCodeCategoryMatch) return;

    const nameCodeCategory = nameCodeCategoryMatch[1];
    const nameCodeCategoryParts = nameCodeCategory.split(' [');
    const nameCode = nameCodeCategoryParts[0];

    let newProduct = product;
    
    if (field === 'nameCode') {
      const newNameCodeCategory = `${value}`;
      newProduct = product.replace(nameCodeCategory, newNameCodeCategory);
    } else if (field === 'quantity') {
      const quantityUnitMatch = product.match(/:\s*(\d+)\s*(\w+)/);
      if (quantityUnitMatch) {
        const unit = quantityUnitMatch[2];
        const priceMatch = product.match(/×\s*([\d.]+)\s*DH/);
        const price = priceMatch ? priceMatch[1] : '0';
        const total = (parseFloat(value) * parseFloat(price)).toFixed(2);
        newProduct = product.replace(quantityUnitMatch[0], `: ${value} ${unit}`).replace(/=\s*[\d.]+\s*DH/, `= ${total} DH`);
      }
    } else if (field === 'unitPrice') {
      const quantityUnitMatch = product.match(/:\s*(\d+)\s*(\w+)/);
      if (quantityUnitMatch) {
        const quantity = quantityUnitMatch[1];
        const unit = quantityUnitMatch[2];
        const total = (parseFloat(quantity) * parseFloat(value)).toFixed(2);
        newProduct = product.replace(/×\s*[\d.]+\s*DH/, `× ${value} DH`).replace(/=\s*[\d.]+\s*DH/, `= ${total} DH`);
      }
    }

    // Remplacer le produit dans les notes
    const newNotes = formData.notes.replace(product, newProduct);
    setFormData({ ...formData, notes: newNotes });
  };

  // Ajouter un produit à la liste d'attente (localStorage)
  type WaitingAddResult = 'added' | 'updated' | 'exists' | 'error';


  const addProductToWaitingList = (item: {
    name: string;
    code: string;
    quantity: number;
    remainingQuantity?: number;
    unit: string;
    unitPrice: number;
  }, flag: 'normal' | 'missing' | 'surplus'): WaitingAddResult => {
    try {
      const raw = localStorage.getItem('waitingListProducts');
      const list: any[] = raw ? JSON.parse(raw) : [];

      // Dedupe par code
      const keyMatch = (p: any) => p.code === item.code;
      const idx = list.findIndex(keyMatch);

      if (idx >= 0) {
        const existing = list[idx];
        const sameFlag = existing.flag === flag;
        const updated = {
          ...existing,
          // toujours rafraîchir quantités/prix éventuels
          quantity: item.quantity,
          remainingQuantity: item.remainingQuantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          flag,
        };
        list[idx] = updated;
        localStorage.setItem('waitingListProducts', JSON.stringify(list));
        return sameFlag ? 'exists' : 'updated';
      }

      const entry = {
        id: `wait-${Date.now()}`,
        name: item.name,
        code: item.code,
        quantity: item.quantity,
        remainingQuantity: item.remainingQuantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        flag,
        createdAt: new Date().toISOString()
      };
      const next = [entry, ...list];
      localStorage.setItem('waitingListProducts', JSON.stringify(next));
      return 'added';
    } catch (e) {
      console.error('Erreur lors de l\'ajout à la liste d\'attente:', e);
      return 'error';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type) {
      alert('Veuillez sélectionner un type de document');
      return;
    }

    // Pour les documents automatiques, on ne vérifie pas les articles
    const isAutomaticDocument = ['supplier_purchase_order', 'customer_sales_order', 'delivery_note', 'invoice'].includes(formData.type);
    
    if (!isAutomaticDocument && formData.items.length === 0) {
      alert('Veuillez ajouter au moins un article');
      return;
    }

    try {
      const documentData = {
        ...formData,
        amount: isAutomaticDocument ? 
          (formData.type === 'supplier_purchase_order' ? getSupplierOrderTotal() : formData.amount) : 
          getFormTotal()
      };

      // Enregistrer les quantités entrées pour les documents de type supplier_purchase_order
      if (formData.type === 'supplier_purchase_order' && formData.enteredQuantities) {
        localStorage.setItem(`enteredQuantities_${editingDocument?.id || 'new'}`, JSON.stringify(formData.enteredQuantities));
      }

      // Debug: afficher les données envoyées
      console.log('Document data to send:', documentData);
      console.log('Editing document:', editingDocument);

      if (editingDocument) {
        await updateDocument(editingDocument.id, documentData);
        // Mettre à jour viewingDocument si c'est le même document
        if (viewingDocument && viewingDocument.id === editingDocument.id) {
          // Recharger le document depuis la liste mise à jour
          setTimeout(() => {
            const updatedDoc = documents.find(doc => doc.id === editingDocument.id);
            if (updatedDoc) {
              setViewingDocument(updatedDoc);
            }
          }, 100);
        }
      } else {
        await createDocument(documentData);
      }
      
      closeModal();
      fetchDocuments();
    } catch (error: any) {
      console.error('Error details:', error);
      alert(`Erreur lors de ${editingDocument ? 'la modification' : 'la création'} du document: ${error.message || error.response?.data?.message || 'Erreur serveur'}`);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        await deleteDocument(documentId);
        fetchDocuments();
      } catch (error: any) {
        alert('Erreur lors de la suppression du document');
      }
    }
  };

  const handleDownloadPDF = (document: Document) => {
    try {
      const pdfGenerator = new PDFGenerator(companyConfig);
      const pdf = pdfGenerator.generateDocument(document, document.type);
      const filename = `${document.type}_${document.number}.pdf`;
      pdfGenerator.download(filename);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  const handleCreateInvoice = async (customerOrder: Document) => {
    try {
      // Créer une facture basée sur le bon de commande client
      const invoiceData = {
        type: 'invoice',
        clientId: customerOrder.Client?.id || customerOrder.clientId,
        amount: customerOrder.amount,
        status: 'draft',
        notes: `Facture générée à partir du bon de commande ${customerOrder.number}`,
        items: customerOrder.items || []
      };

      await createDocument(invoiceData);
      alert('Facture créée avec succès');
      fetchDocuments(); // Rafraîchir la liste des documents
    } catch (error: any) {
      console.error('Erreur lors de la création de la facture:', error);
      alert(`Erreur lors de la création de la facture: ${error.message || 'Erreur serveur'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('documents')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('manageAllDocuments')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalDocuments')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{filteredDocuments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('paid')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {filteredDocuments.filter(d => d.status === 'paid').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
              <Clock className="w-6 h-6" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('pending')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {filteredDocuments.filter(d => d.status === 'sent').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalAmount')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {filteredDocuments.reduce((sum, d) => sum + parseAmount(d.amount), 0).toLocaleString()} DH
              </p>
            </div>
          </div>
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
                placeholder={t('searchByNumber')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
            </div>
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            title="Filtrer par type de document"
          >
            {Object.entries(documentTypes).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            title="Filtrer par statut"
          >
            {Object.entries(statusTypes).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Loading State */}
      {documentsLoading && (
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">{t('loadingDocuments')}</p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {documentsError && (
        <Card>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-500 dark:text-red-400 mb-4">{t('errorLoadingDocuments')}</p>
            <Button variant="secondary" onClick={() => fetchDocuments()}>
              {t('retry')}
            </Button>
          </div>
        </Card>
      )}

      {/* Documents Table */}
      {!documentsLoading && !documentsError && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('type')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('number')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('step')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('date')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('clientSupplier')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('amount')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('status')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('linkedDocuments')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className={`${getTypeColor(doc.type)}`}>
                        {getTypeIcon(doc.type)}
                      </div>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {documentTypes[doc.type as keyof typeof documentTypes]}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-mono">{doc.number}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                      {doc.workflowStep}/6
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {doc.Client?.name 
                      || (doc.clientId && (clients || []).find((c: any) => c.id === (doc as any).clientId)?.name)
                      || doc.Supplier?.name 
                      || (doc.supplierId && (suppliers || []).find((s: any) => s.id === (doc as any).supplierId)?.name)
                      || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                    {parseAmount(doc.amount).toLocaleString()} DH
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                      {statusTypes[doc.status as keyof typeof statusTypes]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {doc.linkedDocuments && doc.linkedDocuments.length > 0 && (
                      <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2 py-1 rounded">
                        {doc.linkedDocuments.length} liés
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openViewModal(doc)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title={t('viewDocument')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(doc)}
                        className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title={t('downloadPDF')}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEditModal(doc)}
                        className="p-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                        title={t('editDocument')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title={t('deleteDocument')}
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
      )}

      {/* No Documents State */}
      {!documentsLoading && !documentsError && filteredDocuments.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('noDocumentsFound')}</p>
          </div>
        </Card>
      )}

      {/* Create/Edit Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingDocument ? t('modifyDocument') : t('newDocument')}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title={t('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Document Type and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('documentType')} *
                    {editingDocument && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({t('notModifiable')})</span>
                    )}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white ${
                      editingDocument 
                        ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' 
                        : 'bg-white dark:bg-gray-700'
                    }`}
                    required
                    title={t('documentType')}
                    disabled={editingDocument ? true : false}
                  >
                    <option value="">{t('selectType')}</option>
                    {Object.entries(editingDocument ? allDocumentTypes : manualDocumentTypes).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    title={t('documentStatus')}
                  >
                    <option value="draft">{t('draft')}</option>
                    <option value="sent">{t('sent')}</option>
                    <option value="paid">{t('paid')}</option>
                    <option value="cancelled">{t('cancelled')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('totalAmount')}
                  </label>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formData.type === 'supplier_purchase_order' ? getSupplierOrderTotal().toLocaleString() : getFormTotal().toLocaleString()} DH
                  </div>
                </div>
              </div>

              {/* Client/Supplier Selection - Hidden for supplier_purchase_order, customer_sales_order, delivery_note, invoice */}
              {!(['supplier_purchase_order','customer_sales_order','delivery_note','invoice'].includes(formData.type)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('client')}
                    </label>
                    <select
                      value={formData.clientId || ''}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      title={t('selectClient')}
                    >
                      <option value="">{t('selectClient')}</option>
                      {(clients || []).map((client: Client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fournisseur
                    </label>
                    <select
                      value={formData.supplierId || ''}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      title="Sélectionner un fournisseur"
                    >
                      <option value="">Sélectionner un fournisseur</option>
                      {(suppliers || []).map((supplier: Supplier) => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Customer Order Details for editing customer_sales_order */}
              {editingDocument && formData.type === 'customer_sales_order' && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('customerOrderDetails')}</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('orderTotal')}
                        </label>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {parseAmount(formData.amount).toLocaleString()} DH
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              )}

              {/* Items Table - allow editing items for delivery_note and invoice same as customer_sales_order */}
              {(!editingDocument || !['supplier_purchase_order'].includes(formData.type)) && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{t('articles')}</h4>
                    {!['customer_sales_order', 'delivery_note', 'invoice'].includes(formData.type) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={addDocumentItem}
                      >
                        Ajouter un article
                      </Button>
                    )}
                  </div>

                {formData.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {['customer_sales_order', 'delivery_note', 'invoice'].includes(formData.type)
                      ? 'Aucun article dans ce document.' 
                      : 'Aucun article ajouté. Cliquez sur "Ajouter un article" pour commencer.'
                    }
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('code')}
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('description')}
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('quantity')}
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
                        {formData.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.code}
                                onChange={(e) => updateDocumentItem(item.id, 'code', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                placeholder="Code produit"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateDocumentItem(item.id, 'description', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                placeholder="Description du produit"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateDocumentItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                min="1"
                                title="Quantité"
                                placeholder="Quantité"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={item.unit}
                                onChange={(e) => updateDocumentItem(item.id, 'unit', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                title="Unité de mesure"
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
                                onChange={(e) => updateDocumentItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                min="0"
                                step="0.01"
                                title="Prix unitaire"
                                placeholder="Prix unitaire"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.total.toLocaleString()} DH
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => removeDocumentItem(item.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                title="Supprimer cet article"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                </div>
              )}

              {/* Information for automatic documents - keep for supplier_purchase_order only */}
              {editingDocument && ['supplier_purchase_order'].includes(formData.type) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center text-blue-800 dark:text-blue-200">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{t('automaticDocument')}</span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    {t('documentGeneratedByWorkflow')}
                  </p>
                </div>
              )}

              {/* Supplier Order Details for editing supplier_purchase_order */}
              {editingDocument && formData.type === 'supplier_purchase_order' && formData.notes ? (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('supplierOrderDetails')}</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                    {(() => {
                      const notes = formData.notes;
                      const lines = notes.split('\n');
                      const deliveryDateLine = lines.find(line => line.includes('Date de livraison souhaitée:'));
                      const totalLine = lines.find(line => line.includes('Total:'));
                      const productsStartIndex = lines.findIndex(line => line.includes('Produits commandés:'));
                      const notesStartIndex = lines.findIndex(line => line.includes('Notes:'));
                      
                      const deliveryDate = deliveryDateLine ? deliveryDateLine.split(': ')[1] : '';
                      const total = totalLine ? totalLine.split(': ')[1] : '';
                      const products = lines.slice(productsStartIndex + 1, notesStartIndex).filter(line => line.trim().startsWith('•'));
                      const notesText = notesStartIndex >= 0 ? lines.slice(notesStartIndex + 1).join('\n').trim() : '';
                      
                      return (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('desiredDeliveryDate')}
                              </label>
                              <input
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => {
                                  const newNotes = notes.replace(
                                    /Date de livraison souhaitée: .*/,
                                    `Date de livraison souhaitée: ${e.target.value}`
                                  );
                                  setFormData({ ...formData, notes: newNotes });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('total')}
                              </label>
                              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                {getSupplierOrderTotal().toLocaleString()} DH
                              </div>
                            </div>
                          </div>
                          
                          {products.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('orderedProducts')}
                              </label>
                              <div className="space-y-2">
                                {products.map((product, index) => {
                                  const parts = product.replace('• ', '').split(': ');
                                  const nameCodeCategory = parts[0];
                                  const details = parts[1] ? parts[1].split(' × ') : [];
                                  const quantityUnit = details[0] ? details[0].split(' ') : [];
                                  const priceTotal = details[1] ? details[1].split(' = ') : [];
                                  
                                  // Extraire le prix unitaire correctement
                                  // Format: "quantité unité × prix DH = total DH"
                                  // priceTotal[0] contient "prix DH"
                                  const unitPrice = priceTotal[0] ? priceTotal[0].replace(' DH', '') : '';
                                  
                                  
                                  // Extraire nom, code et catégorie
                                  const nameCodeCategoryParts = nameCodeCategory.split(' [');
                                  const nameCode = nameCodeCategoryParts[0];
                                  
                                  return (
                                    <div key={index} className="grid grid-cols-2 md:grid-cols-8 gap-2 p-2 bg-white dark:bg-gray-600 rounded border">
                                      <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">{t('nameCode')}</label>
                                        <input
                                          type="text"
                                          value={nameCode}
                                          onChange={(e) => {
                                            const newNameCode = e.target.value;
                                            updateProductInfo(index, 'nameCode', newNameCode);
                                          }}
                                          className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">{t('quantity')}</label>
                                        <input
                                          type="text"
                                          value={quantityUnit[0] || ''}
                                          onChange={(e) => {
                                            const newQuantity = e.target.value;
                                            // Validation: seulement des nombres entiers
                                            if (newQuantity === '' || /^\d+$/.test(newQuantity)) {
                                              updateProductInfo(index, 'quantity', newQuantity);
                                            }
                                          }}
                                          placeholder="1"
                                          className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">{t('unitPrice')}</label>
                                        <input
                                          type="text"
                                          value={(() => {
                                            // Extraire le prix unitaire depuis la ligne du produit
                                            const priceMatch = product.match(/×\s*([\d.]+)\s*DH/);
                                            return priceMatch ? priceMatch[1] : '';
                                          })()}
                                          onChange={(e) => {
                                            const newPrice = e.target.value;
                                            // Validation: seulement des nombres et un point décimal
                                            if (newPrice === '' || /^\d*\.?\d*$/.test(newPrice)) {
                                              updateProductInfo(index, 'unitPrice', newPrice);
                                            }
                                          }}
                                          placeholder="0.00"
                                          className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">{t('total')}</label>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white py-1">
                                          {(() => {
                                            const totalMatch = product.match(/=\s*([\d.]+)\s*DH/);
                                            return totalMatch ? `${totalMatch[1]} DH` : '0.00 DH';
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
{t('notes')}
                            </label>
                            <textarea
                              value={notesText}
                              onChange={(e) => {
                                const newNotes = notes.replace(
                                  /Notes: .*/s,
                                  `Notes: ${e.target.value}`
                                );
                                setFormData({ ...formData, notes: newNotes });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              rows={3}
                              placeholder="Notes et conditions..."
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : formData.type !== 'customer_sales_order' && (
                /* Regular Notes for other document types */
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
{t('notesOptional')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={4}
                    placeholder="Notes et conditions..."
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={closeModal}>
                  {t('cancel')}
                </Button>
                <Button variant="primary" type="submit" icon={<Save className="w-4 h-4" />}>
                  {editingDocument ? t('edit') : t('create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {isViewModalOpen && viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Document - {viewingDocument.number}
              </h3>
              <button
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title={t('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Document Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('type')}
                  </label>
                  <div className="flex items-center">
                    <div className={`${getTypeColor(viewingDocument.type)} mr-2`}>
                      {getTypeIcon(viewingDocument.type)}
                    </div>
                    <span className="text-gray-900 dark:text-white">
                      {documentTypes[viewingDocument.type as keyof typeof documentTypes]}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('number')}
                  </label>
                  <div className="text-gray-900 dark:text-white font-mono">{viewingDocument.number}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('creationDate')}
                  </label>
                  <div className="text-gray-900 dark:text-white">
                    {new Date(viewingDocument.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('status')}
                  </label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(viewingDocument.status)}`}>
                    {statusTypes[viewingDocument.status as keyof typeof statusTypes]}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('workflowStep')}
                  </label>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                    {viewingDocument.workflowStep}/6
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('totalAmount')}
                  </label>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {parseAmount(viewingDocument.amount).toLocaleString()} DH
                  </div>
                </div>
              </div>

              {/* Client/Supplier Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewingDocument.Client && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('client')}
                    </label>
                    <div className="text-gray-900 dark:text-white">{viewingDocument.Client.name}</div>
                  </div>
                )}

                {viewingDocument.Supplier && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('supplier')}
                    </label>
                    <div className="text-gray-900 dark:text-white">{viewingDocument.Supplier.name}</div>
                  </div>
                )}
              </div>

              {/* Items Table - Hidden for customer_sales_order */}
              {viewingDocument.items && viewingDocument.items.length > 0 && viewingDocument.type !== 'customer_sales_order' && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('articles')}</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          {viewingDocument.type === 'delivery_note' && (
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {t('image')}
                            </th>
                          )}
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('code')}
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('description')}
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('quantity')}
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
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                        {viewingDocument.items.map((item, index) => {
                          // Pour les delivery_note, on cherche l'image du produit
                          let productImage = null;
                          if (viewingDocument.type === 'delivery_note') {
                            const catalog: any[] = Array.isArray(productCatalog) ? (productCatalog as any) : [];
                            const byCode = catalog.find(p => String(p.code || '').toLowerCase() === String(item.code || '').toLowerCase());
                            const byName = catalog.find(p => String(p.name || '').toLowerCase() === String(item.description || '').toLowerCase());
                            const prod = byCode || byName;
                            productImage = prod?.image;
                          }
                          
                          return (
                            <tr key={index}>
                              {viewingDocument.type === 'delivery_note' && (
                                <td className="px-3 py-2">
                                  {productImage ? (
                                    <img src={productImage} alt={item.description} className="h-10 w-10 object-cover rounded border border-gray-200 dark:border-gray-600" />
                                  ) : (
                                    <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600" />
                                  )}
                                </td>
                              )}
                              <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{item.code}</td>
                              <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{item.description}</td>
                              <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                              <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{item.unit}</td>
                              <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{item.unitPrice.toLocaleString()} DH</td>
                              <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">{item.total.toLocaleString()} DH</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Supplier Order Details for supplier_purchase_order */}
              {viewingDocument.type === 'supplier_purchase_order' && viewingDocument.notes ? (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('orderDetails')}</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                    {(() => {
                      const notes = viewingDocument.notes;
                      const lines = notes.split('\n');
                      const deliveryDateLine = lines.find(line => line.includes('Date de livraison souhaitée:'));
                      const totalLine = lines.find(line => line.includes('Total:'));
                      const productsStartIndex = lines.findIndex(line => line.includes('Produits commandés:'));
                      const notesStartIndex = lines.findIndex(line => line.includes('Notes:'));
                      
                      const deliveryDate = deliveryDateLine ? deliveryDateLine.split(': ')[1] : '';
                      const total = totalLine ? totalLine.split(': ')[1] : '';
                      const products = lines.slice(productsStartIndex + 1, notesStartIndex).filter(line => line.trim().startsWith('•'));
                      const notesText = notesStartIndex >= 0 ? lines.slice(notesStartIndex + 1).join('\n').trim() : '';
                      
                      return (
                        <>
                          {deliveryDate && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Date de livraison souhaitée:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{deliveryDate}</span>
                            </div>
                          )}
                          {products.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('orderedProducts')}:</span>
                              <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200 dark:border-gray-600 rounded-lg">
                                  <thead className="bg-gray-100 dark:bg-gray-600">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('code')}
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('name')}
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('quantity')}
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
                                        Action
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                                    {products.map((product, index) => {
                                      // Parser le produit pour extraire les informations
                                      // Format: "• CODE - NOM: QUANTITÉ UNITÉ × PRIX DH = TOTAL DH"
                                      const productText = product.replace('• ', '');
                                      const parts = productText.split(': ');
                                      const nameCode = parts[0];
                                      const details = parts[1] ? parts[1].split(' × ') : [];
                                      const quantityUnit = details[0] ? details[0].split(' ') : [];
                                      const priceTotal = details[1] ? details[1].split(' = ') : [];
                                      
                                      const nameCodeParts = nameCode.split(' - ');
                                      const code = nameCodeParts[0] || '';
                                      const name = nameCodeParts[1] || nameCode;
                                      const quantity = quantityUnit[0] || '';
                                      const unit = quantityUnit[1] || '';
                                      const unitPrice = priceTotal[0] ? priceTotal[0].replace(' DH', '') : '';
                                      const total = priceTotal[1] ? priceTotal[1].replace(' DH', '') : '';
                                      
                                      return (
                                        <tr key={index}>
                                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-mono">
                                            {code}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                            {name}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                            {quantity}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                            {unit}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                            {unitPrice} DH
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium">
                                            {total} DH
                                          </td>
                                          <td className="px-3 py-2">
                                            <button
                                              onClick={() => {
                                                // Vérifier si le produit existe déjà dans la liste d'attente
                                                const existingWaitingList = JSON.parse(localStorage.getItem('waitingListProducts') || '[]');
                                                const existingItem = existingWaitingList.find((item: any) => item.code === code);
                                                
                                                if (existingItem) {
                                                  alert('Ce produit existe déjà dans la liste d\'attente');
                                                  return;
                                                }
                                                
                                                // Rediriger vers la liste d'attente avec les données pré-remplies
                                                const prefilledData = {
                                                  name: name,
                                                  code: code,
                                                  quantity: quantity,
                                                  unit: unit,
                                                  buyPrice: parseFloat(unitPrice),
                                                  sellPrice: parseFloat(unitPrice) * 1.5, // Prix de vente estimé
                                                  missingQuantity: 0,
                                                  surplusQuantity: 0
                                                };
                                                
                                                localStorage.setItem('waitingListPrefilledData', JSON.stringify(prefilledData));
                                                window.location.hash = '#waiting';
                                              }}
                                              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                            >
                                              Ajouter
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                          {notesText && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300 block mb-1">Notes:</span>
                              <div className="text-sm text-gray-900 dark:text-white">{notesText}</div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : viewingDocument.type === 'customer_sales_order' ? (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('customerOrderDetails')}</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                    {(() => {
                      // Si les notes sont structurées (comme pour les bons de commande fournisseur)
                      if (viewingDocument.notes && viewingDocument.notes.includes('Produits commandés:')) {
                        const notes = viewingDocument.notes;
                        const lines = notes.split('\n');
                        const deliveryDateLine = lines.find(line => line.includes('Date de livraison souhaitée:'));
                        const totalLine = lines.find(line => line.includes('Total:'));
                        const productsStartIndex = lines.findIndex(line => line.includes('Produits commandés:'));
                        const notesStartIndex = lines.findIndex(line => line.includes('Notes:'));
                        
                        const deliveryDate = deliveryDateLine ? deliveryDateLine.split(': ')[1] : '';
                        const total = totalLine ? totalLine.split(': ')[1] : '';
                        const products = lines.slice(productsStartIndex + 1, notesStartIndex).filter(line => line.trim().startsWith('•'));
                        const notesText = notesStartIndex >= 0 ? lines.slice(notesStartIndex + 1).join('\n').trim() : '';
                        
                        return (
                          <>
                            {deliveryDate && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{t('desiredDeliveryDate')}:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{deliveryDate}</span>
                              </div>
                            )}
                            {total && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{t('total')}:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{total}</span>
                              </div>
                            )}
                            {products.length > 0 && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('orderedProducts')}:</span>
                                <div className="space-y-1">
                                  {products.map((product, index) => (
                                    <div key={index} className="text-sm text-gray-900 dark:text-white">
                                      {product.replace('• ', '')}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {notesText && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300 block mb-1">{t('notes')}:</span>
                                <div className="text-sm text-gray-900 dark:text-white">{notesText}</div>
                              </div>
                            )}
                          </>
                        );
                      } else {
                        // Affichage par défaut pour les bons de commande client générés automatiquement
                        return (
                          <>
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">{t('total')}:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{parseAmount(viewingDocument.amount).toLocaleString()} DH</span>
                            </div>
                            {viewingDocument.items && viewingDocument.items.length > 0 && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('soldProducts')}:</span>
                                <div className="overflow-x-auto">
                                  <table className="w-full border border-gray-200 dark:border-gray-600 rounded-lg">
                                    <thead className="bg-gray-100 dark:bg-gray-600">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                          {t('image')}
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                          {t('code')}
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                          {t('name')}
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                          {t('quantity')}
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                          {t('unitPrice')}
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                          {t('total')}
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                                      {viewingDocument.items.map((item, index) => {
                                        const catalog: any[] = Array.isArray(productCatalog) ? (productCatalog as any) : [];
                                        const byCode = catalog.find(p => String(p.code || '').toLowerCase() === String(item.code || '').toLowerCase());
                                        const byName = catalog.find(p => String(p.name || '').toLowerCase() === String(item.description || '').toLowerCase());
                                        const prod = byCode || byName;
                                        return (
                                        <tr key={index}>
                                          <td className="px-3 py-2">
                                            {prod?.image ? (
                                              <img src={prod.image} alt={prod.name} className="h-10 w-10 object-cover rounded border border-gray-200 dark:border-gray-600" />
                                            ) : (
                                              <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600" />
                                            )}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{item.code}</td>
                                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{item.description}</td>
                                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{item.quantity} {item.unit}</td>
                                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{item.unitPrice.toLocaleString()} DH</td>
                                          <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">{item.total.toLocaleString()} DH</td>
                                        </tr>
                                      );})}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      }
                    })()}
                  </div>
                </div>
              ) : viewingDocument.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('notes')}
                  </label>
                  <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {viewingDocument.notes}
                  </div>
                </div>
              )}

              {/* Linked Documents */}
              {viewingDocument.linkedDocuments && viewingDocument.linkedDocuments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Documents liés
                  </label>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {viewingDocument.linkedDocuments.length} document(s) lié(s)
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={closeViewModal}>
                  {t('close')}
                </Button>
                <Button 
                  variant="primary" 
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => handleDownloadPDF(viewingDocument)}
                >
                  {t('downloadPDF')}
                </Button>
                {viewingDocument.type === 'customer_sales_order' && (
                  <Button 
                    variant="success" 
                    icon={<FileCheck className="w-4 h-4" />}
                    onClick={() => handleCreateInvoice(viewingDocument)}
                  >
                    {t('createInvoice')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;