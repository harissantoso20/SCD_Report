import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Plus, Printer, Edit2, Trash2, Search, Filter, 
  Database, HardDrive, RefreshCw, AlertCircle, CheckCircle2,
  Calendar, MapPin, User, ChevronRight, Copy, Check, Camera,
  Image as ImageIcon, Eye, X, ExternalLink, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';
import { monitoringService, getGDriveThumbnail } from '../services/monitoringService';
import { programService } from '../services/programService';
import MonitoringFormModal from './monitoring/MonitoringFormModal';
import MonitoringPrintModal from './monitoring/MonitoringPrintModal';
import MonitoringAIEvaluation from './monitoring/MonitoringAIEvaluation';
import EvidenceImage from './common/EvidenceImage';

export default function MonitoringView() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageSource, setStorageSource] = useState('cloud');
  const [isCloudReady, setIsCloudReady] = useState(true);
  const [cloudErrorMsg, setCloudErrorMsg] = useState(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [programsList, setProgramsList] = useState([]);

  // Selected Record for AI Evaluation (Single Checkbox Selection)
  const [selectedRecordForEvaluation, setSelectedRecordForEvaluation] = useState(null);

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [printRecord, setPrintRecord] = useState(null);
  const [viewingEvidence, setViewingEvidence] = useState(null); // { type: 'photos' | 'attendance', items: [], title: '' }
  const [docZoom, setDocZoom] = useState(100);

  // SQL Copy Notification
  const [sqlCopied, setSqlCopied] = useState(false);
  const [showSqlHelp, setShowSqlHelp] = useState(false);

  // Load Initial Data
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Check cloud table status
      const status = await monitoringService.checkTableStatus();
      setIsCloudReady(status.isCloudReady);
      if (!status.isCloudReady) {
        setCloudErrorMsg(status.error);
      }

      // 2. Fetch records
      const res = await monitoringService.fetchRecords();
      setRecords(res.data || []);
      setStorageSource(res.source);

      // 3. Fetch programs
      const pList = await programService.fetchProgramList();
      setProgramsList(pList || []);
    } catch (err) {
      console.error('Failed to load monitoring records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Global ESC key listener to close active modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (viewingEvidence) setViewingEvidence(null);
        if (printRecord) setPrintRecord(null);
        if (formModalOpen) setFormModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingEvidence, printRecord, formModalOpen]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchProgram = selectedProgram === 'all' || r.program === selectedProgram;
      if (!matchProgram) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchText = 
        (r.program || '').toLowerCase().includes(q) ||
        (r.lokasi || '').toLowerCase().includes(q) ||
        (r.keterangan || '').toLowerCase().includes(q) ||
        (r.pic_sustainability || '').toLowerCase().includes(q) ||
        (r.penerima_manfaat || '').toLowerCase().includes(q) ||
        (Array.isArray(r.items) && r.items.some((it) => 
          (it.uraian || '').toLowerCase().includes(q) ||
          (it.kendala || '').toLowerCase().includes(q) ||
          (it.tindak_lanjut || '').toLowerCase().includes(q)
        ));

      return matchText;
    });
  }, [records, selectedProgram, searchQuery]);

  // Aggregated Stats
  const stats = useMemo(() => {
    const totalDocs = records.length;
    const uniquePrograms = new Set(records.map((r) => r.program)).size;
    let totalItems = 0;
    let totalKendala = 0;
    let totalEvidenPhotos = 0;
    let totalAttendanceFiles = 0;

    records.forEach((r) => {
      if (Array.isArray(r.items)) {
        totalItems += r.items.length;
        r.items.forEach((it) => {
          if (it.kendala && it.kendala.trim() && it.kendala.trim() !== '-') {
            totalKendala++;
          }
        });
      }
      if (Array.isArray(r.foto_dokumentasi)) {
        totalEvidenPhotos += r.foto_dokumentasi.length;
      }
      if (Array.isArray(r.scan_daftar_hadir)) {
        totalAttendanceFiles += r.scan_daftar_hadir.length;
      }
    });

    return { totalDocs, uniquePrograms, totalItems, totalKendala, totalEvidenPhotos, totalAttendanceFiles };
  }, [records]);

  // Handle Save Record
  const handleSaveRecord = async (formData) => {
    await monitoringService.saveRecord(formData);
    await loadData();
  };

  // Handle Delete Record
  const handleDeleteRecord = async (id, programName) => {
    if (window.confirm(`Hapus formulir monitoring untuk program "${programName}"?`)) {
      await monitoringService.deleteRecord(id);
      await loadData();
    }
  };

  const sqlAlterScript = `-- JALANKAN DI SUPABASE SQL EDITOR UNTUK AKTIFKAN KOLOM FOTO, SCAN PRESENSI, & TTD DIGITAL
ALTER TABLE public."SCD_Report_Monitoring" 
ADD COLUMN IF NOT EXISTS foto_dokumentasi JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS scan_daftar_hadir JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ttd_pic TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS ttd_penerima TEXT DEFAULT '';`;

  const copySqlScript = () => {
    navigator.clipboard.writeText(sqlAlterScript);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1e3a8a] uppercase tracking-wider mb-1">
            <span>SCD TJSL PT BUKIT ASAM</span>
            <span>•</span>
            <span>Arsip Dokumen Fisik & Eviden</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Formulir & Evaluasi Monitoring Program
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Pencatatan resmi dokumen monitoring lapangan sesuai formulir fisik PTBA, dilengkapi upload foto dokumentasi, scan daftar hadir, cetak PDF 1:1, dan evaluasi manajemen AI.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2.5 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setEditingRecord(null);
              setFormModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Form Monitoring</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-500 text-xs font-semibold mb-1">Total Arsip Monitoring</div>
          <div className="text-2xl md:text-3xl font-black text-gray-900">{stats.totalDocs}</div>
          <div className="text-[11px] text-gray-400 mt-1">Dokumen tersimpan</div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-500 text-xs font-semibold mb-1">Program Dipantau</div>
          <div className="text-2xl md:text-3xl font-black text-[#1e3a8a]">{stats.uniquePrograms}</div>
          <div className="text-[11px] text-gray-400 mt-1">Program TJSL aktif</div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-500 text-xs font-semibold mb-1">Temuan & Kendala</div>
          <div className="text-2xl md:text-3xl font-black text-amber-600">
            {stats.totalKendala} <span className="text-xs font-normal text-gray-500">/ {stats.totalItems} uraian</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Hambatan teridentifikasi</div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-500 text-xs font-semibold mb-1">Eviden Tersimpan</div>
          <div className="text-2xl md:text-3xl font-black text-emerald-600">
            {stats.totalEvidenPhotos + stats.totalAttendanceFiles}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {stats.totalEvidenPhotos} foto • {stats.totalAttendanceFiles} daftar hadir
          </div>
        </div>
      </div>

      {/* Section Evaluasi AI Tahap Pertama (Sesuai Program yang Dicentang) */}
      <MonitoringAIEvaluation 
        selectedRecord={selectedRecordForEvaluation} 
      />

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari program, lokasi, uraian, kendala, atau PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
            >
              <option value="all">Semua Program ({records.length})</option>
              {programsList.map((p, idx) => (
                <option key={idx} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500 shrink-0 self-end md:self-auto">
          Menampilkan <span className="font-bold text-gray-800">{filteredRecords.length}</span> dari {records.length} dokumen
        </div>
      </div>

      {/* Table Records List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500 mt-3 font-medium">Memuat riwayat monitoring...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">Belum Ada Catatan Monitoring</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-4">
              {searchQuery || selectedProgram !== 'all'
                ? 'Tidak ditemukan dokumen monitoring yang sesuai dengan kata kunci atau filter yang Anda pilih.'
                : 'Mulai buat catatan formulir monitoring fisik pertama Anda untuk menyimpan riwayat, foto eviden, scan daftar hadir, dan mencetak dokumen 1:1.'}
            </p>
            <button
              onClick={() => {
                setEditingRecord(null);
                setFormModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Buat Form Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-14 text-center">Pilih</th>
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-4">Hari / Tanggal</th>
                  <th className="py-3 px-4">Program & Lokasi</th>
                  <th className="py-3 px-4">Uraian & Kendala</th>
                  <th className="py-3 px-4">Eviden Dokumen</th>
                  <th className="py-3 px-4">Penandatangan</th>
                  <th className="py-3 px-4 text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((rec, index) => {
                  const itemCount = Array.isArray(rec.items) ? rec.items.length : 0;
                  const firstItem = Array.isArray(rec.items) && rec.items[0];
                  const photosCount = Array.isArray(rec.foto_dokumentasi) ? rec.foto_dokumentasi.length : 0;
                  const attCount = Array.isArray(rec.scan_daftar_hadir) ? rec.scan_daftar_hadir.length : 0;
                  const isSelected = selectedRecordForEvaluation?.id === rec.id;

                  return (
                    <tr 
                      key={rec.id || index} 
                      className={`transition-colors ${
                        isSelected 
                          ? 'bg-blue-50/90 font-medium' 
                          : 'hover:bg-blue-50/40'
                      }`}
                    >
                      {/* Checkbox Kolom Pilih (Hanya 1 Program) */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedRecordForEvaluation(isSelected ? null : rec);
                          }}
                          className="w-4 h-4 text-[#1e3a8a] accent-[#1e3a8a] rounded border-gray-300 focus:ring-[#1e3a8a] cursor-pointer"
                          title="Centang untuk melihat evaluasi AI program ini"
                        />
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-gray-400">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{rec.tanggal}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 font-medium">
                          {rec.hari || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1e3a8a]">
                          {rec.program}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{rec.lokasi || '-'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 bg-blue-100 text-[#1e3a8a] text-[10px] font-bold rounded">
                            {itemCount} Temuan
                          </span>
                          {rec.keterangan && (
                            <span className="text-[11px] text-gray-500 truncate max-w-[220px]">
                              {rec.keterangan}
                            </span>
                          )}
                        </div>
                        {firstItem && (
                          <div className="text-xs text-gray-600 line-clamp-1 italic">
                            "{firstItem.uraian || firstItem.kendala || '-'}"
                          </div>
                        )}
                      </td>

                      {/* Kolom Eviden (Foto & Scan Daftar Hadir) */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {photosCount > 0 ? (
                            <button
                              onClick={() => setViewingEvidence({
                                type: 'photos',
                                items: rec.foto_dokumentasi,
                                title: `Foto Dokumentasi - ${rec.program} (${rec.tanggal})`
                              })}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer"
                              title="Klik untuk melihat foto"
                            >
                              <Camera className="w-3 h-3" />
                              <span>{photosCount} Foto</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">Belum ada foto</span>
                          )}

                          {attCount > 0 ? (
                            <button
                              onClick={() => setViewingEvidence({
                                type: 'attendance',
                                items: rec.scan_daftar_hadir,
                                title: `Scan Daftar Hadir - ${rec.program} (${rec.tanggal})`
                              })}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                              title="Klik untuk melihat daftar hadir"
                            >
                              <FileText className="w-3 h-3" />
                              <span>{attCount} Daftar Hadir</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">Belum ada presensi</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs">
                        <div className="font-medium text-gray-800">
                          PTBA: <span className="font-semibold">{rec.pic_sustainability || '-'}</span>
                        </div>
                        <div className="text-gray-500 text-[11px]">
                          Mitra: <span className="font-medium">{rec.penerima_manfaat || '-'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print / Cetak 1:1 Button */}
                          <button
                            onClick={() => setPrintRecord(rec)}
                            className="p-1.5 bg-blue-50 text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Pratinjau & Cetak Format Fisik 1:1"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setEditingRecord(rec);
                              setFormModalOpen(true);
                            }}
                            className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                            title="Edit Catatan & Eviden"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteRecord(rec.id, rec.program)}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Input Modal */}
      {formModalOpen && (
        <MonitoringFormModal
          initialData={editingRecord}
          onClose={() => {
            setFormModalOpen(false);
            setEditingRecord(null);
          }}
          onSave={handleSaveRecord}
        />
      )}

      {/* Print Document Modal */}
      {printRecord && (
        <MonitoringPrintModal
          record={printRecord}
          onClose={() => setPrintRecord(null)}
        />
      )}

      {/* Quick Evidence Lightbox Modal */}
      {viewingEvidence && (
        <div 
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6 pt-16 md:pt-14 overflow-y-auto"
          onClick={() => setViewingEvidence(null)}
        >
          <div 
            className={`relative w-full ${viewingEvidence.type === 'attendance' ? 'max-w-5xl' : 'max-w-3xl'} bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-gray-200 transition-all duration-200 flex flex-col max-h-[85vh]`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-gray-900 text-white shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {viewingEvidence.type === 'photos' ? <Camera className="w-5 h-5 text-blue-400 shrink-0" /> : <FileText className="w-5 h-5 text-amber-400 shrink-0" />}
                <h3 className="text-sm md:text-base font-bold truncate">{viewingEvidence.title}</h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Zoom Controls Bar for Attendance Document */}
                {viewingEvidence.type === 'attendance' && (
                  <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-lg border border-gray-700 text-xs">
                    <button
                      type="button"
                      onClick={() => setDocZoom((prev) => Math.max(prev - 25, 50))}
                      className="p-1 hover:text-white text-gray-300 rounded cursor-pointer transition-colors"
                      title="Perkecil (-)"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-bold text-gray-200 px-1.5 min-w-[3.2rem] text-center select-none">
                      {docZoom}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setDocZoom((prev) => Math.min(prev + 25, 200))}
                      className="p-1 hover:text-white text-gray-300 rounded cursor-pointer transition-colors"
                      title="Perbesar (+)"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocZoom(100)}
                      className="px-1.5 py-0.5 hover:text-white text-gray-400 rounded cursor-pointer transition-colors text-[10px] font-semibold border-l border-gray-700 ml-1"
                      title="Sesuaikan Ukuran Kertas Normal (100%)"
                    >
                      Reset
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setViewingEvidence(null)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  title="Tutup Pratinjau"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className={`p-4 md:p-6 overflow-y-auto flex-1 ${viewingEvidence.type === 'attendance' ? 'bg-slate-100' : 'bg-white'}`}>
              {viewingEvidence.items.length === 0 ? (
                <p className="text-center text-gray-500 text-xs py-12">Tidak ada berkas eviden yang dapat ditampilkan.</p>
              ) : viewingEvidence.type === 'photos' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingEvidence.items.map((item, idx) => {
                    const rawSrc = typeof item === 'string' ? item : (item.url || item.preview);
                    return (
                      <div key={idx} className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex flex-col items-center shadow-xs">
                        <EvidenceImage 
                          src={item} 
                          alt={`Dokumentasi ${idx + 1}`} 
                          className="max-h-72 w-full object-contain bg-black/5" 
                          containerClassName="w-full max-h-72 min-h-[220px]"
                        />
                        <div className="p-2.5 w-full text-center text-xs font-semibold text-gray-700 bg-white border-t border-gray-100 flex items-center justify-between">
                          <span>Foto #{idx + 1}</span>
                          {rawSrc && String(rawSrc).startsWith('http') && (
                            <a href={rawSrc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] font-semibold">
                              Buka di GDrive <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-6">
                  {viewingEvidence.items.map((item, idx) => {
                    const rawSrc = typeof item === 'string' ? item : (item.url || item.preview);
                    const isPdf = typeof item === 'string' ? item.toLowerCase().includes('.pdf') : item.isPdf;

                    if (isPdf) {
                      return (
                        <div key={idx} className="p-5 bg-white border border-gray-200 rounded-xl shadow-xs flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-9 h-9 text-amber-600" />
                            <div>
                              <p className="font-bold text-sm text-gray-800">{item.name || `Berkas Presensi PDF #${idx + 1}`}</p>
                              <p className="text-xs text-gray-500">Format Dokumen PDF Digital</p>
                            </div>
                          </div>
                          {rawSrc && String(rawSrc).startsWith('http') && (
                            <a
                              href={rawSrc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <span>Buka Dokumen PDF</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        {/* Header Bar Lembar Presensi */}
                        <div className="w-full max-w-4xl flex items-center justify-between pb-2 mb-2 text-xs text-gray-700">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">Lembar #{idx + 1}: Daftar Hadir Peserta</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-[#1e3a8a] font-bold">
                              Ukuran Dokumen Proporsional
                            </span>
                          </div>
                          {rawSrc && String(rawSrc).startsWith('http') && (
                            <a
                              href={rawSrc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                            >
                              Buka di GDrive <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Canvas Kertas Dokumen (A4 Proportion, Crystal-Clear Rendering) */}
                        <div className="w-full bg-slate-300/80 p-3 md:p-6 rounded-xl border border-gray-300 overflow-x-auto flex justify-center">
                          <div 
                            className="bg-white shadow-2xl rounded-sm border border-gray-300 transition-all duration-150"
                            style={{
                              width: `${docZoom}%`,
                              maxWidth: docZoom === 100 ? '880px' : 'none',
                              minWidth: '320px'
                            }}
                          >
                            <EvidenceImage 
                              src={item} 
                              alt={`Scan Daftar Hadir ${idx + 1}`} 
                              size="w2000"
                              className="w-full h-auto object-contain block select-none" 
                              containerClassName="w-full bg-white min-h-[400px]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
