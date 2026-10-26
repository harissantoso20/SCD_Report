-- =========================================================================
-- SQL MIGRATION: Menambahkan Kolom Koordinat pada SCD_Report_PLTS_Location
-- Jalankan query ini di Supabase SQL Editor jika kolom Latitude & Longitude
-- belum ada di tabel "SCD_Report_PLTS_Location".
-- =========================================================================

-- 1. Tambahkan kolom Latitude dan Longitude jika belum ada
ALTER TABLE "SCD_Report_PLTS_Location" 
ADD COLUMN IF NOT EXISTS "Latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "Longitude" DOUBLE PRECISION;

-- 2. (Opsional) Mengisi koordinat awal untuk 12 desa PLTS yang sudah ada
-- Berdasarkan peta eksisting sistem:
UPDATE "SCD_Report_PLTS_Location" SET "Latitude" = -0.5829123, "Longitude" = 100.7159371 WHERE "Desa" = 'Talawi Mudik';
UPDATE "SCD_Report_PLTS_Location" SET "Latitude" = -5.1718380, "Longitude" = 105.1158260 WHERE "Desa" = 'Trimulyo';
UPDATE "SCD_Report_PLTS_Location" SET "Latitude" = -3.7161975, "Longitude" = 103.8004536 WHERE "Desa" = 'Tanjung Raja';
UPDATE "SCD_Report_PLTS_Location" SET "Latitude" = -3.6331314, "Longitude" = 103.7262035 WHERE "Desa" = 'Nanjungan';
UPDATE "SCD_Report_PLTS_Location" SET "Latitude" = -4.8466185, "Longitude" = 105.3391385 WHERE "Desa" = 'Rejosari Mataram';
UPDATE "SCD_Report_PLTS_Location" SET "Latitude" = -3.6816109, "Longitude" = 103.8003334 WHERE "Desa" = 'Karang Raja';
UPDATE "SCD_Report_PLTS_Location" SET "Latitude" = -3.6504690, "Longitude" = 103.7457736 WHERE "Desa" = 'Muara Lawai';
UPDATE "SCD_Report_PLTS_Location" SET "Latitude" = -3.9438075, "Longitude" = 103.7948504 WHERE "Desa" = 'Tanjung Agung';
UPDATE "SCD_Report_PLTS_Location" SET "Latitude" = -5.3533811, "Longitude" = 104.8699914 WHERE "Desa" = 'Lugusari';
UPDATE "SCD_Report_PLTS_Location" SET "Latitude" = -3.8947347, "Longitude" = 103.7188515 WHERE "Desa" = 'Tanjung Karangan';
UPDATE "SCD_Report_PLTS_Location" SET "Latitude" = -3.9548610, "Longitude" = 103.8456610 WHERE "Desa" = 'Matas';
UPDATE "SCD_Report_PLTS_Location" SET "Latitude" = -3.5792181, "Longitude" = 103.8098195 WHERE "Desa" = 'Muara Gula';

-- 3. Memastikan hak akses read/write tetap terbuka untuk aplikasi
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "SCD_Report_PLTS_Location" TO anon, authenticated, service_role;
