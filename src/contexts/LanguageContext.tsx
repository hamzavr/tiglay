import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ar' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    pos: 'نقطة البيع',
    inventory: 'المخزون',
    suppliers: 'الموردين',
    clients: 'العملاء',
    documents: 'المستندات',
    reports: 'التقارير',
    settings: 'الإعدادات',
    
    // Common
    search: 'بحث',
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    name: 'الاسم',
    phone: 'الهاتف',
    address: 'العنوان',
    email: 'البريد الإلكتروني',
    price: 'السعر',
    quantity: 'الكمية',
    total: 'المجموع',
    date: 'التاريخ',
    status: 'الحالة',
    actions: 'الإجراءات',
    
    // POS
    cart: 'السلة',
    checkout: 'الدفع',
    cash: 'نقداً',
    card: 'بطاقة',
    credit: 'آجل',
    partial: 'دفع جزئي',
    
    // Products
    product: 'المنتج',
    products: 'المنتجات',
    buyPrice: 'سعر الشراء',
    sellPrice: 'سعر البيع',
    stock: 'المخزون',
    expiryDate: 'تاريخ الانتهاء',
    lowStock: 'مخزون منخفض',
    
    // Dashboard
    todaySales: 'مبيعات اليوم',
    totalProducts: 'إجمالي المنتجات',
    totalSuppliers: 'إجمالي الموردين',
    totalClients: 'إجمالي العملاء',
    recentSales: 'المبيعات الأخيرة',
    stockAlerts: 'تنبيهات المخزون',
    
    // Company
    companyName: 'متجر مواد البناء والسباكة',
    
    // Workflow
    workflow: 'سير العمل',
    purchaseOrder: 'طلب شراء من المورد',
    goodsReception: 'استلام البضاعة',
    stockIn: 'دخول الى المخزون',
    salesOrder: 'طلب بيع من العميل',
    deliveryNote: 'تسليم البضاعة',
    invoice: 'إصدار الفاتورة',
    
    // Workflow Status
    pending: 'في الانتظار',
    inProgress: 'قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    
    // Document Types
    supplierPurchaseOrder: 'أمر شراء المورد',
    receptionSlip: 'إيصال الاستلام',
    stockEntry: 'إدخال المخزون',
    customerSalesOrder: 'أمر بيع العميل',
    deliverySlip: 'إيصال التسليم',
    invoiceDoc: 'الفاتورة',
    
    // Additional Terms
    traceability: 'إمكانية التتبع',
    documentNumber: 'رقم المستند',
    workflowStatus: 'حالة سير العمل',
    linkedDocuments: 'المستندات المرتبطة',
    createDocument: 'إنشاء مستند',
    viewWorkflow: 'عرض سير العمل',
    trackOrder: 'تتبع الطلب',
    
    // Settings
    generalSettings: 'الإعدادات العامة',
    companyInfo: 'معلومات الشركة',
    userManagement: 'إدارة المستخدمين',
    systemPreferences: 'تفضيلات النظام',
    backupRestore: 'النسخ الاحتياطي والاستعادة',
    notifications: 'الإشعارات',
    security: 'الأمان',
    integrations: 'التكاملات',
    
    // Company Information
    companyAddress: 'عنوان الشركة',
    companyPhone: 'هاتف الشركة',
    companyEmail: 'بريد الشركة الإلكتروني',
    taxNumber: 'الرقم الضريبي',
    commercialRegister: 'السجل التجاري',
    
    // User Management
    users: 'المستخدمون',
    roles: 'الأدوار',
    permissions: 'الصلاحيات',
    addUser: 'إضافة مستخدم',
    editUser: 'تعديل مستخدم',
    deleteUser: 'حذف مستخدم',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    role: 'الدور',
    lastLogin: 'آخر تسجيل دخول',
    
    // System Preferences
    language: 'اللغة',
    theme: 'المظهر',
    currency: 'العملة',
    dateFormat: 'تنسيق التاريخ',
    timeZone: 'المنطقة الزمنية',
    
    // Notifications
    emailNotifications: 'إشعارات البريد الإلكتروني',
    smsNotifications: 'إشعارات الرسائل النصية',
    systemAlerts: 'تنبيهات النظام',
    lowStockAlerts: 'تنبيهات المخزون المنخفض',
    expirationAlerts: 'تنبيهات انتهاء الصلاحية',
    
    // Additional missing translations
    category: 'الفئة',
    expiration: 'انتهاء الصلاحية',
    expiringSoon: 'ينتهي قريباً',
    addProduct: 'إضافة منتج',
    noProductsAdded: 'لم يتم إضافة أي منتج. انقر على "إضافة منتج" للبدء.',
    supplierPurchaseOrder: 'أمر شراء المورد',
    receptionSlip: 'إيصال الاستلام',
    stockEntry: 'دخول المخزون',
    customerSalesOrder: 'أمر بيع العميل',
    deliveryNote: 'إيصال التسليم',
    invoiceDoc: 'الفاتورة',
    linkedDocuments: 'المستندات المرتبطة',
    newDocument: 'مستند جديد',
    filters: 'المرشحات',
    manageAllDocuments: 'إدارة جميع المستندات التجارية',
    totalDocuments: 'إجمالي المستندات',
    paid: 'مدفوع',
    pending: 'في الانتظار',
    totalAmount: 'المبلغ الإجمالي',
    searchByNumber: 'البحث بالرقم أو العميل أو المورد...',
    allStatuses: 'جميع الحالات',
    allDocuments: 'جميع المستندات',
    type: 'النوع',
    number: 'الرقم',
    step: 'الخطوة',
    clientSupplier: 'العميل/المورد',
    amount: 'المبلغ',
    linked: 'مرتبط',
    viewDocument: 'عرض المستند',
    downloadPDF: 'تحميل PDF',
    editDocument: 'تعديل المستند',
    deleteDocument: 'حذف المستند',
    noDocumentsFound: 'لم يتم العثور على مستندات',
    loadingDocuments: 'جاري تحميل المستندات...',
    errorLoadingDocuments: 'خطأ في تحميل المستندات',
    retry: 'إعادة المحاولة'
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    pos: 'Point de vente',
    inventory: 'Inventaire',
    suppliers: 'Fournisseurs',
    clients: 'Clients',
    documents: 'Documents',
    reports: 'Rapports',
    settings: 'Paramètres',
    
    // Common
    search: 'Rechercher',
    add: 'Ajouter',
    edit: 'Modifier',
    delete: 'Supprimer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    name: 'Nom',
    phone: 'Téléphone',
    address: 'Adresse',
    email: 'E-mail',
    price: 'Prix',
    quantity: 'Quantité',
    total: 'Total',
    date: 'Date',
    status: 'Statut',
    actions: 'Actions',
    
    // POS
    cart: 'Panier',
    checkout: 'Paiement',
    cash: 'Espèces',
    card: 'Carte',
    credit: 'Crédit',
    partial: 'Paiement partiel',
    
    // Products
    product: 'Produit',
    products: 'Produits',
    buyPrice: 'Prix d\'achat',
    sellPrice: 'Prix de vente',
    stock: 'Stock',
    expiryDate: 'Date d\'expiration',
    lowStock: 'Stock faible',
    
    // Dashboard
    todaySales: 'Ventes du jour',
    totalProducts: 'Total produits',
    totalSuppliers: 'Total fournisseurs',
    totalClients: 'Total clients',
    recentSales: 'Ventes récentes',
    stockAlerts: 'Alertes de stock',
    
    // Company
    companyName: 'BRIQUIN',
    
    // Workflow
    workflow: 'Flux de travail',
    purchaseOrder: 'Bon de commande fournisseur',
    goodsReception: 'Réception des marchandises',
    stockIn: 'Entrée en stock',
    salesOrder: 'Bon de commande client',
    deliveryNote: 'Bon de livraison',
    invoice: 'Facture',
    
    // Workflow Status
    pending: 'En attente',
    inProgress: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
    
    // Document Types
    supplierPurchaseOrder: 'Bon de commande fournisseur',
    receptionSlip: 'Bon de réception',
    stockEntry: 'Entrée de stock',
    customerSalesOrder: 'Bon de commande client',
    deliverySlip: 'Bon de livraison',
    invoiceDoc: 'Facture',
    
    // Additional Terms
    traceability: 'Traçabilité',
    documentNumber: 'Numéro de document',
    workflowStatus: 'Statut du flux',
    linkedDocuments: 'Documents liés',
    createDocument: 'Créer un document',
    viewWorkflow: 'Voir le flux',
    trackOrder: 'Suivre la commande',
    
    // Settings
    generalSettings: 'Paramètres généraux',
    companyInfo: 'Informations entreprise',
    userManagement: 'Gestion des utilisateurs',
    systemPreferences: 'Préférences système',
    backupRestore: 'Sauvegarde et restauration',
    notifications: 'Notifications',
    security: 'Sécurité',
    integrations: 'Intégrations',
    
    // Company Information
    companyAddress: 'Adresse de l\'entreprise',
    companyPhone: 'Téléphone de l\'entreprise',
    companyEmail: 'Email de l\'entreprise',
    taxNumber: 'Numéro fiscal',
    commercialRegister: 'Registre de commerce',
    
    // User Management
    users: 'Utilisateurs',
    roles: 'Rôles',
    permissions: 'Permissions',
    addUser: 'Ajouter utilisateur',
    editUser: 'Modifier utilisateur',
    deleteUser: 'Supprimer utilisateur',
    username: 'Nom d\'utilisateur',
    password: 'Mot de passe',
    role: 'Rôle',
    lastLogin: 'Dernière connexion',
    
    // System Preferences
    language: 'Langue',
    theme: 'Thème',
    currency: 'Devise',
    dateFormat: 'Format de date',
    timeZone: 'Fuseau horaire',
    
    // Notifications
    emailNotifications: 'Notifications email',
    smsNotifications: 'Notifications SMS',
    systemAlerts: 'Alertes système',
    lowStockAlerts: 'Alertes stock bas',
    expirationAlerts: 'Alertes d\'expiration',
    
    // Additional missing translations
    category: 'Catégorie',
    expiration: 'Expiration',
    expiringSoon: 'Expire bientôt',
    addProduct: 'Ajouter un produit',
    noProductsAdded: 'Aucun produit ajouté. Cliquez sur "Ajouter un produit" pour commencer.',
    supplierPurchaseOrder: 'Bon de commande fournisseur',
    receptionSlip: 'Bon de réception',
    stockEntry: 'Entrée en stock',
    customerSalesOrder: 'Bon de commande client',
    deliveryNote: 'Bon de livraison',
    invoiceDoc: 'Facture',
    linkedDocuments: 'Documents liés',
    newDocument: 'Nouveau document',
    filters: 'Filtres',
    manageAllDocuments: 'Gérer tous vos documents commerciaux',
    totalDocuments: 'Total Documents',
    paid: 'Payés',
    pending: 'En attente',
    totalAmount: 'Montant Total',
    searchByNumber: 'Rechercher par numéro, client ou fournisseur...',
    allStatuses: 'Tous les statuts',
    allDocuments: 'Tous les documents',
    type: 'Type',
    number: 'Numéro',
    step: 'Étape',
    clientSupplier: 'Client/Fournisseur',
    amount: 'Montant',
    linked: 'liés',
    viewDocument: 'Voir le document',
    downloadPDF: 'Télécharger PDF',
    editDocument: 'Modifier le document',
    deleteDocument: 'Supprimer le document',
    noDocumentsFound: 'Aucun document trouvé',
    loadingDocuments: 'Chargement des documents...',
    errorLoadingDocuments: 'Erreur lors du chargement des documents',
    retry: 'Réessayer'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};