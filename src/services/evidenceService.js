import { supabase } from '../lib/supabaseClient';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const evidenceService = {
  fetchEvidenceData: async (fuzzyKeyword, targetYear, monthNames) => {
    const { data, error } = await supabase
      .from('SCD_Report_Evidence')
      .select('*')
      .ilike('Program', fuzzyKeyword)
      .eq('Tahun', targetYear)
      .in('Bulan', monthNames);

    if (error) throw error;
    return data || [];
  },

  uploadAndInsertEvidence: async (globalProgram, targetMonth, targetYear, files) => {
    if (!files || files.length === 0) return;

    for (const file of files) {
      if (file instanceof File) {
        // Validation: Limit file size to 5MB
        if (file.size > MAX_FILE_SIZE_BYTES) {
          throw new Error(`Ukuran file "${file.name}" melebihi batas maksimal ${MAX_FILE_SIZE_MB}MB.`);
        }

        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const filePath = `${globalProgram.replace(/\s+/g, '_')}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('evidence_photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('evidence_photos')
          .getPublicUrl(filePath);

        const { error: insEvErr } = await supabase.from('SCD_Report_Evidence').insert([{
          "Program": globalProgram,
          "Bulan": targetMonth,
          "Tahun": targetYear,
          "File_Url": publicUrl
        }]);

        if (insEvErr) throw insEvErr;
      }
    }
  }
};
