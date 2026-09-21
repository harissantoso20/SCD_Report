import { supabase } from '../lib/supabaseClient';

export const beneficiaryService = {
  fetchBeneficiaries: async (globalProgram) => {
    if (!globalProgram) return [];

    const { data, error } = await supabase
      .from('SCD_Report_Beneficiaries')
      .select('*')
      .eq('Program', globalProgram)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching beneficiaries:', error);
      throw error;
    }

    return (data || []).map((row) => ({
      id: row.id,
      nama: row.Nama || '',
      nik: row.NIK || '',
      jenis_kelamin: row.Jenis_Kelamin || 'Laki-laki',
      ttl: row.TTL || '',
      pendidikan: row.Pendidikan || 'SMA / SMK / Sederajat',
      pekerjaan_sebelumnya: row.Pekerjaan_Sebelumnya || 'PETI',
      pekerjaan_sekarang: row.Pekerjaan_Sekarang || 'Anggota',
      jumlah_tanggungan: row.Jumlah_Tanggungan !== null && row.Jumlah_Tanggungan !== undefined ? row.Jumlah_Tanggungan : 0
    }));
  },

  saveBeneficiaries: async (globalProgram, beneficiaries = []) => {
    if (!globalProgram) return;

    // 1. Hapus data penerima manfaat lama untuk program ini
    const { error: delErr } = await supabase
      .from('SCD_Report_Beneficiaries')
      .delete()
      .eq('Program', globalProgram);

    if (delErr) {
      console.error('Error clearing old beneficiaries:', delErr);
      throw delErr;
    }

    // 2. Filter hanya baris yang memiliki setidaknya Nama atau NIK
    const validRows = beneficiaries.filter(
      (b) => b && (b.nama?.trim() !== '' || b.nik?.trim() !== '')
    );

    if (validRows.length === 0) return;

    // 3. Masukkan data baru
    const insertPayloads = validRows.map((b) => ({
      Program: globalProgram,
      Nama: b.nama?.trim() || '-',
      NIK: b.nik?.trim() || '-',
      Jenis_Kelamin: b.jenis_kelamin || 'Laki-laki',
      TTL: b.ttl?.trim() || '-',
      Pendidikan: b.pendidikan || '-',
      Pekerjaan_Sebelumnya: b.pekerjaan_sebelumnya || '-',
      Pekerjaan_Sekarang: b.pekerjaan_sekarang || 'Anggota',
      Jumlah_Tanggungan: parseInt(b.jumlah_tanggungan, 10) || 0
    }));

    const { error: insErr } = await supabase
      .from('SCD_Report_Beneficiaries')
      .insert(insertPayloads);

    if (insErr) {
      console.error('Error inserting beneficiaries:', insErr);
      throw insErr;
    }
  }
};
