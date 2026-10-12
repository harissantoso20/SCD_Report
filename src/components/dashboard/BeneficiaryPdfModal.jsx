import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import useAppStore from '../../store/useAppStore';
import { X, Printer, FileText, Users, UserCheck, Baby } from 'lucide-react';

export default function BeneficiaryPdfModal({ isOpen, onClose, data }) {
  const reportRef = useRef(null);

  const selectedProgram = useAppStore((state) => state.globalProgram);
  const beneficiariesFromStore = useAppStore((state) => state.beneficiariesList) || [];

  const list = data && data.length > 0 ? data : beneficiariesFromStore;

  const totalAnggota = list.length;
  const totalLaki = list.filter((b) => (b.jenis_kelamin || 'Laki-laki') === 'Laki-laki').length;
  const totalPerempuan = list.filter((b) => b.jenis_kelamin === 'Perempuan').length;
  const totalTanggungan = list.reduce((s, b) => s + (Number(b.jumlah_tanggungan) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="executive-modal-backdrop fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Top Action Bar (Hidden when printed) */}
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-t-xl px-5 py-3 flex items-center justify-between shadow-md mb-0 print:hidden">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#1e3a8a]">Cetak Data Anggota Binaan (PDF)</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {selectedProgram} · Total {totalAnggota} Anggota
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
        id="beneficiary-report-document"
        className="w-full max-w-4xl bg-white border border-slate-200 border-t-0 print:border-none rounded-b-xl print:rounded-none p-6 sm:p-8 shadow-xl print:shadow-none text-slate-800 font-sans print:p-0 print:w-full print:max-w-none"
      >
        {/* ── HEADER DOKUMEN (TANPA KOP FORMAL) ── */}
        <div className="border-b-2 border-[#1e3a8a] pb-3 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#1e3a8a] uppercase tracking-tight">
              Data Anggota Binaan · {selectedProgram}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Dicetak per: <span className="font-semibold text-slate-700">{currentDateFormatted}</span> · Status Terdaftar: <span className="font-extrabold text-[#1e3a8a]">{totalAnggota} Orang</span>
            </p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded uppercase tracking-wider">
            Rekap Anggota
          </span>
        </div>

        {/* ── RINGKASAN DEMOGRAFI ── */}
        <div className="grid grid-cols-4 gap-2.5 mb-4 page-break-inside-avoid">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
            <p className="text-[9.5px] text-slate-500 font-bold uppercase flex items-center justify-center gap-1">
              <UserCheck size={11} className="text-[#1e3a8a]" /> Total Anggota
            </p>
            <p className="text-sm sm:text-base font-extrabold text-[#1e3a8a]">{totalAnggota} Orang</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
            <p className="text-[9.5px] text-slate-500 font-bold uppercase flex items-center justify-center gap-1">
              <Users size={11} className="text-blue-600" /> Laki-laki
            </p>
            <p className="text-sm sm:text-base font-extrabold text-blue-600">{totalLaki} Orang</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
            <p className="text-[9.5px] text-slate-500 font-bold uppercase flex items-center justify-center gap-1">
              <Users size={11} className="text-pink-600" /> Perempuan
            </p>
            <p className="text-sm sm:text-base font-extrabold text-pink-600">{totalPerempuan} Orang</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
            <p className="text-[9.5px] text-slate-500 font-bold uppercase flex items-center justify-center gap-1">
              <Baby size={11} className="text-amber-600" /> Tanggungan
            </p>
            <p className="text-sm sm:text-base font-extrabold text-amber-600">{totalTanggungan} Jiwa</p>
          </div>
        </div>

        {/* ── TABEL ANGGOTA BINAAN ── */}
        <div className="mb-2">
          {list.length > 0 ? (
            <div className="overflow-x-auto rounded border border-slate-200">
              <table className="w-full text-[10.5px] text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[9.5px]">
                  <tr>
                    <th className="px-2.5 py-2 border-b border-slate-200 w-8 text-center">No</th>
                    <th className="px-2.5 py-2 border-b border-slate-200">Nama Lengkap</th>
                    <th className="px-2.5 py-2 border-b border-slate-200">NIK</th>
                    <th className="px-2.5 py-2 border-b border-slate-200 text-center">L/P</th>
                    <th className="px-2.5 py-2 border-b border-slate-200">Pendidikan</th>
                    <th className="px-2.5 py-2 border-b border-slate-200">Pekerjaan Sebelumnya</th>
                    <th className="px-2.5 py-2 border-b border-slate-200">Pekerjaan Saat Ini</th>
                    <th className="px-2.5 py-2 border-b border-slate-200 text-center">Tanggungan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {list.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-2.5 py-1.5 text-center text-slate-500">{idx + 1}</td>
                      <td className="px-2.5 py-1.5 font-bold text-slate-800">{b.nama || '-'}</td>
                      <td className="px-2.5 py-1.5 text-slate-600 font-mono text-[9.5px]">{b.nik || '-'}</td>
                      <td className="px-2.5 py-1.5 text-center font-bold text-slate-700">{b.jenis_kelamin === 'Perempuan' ? 'P' : 'L'}</td>
                      <td className="px-2.5 py-1.5 text-slate-600">{b.pendidikan || '-'}</td>
                      <td className="px-2.5 py-1.5 text-slate-600">{b.pekerjaan_sebelumnya || '-'}</td>
                      <td className="px-2.5 py-1.5 text-slate-700 font-semibold">{b.pekerjaan_sekarang || '-'}</td>
                      <td className="px-2.5 py-1.5 text-center font-bold text-slate-700">{b.jumlah_tanggungan ?? 0} Jiwa</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded border border-slate-200 text-center text-[11px] text-slate-500 italic">
              Tidak ada data anggota binaan yang ditemukan.
            </div>
          )}
        </div>

      </div>

    </div>,
    document.body
  );
}
