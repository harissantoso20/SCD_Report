import { supabase } from '../lib/supabaseClient';
import { evidenceService } from './evidenceService';
import { fileToPermanentDataUrl, getGDriveThumbnail } from './monitoringService';
import { getIndoMonthString, getYear } from '../utils/dateUtils';

const LOCAL_STORAGE_KEY = 'scd_logbook_records_local';

/**
 * Helper to get local records from localStorage
 */
const getLocalRecords = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse localStorage logbook records:', err);
    return [];
  }
};

/**
 * Helper to save local records to localStorage
 */
const setLocalRecords = (records) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save logbook to localStorage:', err);
  }
};

/**
 * Process array of photos for logbook
 */
async function processLogbookPhotos(items, meta) {
  if (!Array.isArray(items)) return [];
  const processed = [];

  for (const item of items) {
    if (typeof item === 'string') {
      if (item && !item.startsWith('blob:')) {
        processed.push(item);
      }
    } else if (item?.file) {
      const permanentDataUrl = await fileToPermanentDataUrl(item.file);
      let uploadedToGDrive = false;

      try {
        const uploadFile = new File([item.file], `[LOGBOOK]_${item.file.name}`, { type: item.file.type });
        const gdriveUrl = await evidenceService.uploadFileToGDrive(uploadFile, {
          program: meta.program || 'Logbook Kegiatan',
          month: meta.month || '',
          year: meta.year || ''
        });

        if (gdriveUrl && typeof gdriveUrl === 'string' && gdriveUrl.startsWith('http')) {
          processed.push({
            url: gdriveUrl,
            preview: permanentDataUrl || '',
            name: uploadFile.name
          });
          uploadedToGDrive = true;
        }
      } catch (err) {
        console.warn('GDrive upload issue in logbook, fallback to data URL:', err.message);
      }

      if (!uploadedToGDrive && permanentDataUrl) {
        processed.push({
          url: permanentDataUrl,
          preview: permanentDataUrl,
          name: item.file.name || 'Foto Kegiatan'
        });
      }
    } else if (item?.url) {
      processed.push({
        url: item.url,
        preview: item.preview || '',
        name: item.name || 'Foto Kegiatan'
      });
    } else if (item?.preview && !item.preview.startsWith('blob:')) {
      processed.push({
        url: item.preview,
        preview: item.preview,
        name: 'Foto Kegiatan'
      });
    }
  }

  return processed;
}

