const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'hardware_store',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test de connexion et synchronisation
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Forcer la synchronisation des modèles
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized.');
    
    // Assurer qu'aucune contrainte d'unicité ne bloque product.code
    try {
      // Supprimer contrainte unique si elle existe (nom par défaut Sequelize)
      await sequelize.query('ALTER TABLE "Products" DROP CONSTRAINT IF EXISTS "Products_code_key";');
      // Supprimer index unique potentiel
      await sequelize.query('DROP INDEX IF EXISTS "products_code_key";');
      await sequelize.query('DROP INDEX IF EXISTS "Products_code_key";');
      // Parcourir et supprimer tout index unique sur (code)
      await sequelize.query(`
        DO $$
        DECLARE idx RECORD;
        BEGIN
          FOR idx IN
            SELECT indexname FROM pg_indexes
            WHERE schemaname = 'public'
              AND tablename IN ('Products','products')
              AND indexdef ILIKE 'CREATE UNIQUE INDEX%'
              AND indexdef ILIKE '%(code%'
          LOOP
            EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(idx.indexname) || ';';
          END LOOP;

          -- Supprimer toute contrainte UNIQUE au niveau table
          FOR idx IN
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema='public'
              AND table_name IN ('Products','products')
              AND constraint_type='UNIQUE'
          LOOP
            EXECUTE 'ALTER TABLE "Products" DROP CONSTRAINT IF EXISTS ' || quote_ident(idx.constraint_name) || ';';
            EXECUTE 'ALTER TABLE products DROP CONSTRAINT IF EXISTS ' || quote_ident(idx.constraint_name) || ';';
          END LOOP;
        END $$;`);
      console.log('✅ Any unique constraint on Products.code has been removed.');
    } catch (idxErr) {
      console.warn('⚠️ Could not ensure unique index removal for Products.code:', idxErr.message || idxErr);
    }

    // Rebuild de la colonne code si nécessaire (supprimer définitivement unicité)
    try {
      await sequelize.query(`
        DO $$
        DECLARE has_unique BOOLEAN := false;
        BEGIN
          SELECT EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE schemaname='public'
              AND tablename IN ('Products','products')
              AND indexdef ILIKE 'CREATE UNIQUE INDEX%'
              AND indexdef ILIKE '%(code%'
          ) INTO has_unique;

          IF has_unique THEN
            -- Créer une nouvelle colonne
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='Products' AND column_name='code_new'
            ) THEN
              EXECUTE 'ALTER TABLE "Products" ADD COLUMN code_new TEXT';
            END IF;

            -- Copier les valeurs
            EXECUTE 'UPDATE "Products" SET code_new = code WHERE code_new IS NULL';

            -- Supprimer contraintes/index uniques résiduels
            EXECUTE 'ALTER TABLE "Products" DROP CONSTRAINT IF EXISTS "Products_code_key"';
            FOR idx IN
              SELECT indexname FROM pg_indexes
              WHERE schemaname = 'public'
                AND tablename IN ('Products','products')
                AND indexdef ILIKE 'CREATE UNIQUE INDEX%'
                AND indexdef ILIKE '%(code%'
            LOOP
              EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(idx.indexname);
            END LOOP;

            -- Remplacer la colonne
            EXECUTE 'ALTER TABLE "Products" DROP COLUMN code';
            EXECUTE 'ALTER TABLE "Products" RENAME COLUMN code_new TO code';
            EXECUTE 'ALTER TABLE "Products" ALTER COLUMN code SET NOT NULL';
          END IF;
        END $$;`);
      console.log('✅ Products.code rebuilt without unique constraint when needed.');
    } catch (rebuildErr) {
      console.warn('⚠️ Could not rebuild Products.code:', rebuildErr.message || rebuildErr);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Exporter sequelize directement pour les modèles
module.exports = sequelize;

// Exporter aussi testConnection pour le server.js
module.exports.testConnection = testConnection;