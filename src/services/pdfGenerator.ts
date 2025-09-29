import jsPDF from 'jspdf';

interface DocumentData {
  id: string;
  number: string;
  type: string;
  createdAt: string;
  amount: number;
  Client?: { name: string };
  Supplier?: { name: string };
  notes?: string;
  items?: Array<{
    code: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
}

class PDFGenerator {
  private doc: jsPDF;
  private companyInfo: CompanyInfo;

  constructor(companyInfo: CompanyInfo) {
    // A5 format: 148mm x 210mm
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });
    this.companyInfo = companyInfo;
  }

  private addArabicText(text: string, x: number, y: number, fontSize: number = 12) {
    // For Arabic text support, we need to handle RTL
    this.doc.setFontSize(fontSize);
    this.doc.text(text, x, y, { align: 'right' });
  }

  private addFrenchText(text: string, x: number, y: number, fontSize: number = 12) {
    this.doc.setFontSize(fontSize);
    this.doc.text(text, x, y, { align: 'left' });
  }

  private drawTable(headers: string[], data: any[][], startY: number) {
    const pageWidth = 148;
    const margin = 10;
    const tableWidth = pageWidth - (margin * 2);
    const colWidth = tableWidth / headers.length;
    
    // Draw headers
    this.doc.setFillColor(240, 240, 240);
    this.doc.setTextColor(0, 0, 0); // Set text color to black
    headers.forEach((header, index) => {
      const x = margin + (index * colWidth);
      this.doc.rect(x, startY, colWidth, 8, 'F');
      // Draw text on top of the filled rectangle
      this.doc.setFillColor(255, 255, 255); // White background for text
      this.doc.rect(x + 1, startY + 1, colWidth - 2, 6, 'F');
      this.doc.setTextColor(0, 0, 0); // Black text
      this.addFrenchText(header, x + 2, startY + 6, 8);
    });

    // Draw data rows
    this.doc.setTextColor(0, 0, 0); // Ensure text color is black for data
    data.forEach((row, rowIndex) => {
      const y = startY + 8 + (rowIndex * 6);
      row.forEach((cell, colIndex) => {
        const x = margin + (colIndex * colWidth);
        this.doc.rect(x, y, colWidth, 6, 'S');
        const text = typeof cell === 'number' ? cell.toLocaleString() : cell;
        this.addFrenchText(text.toString(), x + 2, y + 4, 7);
      });
    });
  }

  private parseOrderNotes(notes: string) {
    const lines = notes.split('\n');
    const orderInfo: any = {};
    
    lines.forEach(line => {
      if (line.includes('Date de livraison souhaitée:')) {
        orderInfo.deliveryDate = line.split(':')[1]?.trim();
      } else if (line.includes('Conditions de paiement:')) {
        orderInfo.paymentTerms = line.split(':')[1]?.trim();
      } else if (line.includes('Total:')) {
        orderInfo.total = line.split(':')[1]?.trim();
      } else if (line.includes('Produits commandés:')) {
        orderInfo.products = [];
      } else if (line.startsWith('•') && orderInfo.products) {
        orderInfo.products.push(line.substring(1).trim());
      } else if (line.includes('Notes:') && line.split('Notes:').length > 1) {
        orderInfo.notes = line.split('Notes:')[1]?.trim();
      }
    });
    
    return orderInfo;
  }

  generateDeliveryNote(documentData: DocumentData) {
    // Header with page number
    this.addFrenchText('1/1', 130, 15, 8);
    
    // Client info section with dotted border
    if (documentData.Client) {
      this.addFrenchText('Liv:', 10, 25, 8);
      this.addArabicText(documentData.Client.name, 130, 25, 12);
      this.addArabicText('النهضة', 130, 32, 10);
    }
    this.addFrenchText('Vend: Nour Eddine', 80, 32, 8);

    // Document title
    this.addFrenchText('BON DE LIVRAISON', 10, 45, 16);

    // Document details in horizontal layout
    this.addFrenchText(`N°: ${documentData.number}`, 10, 55, 10);
    this.addFrenchText(`Date: ${new Date(documentData.createdAt).toLocaleDateString('fr-FR')}`, 50, 55, 10);
    this.addFrenchText(`Réf client: ${documentData.Client?.name || 'N/A'}`, 100, 55, 10);

    // Table headers (Description -> Nom)
    const headers = ['Code', 'Nom', 'Qté', 'P.U', 'Total'];
    
    // Données réelles si dispo
    let tableData: any[][] = [];
    if (documentData.items && documentData.items.length > 0) {
      tableData = documentData.items.map(item => [
        item.code,
        item.description,   // affiché comme "Nom"
        item.quantity.toString(),
        item.unitPrice.toLocaleString(),
        item.total.toLocaleString()
      ]);
    } else {
      // Données fallback
      tableData = [
        ['C1315', 'بواني بلير منقوش', '12', '45,00', '540,00'],
        ['C625', 'رويضة كري فران', '20', '7,50', '150,00'],
        ['C4346', 'سلكون كحل AB', '25', '46,50', '1 162,50'],
        ['C4346', 'كوليس بيا 50', '20', '16,00', '320,00'],
        ['C4346', 'وترة زرقاء', '10', '9,00', '90,00']
      ];
    }

    this.drawTable(headers, tableData, 75);

    // Footer
    this.addFrenchText(`Total: ${documentData.amount.toLocaleString()} DH`, 100, 180, 10);

    return this.doc;
  }

  generateCustomerSalesOrder(documentData: DocumentData) {
    // Header with page number
    this.addFrenchText('1/1', 130, 15, 8);
    
    // Client info section
    if (documentData.Client) {
      this.addFrenchText('Liv:', 10, 25, 8);
      this.addArabicText(documentData.Client.name, 130, 25, 12);
      this.addArabicText('النهضة', 130, 32, 10);
    }
    this.addFrenchText('Vend: Nour Eddine', 80, 32, 8);

    // Document title
    this.addFrenchText('BON DE COMMANDE CLIENT', 10, 45, 16);

    // Document details in horizontal layout
    this.addFrenchText(`N°: ${documentData.number}`, 10, 55, 10);
    this.addFrenchText(`Date: ${new Date(documentData.createdAt).toLocaleDateString('fr-FR')}`, 50, 55, 10);
    this.addFrenchText(`Réf client: ${documentData.Client?.name || 'N/A'}`, 100, 55, 10);

    // Table headers (Description -> Nom)
    const headers = ['Code', 'Nom', 'Qté', 'P.U', 'Total'];
    
    // Données réelles si dispo
    let tableData: any[][] = [];
    if (documentData.items && documentData.items.length > 0) {
      tableData = documentData.items.map(item => [
        item.code,
        item.description,   // affiché comme "Nom"
        item.quantity.toString(),
        item.unitPrice.toLocaleString(),
        item.total.toLocaleString()
      ]);
    } else {
      // Données fallback
      tableData = [
        ['C1315', 'بواني بلير منقوش', '12', '45,00', '540,00'],
        ['C625', 'رويضة كري فران', '20', '7,50', '150,00'],
        ['C4346', 'سلكون كحل AB', '25', '46,50', '1 162,50']
      ];
    }

    this.drawTable(headers, tableData, 75);

    // Footer
    this.addFrenchText(`Total: ${documentData.amount.toLocaleString()} DH`, 100, 180, 10);

    return this.doc;
  }

  generateInvoice(documentData: DocumentData) {
    // Header with page number
    this.addFrenchText('1/1', 130, 15, 8);
    
    // Client info section
    if (documentData.Client) {
      this.addFrenchText('Liv:', 10, 25, 8);
      this.addArabicText(documentData.Client.name, 130, 25, 12);
      this.addArabicText('النهضة', 130, 32, 10);
    }
    this.addFrenchText('Vend: Nour Eddine', 80, 32, 8);

    // Document title
    this.addFrenchText('FACTURE', 10, 45, 16);

    // Document details in horizontal layout
    this.addFrenchText(`N°: ${documentData.number}`, 10, 55, 10);
    this.addFrenchText(`Date: ${new Date(documentData.createdAt).toLocaleDateString('fr-FR')}`, 50, 55, 10);
    this.addFrenchText(`Réf client: ${documentData.Client?.name || 'N/A'}`, 100, 55, 10);

    // Table headers (Description -> Nom)
    const headers = ['Code', 'Nom', 'Qté', 'P.U', 'Total'];
    
    // Données réelles si dispo
    let tableData: any[][] = [];
    if (documentData.items && documentData.items.length > 0) {
      tableData = documentData.items.map(item => [
        item.code,
        item.description,   // affiché comme "Nom"
        item.quantity.toString(),
        item.unitPrice.toLocaleString(),
        item.total.toLocaleString()
      ]);
    } else {
      // Données fallback
      tableData = [
        ['C1315', 'بواني بلير منقوش', '12', '45,00', '540,00'],
        ['C625', 'رويضة كري فران', '20', '7,50', '150,00']
      ];
    }

    this.drawTable(headers, tableData, 75);

    // Footer with tax calculations
    const subtotal = documentData.amount / 1.2;
    const tax = documentData.amount - subtotal;
    
    this.addFrenchText(`Sous-total: ${subtotal.toLocaleString()} DH`, 80, 170, 8);
    this.addFrenchText(`TVA (20%): ${tax.toLocaleString()} DH`, 80, 175, 8);
    this.addFrenchText(`Total: ${documentData.amount.toLocaleString()} DH`, 80, 180, 10);

    return this.doc;
  }

  generatePurchaseOrder(documentData: DocumentData) {
    // Header with page number
    this.addFrenchText('1/1', 130, 15, 8);
    
    // Supplier info section
    if (documentData.Supplier) {
      this.addFrenchText('Liv:', 10, 25, 8);
      this.addArabicText(documentData.Supplier.name, 130, 25, 12);
      this.addArabicText('النهضة', 130, 32, 10);
    }
    this.addFrenchText('Vend: Nour Eddine', 80, 32, 8);

    // Document title
    this.addFrenchText('BON DE COMMANDE FOURNISSEUR', 10, 45, 16);

    // Document details in horizontal layout
    this.addFrenchText(`N°: ${documentData.number}`, 10, 55, 10);
    this.addFrenchText(`Date: ${new Date(documentData.createdAt).toLocaleDateString('fr-FR')}`, 50, 55, 10);
    this.addFrenchText(`Réf fournisseur: ${documentData.Supplier?.name || 'N/A'}`, 100, 55, 10);

    // Parse order details from notes
    let orderInfo: any = {};
    if (documentData.notes) {
      orderInfo = this.parseOrderNotes(documentData.notes);
    }

    // Order details
    if (orderInfo.deliveryDate) {
      this.addFrenchText(`Date de livraison souhaitée: ${orderInfo.deliveryDate}`, 10, 70, 8);
    }

    // Table headers (Description -> Nom)
    const headers = ['Code', 'Nom', 'Qté', 'P.U', 'Total'];
    
    let tableData: any[][] = [];
    if (documentData.items && documentData.items.length > 0) {
      // Use real data from document
      tableData = documentData.items.map(item => [
        item.code,
        item.description,   // affiché comme "Nom"
        item.quantity.toString(),
        item.unitPrice.toLocaleString(),
        item.total.toLocaleString()
      ]);
    } else if (orderInfo.products && orderInfo.products.length > 0) {
      // Parse products from notes
      tableData = orderInfo.products.map((product: string) => {
        const parts = product.split(':');
        const codeDesc = parts[0] || '';
        const details = parts[1] || '';
        
        const codeMatch = codeDesc.match(/^([^-]+)/);
        const descMatch = codeDesc.match(/- (.+)$/);
        const detailsMatch = details.match(/(\d+) (\w+) × ([\d,]+) DH = ([\d,]+) DH/);
        
        return [
          codeMatch ? codeMatch[1].trim() : '',
          descMatch ? descMatch[1].trim() : '',
          detailsMatch ? detailsMatch[1] : '',
          detailsMatch ? detailsMatch[3] : '',
          detailsMatch ? detailsMatch[4] : ''
        ];
      });
    } else {
      // Fallback sample data
      tableData = [
        ['P001', 'Produit 1', '10', '50,00', '500,00'],
        ['P002', 'Produit 2', '5', '30,00', '150,00']
      ];
    }

    this.drawTable(headers, tableData, 85);

    // Footer
    this.addFrenchText(`Total: ${documentData.amount.toLocaleString()} DH`, 100, 180, 10);
    
    // Additional notes
    if (orderInfo.notes) {
      this.addFrenchText('Notes:', 10, 190, 8);
      this.addFrenchText(orderInfo.notes, 10, 195, 7);
    }

    return this.doc;
  }

  generateReceptionSlip(documentData: DocumentData) {
    this.addFrenchText('BON DE RÉCEPTION', 10, 45, 16);
    this.addFrenchText(`N° : ${documentData.number}`, 10, 55, 10);
    this.addFrenchText(`Date: ${new Date(documentData.createdAt).toLocaleDateString('fr-FR')}`, 10, 62, 10);

    if (documentData.Supplier) {
      this.addFrenchText('Fournisseur:', 10, 75, 10);
      this.addArabicText(documentData.Supplier.name, 130, 75, 12);
    }

    const headers = ['Code', 'Description', 'Qté Reçue', 'Unite', 'État'];
    const sampleData = [
      ['P001', 'Produit 1', '10', 'U', 'Bon'],
      ['P002', 'Produit 2', '5', 'U', 'Bon']
    ];

    this.drawTable(headers, sampleData, 90);

    this.addFrenchText('Signature réceptionnaire: ........................', 10, 170, 8);
    this.addFrenchText('Signature livreur: ........................', 10, 175, 8);

    return this.doc;
  }

  generateStockEntry(documentData: DocumentData) {
    this.addFrenchText('ENTRÉE EN STOCK', 10, 45, 16);
    this.addFrenchText(`N° : ${documentData.number}`, 10, 55, 10);
    this.addFrenchText(`Date: ${new Date(documentData.createdAt).toLocaleDateString('fr-FR')}`, 10, 62, 10);

    const headers = ['Code', 'Description', 'Qté Entrée', 'Unite', 'Prix Unitaire', 'Valeur'];
    const sampleData = [
      ['P001', 'Produit 1', '10', 'U', '50,00', '500,00'],
      ['P002', 'Produit 2', '5', 'U', '30,00', '150,00']
    ];

    this.drawTable(headers, sampleData, 85);

    this.addFrenchText(`Valeur totale: ${documentData.amount.toLocaleString()} DH`, 80, 180, 10);

    return this.doc;
  }

  generateDocument(documentData: DocumentData, type: string) {
    switch (type) {
      case 'delivery_note':
        return this.generateDeliveryNote(documentData);
      case 'customer_sales_order':
        return this.generateCustomerSalesOrder(documentData);
      case 'invoice':
        return this.generateInvoice(documentData);
      case 'supplier_purchase_order':
        return this.generatePurchaseOrder(documentData);
      case 'reception_slip':
        return this.generateReceptionSlip(documentData);
      case 'stock_entry':
        return this.generateStockEntry(documentData);
      default:
        return this.generateDeliveryNote(documentData);
    }
  }

  download(filename: string) {
    this.doc.save(filename);
  }
}

export default PDFGenerator;