export const logbookService = {
  /**
   * Check whether the Supabase table exists and is accessible
   */
  checkTableStatus: async () => {
    try {
      const { data, error } = await supabase
        .from('SCD_Report_Logbook')
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          return { isCloudReady: false, error: 'Tabel "SCD_Report_Logbook" belum dibuat di Supabase.' };
        }
        return { isCloudReady: false, error: error.message };
      }
      return { isCloudReady: true, error: null };
    } catch (err) {
      return { isCloudReady: false, error: err.message };
    }
  },

  /**
   * Fetch all logbook records (ordered by tanggal DESC)
   */
  fetchRecords: async () => {
    try {
      const { data, error } = await supabase
        .from('SCD_Report_Logbook')
        .select('*')
        .order('tanggal', { ascending: false })
        .order('id', { ascending: false });

      if (error) {
        console.warn('Supabase logbook fetch failed, using local storage:', error.message);
        return { data: getLocalRecords(), source: 'local' };
      }

      // Sync local storage with latest cloud records
      if (Array.isArray(data)) {
        setLocalRecords(data);
      }

      return { data: data || [], source: 'cloud' };
    } catch (err) {
      console.warn('Network issue fetching logbook, using local:', err);
      return { data: getLocalRecords(), source: 'local' };
    }
  },

  /**
   * Save (Insert or Update) a logbook entry
   */
  saveRecord: async (recordData) => {
    const isEdit = Boolean(recordData.id);
    const dateObj = new Date(recordData.tanggal || new Date());
    const monthName = getIndoMonthString(dateObj);
    const yearStr = String(getYear(dateObj));

    // Process photo uploads
    const processedPhotos = await processLogbookPhotos(recordData.foto_dokumentasi || [], {
      program: recordData.program,
      month: monthName,
      year: yearStr
    });

    const payload = {
      tanggal: recordData.tanggal,
      waktu_mulai: recordData.waktu_mulai || null,
      waktu_selesai: recordData.waktu_selesai || null,
      program: recordData.program,
      kategori: recordData.kategori || 'Pekerjaan Teknis/Lapangan',
      judul: recordData.judul,
      lokasi: recordData.lokasi || '',
      pic_nama: recordData.pic_nama || '',
      kelompok_binaan: recordData.kelompok_binaan || recordData.ketua_kelompok || recordData.pihak_terlibat || '',
      ketua_kelompok: recordData.kelompok_binaan || recordData.ketua_kelompok || recordData.pihak_terlibat || '',
      stakeholder: recordData.stakeholder || recordData.tim_pendamping || '',
      tim_pendamping: recordData.stakeholder || recordData.tim_pendamping || '',
      pihak_terlibat: recordData.kelompok_binaan || recordData.ketua_kelompok || recordData.pihak_terlibat || '',
      jumlah_peserta: Number(recordData.jumlah_peserta) || 0,
      uraian_kegiatan: recordData.uraian_kegiatan || '',
      output_capaian: recordData.output_capaian || '',
      status: recordData.status || 'Selesai',
      kendala: recordData.kendala || '',
      tindak_lanjut: recordData.tindak_lanjut || '',
      items: Array.isArray(recordData.items) ? recordData.items : [],
      foto_dokumentasi: processedPhotos,
      link_lampiran: recordData.link_lampiran || '',
      updated_at: new Date().toISOString()
    };

    if (!isEdit) {
      payload.created_by = recordData.created_by || 'comdevptba@gmail.com';
    }

    try {
      let savedData = null;

      if (isEdit) {
        const { data, error } = await supabase
          .from('SCD_Report_Logbook')
          .update(payload)
          .eq('id', recordData.id)
          .select()
          .single();

        if (error) throw error;
        savedData = data;
      } else {
        const { data, error } = await supabase
          .from('SCD_Report_Logbook')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        savedData = data;
      }

      // Update local storage backup
      const localRecords = getLocalRecords();
      let updatedLocal;
      if (isEdit) {
        updatedLocal = localRecords.map((r) => (r.id === savedData.id ? savedData : r));
      } else {
        updatedLocal = [savedData, ...localRecords];
      }
      setLocalRecords(updatedLocal);

      return { success: true, data: savedData, source: 'cloud' };
    } catch (err) {
      console.warn('Saving to Supabase failed, saving locally:', err.message);

      const localRecords = getLocalRecords();
      const localPayload = {
        ...payload,
        id: isEdit ? recordData.id : Date.now(),
        created_at: isEdit ? recordData.created_at : new Date().toISOString()
      };

      let updatedLocal;
      if (isEdit) {
        updatedLocal = localRecords.map((r) => (r.id === localPayload.id ? localPayload : r));
      } else {
        updatedLocal = [localPayload, ...localRecords];
      }
      setLocalRecords(updatedLocal);

      return { 
        success: true, 
        data: localPayload, 
        source: 'local',
        warning: 'Disimpan di penyimpanan lokal sementara (tabel Supabase belum siap atau jaringan offline).' 
      };
    }
  },

  /**
   * Delete a logbook record
   */
  deleteRecord: async (id) => {
    try {
      const { error } = await supabase
        .from('SCD_Report_Logbook')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local storage
      const localRecords = getLocalRecords();
      setLocalRecords(localRecords.filter((r) => r.id !== id));

      return { success: true };
    } catch (err) {
      console.warn('Cloud delete failed, removing from local:', err.message);
      const localRecords = getLocalRecords();
      setLocalRecords(localRecords.filter((r) => r.id !== id));
      return { success: true };
    }
  }
};
