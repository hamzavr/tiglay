'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('SaleItems', 'unit', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'U'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('SaleItems', 'unit');
  }
};
