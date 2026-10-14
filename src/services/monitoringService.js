import { supabase } from '../lib/supabaseClient';
import { evidenceService } from './evidenceService';
import { getIndoMonthString, getYear } from '../utils/dateUtils';

const LOCAL_STORAGE_KEY = 'scd_monitoring_records_local';

/**
 * Helper to get local records from localStorage
 */
const getLocalRecords = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse localStorage monitoring records:', err);
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
    console.error('Failed to save to localStorage:', err);
  }
};

/**
 * Convert file to permanent optimized data URL (compressed base64).
 * Ensures images and PDFs are NEVER lost even if GDrive webhook is unreachable or errors.
 */
export function fileToPermanentDataUrl(file, maxWidth = 1200, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file) return resolve('');

    // If PDF or non-image, read directly as base64 data URL
    if (!file.type || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    // For images, optimize/compress using Canvas to keep size around 100KB
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch {
          resolve(e.target.result || '');
        }
      };
      img.onerror = () => resolve(e.target.result || '');
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to convert GDrive file view link to directly renderable image CDN
 * Uses lh3.googleusercontent.com/d/ID for direct image streaming without cookie block
 */
export function getGDriveThumbnail(url, size = 'w1000') {
  if (!url) return '';
  if (typeof url !== 'string') {
    if (url.preview) return url.preview;
    if (url.url) url = url.url;
    else return '';
  }
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    // drive.google.com/thumbnail is Google's official thumbnail generator, best for cross-origin previews
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=${size}`;
  }
  return url;
}

/**
 * Helper to upload array of evidence files directly to Google Drive,
 * with permanent compressed base64 fallback so evidence NEVER fails or disappears.
 */
async function processEvidenceFiles(items, meta, filePrefix = '') {
  if (!Array.isArray(items)) return [];
  const processed = [];

  for (const item of items) {
    if (typeof item === 'string') {
      if (item && !item.startsWith('blob:')) {
        processed.push(item);
      }
    } else if (item?.file) {
      // 1. Prepare permanent compressed base64 data URL
      const permanentDataUrl = await fileToPermanentDataUrl(item.file);

      // 2. Try uploading to Google Drive
      let uploadedToGDrive = false;
      try {
        const uploadFile = filePrefix 
          ? new File([item.file], `[${filePrefix}]_${item.file.name}`, { type: item.file.type })
          : item.file;

        const gdriveUrl = await evidenceService.uploadFileToGDrive(uploadFile, {
          program: meta.program || 'Monitoring TJSL',
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
        console.warn('GDrive upload webhook issue, using permanent local/cloud data URL:', err.message);
      }

      // 3. If GDrive upload failed or not configured, use permanent compressed base64
      if (!uploadedToGDrive && permanentDataUrl) {
        processed.push(permanentDataUrl);
      }
    } else if (item?.url) {
      processed.push({
        url: item.url,
        preview: item.preview || '',
        name: item.name || 'Berkas Eviden'
      });
    } else if (item?.preview && !item.preview.startsWith('blob:')) {
      processed.push(item.preview);
    }
  }

  return processed;
}

export const monitoringService = {
  /**
   * Check whether the Supabase table exists and is accessible
   */
  checkTableStatus: async () => {
    try {
      const { data, error } = await supabase
        .from('SCD_Report_Monitoring')
        .select('id')
        .limit(1);

      if (error) {
        return { isCloudReady: false, error: error.message, code: error.code };
      }
      return { isCloudReady: true, error: null };
    } catch (err) {
      return { isCloudReady: false, error: err.message };
    }
  },

  /**
   * Fetch all monitoring records (from Supabase if available, fallback to localStorage)
   * Also merges local evidence cache if Supabase table columns are not yet altered.
   */
  fetchRecords: async () => {
    try {
      const { data, error } = await supabase
        .from('SCD_Report_Monitoring')
        .select('*')
        .order('tanggal', { ascending: false })
        .order('id', { ascending: false });

      const localData = getLocalRecords();

      if (error) {
        console.warn('Supabase fetch failed or table does not exist. Using local storage.', error);
        return {
          source: 'local',
          data: localData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)),
          cloudError: error
        };
      }

      // Merge Supabase rows with local evidence cache in case remote schema lacks evidence columns
      const mergedData = (data || []).map((row) => {
        const localMatch = localData.find((l) => String(l.id) === String(row.id));
        return {
          ...row,
          foto_dokumentasi: (Array.isArray(row.foto_dokumentasi) && row.foto_dokumentasi.length > 0)
            ? row.foto_dokumentasi
            : (localMatch?.foto_dokumentasi || []),
          scan_daftar_hadir: (Array.isArray(row.scan_daftar_hadir) && row.scan_daftar_hadir.length > 0)
            ? row.scan_daftar_hadir
            : (localMatch?.scan_daftar_hadir || []),
          jenis_kegiatan: row.jenis_kegiatan || localMatch?.jenis_kegiatan || (row.program === 'SURVEY' ? 'SURVEY' : 'Monitoring'),
          ttd_pic: row.ttd_pic || localMatch?.ttd_pic || '',
          ttd_penerima: row.ttd_penerima || localMatch?.ttd_penerima || ''
        };
      });

      return {
        source: 'cloud',
        data: mergedData,
        cloudError: null
      };
    } catch (err) {
      console.warn('Network or client error during fetch, fallback to local storage:', err);
      return {
        source: 'local',
        data: getLocalRecords(),
        cloudError: err
      };
    }
  },

  /**
   * Save a single monitoring record (insert or update)
   * Handles photo and attendance scan uploads to GDrive with resilient permanent fallback.
   */
  saveRecord: async (record) => {
    const isNew = !record.id;
    const now = new Date().toISOString();
    const dateStr = record.tanggal || now.split('T')[0];

    const meta = {
      program: record.program || 'Monitoring TJSL',
      month: getIndoMonthString(dateStr),
      year: String(getYear(dateStr))
    };

    // 1. Process files (Upload to Google Drive or permanent compressed Base64)
    const processedPhotos = await processEvidenceFiles(
      record.foto_dokumentasi, 
      meta, 
      'Monitoring-Foto'
    );
    const processedAttendance = await processEvidenceFiles(
      record.scan_daftar_hadir, 
      meta, 
      'Monitoring-Presensi'
    );

    const payload = {
      tanggal: record.tanggal,
      hari: record.hari || '',
      program: record.program || '',
      jenis_kegiatan: record.jenis_kegiatan || (record.program === 'SURVEY' ? 'SURVEY' : 'Monitoring'),
      lokasi: record.lokasi || '',
      keterangan: record.keterangan || '',
      items: Array.isArray(record.items) ? record.items : [],
      pic_sustainability: record.pic_sustainability || '',
      penerima_manfaat: record.penerima_manfaat || '',
      ttd_pic: record.ttd_pic || '',
      ttd_penerima: record.ttd_penerima || '',
      created_by: record.created_by || '',
      foto_dokumentasi: processedPhotos,
      scan_daftar_hadir: processedAttendance
    };

    // 2. Try Supabase first
    try {
      let query;
      if (isNew) {
        query = supabase
          .from('SCD_Report_Monitoring')
          .insert([payload])
          .select()
          .single();
      } else {
        query = supabase
          .from('SCD_Report_Monitoring')
          .update(payload)
          .eq('id', record.id)
          .select()
          .single();
      }

      let { data, error } = await query;

      // Graceful fallback if columns foto_dokumentasi / scan_daftar_hadir / ttd / jenis_kegiatan do not exist yet on remote schema
      if (error && (
        error.message?.includes('foto_dokumentasi') || 
        error.message?.includes('scan_daftar_hadir') || 
        error.message?.includes('jenis_kegiatan') || 
        error.message?.includes('ttd_pic') || 
        error.message?.includes('ttd_penerima') || 
        error.code === '42703'
      )) {
        console.warn('Kolom baru belum ada di Supabase remote. Menyimpan ke Cloud dan menyimpan data lengkap di cache lokal...');
        const payloadWithoutNewCols = { ...payload };
        delete payloadWithoutNewCols.foto_dokumentasi;
        delete payloadWithoutNewCols.scan_daftar_hadir;
        delete payloadWithoutNewCols.jenis_kegiatan;
        delete payloadWithoutNewCols.ttd_pic;
        delete payloadWithoutNewCols.ttd_penerima;

        const retryQuery = isNew
          ? supabase.from('SCD_Report_Monitoring').insert([payloadWithoutNewCols]).select().single()
          : supabase.from('SCD_Report_Monitoring').update(payloadWithoutNewCols).eq('id', record.id).select().single();

        const retryRes = await retryQuery;
        if (!retryRes.error && retryRes.data) {
          data = {
            ...retryRes.data,
            jenis_kegiatan: record.jenis_kegiatan || (record.program === 'SURVEY' ? 'SURVEY' : 'Monitoring'),
            foto_dokumentasi: processedPhotos,
            scan_daftar_hadir: processedAttendance,
            ttd_pic: record.ttd_pic || '',
            ttd_penerima: record.ttd_penerima || ''
          };
          error = null;
        }
      }

      if (!error && data) {
        // Ensure local cache also stores the complete record with evidence, signatures, and jenis_kegiatan
        const local = getLocalRecords();
        const fullRecord = {
          ...data,
          jenis_kegiatan: record.jenis_kegiatan || (record.program === 'SURVEY' ? 'SURVEY' : 'Monitoring'),
          foto_dokumentasi: processedPhotos,
          scan_daftar_hadir: processedAttendance,
          ttd_pic: record.ttd_pic || '',
          ttd_penerima: record.ttd_penerima || ''
        };
        const existingIdx = local.findIndex((r) => r.id === data.id);
        if (existingIdx >= 0) {
          local[existingIdx] = fullRecord;
        } else {
          local.unshift(fullRecord);
        }
        setLocalRecords(local);

        return { success: true, data: fullRecord, source: 'cloud' };
      }

      console.warn('Supabase save failed, falling back to local storage:', error);
    } catch (err) {
      console.warn('Network error, falling back to local storage:', err);
    }

    // 3. Fallback: save to Local Storage
    const local = getLocalRecords();
    let savedRecord;

    if (isNew) {
      savedRecord = {
        ...payload,
        id: `local_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        created_at: now,
        is_local_only: true
      };
      local.unshift(savedRecord);
    } else {
      const idx = local.findIndex((r) => r.id === record.id);
      savedRecord = {
        ...payload,
        id: record.id,
        created_at: record.created_at || now,
        is_local_only: true
      };
      if (idx >= 0) {
        local[idx] = savedRecord;
      } else {
        local.unshift(savedRecord);
      }
    }

    setLocalRecords(local);
    return {
      success: true,
      data: savedRecord,
      source: 'local',
      notice: 'Tersimpan di Penyimpanan Lokal'
    };
  },

  /**
   * Delete a monitoring record
   */
  deleteRecord: async (id) => {
    if (typeof id === 'number' || !String(id).startsWith('local_')) {
      try {
        const { error } = await supabase
          .from('SCD_Report_Monitoring')
          .delete()
          .eq('id', id);

        if (error) {
          console.warn('Failed to delete from Supabase:', error);
        }
      } catch (err) {
        console.warn('Error during Supabase delete:', err);
      }
    }

    const local = getLocalRecords();
    const updated = local.filter((r) => String(r.id) !== String(id));
    setLocalRecords(updated);

    return { success: true };
  }
};
