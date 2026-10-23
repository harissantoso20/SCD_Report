import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, FileText, CheckCircle2, Clock, AlertTriangle, Users, User } from 'lucide-react';
import logoPTBA from '../../assets/logo/logo-ptba.png';

const formatTime24 = (val) => {
  if (!val) return '';
  const parts = val.toString().split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return val;
};

export default function LogbookPdfModal({ 
  isOpen, 
  onClose, 
  records = [], 
  selectedProgram = 'all', 
  selectedCategory = 'Semua Kategori',
  selectedStatus = 'all',
  selectedMonth = 'all'
}) {
  const reportRef = useRef(null);

  if (!isOpen) return null;

  const total = records.length;
  const selesai = records.filter((r) => r.status === 'Selesai').length;
  const berjalan = records.filter((r) => r.status === 'Berjalan').length;
  const kendala = records.filter((r) => r.status === 'Ada Kendala').length;

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
      
      {/* Top Action Bar (Hidden when printed) */}
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-t-xl px-5 py-3 flex items-center justify-between shadow-md mb-0 print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-[#1e3a8a] rounded-lg">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#1e3a8a]">Pratinjau Cetak / Ekspor PDF Log Book</h3>
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
        id="logbook-report-document"
        className="w-full max-w-5xl bg-white border border-slate-200 border-t-0 print:border-none rounded-b-xl print:rounded-none p-6 sm:p-8 shadow-xl print:shadow-none text-slate-800 font-sans print:p-0 print:w-full print:max-w-none"
      >
        {/* Header Kop Dokumen */}
        <div className="border-b-2 border-[#1e3a8a] pb-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoPTBA} alt="Logo PTBA" className="h-12 md:h-14 w-auto object-contain" />
            <div>
              <h2 className="text-sm sm:text-base font-black text-[#1e3a8a] uppercase tracking-tight">
                JURNAL LOG BOOK KEGIATAN OPERASIONAL
              </h2>
              <p className="text-xs text-slate-600 font-bold">
                SUSTAINABLE COMMUNITY DEVELOPMENT (SCD) · PT BUKIT ASAM (PERSERO) TBK
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
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Program:</span>
            <span className="font-bold text-[#1e3a8a]">{selectedProgram === 'all' ? 'Semua Program' : selectedProgram}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Kategori:</span>
            <span className="font-semibold text-slate-700">{selectedCategory}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Status Kegiatan:</span>
            <span className="font-semibold text-slate-700">{selectedStatus === 'all' ? 'Semua Status' : selectedStatus}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Periode Bulan:</span>
            <span className="font-semibold text-slate-700">{selectedMonth === 'all' ? 'Seluruh Periode' : selectedMonth}</span>
          </div>
        </div>

        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-4 gap-2.5 mb-4 page-break-inside-avoid">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
            <p className="text-[9.5px] text-slate-500 font-bold uppercase">Total Kegiatan</p>
            <p className="text-sm sm:text-base font-extrabold text-[#1e3a8a]">{total}</p>
          </div>
          <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-200 text-center">
            <p className="text-[9.5px] text-emerald-700 font-bold uppercase">Selesai</p>
            <p className="text-sm sm:text-base font-extrabold text-emerald-700">{selesai}</p>
          </div>
          <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-200 text-center">
            <p className="text-[9.5px] text-amber-700 font-bold uppercase">Berjalan (In Progress)</p>
            <p className="text-sm sm:text-base font-extrabold text-amber-700">{berjalan}</p>
          </div>
          <div className="bg-rose-50/60 p-2 rounded-lg border border-rose-200 text-center">
            <p className="text-[9.5px] text-rose-700 font-bold uppercase">Ada Kendala</p>
            <p className="text-sm sm:text-base font-extrabold text-rose-700">{kendala}</p>
          </div>
        </div>

        {/* Tabel Rekap Log Book */}
        <div className="mb-6">
          {records.length > 0 ? (
            <div className="overflow-x-auto rounded border border-slate-200">
              <table className="w-full text-[10px] text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px]">
                  <tr>
                    <th className="px-2 py-2 border-b border-slate-200 w-7 text-center">No</th>
                    <th className="px-2 py-2 border-b border-slate-200 w-24">Tanggal & Waktu</th>
                    <th className="px-2 py-2 border-b border-slate-200 w-28">Program</th>
                    <th className="px-2 py-2 border-b border-slate-200">Judul & Uraian Kegiatan</th>
                    <th className="px-2 py-2 border-b border-slate-200 w-24">PIC Lapangan</th>
                    <th className="px-2 py-2 border-b border-slate-200 w-24">Kelompok Binaan</th>
                    <th className="px-2 py-2 border-b border-slate-200 w-24">Stakeholder</th>
                    <th className="px-2 py-2 border-b border-slate-200 w-16 text-center">Status</th>
                    <th className="px-2 py-2 border-b border-slate-200 w-36">Output & Kendala</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {records.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-slate-50/50 page-break-inside-avoid">
                      <td className="px-2 py-2 text-center text-slate-500 font-medium">{idx + 1}</td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{r.tanggal}</div>
                        {(r.waktu_mulai || r.waktu_selesai) && (
                          <div className="text-[9px] text-slate-500 font-mono">
                            {formatTime24(r.waktu_mulai) || '00:00'} - {formatTime24(r.waktu_selesai) || 'Selesai'} WIB
                          </div>
                        )}
                        {r.lokasi && <div className="text-[9px] text-slate-400 truncate max-w-[100px]">{r.lokasi}</div>}
                      </td>
                      <td className="px-2 py-2 font-bold text-[#1e3a8a]">
                        <div>{r.program}</div>
                        <div className="text-[9px] font-normal text-slate-500">{r.kategori}</div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="font-bold text-slate-900 leading-tight">{r.judul}</div>
                        <div className="text-slate-600 text-[9.5px] mt-0.5 whitespace-pre-line leading-relaxed">
                          {r.uraian_kegiatan}
                        </div>
                      </td>
                      <td className="px-2 py-2 font-medium text-slate-800">
                        {r.pic_nama || '-'}
                      </td>
                      <td className="px-2 py-2 text-slate-700">
                        {r.kelompok_binaan || r.ketua_kelompok || r.pihak_terlibat || '-'}
                      </td>
                      <td className="px-2 py-2 text-slate-600 text-[9px]">
                        {r.stakeholder || r.tim_pendamping || '-'}
                      </td>
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                          r.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                          r.status === 'Berjalan' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {r.status || 'Selesai'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-[9px]">
                        {r.output_capaian && (
                          <div className="text-emerald-800">
                            <strong>Output:</strong> {r.output_capaian}
                          </div>
                        )}
                        {r.kendala && (
                          <div className="text-rose-800 mt-0.5">
                            <strong>Kendala:</strong> {r.kendala}
                          </div>
                        )}
                        {!r.output_capaian && !r.kendala && <span className="text-slate-400">-</span>}
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

        {/* Tanda Tangan & Pengesahan */}
        <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs page-break-inside-avoid">
          <div>
            <p className="text-slate-500 font-medium">Dibuat Oleh,</p>
            <p className="text-slate-700 font-bold">PIC Lapangan / Penanggung Jawab</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900 underline">
              {records.length > 0 && records[0].pic_nama ? records[0].pic_nama : '( ........................................ )'}
            </p>
            <p className="text-[10px] text-slate-500">Tim Pelaksana Program</p>
          </div>

          <div>
            <p className="text-slate-500 font-medium">Mengetahui,</p>
            <p className="text-slate-700 font-bold">AVP Sustainable Community Development</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900 underline">( ........................................ )</p>
            <p className="text-[10px] text-slate-500">PT Bukit Asam (Persero) Tbk.</p>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
