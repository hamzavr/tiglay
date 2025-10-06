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

-- Produits de plomberie avec nombres premiers
INSERT INTO "Products" (id, name, "nameAr", code, description, "buyPrice", "sellPrice", stock, "minStock", "primeNumber", unit, location, "isActive", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'Tuyau PVC 20mm', 'أنبوب PVC 20مم', 'PLO-001', 'Tuyau PVC diamètre 20mm', 12.50, 18.00, 100, 20, 2, 'M', 'A1-B1', true, NOW(), NOW()),
  (gen_random_uuid(), 'Tuyau PVC 25mm', 'أنبوب PVC 25مم', 'PLO-002', 'Tuyau PVC diamètre 25mm', 15.00, 22.00, 80, 15, 3, 'M', 'A1-B2', true, NOW(), NOW()),
  (gen_random_uuid(), 'Tuyau PVC 32mm', 'أنبوب PVC 32مم', 'PLO-003', 'Tuyau PVC diamètre 32mm', 18.50, 28.00, 60, 12, 5, 'M', 'A1-B3', true, NOW(), NOW()),
  (gen_random_uuid(), 'Tuyau PVC 40mm', 'أنبوب PVC 40مم', 'PLO-004', 'Tuyau PVC diamètre 40mm', 22.00, 35.00, 50, 10, 7, 'M', 'A1-B4', true, NOW(), NOW()),
  (gen_random_uuid(), 'Tuyau PVC 50mm', 'أنبوب PVC 50مم', 'PLO-005', 'Tuyau PVC diamètre 50mm', 28.00, 45.00, 40, 8, 11, 'M', 'A1-B5', true, NOW(), NOW()),
  (gen_random_uuid(), 'Raccord coude 20mm', 'وصلة زاوية 20مم', 'PLO-006', 'Raccord coude PVC 20mm', 3.50, 6.00, 200, 40, 13, 'PCS', 'A2-B1', true, NOW(), NOW()),
  (gen_random_uuid(), 'Raccord coude 25mm', 'وصلة زاوية 25مم', 'PLO-007', 'Raccord coude PVC 25mm', 4.00, 7.50, 150, 30, 17, 'PCS', 'A2-B2', true, NOW(), NOW()),
  (gen_random_uuid(), 'Raccord coude 32mm', 'وصلة زاوية 32مم', 'PLO-008', 'Raccord coude PVC 32mm', 5.50, 9.00, 120, 25, 19, 'PCS', 'A2-B3', true, NOW(), NOW()),
  (gen_random_uuid(), 'Raccord T 20mm', 'وصلة T 20مم', 'PLO-009', 'Raccord T PVC 20mm', 4.50, 8.00, 100, 20, 23, 'PCS', 'A2-B4', true, NOW(), NOW()),
  (gen_random_uuid(), 'Raccord T 25mm', 'وصلة T 25مم', 'PLO-010', 'Raccord T PVC 25mm', 5.00, 9.50, 80, 15, 29, 'PCS', 'A2-B5', true, NOW(), NOW()),
  (gen_random_uuid(), 'Robinet simple 20mm', 'صنبور بسيط 20مم', 'PLO-011', 'Robinet simple PVC 20mm', 25.00, 40.00, 30, 6, 31, 'PCS', 'A3-B1', true, NOW(), NOW()),
  (gen_random_uuid(), 'Robinet simple 25mm', 'صنبور بسيط 25مم', 'PLO-012', 'Robinet simple PVC 25mm', 30.00, 50.00, 25, 5, 37, 'PCS', 'A3-B2', true, NOW(), NOW()),
  (gen_random_uuid(), 'Robinet double 20mm', 'صنبور مزدوج 20مم', 'PLO-013', 'Robinet double PVC 20mm', 45.00, 75.00, 20, 4, 41, 'PCS', 'A3-B3', true, NOW(), NOW()),
  (gen_random_uuid(), 'Robinet double 25mm', 'صنبور مزدوج 25مم', 'PLO-014', 'Robinet double PVC 25mm', 55.00, 90.00, 15, 3, 43, 'PCS', 'A3-B4', true, NOW(), NOW()),
  (gen_random_uuid(), 'Vanne d''arrêt 20mm', 'صمام إيقاف 20مم', 'PLO-015', 'Vanne d''arrêt PVC 20mm', 35.00, 60.00, 25, 5, 47, 'PCS', 'A4-B1', true, NOW(), NOW()),
  (gen_random_uuid(), 'Vanne d''arrêt 25mm', 'صمام إيقاف 25مم', 'PLO-016', 'Vanne d''arrêt PVC 25mm', 42.00, 70.00, 20, 4, 53, 'PCS', 'A4-B2', true, NOW(), NOW()),
  (gen_random_uuid(), 'Vanne d''arrêt 32mm', 'صمام إيقاف 32مم', 'PLO-017', 'Vanne d''arrêt PVC 32mm', 50.00, 85.00, 15, 3, 59, 'PCS', 'A4-B3', true, NOW(), NOW()),
  (gen_random_uuid(), 'Collier de serrage 20mm', 'مشبك تثبيت 20مم', 'PLO-018', 'Collier de serrage PVC 20mm', 2.50, 4.50, 500, 100, 61, 'PCS', 'A5-B1', true, NOW(), NOW()),
  (gen_random_uuid(), 'Collier de serrage 25mm', 'مشبك تثبيت 25مم', 'PLO-019', 'Collier de serrage PVC 25mm', 3.00, 5.50, 400, 80, 67, 'PCS', 'A5-B2', true, NOW(), NOW()),
  (gen_random_uuid(), 'Collier de serrage 32mm', 'مشبك تثبيت 32مم', 'PLO-020', 'Collier de serrage PVC 32mm', 3.50, 6.50, 300, 60, 71, 'PCS', 'A5-B3', true, NOW(), NOW());