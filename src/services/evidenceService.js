import { supabase } from '../lib/supabaseClient';

const GDRIVE_UPLOAD_URL = import.meta.env.VITE_GDRIVE_UPLOAD_URL || 'https://script.google.com/macros/s/AKfycbwPzltqJZXhXu6A_Sq4BHeUDSuQ6fFOHhMEMq5SWGBOEUT_q5CJPMqG505MyuD68YhU_w/exec';

// Helper: convert File to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is 'data:image/jpeg;base64,...'
      const base64Data = reader.result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

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

  uploadFileToGDrive: async (file, metadata = {}) => {
    const base64 = await fileToBase64(file);
    const payload = {
      fileName: file.name,
      mimeType: file.type || 'image/jpeg',
      base64: base64,
      program: metadata.program || '',
      month: metadata.month || '',
      year: metadata.year || ''
    };

    // Google Apps Script requires simple text/plain POST to avoid CORS preflight errors
    const response = await fetch(GDRIVE_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Upload ke Google Drive gagal: HTTP ${response.status}`);
    }

    const resData = await response.json();
    if (!resData.success) {
      throw new Error(`Google Apps Script Error: ${resData.error || 'Gagal mengunggah file'}`);
    }

    return resData.fileUrl;
  },

  saveEvidence: async (globalProgram, targetMonth, targetYear, evidenceItems = []) => {
    // 1. Upload any new files to Google Drive
    const finalUrls = [];

    for (const item of evidenceItems) {
      if (item.type === 'file' && item.file) {
        // Upload new file to GDrive into the program's dedicated folder
        const gdriveUrl = await evidenceService.uploadFileToGDrive(item.file, {
          program: globalProgram,
          month: targetMonth,
          year: targetYear
        });
        finalUrls.push(gdriveUrl);
      } else if (item.type === 'url' && item.url) {
        // Existing kept URL
        finalUrls.push(item.url);
      } else if (typeof item === 'string' && item.trim() !== '') {
        finalUrls.push(item.trim());
      }
    }

    // 2. Clear previous entries for this program/month/year
    const { error: delErr } = await supabase
      .from('SCD_Report_Evidence')
      .delete()
      .eq('Program', globalProgram)
      .eq('Bulan', targetMonth)
      .eq('Tahun', targetYear);

    if (delErr) throw delErr;

    // 3. Insert newly saved URLs
    if (finalUrls.length > 0) {
      const records = finalUrls.map(url => ({
        Program: globalProgram,
        Bulan: targetMonth,
        Tahun: targetYear,
        File_Url: url
      }));

      const { error: insErr } = await supabase
        .from('SCD_Report_Evidence')
        .insert(records);

      if (insErr) throw insErr;
    }

    return finalUrls;
  }
};
