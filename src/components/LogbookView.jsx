import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, Plus, Edit2, Trash2, Search, Filter,
  Database, HardDrive, RefreshCw, AlertCircle, CheckCircle2,
  Calendar, MapPin, User, Users, ChevronRight, Copy, Check, Camera,
  Image as ImageIcon, Eye, X, ExternalLink, Download, Clock,
  LayoutGrid, List, AlertTriangle, ArrowUpDown, Printer
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { logbookService } from '../services/logbookService';
import { programService } from '../services/programService';
import LogbookFormModal from './logbook/LogbookFormModal';
import LogbookPdfModal from './logbook/LogbookPdfModal';
import EvidenceImage from './common/EvidenceImage';

const CATEGORIES = [
  'Semua Kategori',
  'Pekerjaan Teknis/Lapangan',
  'Rapat & Koordinasi',
  'Pelatihan & Pemberdayaan',
  'Penyaluran Bantuan/Alat',
  'Penanganan Masalah (Troubleshooting)',
  'Administrasi & Pelaporan',
  'Lainnya'
];

const formatTime24 = (val) => {
  if (!val) return '';
  const parts = val.toString().split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return val;
};

const parseLampiranUrls = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') {
    return val.split(/[\n,]+/).map((s) => s.trim()).filter((s) => s.startsWith('http') || s.startsWith('data:'));
  }
  return [];
};

