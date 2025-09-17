-- Sample data for testing
INSERT INTO "Clients" (id, name, phone, email, address, "creditBalance", "totalPurchases", "isActive", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'Ahmed Alami', '+212 6 12 34 56 78', 'ahmed.alami@email.com', '123 Rue Hassan II, Casablanca', 0.00, 15000.00, true, NOW(), NOW()),
  (gen_random_uuid(), 'Fatima Benjelloun', '+212 6 98 76 54 32', 'fatima.benjelloun@email.com', '456 Avenue Mohammed V, Rabat', 500.00, 8500.00, true, NOW(), NOW()),
  (gen_random_uuid(), 'Mohammed Tazi', '+212 6 55 44 33 22', 'mohammed.tazi@email.com', '789 Boulevard Al Amir, Fès', 0.00, 22000.00, true, NOW(), NOW()),
  (gen_random_uuid(), 'Amina El Fassi', '+212 6 11 22 33 44', 'amina.elfassi@email.com', '321 Rue Ibn Khaldoun, Marrakech', 1200.00, 18000.00, true, NOW(), NOW()),
  (gen_random_uuid(), 'Hassan Berrada', '+212 6 99 88 77 66', 'hassan.berrada@email.com', '654 Avenue Hassan II, Agadir', 0.00, 9500.00, true, NOW(), NOW());

-- Sample suppliers data
INSERT INTO "Suppliers" (id, name, phone, email, address, "isActive", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'Matériaux Plus', '+212 5 22 33 44 55', 'contact@materiaux-plus.ma', '123 Zone Industrielle, Casablanca', true, NOW(), NOW()),
  (gen_random_uuid(), 'Construction Pro', '+212 5 66 77 88 99', 'info@construction-pro.ma', '456 Rue des Entrepreneurs, Rabat', true, NOW(), NOW()),
  (gen_random_uuid(), 'Bâtiment Express', '+212 5 11 22 33 44', 'ventes@batiment-express.ma', '789 Avenue du Commerce, Fès', true, NOW(), NOW());

-- Sample products data
INSERT INTO "Products" (id, name, "nameAr", code, description, category, "buyPrice", "sellPrice", stock, "minStock", "isActive", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'Ciment Portland', 'أسمنت بورتلاند', 'CEM-001', 'Ciment Portland de haute qualité', 'Ciment', 35.00, 45.00, 1000, 100, true, NOW(), NOW()),
  (gen_random_uuid(), 'Briques rouges', 'طوب أحمر', 'BRI-001', 'Briques rouges standard 24x11x7cm', 'Briques', 1.80, 2.50, 5000, 500, true, NOW(), NOW()),
  (gen_random_uuid(), 'Sable fin', 'رمل ناعم', 'SAB-001', 'Sable fin pour construction', 'Sable', 25.00, 35.00, 200, 50, true, NOW(), NOW()),
  (gen_random_uuid(), 'Gravier 3/8', 'حصى 3/8', 'GRA-001', 'Gravier calibré 3/8 pouce', 'Gravier', 30.00, 40.00, 150, 30, true, NOW(), NOW()),
  (gen_random_uuid(), 'Fer à béton 8mm', 'حديد تسليح 8مم', 'FER-008', 'Barres de fer à béton 8mm', 'Fer', 8.00, 12.00, 200, 50, true, NOW(), NOW());
