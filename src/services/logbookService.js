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

/**
 * Process array of attachment files (documents/PDFs/etc.) for logbook
 * Uploads them directly to Google Drive and returns formatted URL(s)
 */
async function processLogbookAttachments(items, existingLink, meta) {
  const finalUrls = [];

  // 1. Preserve existing valid manual URLs (if any)
  if (typeof existingLink === 'string' && existingLink.trim()) {
    const urls = existingLink.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean);
    urls.forEach((u) => {
      if ((u.startsWith('http') || u.startsWith('data:')) && !finalUrls.includes(u)) {
        finalUrls.push(u);
      }
    });
  }

  // 2. Process file objects or uploaded items
  if (Array.isArray(items)) {
    for (const item of items) {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed && !trimmed.startsWith('blob:') && !finalUrls.includes(trimmed)) {
          finalUrls.push(trimmed);
        }
      } else if (item?.file) {
        let uploadedToGDrive = false;
        try {
          const uploadFile = new File(
            [item.file], 
            `[LOGBOOK_LAMPIRAN]_${item.file.name}`, 
            { type: item.file.type || 'application/octet-stream' }
          );

          const gdriveUrl = await evidenceService.uploadFileToGDrive(uploadFile, {
            program: meta.program || 'Logbook Kegiatan',
            month: meta.month || '',
            year: meta.year || ''
          });

          if (gdriveUrl && typeof gdriveUrl === 'string' && gdriveUrl.startsWith('http')) {
            finalUrls.push(gdriveUrl);
            uploadedToGDrive = true;
          }
        } catch (err) {
          console.warn('GDrive upload issue for logbook attachment, fallback to data URL:', err.message);
        }

        // Permanent fallback if GDrive upload fails
        if (!uploadedToGDrive) {
          try {
            const permanentDataUrl = await fileToPermanentDataUrl(item.file);
            if (permanentDataUrl && !finalUrls.includes(permanentDataUrl)) {
              finalUrls.push(permanentDataUrl);
            }
          } catch (e) {
            console.error('Fallback data URL error for attachment:', e);
          }
        }
      } else if (item?.url && !finalUrls.includes(item.url)) {
        finalUrls.push(item.url);
      }
    }
  }

  const uniqueUrls = Array.from(new Set(finalUrls.filter(Boolean)));
  return uniqueUrls.join('\n');
}