export default function LogbookView({ isViewOnly = false }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageSource, setStorageSource] = useState('cloud');
  const [isCloudReady, setIsCloudReady] = useState(true);
  const [cloudErrorMsg, setCloudErrorMsg] = useState(null);
  const [needsMigration, setNeedsMigration] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [programsList, setProgramsList] = useState([]);

  // View Mode: 'feed' (Cards) or 'table' (Data Grid)
  const [viewMode, setViewMode] = useState('feed');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingPhoto, setViewingPhoto] = useState(null); // { url, title }
  const [sqlCopied, setSqlCopied] = useState(false);
  const [showSqlHelp, setShowSqlHelp] = useState(false);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const status = await logbookService.checkTableStatus();
      setIsCloudReady(status.isCloudReady);
      setNeedsMigration(Boolean(status.needsMigration));
      if (!status.isCloudReady || status.needsMigration) {
        setCloudErrorMsg(status.error);
      } else {
        setCloudErrorMsg(null);
      }

      const res = await logbookService.fetchRecords();
      setRecords(res.data || []);
      setStorageSource(res.source);

      const pList = await programService.fetchProgramList();
      setProgramsList(pList || []);
    } catch (err) {
      console.error('Failed to load logbook records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedProgram !== 'all' && r.program !== selectedProgram) return false;
      if (selectedCategory !== 'Semua Kategori' && r.kategori !== selectedCategory) return false;
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;

      if (selectedMonth !== 'all' && r.tanggal) {
        const itemMonth = r.tanggal.slice(0, 7); // YYYY-MM
        if (itemMonth !== selectedMonth) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (r.judul || '').toLowerCase().includes(q) ||
        (r.uraian_kegiatan || '').toLowerCase().includes(q) ||
        (r.pic_nama || '').toLowerCase().includes(q) ||
        (r.kelompok_binaan || r.ketua_kelompok || r.pihak_terlibat || '').toLowerCase().includes(q) ||
        (r.stakeholder || r.tim_pendamping || '').toLowerCase().includes(q) ||
        (r.program || '').toLowerCase().includes(q) ||
        (r.lokasi || '').toLowerCase().includes(q)
      );
    });
  }, [records, selectedProgram, selectedCategory, selectedStatus, selectedMonth, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const selesai = filteredRecords.filter((r) => r.status === 'Selesai').length;
    const berjalan = filteredRecords.filter((r) => r.status === 'Berjalan').length;
    const kendala = filteredRecords.filter((r) => r.status === 'Ada Kendala').length;
    const totalPhotos = filteredRecords.reduce((sum, r) => sum + (Array.isArray(r.foto_dokumentasi) ? r.foto_dokumentasi.length : 0), 0);

    return { total, selesai, berjalan, kendala, totalPhotos };
  }, [filteredRecords]);

  // Months available in records for month filter
  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    records.forEach((r) => {
      if (r.tanggal) {
        monthsSet.add(r.tanggal.slice(0, 7)); // YYYY-MM
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [records]);

  // Actions
  const handleSaveRecord = async (formData) => {
    const res = await logbookService.saveRecord(formData);
    if (res && res.success) {
      setFormModalOpen(false);
      setEditingRecord(null);
      await loadData();
    } else {
      throw new Error(res?.error || 'Gagal menyimpan catatan kegiatan.');
    }
  };

  const handleDeleteRecord = async (id, title) => {
    if (window.confirm(`Hapus catatan kegiatan: "${title}"?`)) {
      await logbookService.deleteRecord(id);
      await loadData();
    }
  };

  // Export to XLSX (Excel)
  const handleExportXLSX = () => {
    if (!filteredRecords.length) {
      alert('Tidak ada data yang dapat diekspor.');
      return;
    }

    const dataToExport = filteredRecords.map((r, index) => ({
      'No': index + 1,
      'Tanggal': r.tanggal || '',
      'Waktu Mulai': formatTime24(r.waktu_mulai) || '',
      'Waktu Selesai': formatTime24(r.waktu_selesai) || '',
      'Program': r.program || '',
      'Kategori': r.kategori || '',
      'Judul Kegiatan': r.judul || '',
      'Lokasi': r.lokasi || '',
      'Nama PIC Lapangan': r.pic_nama || '',
      'Kelompok Binaan': r.kelompok_binaan || r.ketua_kelompok || r.pihak_terlibat || '',
      'Stakeholder / Pihak Lainnya': r.stakeholder || r.tim_pendamping || '',
      'Jumlah Peserta': r.jumlah_peserta || 0,
      'Uraian Kegiatan': r.uraian_kegiatan || '',
      'Output / Capaian': r.output_capaian || '',
      'Status': r.status || 'Selesai',
      'Kendala Lapangan': r.kendala || '-',
      'Rencana Tindak Lanjut': r.tindak_lanjut || '-',
      'Link Lampiran': r.link_lampiran || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    worksheet['!cols'] = [
      { wch: 5 },   // No
      { wch: 12 },  // Tanggal
      { wch: 12 },  // Waktu Mulai
      { wch: 12 },  // Waktu Selesai
      { wch: 22 },  // Program
      { wch: 22 },  // Kategori
      { wch: 32 },  // Judul Kegiatan
      { wch: 24 },  // Lokasi
      { wch: 20 },  // Nama PIC Lapangan
      { wch: 24 },  // Kelompok Binaan
      { wch: 26 },  // Stakeholder
      { wch: 14 },  // Jumlah Peserta
      { wch: 45 },  // Uraian Kegiatan
      { wch: 32 },  // Output
      { wch: 12 },  // Status
      { wch: 25 },  // Kendala
      { wch: 25 },  // Tindak Lanjut
      { wch: 30 }   // Link Lampiran
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Log Book Kegiatan');

    const programLabel = selectedProgram !== 'all' ? selectedProgram.replace(/[^a-zA-Z0-9]/g, '_') : 'Semua_Program';
    const fileName = `SCD_Logbook_${programLabel}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const copySqlScript = () => {
    const sqlText = `-- ==============================================================================
-- SKRIP SQL LENGKAP & MIGRASI TABEL LOG BOOK KEGIATAN TJSL / SCD PT BUKIT ASAM
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public."SCD_Report_Logbook" (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    tanggal DATE NOT NULL,
    waktu_mulai TIME,
    waktu_selesai TIME,
    program VARCHAR(150) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    judul VARCHAR(255) NOT NULL,
    lokasi VARCHAR(255),
    pic_nama VARCHAR(150) NOT NULL,
    kelompok_binaan VARCHAR(150),
    stakeholder TEXT,
    ketua_kelompok VARCHAR(150),
    tim_pendamping TEXT,
    pihak_terlibat TEXT,
    jumlah_peserta INTEGER DEFAULT 0,
    uraian_kegiatan TEXT NOT NULL,
    output_capaian TEXT,
    status VARCHAR(50) DEFAULT 'Selesai',
    kendala TEXT,
    tindak_lanjut TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    foto_dokumentasi JSONB DEFAULT '[]'::jsonb,
    link_lampiran TEXT,
    created_by VARCHAR(150) DEFAULT 'comdevptba@gmail.com'
);

-- Migrasi jika tabel sudah ada di Supabase namun belum memiliki kolom terbaru:
ALTER TABLE public."SCD_Report_Logbook" 
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS kelompok_binaan VARCHAR(150),
ADD COLUMN IF NOT EXISTS ketua_kelompok VARCHAR(150),
ADD COLUMN IF NOT EXISTS stakeholder TEXT,
ADD COLUMN IF NOT EXISTS jumlah_peserta INTEGER DEFAULT 0;

-- RLS & Grants Keamanan
ALTER TABLE public."SCD_Report_Logbook" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on Logbook" ON public."SCD_Report_Logbook";
CREATE POLICY "Allow public read access on Logbook" ON public."SCD_Report_Logbook" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert on Logbook" ON public."SCD_Report_Logbook";
CREATE POLICY "Allow authenticated insert on Logbook" ON public."SCD_Report_Logbook" FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' NOT IN ('apurnomo@bukitasam.co.id', 'santoso.official03@gmail.com', 'listati@bukitasam.co.id'));

DROP POLICY IF EXISTS "Allow authenticated update on Logbook" ON public."SCD_Report_Logbook";
CREATE POLICY "Allow authenticated update on Logbook" ON public."SCD_Report_Logbook" FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' NOT IN ('apurnomo@bukitasam.co.id', 'santoso.official03@gmail.com', 'listati@bukitasam.co.id'));

DROP POLICY IF EXISTS "Allow authenticated delete on Logbook" ON public."SCD_Report_Logbook";
CREATE POLICY "Allow authenticated delete on Logbook" ON public."SCD_Report_Logbook" FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' NOT IN ('apurnomo@bukitasam.co.id', 'santoso.official03@gmail.com', 'listati@bukitasam.co.id'));

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public."SCD_Report_Logbook" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."SCD_Report_Logbook" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."SCD_Report_Logbook" TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;`;

    navigator.clipboard.writeText(sqlText);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">

      {/* Cloud Sync Status Banner */}
      {!isCloudReady && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-900">Tabel Supabase Belum Aktif</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Tabel <code className="bg-rose-100 px-1 py-0.5 rounded text-rose-900 font-bold">"SCD_Report_Logbook"</code> belum dibuat di Supabase. Data saat ini disimpan sementara di browser (Local Storage).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copySqlScript}
              className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {sqlCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              {sqlCopied ? 'Tersalin!' : 'Salin Skrip SQL'}
            </button>
            <button
              onClick={() => setShowSqlHelp(!showSqlHelp)}
              className="px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 rounded-lg transition-colors"
            >
              {showSqlHelp ? 'Tutup Panduan' : 'Lihat Panduan'}
            </button>
          </div>
        </div>
      )}

      {/* Migration Notice Banner if remote schema lacks new columns */}
      {isCloudReady && needsMigration && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Migrasi Kolom Baru Log Book Diperlukan</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Tabel Supabase saat ini aktif dengan mode kompatibilitas aman. Agar kolom dinamis (items, kelompok binaan, jumlah peserta) tersimpan penuh di database Cloud, silakan jalankan skrip migrasi SQL di Supabase SQL Editor.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copySqlScript}
              className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
            >
              {sqlCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              {sqlCopied ? 'Tersalin!' : 'Salin Skrip Migrasi SQL'}
            </button>
            <button
              onClick={() => setShowSqlHelp(!showSqlHelp)}
              className="px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 rounded-lg transition-colors shrink-0"
            >
              {showSqlHelp ? 'Tutup Panduan' : 'Lihat Panduan'}
            </button>
          </div>
        </div>
      )}

      {showSqlHelp && (
        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-700 shadow-md text-xs space-y-3">
          <div className="font-bold text-amber-400 text-sm">Langkah Menjalankan SQL di Supabase:</div>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>Buka Dashboard Supabase project Anda di browser.</li>
            <li>Pilih menu <strong>SQL Editor</strong> di bilah navigasi kiri.</li>
            <li>Klik tombol <strong>"New Query"</strong>, lalu paste (tempel) skrip yang telah disalin.</li>
            <li>Klik tombol hijau <strong>"Run"</strong> (atau tekan Ctrl+Enter).</li>
            <li>Setelah sukses, muat ulang halaman ini untuk beralih ke sinkronisasi Cloud.</li>
          </ol>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">
            Database Log Book Kegiatan
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Jurnal rekam jejak aktifitas harian operasional program
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {!isViewOnly && (
            <button
              onClick={() => {
                setEditingRecord(null);
                setFormModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white rounded-xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Kegiatan Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-500 text-xs font-semibold mb-1">Total Kegiatan</div>
          <div className="text-2xl md:text-3xl font-black text-gray-900">{stats.total}</div>
          <div className="text-[11px] text-gray-400 mt-1">Aktivitas terdata</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-500 text-xs font-semibold mb-1">Kegiatan Selesai</div>
          <div className="text-2xl md:text-3xl font-black text-emerald-600">{stats.selesai}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            {stats.total > 0 ? `${Math.round((stats.selesai / stats.total) * 100)}% tuntas` : '0%'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-500 text-xs font-semibold mb-1">Sedang Berjalan</div>
          <div className="text-2xl md:text-3xl font-black text-amber-600">{stats.berjalan}</div>
          <div className="text-[11px] text-amber-700 mt-1">In progress</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-500 text-xs font-semibold mb-1">Ada Kendala</div>
          <div className="text-2xl md:text-3xl font-black text-rose-600">{stats.kendala}</div>
          <div className="text-[11px] text-rose-700 mt-1">Perlu tindak lanjut</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs col-span-2 md:col-span-1">
          <div className="text-gray-500 text-xs font-semibold mb-1">Foto Dokumentasi</div>
          <div className="text-2xl md:text-3xl font-black text-[#1e3a8a]">{stats.totalPhotos}</div>
          <div className="text-[11px] text-blue-700 mt-1">Tersimpan di GDrive</div>
        </div>
      </div>

      {/* Filter Bar & View Mode Toggle */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul kegiatan, uraian, nama PIC, lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200 self-end md:self-auto shrink-0">
            <button
              onClick={() => setViewMode('feed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'feed'
                  ? 'bg-white text-[#1e3a8a] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'table'
                  ? 'bg-white text-[#1e3a8a] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters & Download Actions (Sejajar) */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-end justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
          {/* 4 Dropdown Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 flex-1">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Program:
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium cursor-pointer"
              >
                <option value="all">Semua Program ({programsList.length})</option>
                {programsList.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Kategori:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Status:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="Selesai">Selesai</option>
                <option value="Berjalan">Berjalan</option>
                <option value="Ada Kendala">Ada Kendala</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Bulan Kegiatan:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium cursor-pointer"
              >
                <option value="all">Semua Bulan</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tombol Download Sejajar Filter */}
          <div className="flex items-center gap-2 self-end xl:self-end shrink-0 pt-1 xl:pt-0">
            <button
              onClick={handleExportXLSX}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Unduh data sesuai filter yang dipilih (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download XLSX</span>
            </button>

            <button
              onClick={() => setPdfModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Cetak / simpan PDF sesuai filter yang dipilih"
            >
              <Printer className="w-3.5 h-3.5 text-rose-600" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering: Empty State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 mt-3 font-medium">Memuat catatan log book kegiatan...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">Belum Ada Catatan Kegiatan</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            {searchQuery || selectedProgram !== 'all' || selectedCategory !== 'Semua Kategori'
              ? 'Tidak ditemukan kegiatan yang cocok dengan kriteria filter.'
              : 'Belum ada kegiatan yang diinputkan. Klik tombol "Input Kegiatan Baru" untuk mulai mencatat log book kegiatan PIC.'}
          </p>
          {!isViewOnly && (
            <button
              onClick={() => {
                setEditingRecord(null);
                setFormModalOpen(true);
              }}
              className="mt-4 px-4 py-2 bg-[#1e3a8a] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-900 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Catat Kegiatan Pertama
            </button>
          )}
        </div>
      ) : viewMode === 'feed' ? (
        /* MODE 1: FEED CARDS */
        <div className="grid grid-cols-1 gap-4">
          {filteredRecords.map((item) => {
            const hasPhotos = Array.isArray(item.foto_dokumentasi) && item.foto_dokumentasi.length > 0;
            const statusColor =
              item.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                item.status === 'Berjalan' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-rose-50 text-rose-700 border-rose-200';

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        {item.program}
                      </span>
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                        {item.kategori}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusColor}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.tanggal}</span>
                      {(item.waktu_mulai || item.waktu_selesai) && (
                        <>
                          <span>•</span>
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-mono">
                            {formatTime24(item.waktu_mulai) || '00:00'} - {formatTime24(item.waktu_selesai) || 'Selesai'} WIB
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Title & Location */}
                  <div className="mt-3">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 leading-snug">
                      {item.judul}
                    </h3>
                    {item.lokasi && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{item.lokasi}</span>
                      </div>
                    )}
                  </div>

                  {/* PIC & Team Info */}
                  <div className="mt-3 py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-800">
                      <User className="w-3.5 h-3.5 text-[#1e3a8a]" />
                      <span><strong>PIC Lapangan:</strong> {item.pic_nama}</span>
                    </div>
                    {(item.kelompok_binaan || item.ketua_kelompok || item.pihak_terlibat) && (
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span><strong>Kelompok Binaan:</strong> {item.kelompok_binaan || item.ketua_kelompok || item.pihak_terlibat}</span>
                      </div>
                    )}
                    {(item.stakeholder || item.tim_pendamping) && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span><strong>Stakeholder / Pihak Lainnya:</strong> {item.stakeholder || item.tim_pendamping}</span>
                      </div>
                    )}
                  </div>

                  {/* Uraian Kegiatan */}
                  <div className="mt-3 text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {item.uraian_kegiatan}
                  </div>

                  {/* Output & Kendala Badges */}
                  {(item.output_capaian || item.kendala || item.tindak_lanjut) && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {item.output_capaian && (
                        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-lg">
                          <span className="font-bold text-emerald-800 block mb-0.5">Hasil / Output:</span>
                          <span className="text-emerald-950">{item.output_capaian}</span>
                        </div>
                      )}
                      {item.kendala && (
                        <div className="p-2.5 bg-rose-50/70 border border-rose-200/60 rounded-lg">
                          <span className="font-bold text-rose-800 block mb-0.5">Kendala:</span>
                          <span className="text-rose-950">{item.kendala}</span>
                        </div>
                      )}
                      {item.tindak_lanjut && (
                        <div className="p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-lg">
                          <span className="font-bold text-blue-800 block mb-0.5">Tindak Lanjut:</span>
                          <span className="text-blue-950">{item.tindak_lanjut}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Photos Grid */}
                  {hasPhotos && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-blue-600" /> Dokumentasi Kegiatan ({item.foto_dokumentasi.length})
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {item.foto_dokumentasi.map((photo, pIdx) => {
                          const src = typeof photo === 'string' ? photo : (photo.url || photo.preview);
                          return (
                            <div
                              key={pIdx}
                              onClick={() => setViewingPhoto({ url: src, title: `${item.judul} - Foto ${pIdx + 1}` })}
                              className="w-20 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer hover:opacity-85 hover:ring-2 hover:ring-blue-500 transition-all shrink-0"
                            >
                              <EvidenceImage
                                src={photo}
                                alt={`Dokumentasi ${pIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {parseLampiranUrls(item.link_lampiran).map((url, uIdx, arr) => (
                      <a
                        key={uIdx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-semibold transition-colors shadow-2xs"
                        title={url}
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>{arr.length > 1 ? `Lampiran Dokumen ${uIdx + 1}` : 'Buka Lampiran Dokumen'}</span>
                        <ExternalLink className="w-3 h-3 text-amber-600 shrink-0" />
                      </a>
                    ))}
                  </div>

                  {!isViewOnly && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => {
                          setEditingRecord(item);
                          setFormModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(item.id, item.judul)}
                        className="p-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg transition-colors"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MODE 2: DATA TABLE GRID */
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3">Tanggal & Program</th>
                  <th className="py-3 px-4">Judul & Uraian Kegiatan</th>
                  <th className="py-3 px-3">PIC Lapangan</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Foto</th>
                  <th className="py-3 px-3 text-center">Lampiran</th>
                  {!isViewOnly && <th className="py-3 px-3 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-center text-gray-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{r.tanggal}</div>
                      {(r.waktu_mulai || r.waktu_selesai) && (
                        <div className="text-[10px] text-gray-500 font-mono">
                          {formatTime24(r.waktu_mulai) || '00:00'} - {formatTime24(r.waktu_selesai) || 'Selesai'} WIB
                        </div>
                      )}
                      <div className="text-[11px] font-semibold text-[#1e3a8a]">{r.program}</div>
                      {r.lokasi && <div className="text-[10px] text-gray-400 truncate max-w-[140px]">{r.lokasi}</div>}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-bold text-gray-900 leading-snug">{r.judul}</div>
                      <div className="text-gray-500 text-[11px] line-clamp-2 mt-0.5">{r.uraian_kegiatan}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-gray-800">
                      <div className="font-bold text-gray-900">{r.pic_nama}</div>
                      {(r.kelompok_binaan || r.ketua_kelompok || r.pihak_terlibat) && (
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          Kelompok: {r.kelompok_binaan || r.ketua_kelompok || r.pihak_terlibat}
                        </div>
                      )}
                      {(r.stakeholder || r.tim_pendamping) && (
                        <div className="text-[10px] text-gray-500">
                          {r.stakeholder || r.tim_pendamping}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 text-[11px]">
                        {r.kategori}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          r.status === 'Berjalan' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {Array.isArray(r.foto_dokumentasi) && r.foto_dokumentasi.length > 0 ? (
                        <button
                          onClick={() => setViewingPhoto({
                            url: typeof r.foto_dokumentasi[0] === 'string' ? r.foto_dokumentasi[0] : (r.foto_dokumentasi[0].url || r.foto_dokumentasi[0].preview),
                            title: r.judul
                          })}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{r.foto_dokumentasi.length} Foto</span>
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {parseLampiranUrls(r.link_lampiran).length > 0 ? (
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {parseLampiranUrls(r.link_lampiran).map((url, uIdx, arr) => (
                            <a
                              key={uIdx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-semibold transition-colors"
                              title={`Buka berkas di Google Drive (${uIdx + 1})`}
                            >
                              <FileText className="w-3 h-3 text-amber-600" />
                              <span>{arr.length > 1 ? `Berkas ${uIdx + 1}` : 'Berkas'}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-amber-500" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    {!isViewOnly && (
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingRecord(r);
                              setFormModalOpen(true);
                            }}
                            className="p-1 text-gray-600 hover:text-[#1e3a8a] hover:bg-blue-50 rounded"
                            title="Edit Catatan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(r.id, r.judul)}
                            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {formModalOpen && (
        <LogbookFormModal
          initialData={editingRecord}
          onClose={() => {
            setFormModalOpen(false);
            setEditingRecord(null);
          }}
          onSave={handleSaveRecord}
        />
      )}

      {/* Photo Lightbox Modal */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setViewingPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-900 text-white">
              <h4 className="text-xs md:text-sm font-bold truncate max-w-lg">{viewingPhoto.title}</h4>
              <button
                onClick={() => setViewingPhoto(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <EvidenceImage
                src={viewingPhoto.url}
                alt={viewingPhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
      {/* PDF Export & Print Modal */}
      <LogbookPdfModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        records={filteredRecords}
        selectedProgram={selectedProgram}
        selectedCategory={selectedCategory}
        selectedStatus={selectedStatus}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}
