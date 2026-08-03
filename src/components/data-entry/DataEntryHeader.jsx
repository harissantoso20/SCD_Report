import React from 'react';
import useAppStore from '../../store/useAppStore';
import { PROGRAMS, PROGRAM_IMAGES, PROGRAM_DETAILS } from '../../data/mockData';
import { ChevronDown } from '../Icons';

const INDO_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function DataEntryHeader({ isLoading }) {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  const setSelectedProgram = useAppStore((state) => state.setGlobalProgram);
  const selectedDate = useAppStore((state) => state.globalDate);
  const setSelectedDate = useAppStore((state) => state.setGlobalDate);
  const programListFromStore = useAppStore((state) => state.programList);

  const availablePrograms = programListFromStore?.length > 0 ? programListFromStore : PROGRAMS;
  const bannerImage = React.useMemo(() => PROGRAM_IMAGES[selectedProgram] || PROGRAM_IMAGES["default"], [selectedProgram]);

  const currentMonthStr = selectedDate ? selectedDate.split('-')[1] : "01";
  const currentYearStr = selectedDate ? selectedDate.split('-')[0] : "2026";
  
  const handleMonthChange = (e) => {
    setSelectedDate(`${currentYearStr}-${e.target.value}-01`);
  };

  const handleYearChange = (e) => {
    setSelectedDate(`${e.target.value}-${currentMonthStr}-01`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      <div className="lg:w-1/2 flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1e3a8a] mb-2 tracking-tight">Data Entry {isLoading && <span className="text-sm font-normal text-gray-400">(Loading...)</span>}</h2>
          <p className="text-gray-600 font-medium text-[13.5px] pr-4 leading-relaxed text-justify">
            {selectedProgram?.toLowerCase().includes("plts") 
              ? "Pompa Irigasi Berbasis PLTS adalah inisiatif pemanfaatan energi terbarukan untuk mengatasi krisis air di sektor pertanian. Program ini bertujuan untuk meningkatkan produktivitas panen (dari 1x menjadi 2-3x setahun), memperluas lahan produktif, serta mendorong kemandirian ekonomi petani secara berkelanjutan."
              : selectedProgram?.toLowerCase().includes("maggot")
              ? "Budidaya Maggot Tanjung Agung adalah inisiatif ekonomi sirkular yang mengubah masalah sampah organik menjadi pakan ternak alternatif bernilai ekonomi tinggi. Program ini bertujuan mengatasi tingginya biaya pakan ternak dan perikanan sekaligus mengurangi limbah lingkungan, dengan kemampuan menyerap 12 ton sampah per tahun, meningkatkan efisiensi biaya pakan hingga 35%, serta berkontribusi pada penurunan emisi karbon."
              : selectedProgram?.toLowerCase().includes("ikan air tawar")
              ? "Budidaya Ikan Air Tawar Desa Tanjung Agung adalah inisiatif produktif berbasis kelompok yang bertujuan untuk meningkatkan ketahanan pangan dan pendapatan masyarakat lokal, khususnya bagi kelompok pemuda dan eks-pekerja PETI. Program ini berfokus secara holistik pada operasional budidaya, meliputi pembangunan unit kolam, pelatihan teknis pembesaran jenis ikan seperti lele, nila, patin, gurame, dan gabus, serta pendampingan manajemen pakan, kualitas air, hingga masa panen."
              : selectedProgram?.toLowerCase().includes("siba")
              ? "SIBA Pembibitan di Desa Tanjung Karangan adalah inisiatif pengembangan sentra pembibitan tanaman hortikultura dan tanaman produktif untuk menciptakan alternatif mata pencaharian yang berkelanjutan, khususnya bagi eks-pekerja PETI. Program ini berfokus pada penguatan operasional usaha pembibitan secara terpadu, yang meliputi pembangunan fasilitas rumah pembibitan (greenhouse), pelatihan teknis perbanyakan tanaman (seperti stek, cangkok, dan okulasi), serta produksi tambahan berupa media tanam, kompos, dan pupuk organik."
              : selectedProgram?.toLowerCase().includes("puyuh") && selectedProgram?.toLowerCase().includes("seleman")
              ? "Budidaya Puyuh Petelur di Desa Seleman adalah inisiatif pengembangan usaha berbasis kelompok yang bertujuan meningkatkan kapasitas ekonomi masyarakat agar lebih produktif, berkelanjutan, dan memiliki akses pasar yang stabil. Rangkaian kegiatan operasional pada program ini mencakup pembangunan dan penguatan unit kandang produksi, pelatihan teknis budidaya, serta pendampingan berkelanjutan untuk manajemen usaha dan pemasaran telur puyuh."
              : "Update ringkasan program dan data kuantitatif program sustainable community development."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 relative z-50 mt-6 lg:mt-0">
          {/* Program Dropdown */}
          <div className="relative">
            <select 
              className="appearance-none bg-[#f8f9fa] border border-gray-200 text-[#25326a] font-bold text-[13px] rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] cursor-pointer shadow-sm uppercase tracking-wide"
              value={selectedProgram} 
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              {availablePrograms.map(prog => (
                <option key={prog} value={prog}>{prog.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#25326a] pointer-events-none" size={18} strokeWidth={2.5} />
          </div>

          {/* Month Dropdown */}
          <div className="relative">
            <select 
              className="appearance-none bg-[#2c3e80] border border-transparent text-white font-bold text-[14px] rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm"
              value={currentMonthStr}
              onChange={handleMonthChange}
            >
              {INDO_MONTHS.map((m, i) => {
                const val = (i + 1).toString().padStart(2, '0');
                return <option key={val} value={val}>{m}</option>;
              })}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" size={18} strokeWidth={2.5} />
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <select 
              className="appearance-none bg-[#2c3e80] border border-transparent text-white font-bold text-[14px] rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm"
              value={currentYearStr}
              onChange={handleYearChange}
            >
              {[2023, 2024, 2025, 2026, 2027, 2028, 2029].map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>
      <div className="lg:w-1/2 rounded-md overflow-hidden border border-gray-200 shadow-sm relative min-h-[200px] lg:min-h-0">
        <img src={bannerImage} alt={`Banner ${selectedProgram}`} className="absolute inset-0 w-full h-full object-cover object-center" />
      </div>
    </div>
  );
}
