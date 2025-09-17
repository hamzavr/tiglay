-- Migration: Add missing fields to Documents table
-- Date: 2025-09-01

-- Add supplierId column
ALTER TABLE "Documents" ADD COLUMN IF NOT EXISTS "supplierId" UUID REFERENCES "Suppliers"(id);

-- Add clientId column  
ALTER TABLE "Documents" ADD COLUMN IF NOT EXISTS "clientId" UUID REFERENCES "Clients"(id);

-- Add userId column
ALTER TABLE "Documents" ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES "Users"(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_documents_supplier" ON "Documents"("supplierId");
CREATE INDEX IF NOT EXISTS "idx_documents_client" ON "Documents"("clientId");
CREATE INDEX IF NOT EXISTS "idx_documents_user" ON "Documents"("userId");
