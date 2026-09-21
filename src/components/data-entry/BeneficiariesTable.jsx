import React from 'react';
import { Users, Plus, X } from '../Icons';

export const PENDIDIKAN_OPTIONS = [
  'SD / Sederajat',
  'SMP / Sederajat',
  'SMA / SMK / Sederajat',
  'Diploma (D1-D3)',
  'Sarjana (S1)',
  'Magister (S2)',
  'Tidak Sekolah / Lainnya'
];

export const PEKERJAAN_SEBELUMNYA_OPTIONS = [
  'PETI',
  'Petani Mandiri',
  'Buruh Harian / Lepas',
  'Pedagang / Wiraswasta',
  'Ibu Rumah Tangga',
  'Karyawan Swasta',
  'Belum / Tidak Bekerja',
  'Lainnya'
];

export const JENIS_KELAMIN_OPTIONS = [
  'Laki-laki',
  'Perempuan'
];

export const PERAN_OPTIONS = [
  'Ketua',
  'Wakil Ketua',
  'Sekretaris',
  'Bendahara',
  'Anggota'
];

export default function BeneficiariesTable({ value = [], onChange }) {
  const handleRowChange = (index, field, val) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      nama: '',
      nik: '',
      jenis_kelamin: 'Laki-laki',
      ttl: '',
      pendidikan: 'SMA / SMK / Sederajat',
      pekerjaan_sebelumnya: 'PETI',
      pekerjaan_sekarang: 'Anggota',
      jumlah_tanggungan: 0
    };
    onChange([...value, newRow]);
  };

  const handleRemoveRow = (index) => {
    const updated = value.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  // Stats
  const totalAnggota = value.length;
  const totalLaki = value.filter((r) => r.jenis_kelamin === 'Laki-laki').length;
  const totalPerempuan = value.filter((r) => r.jenis_kelamin === 'Perempuan').length;

  return (
    <section className="w-full bg-white border border-gray-200 p-5 rounded-md shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#1e3a8a]" />
            <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
              DATA PENERIMA MANFAAT (ANGGOTA BINAAN)
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Data profil anggota penerima manfaat bersifat statis per program (hanya diperbarui jika ada perubahan anggota).
          </p>
        </div>

        {/* Stats & Add Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
            <span>Total: <strong className="text-[#1e3a8a]">{totalAnggota}</strong> orang</span>
            <span className="text-gray-300">|</span>
            <span>👨 {totalLaki} L</span>
            <span className="text-gray-300">|</span>
            <span>👩 {totalPerempuan} P</span>
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1.5 bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs font-semibold px-3.5 py-1.5 rounded-md shadow-xs transition-colors"
          >
            <Plus size={14} /> Tambah Anggota
          </button>
        </div>
      </div>

      {/* Table / Empty State */}
      {value.length === 0 ? (
        <div className="py-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1e3a8a] flex items-center justify-center mb-2">
            <Users size={20} />
          </div>
          <p className="text-xs font-medium text-gray-700">
            Belum ada data anggota/penerima manfaat untuk program ini.
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5 mb-3">
            Klik tombol di bawah untuk menambahkan data anggota binaan pertama.
          </p>
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1e3a8a] hover:text-blue-700 bg-white border border-gray-300 hover:border-blue-500 px-3 py-1.5 rounded-md shadow-xs transition-colors"
          >
            <Plus size={13} /> Tambah Anggota Baru
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-md shadow-xs">
          <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
            <thead className="bg-[#f8f9fa] text-[#25326a] uppercase font-bold border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3 min-w-[180px]">Nama Lengkap</th>
                <th className="py-2.5 px-3 w-[150px]">NIK</th>
                <th className="py-2.5 px-3 w-[120px]">Jenis Kelamin</th>
                <th className="py-2.5 px-3 min-w-[170px]">Tempat, Tgl Lahir</th>
                <th className="py-2.5 px-3 w-[160px]">Pendidikan Terakhir</th>
                <th className="py-2.5 px-3 w-[170px]">Pekerjaan Sebelumnya</th>
                <th className="py-2.5 px-3 min-w-[180px]">Pekerjaan Sekarang (Peran)</th>
                <th className="py-2.5 px-3 w-[100px] text-center">Tanggungan</th>
                <th className="py-2.5 px-2 w-10 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {value.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-blue-50/40 transition-colors">
                  {/* No */}
                  <td className="py-2 px-3 text-center text-gray-500 font-medium">
                    {idx + 1}
                  </td>

                  {/* 1. Nama */}
                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      className="w-full border border-gray-300 focus:border-blue-500 focus:outline-none rounded px-2 py-1 text-xs text-gray-800"
                      placeholder="Nama Lengkap"
                      value={row.nama || ''}
                      onChange={(e) => handleRowChange(idx, 'nama', e.target.value)}
                    />
                  </td>

                  {/* 2. NIK */}
                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      maxLength={16}
                      className="w-full border border-gray-300 focus:border-blue-500 focus:outline-none rounded px-2 py-1 text-xs text-gray-800 font-mono"
                      placeholder="16 Digit NIK"
                      value={row.nik || ''}
                      onChange={(e) => handleRowChange(idx, 'nik', e.target.value)}
                    />
                  </td>

                  {/* 3. Jenis Kelamin */}
                  <td className="py-1.5 px-2">
                    <select
                      className="w-full border border-gray-300 focus:border-blue-500 focus:outline-none rounded px-2 py-1 text-xs text-gray-800 bg-white cursor-pointer"
                      value={row.jenis_kelamin || 'Laki-laki'}
                      onChange={(e) => handleRowChange(idx, 'jenis_kelamin', e.target.value)}
                    >
                      {JENIS_KELAMIN_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>

                  {/* 4. Tempat, Tanggal Lahir */}
                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      className="w-full border border-gray-300 focus:border-blue-500 focus:outline-none rounded px-2 py-1 text-xs text-gray-800"
                      placeholder="Kota, DD-MM-YYYY"
                      value={row.ttl || ''}
                      onChange={(e) => handleRowChange(idx, 'ttl', e.target.value)}
                    />
                  </td>

                  {/* 5. Pendidikan */}
                  <td className="py-1.5 px-2">
                    <select
                      className="w-full border border-gray-300 focus:border-blue-500 focus:outline-none rounded px-2 py-1 text-xs text-gray-800 bg-white cursor-pointer"
                      value={row.pendidikan || 'SMA / SMK / Sederajat'}
                      onChange={(e) => handleRowChange(idx, 'pendidikan', e.target.value)}
                    >
                      {PENDIDIKAN_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>

                  {/* 6. Pekerjaan Sebelumnya (Dropdown with PETI) */}
                  <td className="py-1.5 px-2">
                    <select
                      className="w-full border border-gray-300 focus:border-blue-500 focus:outline-none rounded px-2 py-1 text-xs text-gray-800 bg-white cursor-pointer font-medium"
                      value={row.pekerjaan_sebelumnya || 'PETI'}
                      onChange={(e) => handleRowChange(idx, 'pekerjaan_sebelumnya', e.target.value)}
                    >
                      {PEKERJAAN_SEBELUMNYA_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>

                  {/* 7. Pekerjaan Sekarang / Peran (Dropdown) */}
                  <td className="py-1.5 px-2">
                    <select
                      className="w-full border border-gray-300 focus:border-blue-500 focus:outline-none rounded px-2 py-1 text-xs text-gray-800 bg-white cursor-pointer font-medium"
                      value={row.pekerjaan_sekarang || 'Anggota'}
                      onChange={(e) => handleRowChange(idx, 'pekerjaan_sekarang', e.target.value)}
                    >
                      {PERAN_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>

                  {/* 8. Tanggungan */}
                  <td className="py-1.5 px-2">
                    <input
                      type="number"
                      min="0"
                      className="w-full border border-gray-300 focus:border-blue-500 focus:outline-none rounded px-2 py-1 text-xs text-center text-gray-800"
                      placeholder="0"
                      value={row.jumlah_tanggungan !== undefined ? row.jumlah_tanggungan : 0}
                      onChange={(e) => handleRowChange(idx, 'jumlah_tanggungan', e.target.value)}
                    />
                  </td>

                  {/* Aksi */}
                  <td className="py-1.5 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="w-7 h-7 inline-flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Hapus Baris"
                    >
                      <X size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
