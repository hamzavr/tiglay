const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Sale, SaleItem, Product, Client } = require('../models');

const generateInvoicePDF = async (saleId) => {
  try {
    const sale = await Sale.findByPk(saleId, {
      include: [
        { model: Client },
        { 
          model: SaleItem, 
          include: [{ model: Product }]
        }
      ]
    });

    if (!sale) {
      throw new Error('Sale not found');
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Generate filename
    const filename = `invoice-${sale.id}-${Date.now()}.pdf`;
    const filepath = path.join(__dirname, '../uploads/invoices', filename);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Pipe PDF to file
    doc.pipe(fs.createWriteStream(filepath));

    // Header
    doc.fontSize(20).text('MATÉRIAUX DE CONSTRUCTION', 50, 50);
    doc.fontSize(12).text('متجر مواد البناء والسباكة', 50, 75);
    doc.text('Hardware Store - Plumbing & Construction Materials', 50, 90);
    
    // Invoice details
    doc.fontSize(16).text('FACTURE / INVOICE', 50, 130);
    doc.fontSize(12);
    doc.text(`Invoice ID: ${sale.id}`, 50, 160);
    doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`, 50, 175);
    doc.text(`Payment Method: ${sale.paymentMethod.toUpperCase()}`, 50, 190);

    // Client details
    if (sale.Client) {
      doc.text('Client Details:', 50, 220);
      doc.text(`Name: ${sale.Client.name}`, 50, 235);
      doc.text(`Phone: ${sale.Client.phone}`, 50, 250);
      if (sale.Client.address) {
        doc.text(`Address: ${sale.Client.address}`, 50, 265);
      }
    }

    // Items table
    let yPosition = 300;
    doc.text('Items:', 50, yPosition);
    yPosition += 20;

    // Table headers
    doc.text('Product', 50, yPosition);
    doc.text('Qty', 200, yPosition);
    doc.text('Price', 250, yPosition);
    doc.text('Total', 350, yPosition);
    yPosition += 20;

    // Draw line
    doc.moveTo(50, yPosition).lineTo(450, yPosition).stroke();
    yPosition += 10;

    // Items
    sale.SaleItems.forEach(item => {
      doc.text(item.Product.name, 50, yPosition);
      doc.text(item.quantity.toString(), 200, yPosition);
      doc.text(`${item.price} DH`, 250, yPosition);
      doc.text(`${item.total} DH`, 350, yPosition);
      yPosition += 20;
    });

    // Total
    yPosition += 20;
    doc.moveTo(50, yPosition).lineTo(450, yPosition).stroke();
    yPosition += 20;
    doc.fontSize(14).text(`TOTAL: ${sale.total} DH`, 350, yPosition);

    // Footer
    doc.fontSize(10).text('Thank you for your business!', 50, yPosition + 50);
    doc.text('شكراً لتعاملكم معنا', 50, yPosition + 65);

    // Finalize PDF
    doc.end();

    return `/uploads/invoices/${filename}`;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

module.exports = { generateInvoicePDF };