const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change column type from STRING to TEXT for storing base64 images
    await queryInterface.changeColumn('Products', 'image', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to STRING
    await queryInterface.changeColumn('Products', 'image', {
      type: DataTypes.STRING,
      allowNull: true,
    });
  }
};
