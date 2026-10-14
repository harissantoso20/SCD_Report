-- ==============================================================================
-- 1. PEMBUATAN / PENYIMPANAN AKUN EKSEKUTIF (listati@bukitasam.co.id) KE SUPABASE AUTH
-- Menggunakan blok PL/pgSQL aman tanpa ON CONFLICT constraint error
-- ==============================================================================
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Cek apakah user sudah terdaftar sebelumnya
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'listati@bukitasam.co.id';

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'listati@bukitasam.co.id',
      crypt('scd2026PTBA!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"role":"eksekutif","name":"Listati"}'::jsonb,
      now(),
      now()
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      format('{"sub":"%s","email":"%s"}', v_user_id::text, 'listati@bukitasam.co.id')::jsonb,
      'email',
      v_user_id::text,
      now(),
      now(),
      now()
    );
  ELSE
    -- Jika user sudah pernah dibuat, perbarui password dan role metadatanya
    UPDATE auth.users
    SET 
      encrypted_password = crypt('scd2026PTBA!', gen_salt('bf')),
      email_confirmed_at = now(),
      raw_user_meta_data = '{"role":"eksekutif","name":"Listati"}'::jsonb,
      updated_at = now()
    WHERE id = v_user_id;
  END IF;
END $$;


-- ==============================================================================
-- 2. MENGAKTIFKAN RLS PADA TABEL UTAMA & TABEL MONITORING
-- ==============================================================================
ALTER TABLE "SCD_Report_Programs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SCD_Report_Monthly_Progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SCD_Report_Sales_Data" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SCD_Report_Evidence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SCD_Report_PLTS_Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SCD_Report_Monitoring" ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- 3. POLICY SELECT: PUBLIK BISA MEMBACA DATA (UNTUK DASHBOARD & MONITORING)
-- ==============================================================================
DROP POLICY IF EXISTS "Allow public read access on Programs" ON "SCD_Report_Programs";
CREATE POLICY "Allow public read access on Programs" ON "SCD_Report_Programs" 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on Progress" ON "SCD_Report_Monthly_Progress";
CREATE POLICY "Allow public read access on Progress" ON "SCD_Report_Monthly_Progress" 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on Sales" ON "SCD_Report_Sales_Data";
CREATE POLICY "Allow public read access on Sales" ON "SCD_Report_Sales_Data" 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on Evidence" ON "SCD_Report_Evidence";
CREATE POLICY "Allow public read access on Evidence" ON "SCD_Report_Evidence" 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on Location" ON "SCD_Report_PLTS_Location";
CREATE POLICY "Allow public read access on Location" ON "SCD_Report_PLTS_Location" 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on Monitoring" ON "SCD_Report_Monitoring";
CREATE POLICY "Allow public read access on Monitoring" ON "SCD_Report_Monitoring" 
FOR SELECT USING (true);


-- ==============================================================================
-- 4. POLICY INSERT: HANYA PENGGUNA TEROTENTIKASI (SELAIN AKUN VIEW-ONLY)
-- ==============================================================================
DROP POLICY IF EXISTS "Allow authenticated insert on Progress" ON "SCD_Report_Monthly_Progress";
CREATE POLICY "Allow authenticated insert on Progress" ON "SCD_Report_Monthly_Progress" 
FOR INSERT TO authenticated WITH CHECK (
  auth.jwt() ->> 'email' NOT IN (
    'apurnomo@bukitasam.co.id', 
    'santoso.official03@gmail.com', 
    'listati@bukitasam.co.id'
  )
);

DROP POLICY IF EXISTS "Allow authenticated insert on Sales" ON "SCD_Report_Sales_Data";
CREATE POLICY "Allow authenticated insert on Sales" ON "SCD_Report_Sales_Data" 
FOR INSERT TO authenticated WITH CHECK (
  auth.jwt() ->> 'email' NOT IN (
    'apurnomo@bukitasam.co.id', 
    'santoso.official03@gmail.com', 
    'listati@bukitasam.co.id'
  )
);

DROP POLICY IF EXISTS "Allow authenticated insert on Evidence" ON "SCD_Report_Evidence";
CREATE POLICY "Allow authenticated insert on Evidence" ON "SCD_Report_Evidence" 
FOR INSERT TO authenticated WITH CHECK (
  auth.jwt() ->> 'email' NOT IN (
    'apurnomo@bukitasam.co.id', 
    'santoso.official03@gmail.com', 
    'listati@bukitasam.co.id'
  )
);

