import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Plus, Trash2, Save, AlertCircle, Camera, FileText, 
  UploadCloud, Image as ImageIcon, Eye, CheckCircle2 
} from 'lucide-react';
import { programService } from '../../services/programService';
import { getGDriveThumbnail } from '../../services/monitoringService';
import SavingOverlay from '../common/SavingOverlay';

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const GDriveBadge = () => (
  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
    <svg viewBox="0 0 87.3 78" className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27.5h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
    Tersimpan ke Google Drive
  </span>
);

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MonitoringFormModal({ initialData, onClose, onSave }) {
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatusText, setSubmitStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Refs for file inputs
  const photoInputRef = useRef(null);
  const attendanceInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    id: initialData?.id || null,
    tanggal: initialData?.tanggal || new Date().toISOString().split('T')[0],
    hari: initialData?.hari || '',
    program: initialData?.program || '',
    lokasi: initialData?.lokasi || '',
    keterangan: initialData?.keterangan || 'Monitoring Rutin Pelaksanaan Program',
    pic_sustainability: initialData?.pic_sustainability || 'Sensiani',
    penerima_manfaat: initialData?.penerima_manfaat || '',
    items: initialData?.items && initialData.items.length > 0
      ? initialData.items
      : [
          {
            no: 1,
            uraian: '',
            kendala: '',
            tindak_lanjut: ''
          }
        ],
    foto_dokumentasi: Array.isArray(initialData?.foto_dokumentasi)
      ? initialData.foto_dokumentasi.map((item) => typeof item === 'string' ? { url: item, name: 'Foto Dokumentasi' } : item)
      : [],
    scan_daftar_hadir: Array.isArray(initialData?.scan_daftar_hadir)
      ? initialData.scan_daftar_hadir.map((item) => typeof item === 'string' ? { url: item, name: 'Scan Daftar Hadir' } : item)
      : []
  });

  // Calculate day name whenever tanggal changes
  useEffect(() => {
    if (formData.tanggal) {
      try {
        const d = new Date(formData.tanggal);
        if (!isNaN(d.getTime())) {
          const dayName = DAYS_ID[d.getDay()];
          setFormData((prev) => ({ ...prev, hari: dayName }));
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [formData.tanggal]);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, submitting]);

  // Load programs list
  useEffect(() => {
    const loadPrograms = async () => {
      setLoadingPrograms(true);
      try {
        const list = await programService.fetchProgramList();
        setPrograms(list || []);
        if (!formData.program && list && list.length > 0) {
          setFormData((prev) => ({ ...prev, program: list[0] }));
        }
      } catch (err) {
        console.warn('Failed to load program list, using standard fallback', err);
        setPrograms([
          'Pengolahan Minyak Atsiri',
          'PLTS Irigasi',
          'PROKLIM',
          'Kopi Semendo',
          'Bambu Indah',
          'Sentra IKM Batubara'
        ]);
      } finally {
        setLoadingPrograms(false);
      }
    };
    loadPrograms();
  }, []);

  // Items table handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          no: prev.items.length + 1,
          uraian: '',
          kendala: '',
          tindak_lanjut: ''
        }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) {
      setErrorMsg('Minimal harus ada satu baris uraian monitoring.');
      return;
    }
    const filtered = formData.items
      .filter((_, i) => i !== index)
      .map((item, idx) => ({ ...item, no: idx + 1 }));
    setFormData((prev) => ({ ...prev, items: filtered }));
  };

  // --- Photo Documentation Handlers ---
  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newEntries = files.map((file) => ({
      id: `photo_${Date.now()}_${Math.random()}`,
      file: file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file)
    }));

    setFormData((prev) => ({
      ...prev,
      foto_dokumentasi: [...prev.foto_dokumentasi, ...newEntries]
    }));

    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleRemovePhoto = (index) => {
    const target = formData.foto_dokumentasi[index];
    if (target?.preview) {
      URL.revokeObjectURL(target.preview);
    }
    setFormData((prev) => ({
      ...prev,
      foto_dokumentasi: prev.foto_dokumentasi.filter((_, i) => i !== index)
    }));
  };

  // --- Attendance Scan Handlers ---
  const handleAddAttendance = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newEntries = files.map((file) => ({
      id: `att_${Date.now()}_${Math.random()}`,
      file: file,
      name: file.name,
      size: file.size,
      isPdf: file.type === 'application/pdf',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setFormData((prev) => ({
      ...prev,
      scan_daftar_hadir: [...prev.scan_daftar_hadir, ...newEntries]
    }));

    if (attendanceInputRef.current) attendanceInputRef.current.value = '';
  };

  const handleRemoveAttendance = (index) => {
    const target = formData.scan_daftar_hadir[index];
    if (target?.preview) {
      URL.revokeObjectURL(target.preview);
    }
    setFormData((prev) => ({
      ...prev,
      scan_daftar_hadir: prev.scan_daftar_hadir.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.tanggal) {
      setErrorMsg('Pilih tanggal monitoring terlebih dahulu.');
      return;
    }
    if (!formData.program.trim()) {
      setErrorMsg('Pilih atau masukkan nama program.');
      return;
    }

    const hasEmptyUraian = formData.items.some((item) => !item.uraian.trim());
    if (hasEmptyUraian) {
      setErrorMsg('Harap lengkapi uraian untuk setiap baris.');
      return;
    }

    setSubmitting(true);
    setSubmitStatusText('Mengunggah berkas eviden ke Google Drive & menyimpan ke database...');
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal menyimpan catatan monitoring.');
    } finally {
      setSubmitting(false);
      setSubmitStatusText('');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6 pt-16 md:pt-14 overflow-y-auto"
      onClick={() => { if (!submitting) onClose(); }}
    >
      <div 
        className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden my-auto border border-gray-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1e3a8a] text-white shrink-0">
          <div>
            <h2 className="text-lg font-bold">
              {formData.id ? 'Edit Catatan Monitoring' : 'Buat Formulir Monitoring Baru'}
            </h2>
            <p className="text-xs text-blue-100">
              Monitoring Program TJSL PT Bukit Asam (Persero) Tbk
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Metadata Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            {/* Tanggal & Hari */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tanggal Monitoring <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  required
                />
                <input
                  type="text"
                  value={formData.hari}
                  readOnly
                  placeholder="Hari"
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 font-semibold text-gray-600 text-center"
                  title="Hari otomatis terhitung"
                />
              </div>
            </div>

            {/* Program */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Program TJSL <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                required
              >
                <option value="">-- Pilih Program --</option>
                {programs.map((p, idx) => (
                  <option key={idx} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Lokasi */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Lokasi Pelaksanaan
              </label>
              <input
                type="text"
                placeholder="Contoh: Desa Karang Raja, Kec. Muara Enim"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              />
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Keterangan / Fokus Monitoring
              </label>
              <input
                type="text"
                placeholder="Contoh: Monitoring Rutin Pelaksanaan Program"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              />
            </div>
          </div>

          {/* Section 2: Tabel Temuan Monitoring (Dinamis) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-800">
                Uraian, Kendala, & Rencana Tindak Lanjut
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#1e3a8a] border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Baris
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 bg-white border border-gray-200 rounded-lg shadow-xs space-y-2 relative"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-xs font-bold text-gray-500 uppercase">
                      Baris #{item.no || index + 1}
                    </span>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        URAIAN <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Uraian kondisi, kegiatan, atau temuan monitoring..."
                        value={item.uraian}
                        onChange={(e) => handleItemChange(index, 'uraian', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1e3a8a] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        KENDALA / PERMASALAHAN
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Hambatan yang ditemukan di lapangan..."
                        value={item.kendala}
                        onChange={(e) => handleItemChange(index, 'kendala', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1e3a8a] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        RENCANA TINDAK LANJUT
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Rencana aksi atau solusi yang disepakati..."
                        value={item.tindak_lanjut}
                        onChange={(e) => handleItemChange(index, 'tindak_lanjut', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1e3a8a] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: UPLOAD EVIDEN DOKUMENTASI & SCAN DAFTAR HADIR (Terhubung ke Google Drive) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Upload Foto Dokumentasi */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <Camera className="w-4 h-4 text-[#1e3a8a]" />
                    <span>Foto Dokumentasi Kegiatan</span>
                  </div>
                  <GDriveBadge />
                </div>
                <p className="text-[11px] text-gray-500 mb-3">
                  Unggah foto suasana monitoring. Foto otomatis diunggah langsung ke folder Google Drive program terkait.
                </p>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handleAddPhotos}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                {/* Drop/Click Button */}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full py-3 px-4 border-2 border-dashed border-blue-300 hover:border-[#1e3a8a] hover:bg-blue-50/80 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 text-xs text-blue-900 font-semibold cursor-pointer mb-3"
                >
                  <UploadCloud className="w-5 h-5 text-[#1e3a8a]" />
                  <span>Pilih / Ambil Foto Dokumentasi</span>
                  <span className="text-[10px] text-gray-400 font-normal">Tersimpan ke folder GDrive program</span>
                </button>

                {/* Thumbnails Grid */}
                {formData.foto_dokumentasi.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 bg-white rounded-lg border border-gray-200">
                    {formData.foto_dokumentasi.map((photo, pIdx) => {
                      const rawSrc = photo.preview || photo.url;
                      const imgSrc = getGDriveThumbnail(rawSrc);
                      return (
                        <div key={pIdx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                          {imgSrc ? (
                            <img 
                              src={imgSrc} 
                              alt={photo.name || 'Eviden'} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const match = String(rawSrc).match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || String(rawSrc).match(/[?&]id=([a-zA-Z0-9_-]+)/);
                                if (match && match[1] && !e.currentTarget.dataset.retried) {
                                  e.currentTarget.dataset.retried = 'true';
                                  e.currentTarget.src = `https://lh3.googleusercontent.com/d/${match[1]}`;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(pIdx)}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                            title="Hapus foto"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Upload Scan Daftar Hadir */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <span>Scan / Foto Daftar Hadir</span>
                  </div>
                  <GDriveBadge />
                </div>
                <p className="text-[11px] text-gray-500 mb-3">
                  Unggah berkas lembar presensi (JPG, PNG, PDF). Otomatis diarsipkan ke Google Drive terpusat.
                </p>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={attendanceInputRef}
                  onChange={handleAddAttendance}
                  accept="image/*,application/pdf"
                  multiple
                  className="hidden"
                />

                {/* Drop/Click Button */}
                <button
                  type="button"
                  onClick={() => attendanceInputRef.current?.click()}
                  className="w-full py-3 px-4 border-2 border-dashed border-amber-300 hover:border-amber-600 hover:bg-amber-50/80 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 text-xs text-amber-900 font-semibold cursor-pointer mb-3"
                >
                  <UploadCloud className="w-5 h-5 text-amber-700" />
                  <span>Pilih Scan / Foto Daftar Hadir</span>
                  <span className="text-[10px] text-gray-400 font-normal">Format PDF atau Foto Gambar</span>
                </button>

                {/* Thumbnails / Files List */}
                {formData.scan_daftar_hadir.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto p-1 bg-white rounded-lg border border-gray-200">
                    {formData.scan_daftar_hadir.map((att, aIdx) => {
                      const rawSrc = att.preview || att.url;
                      const isImg = att.preview || (typeof att.url === 'string' && !att.url.toLowerCase().endsWith('.pdf'));
                      const imgSrc = getGDriveThumbnail(rawSrc);

                      return (
                        <div key={aIdx} className="flex items-center justify-between p-1.5 bg-gray-50 rounded border border-gray-200 text-xs">
                          <div className="flex items-center gap-2 truncate">
                            {isImg && imgSrc ? (
                              <img src={imgSrc} alt="Thumb" className="w-7 h-7 object-cover rounded shrink-0 border" />
                            ) : (
                              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                            )}
                            <div className="truncate">
                              <p className="truncate font-medium text-gray-700">{att.name || 'Berkas Daftar Hadir'}</p>
                              {att.size && <span className="text-[10px] text-gray-400">{formatBytes(att.size)}</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttendance(aIdx)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0 ml-1"
                            title="Hapus berkas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Pengesahan & Tanda Tangan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                PIC Sustainability PTBA
              </label>
              <input
                type="text"
                placeholder="Nama PIC (contoh: Sensiani)"
                value={formData.pic_sustainability}
                onChange={(e) => setFormData({ ...formData, pic_sustainability: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              />
              <span className="text-[11px] text-gray-500 mt-0.5 block">
                Pihak penanggung jawab monitoring PTBA
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Penerima Manfaat
              </label>
              <input
                type="text"
                placeholder="Nama Perwakilan / Pengurus Kelompok Mitra"
                value={formData.penerima_manfaat}
                onChange={(e) => setFormData({ ...formData, penerima_manfaat: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              />
              <span className="text-[11px] text-gray-500 mt-0.5 block">
                Perwakilan mitra / penerima manfaat di lapangan
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 flex items-center gap-1.5">
              {submitting && (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[#1e3a8a] font-semibold">{submitStatusText}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 self-end">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Menyimpan...' : 'Simpan ke Database'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Animated Saving Overlay Modal */}
      {submitting && (
        <SavingOverlay 
          title="Menyimpan Dokumen & Mengunggah Eviden..." 
          subtitle={`Sistem sedang mengunggah foto kegiatan & scan presensi ke Google Drive untuk program ${formData.program} dan merekam formulir fisik.`}
        />
      )}
    </div>
  );
}
