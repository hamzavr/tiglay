import { documentsAPI } from './api';

export interface SaleData {
  id: string;
  clientId: string;
  total: number;
  items: Array<{
    code: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  deliveryDate: string;
  paymentTerms: string;
  notes: string;
}

export interface SupplierOrderData {
  id: string;
  supplierId: string;
  total: number;
  items: Array<{
    code: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  deliveryDate: string;
  paymentTerms: string;
  notes: string;
}

class DocumentWorkflowService {
  private generateDocumentNumber(type: string): string {
    const prefix = this.getDocumentPrefix(type);
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}-${random}`;
  }

  private getDocumentPrefix(type: string): string {
    switch (type) {
      case 'supplier_purchase_order': return 'BC';
      case 'reception_slip': return 'BR';
      case 'stock_entry': return 'ES';
      case 'customer_sales_order': return 'VT';
      case 'delivery_note': return 'BL';
      case 'invoice': return 'FA';
      default: return 'DOC';
    }
  }

  /**
   * Crée automatiquement les documents du workflow après une vente client
   * Génère: Bon de commande client, Bon de livraison, Facture
   */
  async createCustomerSaleDocuments(saleData: SaleData) {
    try {
      const documents = [];

      // 1. Bon de commande client (Étape 4)
      const customerOrder = await documentsAPI.create({
        type: 'customer_sales_order',
        number: this.generateDocumentNumber('customer_sales_order'),
        workflowStep: 4,
        status: 'sent',
        amount: saleData.total,
        clientId: saleData.clientId,
        notes: `Commande automatique générée depuis la vente ${saleData.id}`,
        linkedDocuments: []
      });
      documents.push(customerOrder);

      // 2. Bon de livraison (Étape 5)
      const deliveryNote = await documentsAPI.create({
        type: 'delivery_note',
        number: this.generateDocumentNumber('delivery_note'),
        workflowStep: 5,
        status: 'sent',
        amount: saleData.total,
        clientId: saleData.clientId,
        notes: `Bon de livraison automatique pour la vente ${saleData.id}`,
        linkedDocuments: [customerOrder.id || customerOrder.data?.id]
      });
      documents.push(deliveryNote);

      // 3. Facture (Étape 6)
      const invoice = await documentsAPI.create({
        type: 'invoice',
        number: this.generateDocumentNumber('invoice'),
        workflowStep: 6,
        status: 'sent',
        amount: saleData.total,
        clientId: saleData.clientId,
        notes: `Facture automatique pour la vente ${saleData.id}`,
        linkedDocuments: [
          customerOrder.id || customerOrder.data?.id, 
          deliveryNote.id || deliveryNote.data?.id
        ]
      });
      documents.push(invoice);

      // Mettre à jour les documents liés
      const customerOrderId = customerOrder.id || customerOrder.data?.id;
      const deliveryNoteId = deliveryNote.id || deliveryNote.data?.id;
      const invoiceId = invoice.id || invoice.data?.id;

      if (customerOrderId && deliveryNoteId && invoiceId) {
        await Promise.all([
          documentsAPI.update(customerOrderId, { 
            linkedDocuments: [deliveryNoteId, invoiceId] 
          }),
          documentsAPI.update(deliveryNoteId, { 
            linkedDocuments: [customerOrderId, invoiceId] 
          })
        ]);
      }

      console.log('Documents client créés automatiquement:', documents);
      return documents;

    } catch (error) {
      console.error('Erreur lors de la création des documents client:', error);
      throw error;
    }
  }

  /**
   * Crée automatiquement le bon de commande fournisseur
   * Génère: Bon de commande fournisseur (Étape 1)
   */
  async createSupplierPurchaseOrder(orderData: SupplierOrderData) {
    try {
      // Créer des notes détaillées avec toutes les informations
      const detailedNotes = `
Commande fournisseur détaillée:
- Date de livraison souhaitée: ${orderData.deliveryDate}
- Conditions de paiement: ${orderData.paymentTerms}
- Total: ${orderData.total.toLocaleString()} DH

Produits commandés:
${orderData.items.map(item => 
  `• ${item.code} - ${item.description}: ${item.quantity} ${item.unit} × ${item.unitPrice} DH = ${item.total} DH`
).join('\n')}

Notes: ${orderData.notes}
      `.trim();

      const purchaseOrder = await documentsAPI.create({
        type: 'supplier_purchase_order',
        number: this.generateDocumentNumber('supplier_purchase_order'),
        workflowStep: 1,
        status: 'sent',
        amount: orderData.total,
        supplierId: orderData.supplierId,
        notes: detailedNotes,
        linkedDocuments: []
      });

      console.log('Bon de commande fournisseur créé automatiquement:', purchaseOrder);
      return purchaseOrder;

    } catch (error) {
      console.error('Erreur lors de la création du bon de commande fournisseur:', error);
      throw error;
    }
  }

  /**
   * Crée automatiquement les documents de réception après livraison fournisseur
   * Génère: Réception des marchandises (Étape 2), Entrée en stock (Étape 3)
   */
  async createSupplierDeliveryDocuments(deliveryData: {
    supplierId: string;
    orderId: string;
    total: number;
    items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  }) {
    try {
      const documents = [];

      // 1. Réception des marchandises (Étape 2)
      const receptionSlip = await documentsAPI.create({
        type: 'reception_slip',
        number: this.generateDocumentNumber('reception_slip'),
        workflowStep: 2,
        status: 'sent',
        amount: deliveryData.total,
        supplierId: deliveryData.supplierId,
        notes: `Réception automatique pour la commande ${deliveryData.orderId}`,
        linkedDocuments: []
      });
      documents.push(receptionSlip);

      // 2. Entrée en stock (Étape 3)
      const stockEntry = await documentsAPI.create({
        type: 'stock_entry',
        number: this.generateDocumentNumber('stock_entry'),
        workflowStep: 3,
        status: 'sent',
        amount: deliveryData.total,
        supplierId: deliveryData.supplierId,
        notes: `Entrée en stock automatique pour la commande ${deliveryData.orderId}`,
        linkedDocuments: [receptionSlip.id || receptionSlip.data?.id]
      });
      documents.push(stockEntry);

      // Mettre à jour les documents liés
      const receptionSlipId = receptionSlip.id || receptionSlip.data?.id;
      const stockEntryId = stockEntry.id || stockEntry.data?.id;

      if (receptionSlipId && stockEntryId) {
        await documentsAPI.update(receptionSlipId, { 
          linkedDocuments: [stockEntryId] 
        });
      }

      console.log('Documents de réception créés automatiquement:', documents);
      return documents;

    } catch (error) {
      console.error('Erreur lors de la création des documents de réception:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les documents liés à une vente ou commande
   */
  async getLinkedDocuments(saleOrOrderId: string) {
    try {
      // Rechercher les documents qui mentionnent cette vente/commande dans leurs notes
      const allDocuments = await documentsAPI.getAll();
      return allDocuments.filter(doc => 
        doc.notes && doc.notes.includes(saleOrOrderId)
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des documents liés:', error);
      return [];
    }
  }
}

export default new DocumentWorkflowService();
