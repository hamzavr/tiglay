const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter la colonne permissions à la table Users
    await queryInterface.addColumn('Users', 'permissions', {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        canAccessInventory: true,
        canAccessSuppliers: true,
        canAccessClients: true,
        canAccessDocuments: true,
        canAccessWaiting: true,
        canAccessReports: true,
        canAccessSettings: true,
        canManageUsers: false
      }
    });

    // Mettre à jour les utilisateurs existants avec les permissions par défaut selon leur rôle
    const [users] = await queryInterface.sequelize.query('SELECT id, role FROM "Users"');
    
    for (const user of users) {
      let defaultPermissions;
      if (user.role === 'admin') {
        defaultPermissions = {
          canAccessInventory: true,
          canAccessSuppliers: true,
          canAccessClients: true,
          canAccessDocuments: true,
          canAccessWaiting: true,
          canAccessReports: true,
          canAccessSettings: true,
          canManageUsers: true
        };
      } else if (user.role === 'manager') {
        defaultPermissions = {
          canAccessInventory: true,
          canAccessSuppliers: true,
          canAccessClients: true,
          canAccessDocuments: true,
          canAccessWaiting: true,
          canAccessReports: true,
          canAccessSettings: true,
          canManageUsers: false
        };
      } else {
        // Pour les anciens utilisateurs avec le rôle 'cashier', les convertir en 'manager' avec des permissions limitées
        defaultPermissions = {
          canAccessInventory: false,
          canAccessSuppliers: false,
          canAccessClients: true,
          canAccessDocuments: true,
          canAccessWaiting: true,
          canAccessReports: false,
          canAccessSettings: false,
          canManageUsers: false
        };
        
        // Changer le rôle de 'cashier' à 'manager'
        await queryInterface.sequelize.query(
          'UPDATE "Users" SET role = \'manager\' WHERE id = :userId',
          { replacements: { userId: user.id } }
        );
      }
      
      await queryInterface.sequelize.query(
        'UPDATE "Users" SET permissions = :permissions WHERE id = :userId',
        { 
          replacements: { 
            permissions: JSON.stringify(defaultPermissions),
            userId: user.id 
          } 
        }
      );
    }

    // Modifier l'ENUM pour supprimer 'cashier'
    await queryInterface.changeColumn('Users', 'role', {
      type: DataTypes.ENUM('admin', 'manager'),
      allowNull: false,
      defaultValue: 'manager'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Restaurer l'ENUM avec 'cashier'
    await queryInterface.changeColumn('Users', 'role', {
      type: DataTypes.ENUM('admin', 'manager', 'cashier'),
      allowNull: false,
      defaultValue: 'cashier'
    });

    // Supprimer la colonne permissions
    await queryInterface.removeColumn('Users', 'permissions');
  }
};


