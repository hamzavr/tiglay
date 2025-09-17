const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM(
      'supplier_purchase_order',
      'reception_slip',
      'stock_entry',
      'customer_sales_order',
      'delivery_note',
      'invoice'
    ),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'paid', 'cancelled'),
    defaultValue: 'draft'
  },
  workflowStep: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'credit', 'partial'),
    defaultValue: 'cash'
  },
  notes: {
    type: DataTypes.TEXT
  },
  pdfPath: {
    type: DataTypes.STRING
  },
  supplierId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  clientId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  linkedDocuments: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  }
});

module.exports = Document;