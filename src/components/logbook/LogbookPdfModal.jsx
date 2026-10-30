import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, FileText, CheckCircle2, Clock, AlertTriangle, Users, User } from 'lucide-react';
import logoPTBA from '../../assets/logo/logo-ptba.png';
import logoMoraFlat from '../../assets/logo/logo-mora-flat.png';

const formatTime24 = (val) => {
  if (!val) return '';
  const parts = val.toString().split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return val;
};

const INDO_MONTH_NAMES = {
  '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
  '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
  '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
};

const formatPeriodLabel = (month, year) => {
  if (month === 'all' && year === 'all') return 'Seluruh Periode';
  const monthName = INDO_MONTH_NAMES[month] || month;
  if (month !== 'all' && year !== 'all') return `${monthName} ${year}`;
  if (month !== 'all') return `Bulan ${monthName}`;
  return `Tahun ${year}`;
};

export default function LogbookPdfModal({
  isOpen,
  onClose,
  records = [],
  selectedProgram = 'all',
  selectedCategory = 'Semua Kategori',
  selectedPic = 'all',
  selectedMonth = 'all',
  selectedYear = 'all'
}) {
  const reportRef = useRef(null);

  if (!isOpen) return null;

  const total = records.length;

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #logbook-report-document {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden when printed) */}
      <div className="w-full max-w-[1400px] bg-white border border-slate-200 rounded-t-xl px-5 py-3 flex items-center justify-between shadow-md mb-0 print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-[#1e3a8a] rounded-lg">
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#1e3a8a]">Pratinjau Cetak / Ekspor PDF Log Book</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded">
                Landscape
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {selectedProgram === 'all' ? 'Seluruh Program SCD' : selectedProgram} · Total {total} Kegiatan
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
            <span>Cetak / Simpan PDF (Landscape)</span>
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
        id="logbook-report-document"
        className="w-full max-w-[1400px] bg-white border border-slate-200 border-t-0 print:border-none rounded-b-xl print:rounded-none p-6 sm:p-8 shadow-xl print:shadow-none text-slate-800 font-sans print:p-0 print:w-full print:max-w-none"
      >
        {/* Header Kop Dokumen */}
        <div className="border-b-2 border-[#1e3a8a] pb-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img src={logoPTBA} alt="Logo PTBA" className="h-12 md:h-14 w-auto object-contain" />
            <img src={logoMoraFlat} alt="Logo MORA SCD" className="h-11 md:h-13 w-auto object-contain" />
            <div className="border-l-2 border-slate-300 pl-3">
              <h2 className="text-sm sm:text-base font-black text-[#1e3a8a] uppercase tracking-tight">
                JURNAL LOG BOOK KEGIATAN OPERASIONAL
              </h2>
              <p className="text-xs text-slate-600 font-bold">
                MORA SCD · SUSTAINABLE COMMUNITY DEVELOPMENT · PT BUKIT ASAM (PERSERO) TBK
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-[#1e3a8a] text-[10px] font-bold rounded uppercase tracking-wider block mb-1">
              Dokumen Resmi PIC
            </span>
            <p className="text-[10px] text-slate-500 font-medium">
              Tanggal Cetak: <span className="font-semibold text-slate-700">{currentDateFormatted}</span>
            </p>
          </div>
        </div>

        {/* Filter & Scope Metadata */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Program:</span>
            <span className="font-bold text-[#1e3a8a]">{selectedProgram === 'all' ? 'Semua Program' : selectedProgram}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Kategori Aktivitas:</span>
            <span className="font-semibold text-slate-700">{selectedCategory}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">PIC Lapangan:</span>
            <span className="font-semibold text-slate-700">{selectedPic === 'all' ? 'Semua PIC' : selectedPic}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Periode:</span>
            <span className="font-semibold text-slate-700">{formatPeriodLabel(selectedMonth, selectedYear)}</span>
          </div>
        </div>

        {/* Ringkasan Statistik */}
        <div className="flex items-center justify-between bg-blue-50/50 border border-blue-200/60 rounded-lg px-4 py-2 mb-4 text-xs page-break-inside-avoid">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1e3a8a]">Total Kegiatan Tercatat:</span>
            <span className="px-2 py-0.5 rounded bg-[#1e3a8a] text-white font-extrabold text-xs">{total} Kegiatan</span>
          </div>
          <div className="text-slate-500 text-[11px] font-medium">
            Dokumen Jurnal Kegiatan PIC Lapangan
          </div>
        </div>

        {/* Tabel Rekap Log Book */}
        <div className="mb-6">
          {records.length > 0 ? (
            <div className="overflow-x-auto rounded border border-slate-300">
              <table className="w-full text-[9.5px] text-left border-collapse">
                <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[9px] border-b border-slate-300">
                  <tr>
                    <th className="px-2 py-2 border-r border-slate-300 w-8 text-center">No</th>
                    <th className="px-2 py-2 border-r border-slate-300 w-28">Tanggal & Waktu</th>
                    <th className="px-2 py-2 border-r border-slate-300 w-36">Program</th>
                    <th className="px-2 py-2 border-r border-slate-300 w-28">PIC</th>
                    <th className="px-2 py-2 border-r border-slate-300 w-32">Kelompok Binaan</th>
                    <th className="px-2 py-2 border-r border-slate-300 w-32">Stakeholder</th>
                    <th className="px-2 py-2 border-r border-slate-300 w-44">Judul Kegiatan</th>
                    <th className="px-2 py-2 min-w-[260px]">Uraian Kegiatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {records.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-slate-50/50 page-break-inside-avoid">
                      <td className="px-2 py-2 text-center text-slate-500 font-medium align-top border-r border-slate-200">{idx + 1}</td>
                      <td className="px-2 py-2 whitespace-nowrap align-top border-r border-slate-200">
                        <div className="font-bold text-slate-800">{r.tanggal}</div>
                        {(r.waktu_mulai || r.waktu_selesai) && (
                          <div className="text-[9px] text-slate-500 font-mono">
                            {formatTime24(r.waktu_mulai) || '00:00'} - {formatTime24(r.waktu_selesai) || 'Selesai'} WIB
                          </div>
                        )}
                        {r.lokasi && <div className="text-[9px] text-slate-400 truncate max-w-[120px]">{r.lokasi}</div>}
                      </td>
                      <td className="px-2 py-2 font-bold text-[#1e3a8a] align-top border-r border-slate-200">
                        <div>{r.program}</div>
                        <div className="text-[9px] font-normal text-slate-500">{r.kategori}</div>
                      </td>
                      <td className="px-2 py-2 font-medium text-slate-800 align-top border-r border-slate-200">
                        {r.pic_nama || '-'}
                      </td>
                      <td className="px-2 py-2 text-slate-700 align-top border-r border-slate-200">
                        {r.kelompok_binaan || r.ketua_kelompok || r.pihak_terlibat || '-'}
                      </td>
                      <td className="px-2 py-2 text-slate-600 text-[9px] align-top border-r border-slate-200">
                        {r.stakeholder || r.tim_pendamping || '-'}
                      </td>
                      <td className="px-2 py-2 font-bold text-slate-900 leading-snug align-top border-r border-slate-200">
                        {r.judul}
                      </td>
                      <td className="px-2 py-2 text-slate-700 text-[9.5px] align-top whitespace-pre-line leading-relaxed">
                        {r.uraian_kegiatan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded">
              Tidak ada data kegiatan yang dicetak.
            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
