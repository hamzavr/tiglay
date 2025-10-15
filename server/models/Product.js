const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nameAr: {
    type: DataTypes.STRING,
    allowNull: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  descriptionAr: {
    type: DataTypes.TEXT
  },
  size: {
    type: DataTypes.STRING
  },
  buyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  sellPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  minStock: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  expiryDate: {
    type: DataTypes.DATE
  },
  arrivalDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  totalPurchases: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalReturns: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  image: {
    type: DataTypes.TEXT
  },
  location: {
    type: DataTypes.STRING
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'U'
  },
  primeNumber: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  missingQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  surplusQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Suppliers',
      key: 'id'
    }
  }
});

module.exports = Product;