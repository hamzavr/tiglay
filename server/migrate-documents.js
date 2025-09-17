const { sequelize } = require('./config/database');

async function migrateDocumentsTable() {
  try {
    console.log('🔄 Migration de la table Documents...');

    // Ajouter les colonnes manquantes
    await sequelize.query(`
      ALTER TABLE "Documents" 
      ADD COLUMN IF NOT EXISTS "supplierId" UUID,
      ADD COLUMN IF NOT EXISTS "clientId" UUID,
      ADD COLUMN IF NOT EXISTS "userId" UUID;
    `);

    console.log('✅ Colonnes supplierId, clientId, userId ajoutées');

    // Ajouter les contraintes de clés étrangères
    await sequelize.query(`
      ALTER TABLE "Documents" 
      ADD CONSTRAINT IF NOT EXISTS "fk_documents_supplier" 
      FOREIGN KEY ("supplierId") REFERENCES "Suppliers"(id) ON DELETE SET NULL;
    `);

    await sequelize.query(`
      ALTER TABLE "Documents" 
      ADD CONSTRAINT IF NOT EXISTS "fk_documents_client" 
      FOREIGN KEY ("clientId") REFERENCES "Clients"(id) ON DELETE SET NULL;
    `);

    await sequelize.query(`
      ALTER TABLE "Documents" 
      ADD CONSTRAINT IF NOT EXISTS "fk_documents_user" 
      FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE SET NULL;
    `);

    console.log('✅ Contraintes de clés étrangères ajoutées');

    // Créer les index
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_documents_supplier" ON "Documents"("supplierId");
      CREATE INDEX IF NOT EXISTS "idx_documents_client" ON "Documents"("clientId");
      CREATE INDEX IF NOT EXISTS "idx_documents_user" ON "Documents"("userId");
    `);

    console.log('✅ Index de performance créés');

    console.log('🎉 Migration terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await sequelize.close();
  }
}

// Lancer la migration
migrateDocumentsTable();
