const User = require('./User');
const Product = require('./Product');
const Supplier = require('./Supplier');
const Client = require('./Client');
const Document = require('./Document');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');

// Define associations
Product.belongsTo(Supplier, { foreignKey: 'supplierId' });
Supplier.hasMany(Product, { foreignKey: 'supplierId' });

Document.belongsTo(Supplier, { foreignKey: 'supplierId' });
Document.belongsTo(Client, { foreignKey: 'clientId' });
Document.belongsTo(User, { foreignKey: 'userId' });

Sale.belongsTo(Client, { foreignKey: 'clientId' });
Client.hasMany(Sale, { foreignKey: 'clientId' });
Sale.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Sale, { foreignKey: 'userId' });
Sale.hasMany(SaleItem, { foreignKey: 'saleId' });

SaleItem.belongsTo(Sale, { foreignKey: 'saleId' });
SaleItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(SaleItem, { foreignKey: 'productId' });

module.exports = {
  User,
  Product,
  Supplier,
  Client,
  Document,
  Sale,
  SaleItem
};