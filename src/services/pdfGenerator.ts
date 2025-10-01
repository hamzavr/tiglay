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
    // A4 format: 210mm x 297mm
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    this.companyInfo = companyInfo;
  }

  private addArabicText(text: string, x: number, y: number, fontSize: number = 12) {
    // For Arabic text support, we need to handle RTL
    this.doc.setFontSize(fontSize);
    this.doc.text(text, x, y, { align: 'right' });
  }

  private addFrenchText(text: string, x: number, y: number, fontSize: number = 12, align: 'left' | 'center' | 'right' = 'left') {
    this.doc.setFontSize(fontSize);
    this.doc.text(text, x, y, { align });
  }

  private drawDottedLine(x1: number, y1: number, x2: number, y2: number) {
    const dashLength = 2;
    const gapLength = 1;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const dashCount = Math.floor(distance / (dashLength + gapLength));
    
    for (let i = 0; i < dashCount; i++) {
      const startX = x1 + (dx * i * (dashLength + gapLength)) / distance;
      const startY = y1 + (dy * i * (dashLength + gapLength)) / distance;
      const endX = x1 + (dx * (i * (dashLength + gapLength) + dashLength)) / distance;
      const endY = y1 + (dy * (i * (dashLength + gapLength) + dashLength)) / distance;
      this.doc.line(startX, startY, endX, endY);
    }
  }

  private drawTable(headers: string[], data: any[][], startY: number) {
    const pageWidth = 210;
    const margin = 15;
    const tableWidth = pageWidth - (margin * 2);
    const colWidth = tableWidth / headers.length;
    
    // Draw table border
    this.doc.rect(margin, startY, tableWidth, 8 + (data.length * 8), 'S');
    
    // Draw headers with proper background
    this.doc.setFillColor(240, 240, 240);
    this.doc.setTextColor(0, 0, 0);
    headers.forEach((header, index) => {
      const x = margin + (index * colWidth);
      
      // Draw header background
      this.doc.rect(x, startY, colWidth, 8, 'F');
      
      // Draw vertical lines
      if (index > 0) {
        this.doc.line(x, startY, x, startY + 8);
      }
      
      // Add header text with proper color and background
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFillColor(255, 255, 255); // White background for text
      const textX = x + (colWidth / 2);
      this.addFrenchText(header, textX, startY + 5, 8, 'center');
    });

    // Draw data rows
    this.doc.setTextColor(0, 0, 0);
    data.forEach((row, rowIndex) => {
      const y = startY + 8 + (rowIndex * 8);
      row.forEach((cell, colIndex) => {
        const x = margin + (colIndex * colWidth);
        
        // Draw vertical lines
        if (colIndex > 0) {
          this.doc.line(x, y, x, y + 8);
        }
        
        // Draw horizontal line
        this.doc.line(margin, y, margin + tableWidth, y);
        
        const text = typeof cell === 'number' ? cell.toLocaleString() : cell;
        const textX = x + (colWidth / 2);
        this.addFrenchText(text.toString(), textX, y + 5, 7, 'center');
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
    // Page number (top right)
    this.addFrenchText('1/1', 190, 15, 8);
    
    // Document title (centered)
    this.addFrenchText('BON DE LIVRAISON', 105, 25, 16, 'center');
    
    // Company name in Arabic (bold)
    this.addArabicText('عقاقير النهضة N', 190, 35, 14);
    this.addArabicText('النهضة', 190, 42, 10);
    
    // Dotted line separator
    this.drawDottedLine(15, 50, 195, 50);
    
    // Vendeur section
    this.addFrenchText('Vendeur: Nour Eddine', 15, 58, 8);
    
    // Document details in three columns
    const docDetailsY = 70;
    this.addFrenchText(`N°: ${documentData.number}`, 15, docDetailsY, 10);
    this.addFrenchText(`Date: ${new Date(documentData.createdAt).toLocaleDateString('fr-FR')}`, 80, docDetailsY, 10);
    this.addFrenchText(`Réf client: ${documentData.Client?.name || 'N/A'}`, 150, docDetailsY, 10);
    
    // Vertical separators for document details
    this.doc.line(70, docDetailsY - 5, 70, docDetailsY + 5);
    this.doc.line(140, docDetailsY - 5, 140, docDetailsY + 5);

    // Table headers
    const headers = ['Code', 'Description', 'Qté', 'P.U', 'Total'];
    
    // Table data
    let tableData: any[][] = [];
    if (documentData.items && documentData.items.length > 0) {
      tableData = documentData.items.map(item => [
        item.code,
        item.description,
        item.quantity.toString(),
        item.unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        item.total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      ]);
    } else {
      // Sample data from the model
      tableData = [
        ['C1315', 'بواني بلير منقوش', '12', '45,00', '540,00'],
        ['C625', 'رويضة كري فران', '20', '7,50', '150,00'],
        ['C4346', 'سلكون كحل AB', '25', '46,50', '1 162,50'],
        ['C269', 'كوليس بيا 50', '20', '16,00', '320,00'],
        ['C88', 'وترة زرقاء', '10', '9,00', '90,00'],
        ['C716', 'كانو 8 سنتيم', '7', '45,00', '315,00'],
        ['C717', 'كانو 7 سنتيم', '7', '44,00', '308,00'],
        ['C423', 'اومبراص صفر', '30', '7,00', '210,00'],
        ['C3885', 'كلامونيط 10 لامبوس', '5', '34,00', '170,00'],
        ['C3884', 'كلامونيط 12 لامبوس', '6', '38,00', '228,00'],
        ['C165', 'خامية اناناس 2 AB', '40', '31,00', '1 240,00'],
        ['C27', 'كانو حمام بدون ساروت', '12', '35,00', '420,00'],
        ['C1786', 'قفل كوليس', '4', '50,00', '200,00']
      ];
    }

    this.drawTable(headers, tableData, 85);

    // Total section with border
    const totalY = 85 + 8 + (tableData.length * 8) + 10;
    this.doc.rect(15, totalY, 180, 8, 'S');
    this.addFrenchText('Total:', 20, totalY + 5, 10);
    this.addFrenchText(`${documentData.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, totalY + 5, 10, 'right');

    return this.doc;
  }

  generateCustomerSalesOrder(documentData: DocumentData) {
    // Page number (top right)
    this.addFrenchText('1/1', 190, 15, 8);
    
    // Document title (centered)
    this.addFrenchText('BON DE COMMANDE CLIENT', 105, 25, 16, 'center');
    
    // Company name in Arabic (bold)
    this.addArabicText('عقاقير النهضة N', 190, 35, 14);
    this.addArabicText('النهضة', 190, 42, 10);
    
    // Dotted line separator
    this.drawDottedLine(15, 50, 195, 50);
    
    // Vendeur section
    this.addFrenchText('Vendeur: Nour Eddine', 15, 58, 8);
    
    // Document details in three columns
    const docDetailsY = 70;
    this.addFrenchText(`N°: ${documentData.number}`, 15, docDetailsY, 10);
    this.addFrenchText(`Date: ${new Date(documentData.createdAt).toLocaleDateString('fr-FR')}`, 80, docDetailsY, 10);
    this.addFrenchText(`Réf client: ${documentData.Client?.name || 'N/A'}`, 150, docDetailsY, 10);
    
    // Vertical separators for document details
    this.doc.line(70, docDetailsY - 5, 70, docDetailsY + 5);
    this.doc.line(140, docDetailsY - 5, 140, docDetailsY + 5);

    // Table headers
    const headers = ['Code', 'Description', 'Qté', 'P.U', 'Total'];
    
    // Table data
    let tableData: any[][] = [];
    if (documentData.items && documentData.items.length > 0) {
      tableData = documentData.items.map(item => [
        item.code,
        item.description,
        item.quantity.toString(),
        item.unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        item.total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      ]);
    } else {
      // Sample data
      tableData = [
        ['C1315', 'بواني بلير منقوش', '12', '45,00', '540,00'],
        ['C625', 'رويضة كري فران', '20', '7,50', '150,00'],
        ['C4346', 'سلكون كحل AB', '25', '46,50', '1 162,50']
      ];
    }

    this.drawTable(headers, tableData, 85);

    // Total section with border
    const totalY = 85 + 8 + (tableData.length * 8) + 10;
    this.doc.rect(15, totalY, 180, 8, 'S');
    this.addFrenchText('Total:', 20, totalY + 5, 10);
    this.addFrenchText(`${documentData.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, totalY + 5, 10, 'right');

    return this.doc;
  }

  generateInvoice(documentData: DocumentData) {
    // Page number (top right)
    this.addFrenchText('1/1', 190, 15, 8);
    
    // Document title (centered)
    this.addFrenchText('FACTURE', 105, 25, 16, 'center');
    
    // Company name in Arabic (bold)
    this.addArabicText('عقاقير النهضة N', 190, 35, 14);
    this.addArabicText('النهضة', 190, 42, 10);
    
    // Dotted line separator
    this.drawDottedLine(15, 50, 195, 50);
    
    // Vendeur section
    this.addFrenchText('Vendeur: Nour Eddine', 15, 58, 8);
    
    // Document details in three columns
    const docDetailsY = 70;
    this.addFrenchText(`N°: ${documentData.number}`, 15, docDetailsY, 10);
    this.addFrenchText(`Date: ${new Date(documentData.createdAt).toLocaleDateString('fr-FR')}`, 80, docDetailsY, 10);
    this.addFrenchText(`Réf client: ${documentData.Client?.name || 'N/A'}`, 150, docDetailsY, 10);
    
    // Vertical separators for document details
    this.doc.line(70, docDetailsY - 5, 70, docDetailsY + 5);
    this.doc.line(140, docDetailsY - 5, 140, docDetailsY + 5);

    // Table headers
    const headers = ['Code', 'Description', 'Qté', 'P.U', 'Total'];
    
    // Table data
    let tableData: any[][] = [];
    if (documentData.items && documentData.items.length > 0) {
      tableData = documentData.items.map(item => [
        item.code,
        item.description,
        item.quantity.toString(),
        item.unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        item.total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      ]);
    } else {
      // Sample data
      tableData = [
        ['C1315', 'بواني بلير منقوش', '12', '45,00', '540,00'],
        ['C625', 'رويضة كري فران', '20', '7,50', '150,00']
      ];
    }

    this.drawTable(headers, tableData, 85);

    // Tax calculations
    const subtotal = documentData.amount / 1.2;
    const tax = documentData.amount - subtotal;
    const totalY = 85 + 8 + (tableData.length * 8) + 10;
    
    // Tax section
    this.addFrenchText(`Sous-total: ${subtotal.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`, 15, totalY + 5, 8);
    this.addFrenchText(`TVA (20%): ${tax.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`, 15, totalY + 12, 8);
    
    // Total section with border
    this.doc.rect(15, totalY + 15, 180, 8, 'S');
    this.addFrenchText('Total:', 20, totalY + 20, 10);
    this.addFrenchText(`${documentData.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, totalY + 20, 10, 'right');

    return this.doc;
  }

  generatePurchaseOrder(documentData: DocumentData) {
    // Page number (top right)
    this.addFrenchText('1/1', 190, 15, 8);
    
    // Document title (centered)
    this.addFrenchText('BON DE COMMANDE FOURNISSEUR', 105, 25, 16, 'center');
    
    // Company name in Arabic (bold)
    this.addArabicText('عقاقير النهضة N', 190, 35, 14);
    this.addArabicText('النهضة', 190, 42, 10);
    
    // Dotted line separator
    this.drawDottedLine(15, 50, 195, 50);
    
    // Vendeur section
    this.addFrenchText('Vendeur: Nour Eddine', 15, 58, 8);
    
    // Document details in three columns
    const docDetailsY = 70;
    this.addFrenchText(`N°: ${documentData.number}`, 15, docDetailsY, 10);
    this.addFrenchText(`Date: ${new Date(documentData.createdAt).toLocaleDateString('fr-FR')}`, 80, docDetailsY, 10);
    this.addFrenchText(`Réf fournisseur: ${documentData.Supplier?.name || 'N/A'}`, 150, docDetailsY, 10);
    
    // Vertical separators for document details
    this.doc.line(70, docDetailsY - 5, 70, docDetailsY + 5);
    this.doc.line(140, docDetailsY - 5, 140, docDetailsY + 5);

    // Parse order details from notes
    let orderInfo: any = {};
    if (documentData.notes) {
      orderInfo = this.parseOrderNotes(documentData.notes);
    }

    // Order details
    if (orderInfo.deliveryDate) {
      this.addFrenchText(`Date de livraison souhaitée: ${orderInfo.deliveryDate}`, 15, 80, 8);
    }

    // Table headers
    const headers = ['Code', 'Description', 'Qté', 'P.U', 'Total'];
    
    let tableData: any[][] = [];
    if (documentData.items && documentData.items.length > 0) {
      // Use real data from document
      tableData = documentData.items.map(item => [
        item.code,
        item.description,
        item.quantity.toString(),
        item.unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        item.total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

    this.drawTable(headers, tableData, 90);

    // Total section with border
    const totalY = 90 + 8 + (tableData.length * 8) + 10;
    this.doc.rect(15, totalY, 180, 8, 'S');
    this.addFrenchText('Total:', 20, totalY + 5, 10);
    this.addFrenchText(`${documentData.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, totalY + 5, 10, 'right');
    
    // Additional notes
    if (orderInfo.notes) {
      this.addFrenchText('Notes:', 15, totalY + 20, 8);
      this.addFrenchText(orderInfo.notes, 15, totalY + 27, 7);
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