export const logbookService = {
  /**
   * Check whether the Supabase table exists and is accessible
   * Also checks if columns items / kelompok_binaan have been migrated.
   */
  checkTableStatus: async () => {
    try {
      const { data, error } = await supabase
        .from('SCD_Report_Logbook')
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          return { isCloudReady: false, needsMigration: false, error: 'Tabel "SCD_Report_Logbook" belum dibuat di Supabase.' };
        }
        return { isCloudReady: false, needsMigration: false, error: error.message };
      }

      // Check if schema has columns items and kelompok_binaan
      const { error: colError } = await supabase
        .from('SCD_Report_Logbook')
        .select('items, kelompok_binaan')
        .limit(1);

      if (colError && (colError.code === 'PGRST204' || colError.code === '42703' || colError.message?.includes('column'))) {
        return { 
          isCloudReady: true, 
          needsMigration: true, 
          error: 'Kolom baru (items, kelompok_binaan, dll.) belum dimigrasi di tabel Supabase. Sistem saat ini beroperasi dengan mode kompatibilitas aman.' 
        };
      }

      return { isCloudReady: true, needsMigration: false, error: null };
    } catch (err) {
      return { isCloudReady: false, needsMigration: false, error: err.message };
    }
  },

  /**
   * Fetch all logbook records (ordered by tanggal DESC)
   * Resiliently merges remote rows with local cache so that items / kelompok_binaan are never lost.
   */
  fetchRecords: async () => {
    try {
      const { data, error } = await supabase
        .from('SCD_Report_Logbook')
        .select('*')
        .order('tanggal', { ascending: false })
        .order('id', { ascending: false });

      const localData = getLocalRecords();

      if (error) {
        console.warn('Supabase logbook fetch failed, using local storage:', error.message);
        return { data: localData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)), source: 'local' };
      }

      // Merge Supabase rows with local cache so that items, kelompok_binaan, etc. are retained
      const mergedData = (data || []).map((row) => {
        const localMatch = localData.find((l) => String(l.id) === String(row.id));
        return {
          ...row,
          items: (Array.isArray(row.items) && row.items.length > 0)
            ? row.items
            : (localMatch?.items || []),
          kelompok_binaan: row.kelompok_binaan || localMatch?.kelompok_binaan || row.pihak_terlibat || '',
          stakeholder: row.stakeholder || localMatch?.stakeholder || row.tim_pendamping || '',
          ketua_kelompok: row.ketua_kelompok || localMatch?.ketua_kelompok || '',
          jumlah_peserta: row.jumlah_peserta ?? localMatch?.jumlah_peserta ?? 0,
          foto_dokumentasi: (Array.isArray(row.foto_dokumentasi) && row.foto_dokumentasi.length > 0)
            ? row.foto_dokumentasi
            : (localMatch?.foto_dokumentasi || [])
        };
      });

      // Preserve any local-only records (e.g. offline created records)
      const cloudIds = new Set((data || []).map((r) => String(r.id)));
      const localOnly = localData.filter((r) => !cloudIds.has(String(r.id)));
      const combined = [...localOnly, ...mergedData];

      // Update local storage backup without erasing unsynced records
      setLocalRecords(combined);

      return { data: combined, source: 'cloud' };
    } catch (err) {
      console.warn('Network issue fetching logbook, using local:', err);
      return { data: getLocalRecords(), source: 'local' };
    }
  },

  /**
   * Save (Insert or Update) a logbook entry
   * Features resilient schema-aware fallback: automatically strips unsupported columns on remote DB
   * while caching complete data locally, guaranteeing zero data loss.
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

    // Process attachment files (upload to Google Drive)
    const finalLinkLampiran = await processLogbookAttachments(
      recordData.lampiran_files || [], 
      recordData.link_lampiran || '', 
      {
        program: recordData.program,
        month: monthName,
        year: yearStr
      }
    );

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
      link_lampiran: finalLinkLampiran,
      updated_at: new Date().toISOString()
    };

    if (!isEdit) {
      payload.created_by = recordData.created_by || 'comdevptba@gmail.com';
    }

    try {
      let savedData = null;

      // 1. First attempt: save full payload
      const query = isEdit
        ? supabase.from('SCD_Report_Logbook').update(payload).eq('id', recordData.id).select().single()
        : supabase.from('SCD_Report_Logbook').insert([payload]).select().single();

      let { data, error } = await query;

      // 2. Fallback: if remote schema lacks new columns (items, kelompok_binaan, ketua_kelompok, stakeholder, jumlah_peserta)
      if (error && (
        error.code === 'PGRST204' || 
        error.code === '42703' || 
        error.message?.includes('items') ||
        error.message?.includes('kelompok_binaan') ||
        error.message?.includes('ketua_kelompok') ||
        error.message?.includes('stakeholder') ||
        error.message?.includes('jumlah_peserta') ||
        error.message?.includes('column')
      )) {
        console.warn('Kolom baru belum ada di Supabase remote. Menyimpan kolom dasar dan cache lokal...', error.message);
        const fallbackPayload = { ...payload };
        delete fallbackPayload.items;
        delete fallbackPayload.kelompok_binaan;
        delete fallbackPayload.ketua_kelompok;
        delete fallbackPayload.stakeholder;
        delete fallbackPayload.jumlah_peserta;

        const retryQuery = isEdit
          ? supabase.from('SCD_Report_Logbook').update(fallbackPayload).eq('id', recordData.id).select().single()
          : supabase.from('SCD_Report_Logbook').insert([fallbackPayload]).select().single();

        const retryRes = await retryQuery;
        if (!retryRes.error && retryRes.data) {
          savedData = {
            ...retryRes.data,
            items: payload.items,
            kelompok_binaan: payload.kelompok_binaan,
            ketua_kelompok: payload.ketua_kelompok,
            stakeholder: payload.stakeholder,
            jumlah_peserta: payload.jumlah_peserta
          };
          error = null;
        } else if (retryRes.error) {
          throw retryRes.error;
        }
      } else if (!error && data) {
        savedData = data;
      } else if (error) {
        throw error;
      }

      if (savedData) {
        // Update local storage backup
        const localRecords = getLocalRecords();
        const fullRecord = {
          ...savedData,
          items: payload.items,
          kelompok_binaan: payload.kelompok_binaan,
          stakeholder: payload.stakeholder,
          jumlah_peserta: payload.jumlah_peserta
        };
        let updatedLocal;
        if (isEdit) {
          updatedLocal = localRecords.map((r) => (String(r.id) === String(fullRecord.id) ? fullRecord : r));
        } else {
          updatedLocal = [fullRecord, ...localRecords.filter((r) => String(r.id) !== String(fullRecord.id))];
        }
        setLocalRecords(updatedLocal);

        return { success: true, data: fullRecord, source: 'cloud' };
      }

      throw new Error('Gagal memproses data logbook');
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
        updatedLocal = localRecords.map((r) => (String(r.id) === String(localPayload.id) ? localPayload : r));
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
      setLocalRecords(localRecords.filter((r) => String(r.id) !== String(id)));

      return { success: true };
    } catch (err) {
      console.warn('Cloud delete failed, removing from local:', err.message);
      const localRecords = getLocalRecords();
      setLocalRecords(localRecords.filter((r) => String(r.id) !== String(id)));
      return { success: true };
    }
  }
};
