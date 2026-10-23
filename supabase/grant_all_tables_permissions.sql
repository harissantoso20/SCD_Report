-- ==============================================================================
-- SKRIP MASTER PEMBERIAN HAK AKSES API SUPABASE (UNTUK SEMUA TABEL SCD REPORT)
-- Jalankan skrip ini sekali di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================
-- Tujuan:
-- 1. Memastikan seluruh tabel (Program, Progress, Sales, Evidence, PLTS, Monitoring, Logbook)
--    dapat diakses tanpa kendala izin (Permission Denied).
-- 2. Mengatur Default Privileges agar tabel baru di masa depan otomatis memiliki hak akses API.
-- ==============================================================================

-- 1. Izin Skema Public
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Berikan Izin ke SEMUA Tabel yang Ada Saat Ini
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;

-- 3. Berikan Izin ke SEMUA Sequence (ID Auto-Increment)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- 4. Set Otomatis untuk Semua Tabel Baru di Masa Mendatang (Default Privileges)
-- Dengan menjalankan baris ini, Anda tidak perlu lagi menambahkan GRANT manual setiap membuat tabel baru!
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON SEQUENCES TO authenticated, service_role;