DROP POLICY IF EXISTS "Allow authenticated insert on Monitoring" ON "SCD_Report_Monitoring";
CREATE POLICY "Allow authenticated insert on Monitoring" ON "SCD_Report_Monitoring" 
FOR INSERT TO authenticated WITH CHECK (
  auth.jwt() ->> 'email' NOT IN (
    'apurnomo@bukitasam.co.id', 
    'santoso.official03@gmail.com', 
    'listati@bukitasam.co.id'
  )
);


-- ==============================================================================
-- 5. POLICY UPDATE: HANYA PENGGUNA TEROTENTIKASI (SELAIN AKUN VIEW-ONLY)
-- ==============================================================================
DROP POLICY IF EXISTS "Allow authenticated update on Progress" ON "SCD_Report_Monthly_Progress";
CREATE POLICY "Allow authenticated update on Progress" ON "SCD_Report_Monthly_Progress" 
FOR UPDATE TO authenticated USING (
  auth.jwt() ->> 'email' NOT IN (
    'apurnomo@bukitasam.co.id', 
    'santoso.official03@gmail.com', 
    'listati@bukitasam.co.id'
  )
);

DROP POLICY IF EXISTS "Allow authenticated update on Sales" ON "SCD_Report_Sales_Data";
CREATE POLICY "Allow authenticated update on Sales" ON "SCD_Report_Sales_Data" 
FOR UPDATE TO authenticated USING (
  auth.jwt() ->> 'email' NOT IN (
    'apurnomo@bukitasam.co.id', 
    'santoso.official03@gmail.com', 
    'listati@bukitasam.co.id'
  )
);

DROP POLICY IF EXISTS "Allow authenticated update on Evidence" ON "SCD_Report_Evidence";
CREATE POLICY "Allow authenticated update on Evidence" ON "SCD_Report_Evidence" 
FOR UPDATE TO authenticated USING (
  auth.jwt() ->> 'email' NOT IN (
    'apurnomo@bukitasam.co.id', 
    'santoso.official03@gmail.com', 
    'listati@bukitasam.co.id'
  )
);

DROP POLICY IF EXISTS "Allow authenticated update on Monitoring" ON "SCD_Report_Monitoring";
CREATE POLICY "Allow authenticated update on Monitoring" ON "SCD_Report_Monitoring" 
FOR UPDATE TO authenticated USING (
  auth.jwt() ->> 'email' NOT IN (
    'apurnomo@bukitasam.co.id', 
    'santoso.official03@gmail.com', 
    'listati@bukitasam.co.id'
  )
);


-- ==============================================================================
-- 6. POLICY DELETE: HANYA PENGGUNA TEROTENTIKASI (SELAIN AKUN VIEW-ONLY)
-- ==============================================================================
DROP POLICY IF EXISTS "Allow authenticated delete on Progress" ON "SCD_Report_Monthly_Progress";
CREATE POLICY "Allow authenticated delete on Progress" ON "SCD_Report_Monthly_Progress" 
FOR DELETE TO authenticated USING (
  auth.jwt() ->> 'email' NOT IN (
    'apurnomo@bukitasam.co.id', 
    'santoso.official03@gmail.com', 
    'listati@bukitasam.co.id'
  )
);

DROP POLICY IF EXISTS "Allow authenticated delete on Sales" ON "SCD_Report_Sales_Data";
CREATE POLICY "Allow authenticated delete on Sales" ON "SCD_Report_Sales_Data" 
FOR DELETE TO authenticated USING (
  auth.jwt() ->> 'email' NOT IN (
    'apurnomo@bukitasam.co.id', 
    'santoso.official03@gmail.com', 
    'listati@bukitasam.co.id'
  )
);

DROP POLICY IF EXISTS "Allow authenticated delete on Evidence" ON "SCD_Report_Evidence";
CREATE POLICY "Allow authenticated delete on Evidence" ON "SCD_Report_Evidence" 
FOR DELETE TO authenticated USING (
  auth.jwt() ->> 'email' NOT IN (
    'apurnomo@bukitasam.co.id', 
    'santoso.official03@gmail.com', 
    'listati@bukitasam.co.id'
  )
);

DROP POLICY IF EXISTS "Allow authenticated delete on Monitoring" ON "SCD_Report_Monitoring";
CREATE POLICY "Allow authenticated delete on Monitoring" ON "SCD_Report_Monitoring" 
FOR DELETE TO authenticated USING (
  auth.jwt() ->> 'email' NOT IN (
    'apurnomo@bukitasam.co.id', 
    'santoso.official03@gmail.com', 
    'listati@bukitasam.co.id'
  )
);
