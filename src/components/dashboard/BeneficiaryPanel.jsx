import React, { useState, useMemo } from 'react';
import useAppStore from '../../store/useAppStore';
import { Users, Search, UserCheck, GraduationCap, Briefcase, Baby, Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import BeneficiaryPdfModal from './BeneficiaryPdfModal';

const BeneficiaryPanel = React.memo(function BeneficiaryPanel() {
  const beneficiariesList = useAppStore((state) => state.beneficiariesList) || [];
  const selectedProgram = useAppStore((state) => state.globalProgram);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const genderCounts = useMemo(() => {
    const counts = { Semua: beneficiariesList.length };
    beneficiariesList.forEach((b) => {
      const g = b.jenis_kelamin || 'Laki-laki';
      counts[g] = (counts[g] || 0) + 1;
    });
    return counts;
  }, [beneficiariesList]);

  const filtered = useMemo(() => {
    let list = beneficiariesList;
    if (activeFilter !== 'Semua') {
      list = list.filter((b) => (b.jenis_kelamin || 'Laki-laki') === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          (b.nama || '').toLowerCase().includes(q) ||
          (b.nik || '').toLowerCase().includes(q) ||
          (b.pendidikan || '').toLowerCase().includes(q) ||
          (b.pekerjaan_sekarang || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [beneficiariesList, activeFilter, search]);

  const totalAnggota = beneficiariesList.length;
  const totalLaki = beneficiariesList.filter((b) => (b.jenis_kelamin || 'Laki-laki') === 'Laki-laki').length;
  const totalPerempuan = beneficiariesList.filter((b) => b.jenis_kelamin === 'Perempuan').length;
  const totalTanggungan = beneficiariesList.reduce((s, b) => s + (Number(b.jumlah_tanggungan) || 0), 0);

  const handleDownloadDataAnggota = () => {
    if (!beneficiariesList || beneficiariesList.length === 0) return;

    const dataToExport = filtered.length > 0 ? filtered : beneficiariesList;
    const rows = dataToExport.map((b, idx) => ({
      'No': idx + 1,
      'Nama Anggota': b.nama || '-',
      'Tempat / Tgl Lahir': b.ttl || '-',
      'NIK': b.nik ? `'${b.nik}` : '-',
      'Jenis Kelamin': b.jenis_kelamin || 'Laki-laki',
      'Pendidikan Terakhir': b.pendidikan || '-',
      'Pekerjaan Sebelumnya': b.pekerjaan_sebelumnya || '-',
      'Pekerjaan Sekarang': b.pekerjaan_sekarang || '-',
      'Jumlah Tanggungan': Number(b.jumlah_tanggungan) || 0
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 5 },
      { wch: 25 },
      { wch: 22 },
      { wch: 22 },
      { wch: 14 },
      { wch: 18 },
      { wch: 22 },
      { wch: 22 },
      { wch: 18 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Anggota');

    const cleanName = (selectedProgram || 'Program').replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(wb, `Data_Anggota_${cleanName}.xlsx`);
  };

  if (totalAnggota === 0) {
    return (
      <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
            <Users size={18} className="text-indigo-500" />
            Data Anggota Binaan
            <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-full">
              0 Orang
            </span>
          </h3>
        </div>
        <div className="py-8 text-center text-slate-400 text-[12px] bg-slate-50/60 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center">
          <Users size={32} className="text-slate-300 mb-2" />
          <p className="font-semibold text-slate-600">Belum ada data anggota binaan untuk program ini</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Data anggota dapat ditambahkan melalui menu <span className="font-semibold text-indigo-600">Input Data</span> pada tab <span className="font-semibold text-indigo-600">Anggota</span>.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
          <Users size={18} className="text-indigo-500" />
          Data Anggota Binaan
          <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-full">
            {totalAnggota} Orang
          </span>
        </h3>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, NIK, pekerjaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-7 py-1 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-slate-50 w-40 sm:w-48"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleDownloadDataAnggota}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-md text-[11px] font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer whitespace-nowrap"
            title="Download data anggota ke format Excel (.xlsx)"
          >
            <Download size={13} />
            <span>Download XLSX</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-md text-[11px] font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer whitespace-nowrap"
            title="Download & Cetak data anggota ke format PDF"
          >
            <FileText size={13} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { icon: UserCheck, label: 'Total Anggota', value: totalAnggota, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { icon: Users,     label: 'Laki-laki',     value: totalLaki,    color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { icon: Users,     label: 'Perempuan',      value: totalPerempuan, color: 'text-pink-600', bg: 'bg-pink-50'   },
          { icon: Baby,      label: 'Total Tanggungan', value: totalTanggungan, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-lg p-3 flex items-center gap-2.5`}>
            <Icon size={20} className={color} />
            <div>
              <p className="text-[11px] text-slate-500 font-medium">{label}</p>
              <p className={`text-[18px] font-extrabold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 mb-3">
        {['Semua', 'Laki-laki', 'Perempuan'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-colors ${
              activeFilter === tab
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab} ({genderCounts[tab] || 0})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[360px] overflow-y-auto minimal-scrollbar rounded-md border border-slate-100">
        <table className="w-full text-[12px] text-left border-collapse">
          <thead className="bg-slate-50 text-slate-600 uppercase text-[10.5px] font-bold tracking-wider sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-3 py-2.5 border-b border-slate-200 w-6 text-center">#</th>
              <th className="px-3 py-2.5 border-b border-slate-200">
                <span className="flex items-center gap-1"><UserCheck size={11} /> Nama</span>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200">NIK</th>
              <th className="px-3 py-2.5 border-b border-slate-200 text-center">L/P</th>
              <th className="px-3 py-2.5 border-b border-slate-200">
                <span className="flex items-center gap-1"><GraduationCap size={11} /> Pendidikan</span>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200">
                <span className="flex items-center gap-1"><Briefcase size={11} /> Pekerjaan Sblm</span>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200">
                <span className="flex items-center gap-1"><Briefcase size={11} /> Pekerjaan Skrg</span>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200 text-center">
                <span className="flex items-center gap-1 justify-center"><Baby size={11} /> Tanggungan</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-[12px]">
                  Tidak ada anggota yang cocok dengan pencarian.
                </td>
              </tr>
            ) : (
              filtered.map((b, idx) => (
                <tr key={b.id || idx} className="hover:bg-indigo-50/40 transition-colors">
                  <td className="px-3 py-2.5 text-center text-slate-400 font-medium">{idx + 1}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-800 whitespace-nowrap">
                    {b.nama || '-'}
                    {b.ttl && <span className="block text-[10.5px] text-slate-400 font-normal">{b.ttl}</span>}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 font-mono text-[11px]">{b.nik || '-'}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      b.jenis_kelamin === 'Perempuan' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {b.jenis_kelamin === 'Perempuan' ? 'P' : 'L'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">{b.pendidikan || '-'}</td>
                  <td className="px-3 py-2.5 text-slate-500 text-[11px]">
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                      {b.pekerjaan_sebelumnya || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-700 font-medium">{b.pekerjaan_sekarang || '-'}</td>
                  <td className="px-3 py-2.5 text-center font-semibold text-slate-700">
                    {b.jumlah_tanggungan ?? 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-[11px] text-slate-400 mt-2 text-right">
          Menampilkan {filtered.length} dari {totalAnggota} anggota
        </p>
      )}

      {/* Modal Laporan PDF Khusus Data Anggota */}
      {isPdfModalOpen && (
        <BeneficiaryPdfModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          data={filtered.length > 0 ? filtered : beneficiariesList}
        />
      )}
    </section>
  );
});

export default BeneficiaryPanel;
