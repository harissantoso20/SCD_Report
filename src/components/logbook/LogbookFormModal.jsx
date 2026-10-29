import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Plus, Trash2, Save, AlertCircle, Camera, UploadCloud, 
  Image as ImageIcon, CheckCircle2, Clock, Calendar, MapPin, User, Users,
  Check, FileText, ExternalLink
} from 'lucide-react';
import { programService } from '../../services/programService';
import SavingOverlay from '../common/SavingOverlay';
import TimePicker24 from './TimePicker24';

const CATEGORIES = [
  'Pekerjaan Teknis/Lapangan',
  'Rapat & Koordinasi',
  'Pelatihan & Pemberdayaan',
  'Penyaluran Bantuan/Alat',
  'Penanganan Masalah (Troubleshooting)',
  'Administrasi & Pelaporan',
  'Lainnya'
];

const STATUS_OPTIONS = [
  { value: 'Selesai', label: 'Selesai', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  { value: 'Berjalan', label: 'Berjalan (In Progress)', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  { value: 'Ada Kendala', label: 'Ada Kendala', color: 'bg-rose-50 text-rose-700 border-rose-300' }
];

const TIME_OPTIONS_24H = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '21:00', '22:00'
];

export const formatTime24 = (val) => {
  if (!val) return '';
  const parts = val.toString().split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return val;
};

const cleanTime24Input = (val) => {
  if (!val) return '';
  let str = val.toString().replace(/[^0-9:]/g, '');
  if (!str.includes(':') && str.length >= 3) {
    str = str.slice(0, 2) + ':' + str.slice(2, 4);
  }
  return str.slice(0, 5);
};

const normalizeTime24OnBlur = (val) => {
  if (!val) return '';
  const trimmed = val.trim();
  if (/^\d{1,2}$/.test(trimmed)) {
    const num = Math.min(23, Math.max(0, parseInt(trimmed, 10)));
    return `${String(num).padStart(2, '0')}:00`;
  }
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    let h = parseInt(parts[0] || '0', 10);
    let m = parseInt(parts[1] || '0', 10);
    h = isNaN(h) ? 0 : Math.min(23, Math.max(0, h));
    m = isNaN(m) ? 0 : Math.min(59, Math.max(0, m));
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  return trimmed;
};

const GDriveBadge = () => (
  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
    <svg viewBox="0 0 87.3 78" className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
    <span>Tersimpan di Google Drive</span>
  </span>
);

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LogbookFormModal({ initialData, onClose, onSave }) {
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const photoInputRef = useRef(null);
  const attachmentInputRef = useRef(null);

  // Attachment state (Direct upload to Google Drive)
  const [lampiranFiles, setLampiranFiles] = useState([]);
  const [existingLinks, setExistingLinks] = useState(() => {
    if (!initialData?.link_lampiran) return [];
    if (typeof initialData.link_lampiran === 'string') {
      return initialData.link_lampiran.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    }
    return [];
  });
  const [manualLink, setManualLink] = useState('');
  const [showManualUrl, setShowManualUrl] = useState(false);

  // Helper to normalize items
  const initialItems = (() => {
    if (Array.isArray(initialData?.items) && initialData.items.length > 0) {
      return initialData.items;
    }
    if (initialData?.output_capaian || initialData?.kendala || initialData?.tindak_lanjut) {
      return [
        {
          no: 1,
          output_capaian: initialData.output_capaian || '',
          kendala: initialData.kendala || '',
          tindak_lanjut: initialData.tindak_lanjut || ''
        }
      ];
    }
    return [
      {
        no: 1,
        output_capaian: '',
        kendala: '',
        tindak_lanjut: ''
      }
    ];
  })();

  // Form State
  const [formData, setFormData] = useState({
    id: initialData?.id || null,
    tanggal: initialData?.tanggal || new Date().toISOString().split('T')[0],
    waktu_mulai: initialData?.waktu_mulai ? formatTime24(initialData.waktu_mulai) : '',
    waktu_selesai: initialData?.waktu_selesai ? formatTime24(initialData.waktu_selesai) : '',
    program: initialData?.program || '',
    kategori: initialData?.kategori || 'Pekerjaan Teknis/Lapangan',
    judul: initialData?.judul || '',
    lokasi: initialData?.lokasi || '',
    pic_nama: initialData?.pic_nama || '',
    kelompok_binaan: initialData?.kelompok_binaan || initialData?.ketua_kelompok || initialData?.pihak_terlibat || '',
    ketua_kelompok: initialData?.kelompok_binaan || initialData?.ketua_kelompok || initialData?.pihak_terlibat || '',
    stakeholder: initialData?.stakeholder || initialData?.tim_pendamping || '',
    tim_pendamping: initialData?.stakeholder || initialData?.tim_pendamping || '',
    pihak_terlibat: initialData?.kelompok_binaan || initialData?.ketua_kelompok || initialData?.pihak_terlibat || '',
    jumlah_peserta: initialData?.jumlah_peserta || '',
    uraian_kegiatan: initialData?.uraian_kegiatan || '',
    output_capaian: initialData?.output_capaian || '',
    status: initialData?.status || 'Selesai',
    kendala: initialData?.kendala || '',
    tindak_lanjut: initialData?.tindak_lanjut || '',
    items: initialItems,
    foto_dokumentasi: Array.isArray(initialData?.foto_dokumentasi) ? initialData.foto_dokumentasi : [],
    link_lampiran: initialData?.link_lampiran || '',
    created_by: initialData?.created_by || 'comdevptba@gmail.com'
  });

  // Fetch list of programs for admin dropdown
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      try {
        const list = await programService.fetchProgramList();
        setPrograms(list || []);
        if (!formData.program && list && list.length > 0) {
          setFormData((prev) => ({ ...prev, program: list[0] }));
        }
      } catch (err) {
        console.error('Failed to load program list:', err);
      } finally {
        setLoadingPrograms(false);
      }
    };
    fetchPrograms();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleTimeChange = (field, val) => {
    const cleaned = cleanTime24Input(val);
    handleChange(field, cleaned);
  };

  const handleTimeBlur = (field, val) => {
    const normalized = normalizeTime24OnBlur(val);
    handleChange(field, normalized);
  };

  // Add Photos (from device / camera)
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newItems = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setFormData((prev) => ({
      ...prev,
      foto_dokumentasi: [...prev.foto_dokumentasi, ...newItems]
    }));

    // Reset input
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleRemovePhoto = (index) => {
    setFormData((prev) => {
      const updated = [...prev.foto_dokumentasi];
      const removed = updated.splice(index, 1)[0];
      if (removed?.preview && removed.preview.startsWith('blob:')) {
        URL.revokeObjectURL(removed.preview);
      }
      return { ...prev, foto_dokumentasi: updated };
    });
  };

  // Attachment Handlers (Direct Upload to Google Drive)
  const handleAttachmentSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newEntries = files.map((file) => ({
      id: `att_${Date.now()}_${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setLampiranFiles((prev) => [...prev, ...newEntries]);
    if (attachmentInputRef.current) attachmentInputRef.current.value = '';
  };

  const handleRemoveAttachment = (index) => {
    setLampiranFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingLink = (index) => {
    setExistingLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // Add, Remove, and Change dynamic item rows
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          no: prev.items.length + 1,
          output_capaian: '',
          kendala: '',
          tindak_lanjut: ''
        }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => {
      const filtered = prev.items.filter((_, i) => i !== index);
      const renumbered = filtered.map((it, i) => ({ ...it, no: i + 1 }));
      return { ...prev, items: renumbered };
    });
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.program) {
      setErrorMsg('Harap pilih program kegiatan.');
      return;
    }
    if (!formData.judul.trim()) {
      setErrorMsg('Harap isi judul kegiatan.');
      return;
    }
    if (!formData.pic_nama.trim()) {
      setErrorMsg('Harap isi nama PIC penanggung jawab kegiatan.');
      return;
    }
    if (!formData.uraian_kegiatan.trim()) {
      setErrorMsg('Harap isi uraian ringkas kegiatan yang dilaksanakan.');
      return;
    }

    // Synthesize combined output, kendala, and tindak_lanjut from rows
    const validOutputs = (formData.items || [])
      .map((it, idx) => {
        const text = it.output_capaian?.trim();
        if (!text) return '';
        return (formData.items || []).length > 1 ? `${idx + 1}. ${text}` : text;
      })
      .filter(Boolean)
      .join('\n');

    const validKendalas = (formData.items || [])
      .map((it, idx) => {
        const text = it.kendala?.trim();
        if (!text) return '';
        return (formData.items || []).length > 1 ? `${idx + 1}. ${text}` : text;
      })
      .filter(Boolean)
      .join('\n');

    const validTindakLanjuts = (formData.items || [])
      .map((it, idx) => {
        const text = it.tindak_lanjut?.trim();
        if (!text) return '';
        return (formData.items || []).length > 1 ? `${idx + 1}. ${text}` : text;
      })
      .filter(Boolean)
      .join('\n');

    const remainingUrls = [
      ...existingLinks,
      ...(manualLink.trim() ? [manualLink.trim()] : [])
    ].join('\n');

    const payload = {
      ...formData,
      waktu_mulai: normalizeTime24OnBlur(formData.waktu_mulai) || null,
      waktu_selesai: normalizeTime24OnBlur(formData.waktu_selesai) || null,
      output_capaian: validOutputs,
      kendala: validKendalas,
      tindak_lanjut: validTindakLanjuts,
      link_lampiran: remainingUrls,
      lampiran_files: lampiranFiles
    };

    setSubmitting(true);
    setErrorMsg('');

    try {
      await onSave(payload);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan catatan kegiatan.');
      setSubmitting(false);
    }
  };

  return (
    <>
      {submitting && (
        <SavingOverlay 
          title="Menyimpan Log Book & Mengunggah Berkas..." 
          subtitle="Sistem sedang mengunggah dokumentasi foto & berkas lampiran ke Google Drive terpusat dan menyimpan data ke database."
        />
      )}

      <div 
        className="fixed inset-0 z-[100] flex items-start justify-center bg-black/75 backdrop-blur-sm p-3 md:p-6 pt-16 md:pt-14 overflow-y-auto"
        onClick={() => { if (!submitting) onClose(); }}
      >
        <div 
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-gray-200 flex flex-col max-h-[85vh] animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold">
                {formData.id ? 'Ubah Log Book Kegiatan' : 'Tambah Log Book Kegiatan PIC'}
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Informasi Program & Tanggal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Program <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.program}
                  onChange={(e) => handleChange('program', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-gray-800"
                  required
                >
                  <option value="">-- Pilih Program --</option>
                  {programs.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tanggal Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => handleChange('tanggal', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Waktu (Mulai - Selesai)
                </label>
                <div className="flex items-center gap-2">
                  <TimePicker24
                    value={formData.waktu_mulai}
                    onChange={(val) => handleChange('waktu_mulai', val)}
                    placeholder="08:00"
                    align="left"
                  />
                  <span className="text-gray-400 font-bold">-</span>
                  <TimePicker24
                    value={formData.waktu_selesai}
                    onChange={(val) => handleChange('waktu_selesai', val)}
                    placeholder="16:00"
                    align="right"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Kategori & Judul Kegiatan */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Kategori Aktivitas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => handleChange('kategori', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Judul Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.judul}
                    onChange={(e) => handleChange('judul', e.target.value)}
                    placeholder="Contoh: Pengecekan Panel Surya & Uji Pompa Irigasi Blok A"
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Lokasi Spesifik
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.lokasi}
                      onChange={(e) => handleChange('lokasi', e.target.value)}
                      placeholder="Contoh: Dusun IV, Desa Karang Raja"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Status Kegiatan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map((st) => {
                      const isSelected = formData.status === st.value;
                      return (
                        <button
                          key={st.value}
                          type="button"
                          onClick={() => handleChange('status', st.value)}
                          className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                            isSelected 
                              ? `${st.color} ring-2 ring-blue-500/30 shadow-sm` 
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Person In Charge (PIC) & Keterlibatan */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4" /> Person In Charge & Pihak Terkait
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Kolom 1 (Kiri): Nama PIC Lapangan */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Nama PIC Lapangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pic_nama}
                    onChange={(e) => handleChange('pic_nama', e.target.value)}
                    placeholder="Nama PIC penanggung jawab"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                    required
                  />
                </div>

                {/* Kolom 2 (Tengah): Kelompok Binaan */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Kelompok Binaan
                  </label>
                  <input
                    type="text"
                    value={formData.kelompok_binaan}
                    onChange={(e) => {
                      handleChange('kelompok_binaan', e.target.value);
                      handleChange('ketua_kelompok', e.target.value);
                      handleChange('pihak_terlibat', e.target.value);
                    }}
                    placeholder="Contoh: Kelompok Tani Sukamaju"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Kolom 3 (Kanan): Stakeholder / Pihak Lainnya */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Stakeholder / Pihak Lainnya
                  </label>
                  <input
                    type="text"
                    value={formData.stakeholder}
                    onChange={(e) => {
                      handleChange('stakeholder', e.target.value);
                      handleChange('tim_pendamping', e.target.value);
                    }}
                    placeholder="Contoh: Pemdes, Dinas, Vendor, dll."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Deskripsi & Output */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Uraian Kegiatan yang Dilakukan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.uraian_kegiatan}
                  onChange={(e) => handleChange('uraian_kegiatan', e.target.value)}
                  placeholder="Ceritakan detail aktivitas yang dilaksanakan, proses pertemuan, langkah teknis, dll..."
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Tabel Capaian, Kendala & Tindak Lanjut (Dinamis / Tambah Baris) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Hasil / Capaian, Kendala, & Rencana Tindak Lanjut
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#1e3a8a] border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Baris
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                        <span className="text-[11px] font-bold text-slate-600 uppercase">
                          Baris #{item.no || index + 1}
                        </span>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus Baris
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                            HASIL / CAPAIAN (OUTPUT)
                          </label>
                          <textarea
                            rows={2}
                            value={item.output_capaian}
                            onChange={(e) => handleItemChange(index, 'output_capaian', e.target.value)}
                            placeholder="Contoh: Pompa beroperasi normal, debit air 2.5 L/dtk"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                            KENDALA / ISU LAPANGAN
                          </label>
                          <textarea
                            rows={2}
                            value={item.kendala}
                            onChange={(e) => handleItemChange(index, 'kendala', e.target.value)}
                            placeholder="Tulis kendala yang ditemukan (jika ada)"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                            RENCANA TINDAK LANJUT
                          </label>
                          <textarea
                            rows={2}
                            value={item.tindak_lanjut}
                            onChange={(e) => handleItemChange(index, 'tindak_lanjut', e.target.value)}
                            placeholder="Rencana kegiatan lanjutan berikutnya..."
                            className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 5: Foto Dokumentasi & Link Lampiran */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#1e3a8a]" /> Foto Dokumentasi Kegiatan
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Foto akan otomatis diunggah ke Google Drive terpusat di folder program & bulan terkait.
                  </p>
                </div>
                <div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-bold bg-[#1e3a8a] text-white rounded-lg hover:bg-[#1e3a8a]/90 flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Foto
                  </button>
                </div>
              </div>

              {/* Photo Previews */}
              {formData.foto_dokumentasi.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {formData.foto_dokumentasi.map((photo, idx) => {
                    const imgSrc = typeof photo === 'string' ? photo : (photo.preview || photo.url);
                    return (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-video flex items-center justify-center">
                        <img
                          src={imgSrc}
                          alt={`Dokumentasi ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-md shadow opacity-90 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center bg-white">
                  <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Belum ada foto yang dipilih.</p>
                </div>
              )}

            {/* Section: Lampiran Dokumen / Berkas Kegiatan (GDrive Upload) */}
            <div className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Lampiran Dokumen / Berkas (Notulen, Berita Acara, dsb.)
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Unggah berkas dokumen (PDF, Word, Excel, Foto) langsung dari perangkat Anda. Otomatis diarsipkan ke Google Drive terpusat.
                  </p>
                </div>
                <GDriveBadge />
              </div>

              {/* Hidden File Input for Documents */}
              <input
                ref={attachmentInputRef}
                type="file"
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                multiple
                className="hidden"
                onChange={handleAttachmentSelect}
              />

              {/* Drop / Click Upload Button */}
              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                className="w-full py-3 px-4 border-2 border-dashed border-amber-300 hover:border-amber-600 hover:bg-amber-50/80 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 text-xs text-amber-900 font-semibold cursor-pointer"
              >
                <UploadCloud className="w-5 h-5 text-amber-700" />
                <span>Pilih / Unggah Berkas Lampiran</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  Mendukung berkas PDF, Word (DOC/DOCX), Excel (XLS/XLSX), atau Gambar (Bisa pilih lebih dari satu)
                </span>
              </button>

              {/* List of Files Selected to Upload */}
              {lampiranFiles.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    Berkas Siap Diunggah ({lampiranFiles.length}):
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto p-1.5 bg-white rounded-lg border border-amber-200">
                    {lampiranFiles.map((att, aIdx) => (
                      <div key={att.id || aIdx} className="flex items-center justify-between p-2 bg-amber-50/50 hover:bg-amber-50 rounded border border-amber-200 text-xs">
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-4 h-4 text-amber-700 shrink-0" />
                          <div className="truncate">
                            <p className="truncate font-semibold text-gray-800">{att.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                              <span>{formatBytes(att.size)}</span>
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">Siap diunggah ke Google Drive</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(aIdx)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0 ml-2"
                          title="Hapus berkas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* List of Existing Uploaded Links */}
              {existingLinks.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    Lampiran Tersimpan di Google Drive ({existingLinks.length}):
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto p-1.5 bg-white rounded-lg border border-gray-200">
                    {existingLinks.map((url, uIdx) => (
                      <div key={uIdx} className="flex items-center justify-between p-2 bg-blue-50/40 rounded border border-blue-200 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-blue-700 hover:text-blue-900 font-medium hover:underline inline-flex items-center gap-1"
                          >
                            <span className="truncate">{url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingLink(uIdx)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0 ml-2"
                          title="Hapus tautan ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual URL Input (Collapsible / Secondary) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowManualUrl(!showManualUrl)}
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {showManualUrl ? 'Sembunyikan Tautan Manual' : '+ Tambah Tautan Manual (Google Drive / URL Lain)'}
                </button>

                {showManualUrl && (
                  <div className="mt-2 space-y-1.5">
                    <input
                      type="url"
                      value={manualLink}
                      onChange={(e) => setManualLink(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-gray-500">
                      Anda juga dapat memasukkan tautan Google Drive / dokumen daring yang sudah ada secara manual.
                    </p>
                  </div>
                )}
              </div>
            </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm font-bold bg-[#1e3a8a] text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {formData.id ? 'Perbarui Log Kegiatan' : 'Simpan Log Kegiatan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
