import React, { useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import useAppStore from '../../store/useAppStore';
import { X, Printer, FileText } from 'lucide-react';
import ExecutiveInfographics from './ExecutiveInfographics';
import ExecutiveAIInsight from './ExecutiveAIInsight';

const INDO_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const formatNumber = (val) => new Intl.NumberFormat('id-ID').format(val || 0);
const formatJuta = (val) => {
  if (!val || val === 0) return '0';
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} M`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} Jt`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)} Rb`;
  return val.toString();
};

function parseMonthIdx(monthStr) {
  if (!monthStr) return -1;
  const m = String(monthStr).toUpperCase().trim();
  if (m.includes('JAN')) return 0;
  if (m.includes('FEB')) return 1;
  if (m.includes('MAR')) return 2;
  if (m.includes('APR')) return 3;
  if (m.includes('MAY') || m.includes('MEI')) return 4;
  if (m.includes('JUN')) return 5;
  if (m.includes('JUL')) return 6;
  if (m.includes('AUG') || m.includes('AGS') || m.includes('AGU')) return 7;
  if (m.includes('SEP')) return 8;
  if (m.includes('OCT') || m.includes('OKT')) return 9;
  if (m.includes('NOV')) return 10;
  if (m.includes('DEC') || m.includes('DES')) return 11;
  return -1;
}

function getDisplayImageUrl(url) {
  if (!url) return '';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  }
  return url;
}

function isFolderUrl(url) {
  return url && (url.includes('/folders/') || url.includes('/drive/folders'));
}

export default function ExecutiveReportModal({ isOpen, onClose }) {
  const reportRef = useRef(null);

  const selectedProgram = useAppStore((state) => state.globalProgram);
  const selectedDate = useAppStore((state) => state.globalDate);
  const programContext = useAppStore((state) => state.programContext);
  const monthlyProgress = useAppStore((state) => state.monthlyProgress);
  const beneficiariesList = useAppStore((state) => state.beneficiariesList) || [];
  const salesData = useAppStore((state) => state.salesData) || [];
  const pltsLocations = useAppStore((state) => state.pltsLocations) || [];
  const evidenceData = useAppStore((state) => state.evidenceData) || [];

  const currentMonthIdx = selectedDate ? Number(selectedDate.split('-')[1]) - 1 : 0;
  const currentMonthName = INDO_MONTHS[currentMonthIdx] || "Januari";
  const currentYearStr = selectedDate ? selectedDate.split('-')[0] : "2026";

  const totalAnggota = beneficiariesList.length;
  const totalLaki = beneficiariesList.filter((b) => (b.jenis_kelamin || 'Laki-laki') === 'Laki-laki').length;
  const totalPerempuan = beneficiariesList.filter((b) => b.jenis_kelamin === 'Perempuan').length;
  const totalTanggungan = beneficiariesList.reduce((s, b) => s + (Number(b.jumlah_tanggungan) || 0), 0);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Program identifier helpers
  const pLower = (selectedProgram || '').toLowerCase();
  const isMaggot = pLower.includes('maggot');
  const isPLTS = pLower.includes('plts');
  const isFish = pLower.includes('ikan') || pLower.includes('ras');
  const isPoultry = pLower.includes('puyuh') || pLower.includes('itik');
  const isLingkarTambang = pLower.includes('lingkar tambang');

  // Filter rows for current year
  const currYearRows = useMemo(() => {
    return salesData.filter(d => String(d.Tahun) === currentYearStr);
  }, [salesData, currentYearStr]);

  // Monthly breakdown for SVG Infographic Trend
  const monthlySummary = useMemo(() => {
    const map = MONTHS_SHORT.map((m, idx) => ({
      name: m,
      monthIdx: idx,
      omzet: 0,
      volume: 0,
      sampah: 0,
      itemsCount: 0
    }));

    currYearRows.forEach(row => {
      const mIdx = parseMonthIdx(row.Bulan);
      if (mIdx >= 0 && mIdx < 12) {
        const omzetVal = Number(row.Omzet) || 0;
        const volVal = Number(row.Jumlah) || 0;
        const opVal = Number(row['Value Operasional']) || 0;
        const opName = (row.Operasional || '').toLowerCase();

        map[mIdx].omzet += omzetVal;
        map[mIdx].volume += volVal;
        if (opName.includes('sampah')) {
          map[mIdx].sampah += opVal;
        }
        map[mIdx].itemsCount += 1;
      }
    });

    return map;
  }, [currYearRows]);

  // YTD Metrics calculation
  const ytdMetrics = useMemo(() => {
    let ytdOmzet = 0;
    let ytdVolume = 0;
    let ytdSampah = 0;
    let peakMonth = { name: '-', value: 0 };

    monthlySummary.forEach((m, idx) => {
      if (idx <= currentMonthIdx) {
        ytdOmzet += m.omzet;
        ytdVolume += m.volume;
        ytdSampah += m.sampah;
        if (m.omzet > peakMonth.value) {
          peakMonth = { name: m.name, value: m.omzet };
        }
      }
    });

    // Product breakdown
    const productMap = {};
    currYearRows.forEach(row => {
      const mIdx = parseMonthIdx(row.Bulan);
      if (mIdx >= 0 && mIdx <= currentMonthIdx) {
        const prodName = row.Produk && row.Produk !== '-' ? row.Produk : (row['Kategori Produk'] || 'Produk Utama');
        if (!productMap[prodName]) {
          productMap[prodName] = { 
            name: prodName, 
            volume: 0, 
            omzet: 0, 
            unit: row.Satuan_1 || 'Kg' 
          };
        }
        productMap[prodName].volume += (Number(row.Jumlah) || 0);
        productMap[prodName].omzet += (Number(row.Omzet) || 0);
      }
    });

    const productsList = Object.values(productMap).sort((a, b) => b.omzet - a.omzet);
    const activeMonths = currentMonthIdx + 1;
    const avgOmzet = activeMonths > 0 ? Math.round(ytdOmzet / activeMonths) : 0;

    return {
      ytdOmzet,
      ytdVolume,
      ytdSampah,
      peakMonth,
      productsList,
      activeMonths,
      avgOmzet
    };
  }, [monthlySummary, currentMonthIdx, currYearRows]);

  // PLTS specific metrics
  const pltsTotalLuas = useMemo(() => {
    return pltsLocations.reduce((s, l) => s + (Number(l.luas_lahan) || 0), 0);
  }, [pltsLocations]);

  const pltsTotalPetani = useMemo(() => {
    return pltsLocations.reduce((s, l) => s + (Number(l.jumlah_petani) || 0), 0);
  }, [pltsLocations]);

  // Valid Evidence Photos
  const validEvidences = useMemo(() => {
    return evidenceData
      .filter(e => e.File_Url && !isFolderUrl(e.File_Url))
      .slice(0, 3);
  }, [evidenceData]);

  // Max value for SVG Bar Chart scaling
  const maxMonthlyVal = useMemo(() => {
    const maxO = Math.max(...monthlySummary.slice(0, currentMonthIdx + 1).map(x => x.omzet), 0);
    return maxO > 0 ? maxO : 100;
  }, [monthlySummary, currentMonthIdx]);

  if (!isOpen) return null;

  return createPortal(
    <div className="executive-modal-backdrop fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Top Action Bar (Hidden when printed) */}
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-t-xl px-5 py-3 flex items-center justify-between shadow-md mb-0 print:hidden">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-[#1e3a8a] rounded-lg">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#1e3a8a]">Laporan Eksekutif Bulanan (PDF)</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {selectedProgram} · Periode {currentMonthName} {currentYearStr}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Printer size={15} />
            <span>Cetak / Simpan PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Tutup"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Printable Report Document Body */}
      <div 
        ref={reportRef}
        id="executive-report-document"
        className="w-full max-w-4xl bg-white border border-slate-200 border-t-0 print:border-none rounded-b-xl print:rounded-none p-6 sm:p-10 shadow-xl print:shadow-none text-slate-800 font-sans print:p-0 print:w-full print:max-w-none"
      >
        {/* ── HEADER DOKUMEN LAPORAN ── */}
        <div className="border-b-2 border-[#1e3a8a] pb-3 mb-5 flex items-start justify-between gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-[#1e3a8a] text-[9.5px] font-extrabold rounded uppercase tracking-wider mb-1.5">
              Laporan Analitik Kinerja Eksekutif
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              {selectedProgram}
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              PT Bukit Asam Tbk · Unit Pertambangan Tanjung Enim · Periode: <span className="font-extrabold text-[#1e3a8a]">{currentMonthName} {currentYearStr}</span>
            </p>
          </div>
          <div className="text-right flex flex-col items-end shrink-0">
            <span className="text-[10px] font-medium text-slate-400">Tanggal Cetak:</span>
            <span className="text-[11px] font-bold text-slate-700">{currentDateFormatted}</span>
          </div>
        </div>

        {/* ── LAPORAN AI INSIGHT ANALITIK ── */}
        <div className="mb-5 page-break-inside-avoid">
          <ExecutiveAIInsight
            selectedProgram={selectedProgram}
            currentMonthName={currentMonthName}
            currentYearStr={currentYearStr}
            programContext={programContext}
            monthlyProgress={monthlyProgress}
            salesData={salesData}
          />
        </div>

        {/* ── INFOGRAFIS KINERJA & CAPAIAN PROGRAM ── */}
        <div className="mb-4">
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-1 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#1e3a8a] rounded-xs"></div>
              <h3 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
                Infografis Kinerja & Capaian Program
              </h3>
            </div>
            <span className="text-[9.5px] font-semibold text-slate-500 uppercase tracking-wide">
              Rekapitulasi Kuantitatif s.d. {currentMonthName} {currentYearStr}
            </span>
          </div>

          {/* Menampilkan Seluruh Grafik & Infografis Program Lengkap */}
          <ExecutiveInfographics
            selectedProgram={selectedProgram}
            currentMonthIdx={currentMonthIdx}
            currentMonthName={currentMonthName}
            currentYearStr={currentYearStr}
            validEvidences={validEvidences}
          />
        </div>

      </div>

    </div>,
    document.body
  );
}
