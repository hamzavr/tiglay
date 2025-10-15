'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Products', 'supplierId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Suppliers',
        key: 'id'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Products', 'supplierId');
  }
};
